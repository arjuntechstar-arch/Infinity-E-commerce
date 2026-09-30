import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { migrateCommerce, migrateIntegrations, migrateCredits } from './migrations';
import { migrateWorkflows } from './workflows';

export class Store {
  readonly db: DatabaseSync;
  constructor(filename = process.env.DATABASE_PATH || 'data/voltmart.sqlite') {
    if (filename !== ':memory:') mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
    this.migrate();
    migrateCommerce(this);
    migrateIntegrations(this);
    migrateCredits(this);
    migrateWorkflows(this);
    if (!this.get('SELECT version FROM migrations WHERE version=6')) this.transaction(() => this.db.exec("CREATE TABLE password_resets(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL); INSERT INTO migrations(version) VALUES(6);"));
  }
  run(sql: string, ...args: SQLInputValue[]) { return this.db.prepare(sql).run(...args); }
  get<T>(sql: string, ...args: SQLInputValue[]): T | undefined { return this.db.prepare(sql).get(...args) as T | undefined; }
  all<T>(sql: string, ...args: SQLInputValue[]): T[] { return this.db.prepare(sql).all(...args) as T[]; }
  transaction<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); this.db.exec('COMMIT'); return value; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  close() { this.db.close(); }
  private migrate() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
    if (this.get('SELECT version FROM migrations WHERE version=1')) return;
    this.transaction(() => this.db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL COLLATE NOCASE, name TEXT NOT NULL,
        password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('customer','admin')) DEFAULT 'customer',
        phone TEXT NOT NULL DEFAULT '', phone_verified INTEGER NOT NULL DEFAULT 0,
        address TEXT NOT NULL DEFAULT '', disabled INTEGER NOT NULL DEFAULT 0,
        kyc_status TEXT NOT NULL DEFAULT 'unverified', stripe_customer_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE sessions (
        token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        csrf TEXT NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE INDEX sessions_user ON sessions(user_id);
      CREATE TABLE rate_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO settings VALUES ('store', '{"name":"VoltMart","currency":"USD","country":"US","shippingFee":0,"taxBasisPoints":0,"supportEmail":"","address":""}');
      CREATE TABLE audit_logs (id INTEGER PRIMARY KEY, actor_id TEXT REFERENCES users(id), action TEXT NOT NULL, entity_id TEXT, details TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
      INSERT INTO migrations(version) VALUES (1);
    `));
  }
}

export function audit(store: Store, actor: string | null, action: string, entity: string | null = null, details: object = {}) {
  store.run('INSERT INTO audit_logs(actor_id,action,entity_id,details) VALUES (?,?,?,?)', actor, action, entity, JSON.stringify(details));
}

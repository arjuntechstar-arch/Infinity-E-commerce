import type { Store } from './db';
export function migrateCommerce(store: Store) {
  if (store.get('SELECT version FROM migrations WHERE version=2')) return;
  store.transaction(() => store.db.exec(`
    CREATE TABLE products(id TEXT PRIMARY KEY, sku TEXT UNIQUE NOT NULL, title TEXT NOT NULL, brand TEXT NOT NULL DEFAULT '', category TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', price INTEGER NOT NULL CHECK(price>0), stock INTEGER NOT NULL CHECK(stock>=0), image TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1, warranty_months INTEGER NOT NULL DEFAULT 12, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE carts(user_id TEXT NOT NULL REFERENCES users(id), product_id TEXT NOT NULL REFERENCES products(id), quantity INTEGER NOT NULL CHECK(quantity>0), PRIMARY KEY(user_id,product_id));
    CREATE TABLE vouchers(code TEXT PRIMARY KEY, discount INTEGER NOT NULL CHECK(discount>0), minimum INTEGER NOT NULL DEFAULT 0, max_uses INTEGER NOT NULL, uses INTEGER NOT NULL DEFAULT 0, expires_at TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE orders(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), currency TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL, shipping INTEGER NOT NULL, tax INTEGER NOT NULL, total INTEGER NOT NULL CHECK(total>=0), status TEXT NOT NULL DEFAULT 'pending_payment', address TEXT NOT NULL, voucher_code TEXT REFERENCES vouchers(code), request_key TEXT NOT NULL, request_hash TEXT NOT NULL, checkout_id TEXT, payment_id TEXT, tracking_number TEXT NOT NULL DEFAULT '', tracking_url TEXT NOT NULL DEFAULT '', carrier TEXT NOT NULL DEFAULT '', expires_at INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,request_key));
    CREATE TABLE order_items(id INTEGER PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), product_id TEXT NOT NULL REFERENCES products(id), title TEXT NOT NULL, sku TEXT NOT NULL, price INTEGER NOT NULL, quantity INTEGER NOT NULL, warranty_months INTEGER NOT NULL);
    CREATE TABLE order_events(id INTEGER PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), status TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE INDEX orders_user ON orders(user_id,created_at);
    INSERT INTO migrations(version) VALUES(2);
  `));
}

export function migrateIntegrations(s: Store) {
  if (s.get('SELECT version FROM migrations WHERE version=3')) return;
  s.transaction(() => s.db.exec(`
    CREATE TABLE provider_events(id TEXT PRIMARY KEY, type TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE verifications(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL, target TEXT NOT NULL DEFAULT '', status TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE refunds(id TEXT PRIMARY KEY, order_id TEXT UNIQUE REFERENCES orders(id), provider_id TEXT UNIQUE, status TEXT NOT NULL, previous_status TEXT NOT NULL, amount INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE shipping_quotes(id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), rates TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE shipping_labels(order_id TEXT PRIMARY KEY REFERENCES orders(id), provider_id TEXT, status TEXT NOT NULL, label_url TEXT NOT NULL DEFAULT '', rate_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE scheme_plans(id TEXT PRIMARY KEY, name TEXT NOT NULL, monthly INTEGER NOT NULL CHECK(monthly>=50), months INTEGER NOT NULL CHECK(months>0), bonus_bps INTEGER NOT NULL DEFAULT 1000, active INTEGER NOT NULL DEFAULT 1, terms TEXT NOT NULL);
    CREATE TABLE enrollments(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), plan_id TEXT NOT NULL REFERENCES scheme_plans(id), currency TEXT NOT NULL, monthly INTEGER NOT NULL, months INTEGER NOT NULL, bonus_bps INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', subscription_id TEXT UNIQUE, checkout_id TEXT, cancel_at INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE installments(id TEXT PRIMARY KEY, enrollment_id TEXT NOT NULL REFERENCES enrollments(id), payment_id TEXT NOT NULL, amount INTEGER NOT NULL, refund_id TEXT, refund_status TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE credits(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), enrollment_id TEXT UNIQUE NOT NULL REFERENCES enrollments(id), amount INTEGER NOT NULL, remaining INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE credit_redemptions(order_id TEXT PRIMARY KEY REFERENCES orders(id), credit_id TEXT NOT NULL REFERENCES credits(id), amount INTEGER NOT NULL);
    INSERT INTO migrations(version) VALUES(3);
  `));
}

export function migrateCredits(s: Store) {
  if (s.get('SELECT version FROM migrations WHERE version=4')) return;
  s.transaction(() => s.db.exec(`ALTER TABLE orders ADD COLUMN credited INTEGER NOT NULL DEFAULT 0; ALTER TABLE credit_redemptions ADD COLUMN returned INTEGER NOT NULL DEFAULT 0; INSERT INTO migrations(version) VALUES(4);`));
}

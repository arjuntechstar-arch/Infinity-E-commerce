import { randomUUID } from 'node:crypto';
import { Store, audit } from '../backend/db';
import { passwordHash } from '../backend/auth';
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || password.length > 128) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12–128 characters) before running this command.');
const store = new Store();
try {
  if (store.get('SELECT id FROM users WHERE email=?', email)) throw new Error('Account already exists; this command does not overwrite accounts.');
  const id = randomUUID();
  store.run("INSERT INTO users(id,email,name,password_hash,role) VALUES (?,?,?,?,'admin')", id, email, process.env.ADMIN_NAME || 'Store Administrator', await passwordHash(password));
  audit(store, id, 'admin.created', id);
  console.log('Administrator created. Sign in using the email and password you configured.');
} finally { store.close(); }

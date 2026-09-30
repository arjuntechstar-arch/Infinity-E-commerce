import { Router, type Request, type Response, type NextFunction } from 'express';
import { randomBytes, randomUUID, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Store, audit } from './db';
import { HttpError, text } from './http';
import { Providers } from './providers';
const scrypt = promisify(scryptCallback);
export interface User { id: string; email: string; name: string; role: 'admin' | 'customer'; phone: string; phone_verified: number; address: string; kyc_status: string; disabled: number; password_hash: string; stripe_customer_id: string | null }
declare global { namespace Express { interface Request { user?: User; session?: { token_hash: string; csrf: string } } } }
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  const result = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${result.toString('hex')}`;
}
async function verifyPassword(password: string, hash: string) {
  const [salt, expected] = hash.split(':');
  const result = await scrypt(password, salt, 64) as Buffer;
  const stored = Buffer.from(expected, 'hex');
  return stored.length === result.length && timingSafeEqual(stored, result);
}
export const publicUser = (u: User) => ({ id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, phoneVerified: !!u.phone_verified, address: u.address, kycStatus: u.kyc_status });
export function rateLimit(store: Store, key: string, max = 10, window = 15 * 60 * 1000) {
  const now = Date.now();
  store.run('DELETE FROM rate_limits WHERE expires_at < ?', now);
  store.run('INSERT INTO rate_limits(key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1', key, now + window);
  if (store.get<{ attempts: number }>('SELECT attempts FROM rate_limits WHERE key=?', key)!.attempts > max) throw new HttpError(429, 'Too many attempts. Please try again later.');
}
export function security(store: Store, production: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-store');
    if (production) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    const token = req.headers.cookie?.match(/(?:^|;\s*)vm_session=([a-f0-9]{64})(?:;|$)/)?.[1];
    if (token) {
      const session = store.get<{ user_id: string; csrf: string; token_hash: string }>('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?', digest(token), Date.now());
      const user = session && store.get<User>('SELECT * FROM users WHERE id=? AND disabled=0', session.user_id);
      if (user && session) { req.user = user; req.session = session; }
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.headers.origin;
      const expected = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      if (origin && origin !== new URL(expected).origin) throw new HttpError(403, 'Cross-origin request denied');
      if (req.session && req.headers['x-csrf-token'] !== req.session.csrf) throw new HttpError(403, 'Invalid request token. Refresh and try again.');
    }
    next();
  };
}
export function requireUser(req: Request, _res: Response, next: NextFunction) { if (!req.user) throw new HttpError(401, 'Please sign in'); next(); }
export function requireAdmin(req: Request, _res: Response, next: NextFunction) { if (!req.user) throw new HttpError(401, 'Please sign in'); if (req.user.role !== 'admin') throw new HttpError(403, 'Administrator access required'); next(); }
export function authRoutes(store: Store, production: boolean, providers = new Providers()) {
  const router = Router();
  const session = (req: Request, res: Response, user: User) => {
    if (req.session) store.run('DELETE FROM sessions WHERE token_hash=?', req.session.token_hash);
    store.run('DELETE FROM sessions WHERE expires_at<?', Date.now());
    const token = randomBytes(32).toString('hex');
    const csrf = randomBytes(32).toString('hex');
    store.run('INSERT INTO sessions VALUES (?,?,?,?)', digest(token), user.id, csrf, Date.now() + 1000 * 60 * 60 * 24 * 7);
    res.cookie('vm_session', token, { httpOnly: true, sameSite: 'strict', secure: production, maxAge: 604800000, path: '/' });
    res.json({ user: publicUser(user), csrf });
  };
  router.get('/session', (req, res) => res.json({ user: req.user ? publicUser(req.user) : null, csrf: req.session?.csrf || null }));
  router.post('/forgot-password', async (req, res) => {
    rateLimit(store, `reset:${req.ip}`, 5, 3600000);
    if (!providers.mailConfigured()) throw new HttpError(503, 'Account recovery email is not configured. Contact the store.');
    const origin = providers.appUrl();
    const email = text(req.body.email, 'Email', 3, 254).toLowerCase();
    const user = store.get<User>('SELECT * FROM users WHERE email=? AND disabled=0', email);
    if (user) {
      const token = randomBytes(32).toString('hex');
      store.run('DELETE FROM password_resets WHERE user_id=? OR expires_at<?', user.id, Date.now());
      store.run('INSERT INTO password_resets VALUES (?,?,?)', digest(token), user.id, Date.now() + 900000);
      await providers.sendReset(email, `${origin}/?view=account&reset=${token}`);
    }
    res.json({ success: true, message: 'If this email has an account, a reset link has been sent.' });
  });
  router.post('/reset-password', async (req, res) => {
    rateLimit(store, `reset-confirm:${req.ip}`, 10, 3600000);
    const token = text(req.body.token, 'Reset token', 64, 64), password = text(req.body.password, 'New password', 12, 128);
    const hash = await passwordHash(password);
    store.transaction(() => {
      const reset = store.get<{ user_id: string }>('SELECT * FROM password_resets WHERE token_hash=? AND expires_at>?', digest(token), Date.now());
      if (!reset) throw new HttpError(400, 'Reset link is invalid or expired');
      store.run('UPDATE users SET password_hash=? WHERE id=?', hash, reset.user_id);
      store.run('DELETE FROM password_resets WHERE user_id=?', reset.user_id);
      store.run('DELETE FROM sessions WHERE user_id=?', reset.user_id);
      audit(store, reset.user_id, 'account.password_reset', reset.user_id);
    });
    res.json({ success: true });
  });
  router.post('/register', async (req, res) => {
    rateLimit(store, `register:${req.ip}`, 5);
    const email = text(req.body.email, 'Email', 3, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email');
    const name = text(req.body.name, 'Name', 2, 100);
    const password = text(req.body.password, 'Password', 12, 128);
    if (store.get('SELECT id FROM users WHERE email=?', email)) throw new HttpError(409, 'Unable to register this email. Sign in or contact support.');
    const id = randomUUID();
    const hash = await passwordHash(password);
    try { store.run('INSERT INTO users(id,email,name,password_hash) VALUES (?,?,?,?)', id, email, name, hash); }
    catch (error) { if (store.get('SELECT id FROM users WHERE email=?', email)) throw new HttpError(409, 'Unable to register this email'); throw error; }
    audit(store, id, 'account.registered', id);
    session(req, res, store.get<User>('SELECT * FROM users WHERE id=?', id)!);
  });
  router.post('/login', async (req, res) => {
    rateLimit(store, `login:${req.ip}`, 20);
    const email = text(req.body.email, 'Email', 3, 254).toLowerCase();
    const password = text(req.body.password, 'Password', 1, 128);
    const user = store.get<User>('SELECT * FROM users WHERE email=?', email);
    const valid = await verifyPassword(password, user?.password_hash || `${'00'.repeat(16)}:${'00'.repeat(64)}`);
    if (!user || !valid || user.disabled) throw new HttpError(401, 'Incorrect email or password');
    audit(store, user.id, 'account.login', user.id);
    session(req, res, user);
  });
  router.post('/logout', requireUser, (req, res) => {
    store.run('DELETE FROM sessions WHERE token_hash=?', req.session!.token_hash);
    res.clearCookie('vm_session', { path: '/', httpOnly: true, sameSite: 'strict', secure: production });
    res.json({ success: true });
  });
  router.put('/profile', requireUser, (req, res) => {
    const name = text(req.body.name, 'Name', 2, 100);
    const address = text(req.body.address, 'Address', 0, 1000);
    store.run('UPDATE users SET name=?, address=? WHERE id=?', name, address, req.user!.id);
    audit(store, req.user!.id, 'account.updated', req.user!.id);
    res.json({ user: publicUser(store.get<User>('SELECT * FROM users WHERE id=?', req.user!.id)!) });
  });
  router.post('/password', requireUser, async (req, res) => {
    rateLimit(store, `password:${req.user!.id}`, 5);
    const oldPassword = text(req.body.oldPassword, 'Current password', 1, 128);
    const newPassword = text(req.body.newPassword, 'New password', 12, 128);
    if (!await verifyPassword(oldPassword, req.user!.password_hash)) throw new HttpError(400, 'Current password is incorrect');
    store.run('UPDATE users SET password_hash=? WHERE id=?', await passwordHash(newPassword), req.user!.id);
    store.run('DELETE FROM sessions WHERE user_id=?', req.user!.id);
    audit(store, req.user!.id, 'account.password_changed', req.user!.id);
    session(req, res, req.user!);
  });
  return router;
}

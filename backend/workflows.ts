import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import PDFDocument from 'pdfkit';
import { Store, audit } from './db';
import { requireUser, requireAdmin, rateLimit } from './auth';
import { HttpError, integer, text } from './http';
import { orderDetails, settings } from './commerce';

export function migrateWorkflows(s: Store) {
  if (s.get('SELECT version FROM migrations WHERE version=5')) return;
  s.transaction(() => s.db.exec(`
    CREATE TABLE tickets(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),kind TEXT NOT NULL,subject TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',order_item_id INTEGER REFERENCES order_items(id),quote_amount INTEGER,voucher_code TEXT REFERENCES vouchers(code),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE messages(id INTEGER PRIMARY KEY,ticket_id TEXT NOT NULL REFERENCES tickets(id),author_id TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    ALTER TABLE vouchers ADD COLUMN owner_id TEXT REFERENCES users(id);
    INSERT INTO migrations(version) VALUES(5);
  `));
}
export function workflows(s: Store) {
  const r = Router();
  r.get('/orders/:id/receipt.pdf', requireUser, (req, res) => {
    const order = orderDetails(s, String(req.params.id));
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') throw new HttpError(404, 'Order not found');
    const cfg = settings(s); const money = (n: number) => `${order.currency} ${(n / 100).toFixed(2)}`;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="order-${order.id}.pdf"`);
    doc.pipe(res);
    doc.fontSize(24).text(cfg.name).moveDown();
    doc.fontSize(15).text(order.status === 'pending_payment' ? 'Order summary — unpaid' : 'Order receipt');
    doc.fontSize(10).text(`Reference: ${order.id}`).text(`Created: ${order.created_at} UTC`).text(`Status: ${order.status}`).moveDown();
    if (cfg.address) doc.text(cfg.address).moveDown();
    const a = order.address;
    doc.text(`Recipient: ${a.name}`).text(`${a.line1} ${a.line2 || ''}`).text(`${a.city}, ${a.state} ${a.postalCode} ${a.country}`).moveDown();
    for (const item of order.items) doc.text(`${item.title} (${item.sku}) × ${item.quantity} — ${money(item.price * item.quantity)}`).moveDown(0.5);
    doc.moveDown().text(`Subtotal: ${money(order.subtotal)}`).text(`Discount: ${money(order.discount)}`).text(`Shipping: ${money(order.shipping)}`).text(`Tax: ${money(order.tax)}`);
    const credit = s.get<{ credited: number }>('SELECT credited FROM orders WHERE id=?', order.id)!.credited;
    if (credit) doc.text(`Savings credit: ${money(credit)}`);
    doc.fontSize(14).text(`Payment amount: ${money(order.total)}`);
    if (order.payment_id) doc.fontSize(9).text(`Payment reference: ${order.payment_id}`);
    doc.end();
  });
  const warranties = (userId: string) => s.all<{ id: number; order_id: string; title: string; sku: string; quantity: number; warranty_months: number; created_at: string }>("SELECT i.*,o.created_at FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.user_id=? AND o.status IN ('paid','processing','shipped','delivered') AND i.warranty_months>0 ORDER BY o.created_at DESC", userId).map(w => {
    const expires = new Date(w.created_at.replace(' ', 'T') + 'Z'); const day = expires.getUTCDate(); expires.setUTCDate(1); expires.setUTCMonth(expires.getUTCMonth() + w.warranty_months); expires.setUTCDate(Math.min(day, new Date(Date.UTC(expires.getUTCFullYear(), expires.getUTCMonth() + 1, 0)).getUTCDate()));
    return { ...w, expiresAt: expires.toISOString(), active: expires.getTime() > Date.now() };
  });
  r.get('/warranties', requireUser, (req, res) => res.json({ data: warranties(req.user!.id) }));
  r.get('/warranties/:id/certificate.pdf', requireUser, (req, res) => {
    const warranty = warranties(req.user!.id).find(w => String(w.id) === req.params.id);
    if (!warranty) throw new HttpError(404, 'Warranty not found');
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="warranty-${warranty.id}.pdf"`); doc.pipe(res);
    doc.fontSize(24).text(settings(s).name).moveDown().fontSize(16).text('Store warranty certificate').moveDown();
    doc.fontSize(12).text(warranty.title).text(`SKU: ${warranty.sku}`).text(`Order: ${warranty.order_id}`).text(`Coverage: ${warranty.warranty_months} months`).text(`Expires: ${warranty.expiresAt.slice(0, 10)}`).text(`Covered units: ${warranty.quantity}`).moveDown().text('Contact the store through your account to submit a claim. This certificate records the store coverage sold with your order. Manufacturer coverage, if any, is governed by the manufacturer.'); doc.end();
  });
  const ticketDetails = (id: string) => {
    const ticket = s.get<{ id: string; user_id: string; status: string; kind: string; quote_amount: number; voucher_code: string | null }>('SELECT * FROM tickets WHERE id=?', id);
    if (!ticket) throw new HttpError(404, 'Ticket not found');
    return { ...ticket, messages: s.all('SELECT m.id,m.body,m.created_at,u.name,u.role FROM messages m JOIN users u ON u.id=m.author_id WHERE ticket_id=? ORDER BY m.id', id) };
  };
  r.get('/tickets', requireUser, (req, res) => res.json({ data: s.all<{ id: string }>('SELECT id FROM tickets WHERE user_id=? ORDER BY updated_at DESC LIMIT 100', req.user!.id).map(t => ticketDetails(t.id)) }));
  r.post('/tickets', requireUser, (req, res) => {
    rateLimit(s, `tickets:${req.user!.id}`, 20, 3600000);
    const kind = text(req.body.kind || 'support', 'Ticket type');
    if (!['support', 'warranty', 'trade-in'].includes(kind)) throw new HttpError(400, 'Invalid ticket type');
    const subject = text(req.body.subject, 'Subject', 3, 200), message = text(req.body.message, 'Message', 10, 10000);
    const itemId = kind === 'warranty' ? integer(req.body.orderItemId, 'Warranty item', 1) : null;
    if (itemId && !warranties(req.user!.id).find(w => w.id === itemId && w.active)) throw new HttpError(400, 'An active warranty belonging to your account is required');
    const id = randomUUID();
    s.transaction(() => { s.run('INSERT INTO tickets(id,user_id,kind,subject,order_item_id) VALUES (?,?,?,?,?)', id, req.user!.id, kind, subject, itemId); s.run('INSERT INTO messages(ticket_id,author_id,body) VALUES (?,?,?)', id, req.user!.id, message); audit(s, req.user!.id, 'ticket.created', id); });
    res.status(201).json({ data: ticketDetails(id) });
  });
  r.post('/tickets/:id/messages', requireUser, (req, res) => {
    const t = ticketDetails(String(req.params.id));
    if (t.user_id !== req.user!.id && req.user!.role !== 'admin') throw new HttpError(404, 'Ticket not found');
    rateLimit(s, `messages:${req.user!.id}`, 60, 3600000);
    const message = text(req.body.message, 'Message', 1, 10000);
    s.run('INSERT INTO messages(ticket_id,author_id,body) VALUES (?,?,?)', t.id, req.user!.id, message);
    s.run('UPDATE tickets SET updated_at=CURRENT_TIMESTAMP WHERE id=?', t.id);
    res.status(201).json({ data: ticketDetails(t.id) });
  });
  r.post('/tickets/:id/accept', requireUser, (req, res) => {
    const t = ticketDetails(String(req.params.id));
    if (t.user_id !== req.user!.id) throw new HttpError(404, 'Ticket not found');
    if (t.kind !== 'trade-in' || t.status !== 'quoted') throw new HttpError(409, 'No trade-in offer to accept');
    s.run("UPDATE tickets SET status='accepted',updated_at=CURRENT_TIMESTAMP WHERE id=?", t.id); audit(s, req.user!.id, 'trade_in.accepted', t.id);
    res.json({ success: true });
  });
  r.get('/admin/tickets', requireAdmin, (_req, res) => res.json({ data: s.all<{ id: string }>('SELECT id FROM tickets ORDER BY updated_at DESC LIMIT 500').map(t => ticketDetails(t.id)) }));
  r.put('/admin/tickets/:id', requireAdmin, (req, res) => {
    const t = ticketDetails(String(req.params.id)); const status = text(req.body.status, 'Status');
    const allowed: Record<string, string[]> = { open: ['in_progress', 'resolved', ...(t.kind === 'trade-in' ? ['quoted'] : [])], in_progress: ['resolved', ...(t.kind === 'trade-in' ? ['quoted'] : [])], quoted: ['open'], accepted: ['received'], received: ['resolved'] };
    if (!allowed[t.status]?.includes(status)) throw new HttpError(409, 'Invalid ticket status transition');
    s.transaction(() => {
      if (status === 'quoted') s.run('UPDATE tickets SET quote_amount=? WHERE id=?', integer(req.body.quoteAmount, 'Offer in minor units', 50), t.id);
      if (status === 'received') {
        const code = 'TRADE-' + randomUUID().slice(0, 8).toUpperCase();
        s.run('INSERT INTO vouchers(code,discount,minimum,max_uses,expires_at,owner_id) VALUES (?,?,0,1,?,?)', code, t.quote_amount, new Date(Date.now() + 365 * 86400000).toISOString(), t.user_id);
        s.run('UPDATE tickets SET voucher_code=? WHERE id=?', code, t.id);
      }
      s.run('UPDATE tickets SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', status, t.id);
      audit(s, req.user!.id, 'ticket.' + status, t.id);
    });
    res.json({ data: ticketDetails(t.id) });
  });
  return r;
}

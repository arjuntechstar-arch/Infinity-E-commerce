import { Router } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { Store, audit } from './db';
import { requireAdmin, requireUser } from './auth';
import { HttpError, text, integer } from './http';

export interface ProductRow { id: string; sku: string; title: string; brand: string; category: string; description: string; price: number; stock: number; image: string; active: number; warranty_months: number }
export interface OrderRow { id: string; user_id: string; currency: string; subtotal: number; discount: number; shipping: number; tax: number; total: number; status: string; address: string; voucher_code: string | null; request_hash: string; checkout_id: string | null; payment_id: string | null; tracking_number: string; tracking_url: string; carrier: string; expires_at: number; created_at: string }
export interface ItemRow { product_id: string; title: string; sku: string; price: number; quantity: number; warranty_months: number }
export interface Settings { name: string; currency: string; country: string; shippingFee: number; taxBasisPoints: number; supportEmail: string; address: string }
export const settings = (s: Store): Settings => JSON.parse(s.get<{ value: string }>("SELECT value FROM settings WHERE key='store'")!.value);
export function returnCredit(s: Store, orderId: string) {
  const redemption = s.get<{ credit_id: string; amount: number }>('SELECT * FROM credit_redemptions WHERE order_id=? AND returned=0', orderId);
  if (redemption) {
    s.run('UPDATE credits SET remaining=remaining+? WHERE id=?', redemption.amount, redemption.credit_id);
    s.run('UPDATE credit_redemptions SET returned=1 WHERE order_id=?', orderId);
  }
}
export function orderDetails(s: Store, id: string) {
  const order = s.get<OrderRow>('SELECT * FROM orders WHERE id=?', id);
  if (!order) throw new HttpError(404, 'Order not found');
  return { ...order, address: JSON.parse(order.address), items: s.all<ItemRow>('SELECT product_id,title,sku,price,quantity,warranty_months FROM order_items WHERE order_id=?', id), events: s.all('SELECT status,note,created_at FROM order_events WHERE order_id=? ORDER BY id', id) };
}
export function cancelOrder(s: Store, id: string, actor: string | null, note: string) {
  const order = s.get<OrderRow>('SELECT * FROM orders WHERE id=?', id);
  if (!order || order.status !== 'pending_payment') throw new HttpError(409, 'Only unpaid orders can be cancelled');
  for (const item of s.all<ItemRow>('SELECT * FROM order_items WHERE order_id=?', id)) s.run('UPDATE products SET stock=stock+? WHERE id=?', item.quantity, item.product_id);
  if (order.voucher_code) s.run('UPDATE vouchers SET uses=MAX(0,uses-1) WHERE code=?', order.voucher_code);
  returnCredit(s, id);
  s.run("UPDATE orders SET status='cancelled', updated_at=CURRENT_TIMESTAMP WHERE id=?", id);
  s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'cancelled',?)", id, note);
  audit(s, actor, 'order.cancelled', id);
}
export function addressInput(input: unknown) {
  if (!input || typeof input !== 'object') throw new HttpError(400, 'Shipping address is required');
  const a = input as Record<string, unknown>;
  const country = text(a.country, 'Country', 2, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new HttpError(400, 'Use a two-letter country code');
  return { name: text(a.name, 'Recipient', 2, 100), line1: text(a.line1, 'Street', 3, 200), line2: a.line2 ? text(a.line2, 'Address line 2', 0, 200) : '', city: text(a.city, 'City', 2, 100), state: text(a.state || '', 'State', 0, 100), postalCode: text(a.postalCode, 'Postal code', 2, 20), country, phone: text(a.phone || '', 'Phone', 0, 30) };
}
function safeUrl(value: unknown) {
  if (!value) return '';
  const url = text(value, 'URL', 1, 2000);
  try { if (new URL(url).protocol !== 'https:') throw new Error(); } catch { throw new HttpError(400, 'Use an HTTPS image or tracking URL'); }
  return url;
}
function productInput(b: Record<string, unknown>) {
  return { sku: text(b.sku, 'SKU', 1, 80), title: text(b.title, 'Title', 2, 200), brand: text(b.brand || '', 'Brand', 0, 100), category: text(b.category, 'Category', 1, 80), description: text(b.description || '', 'Description', 0, 10000), price: integer(b.price, 'Price in minor currency units', 1, 100000000), stock: integer(b.stock, 'Stock', 0, 1000000), image: safeUrl(b.image), active: b.active === false || b.active === 0 ? 0 : 1, warranty_months: integer(b.warranty_months ?? 12, 'Warranty months', 0, 120) };
}
export function commerceRoutes(s: Store) {
  const r = Router();
  r.get('/store', (_req, res) => res.json(settings(s)));
  r.get('/products', (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.slice(0, 100) : '';
    res.json({ data: s.all<ProductRow>("SELECT * FROM products WHERE active=1 AND (title LIKE ? OR sku LIKE ? OR category LIKE ?) ORDER BY created_at DESC LIMIT 500", `%${search}%`, `%${search}%`, `%${search}%`) });
  });
  r.get('/cart', requireUser, (req, res) => res.json({ data: s.all('SELECT p.*,c.quantity FROM carts c JOIN products p ON p.id=c.product_id WHERE c.user_id=?', req.user!.id) }));
  r.put('/cart', requireUser, (req, res) => {
    const id = text(req.body.productId, 'Product'); const quantity = integer(req.body.quantity, 'Quantity', 0, 99);
    if (!quantity) s.run('DELETE FROM carts WHERE user_id=? AND product_id=?', req.user!.id, id);
    else {
      const p = s.get<ProductRow>('SELECT * FROM products WHERE id=? AND active=1', id);
      if (!p) throw new HttpError(404, 'Product not found');
      if (quantity > p.stock) throw new HttpError(409, 'Not enough stock');
      s.run('INSERT INTO carts VALUES (?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET quantity=excluded.quantity', req.user!.id, id, quantity);
    }
    res.json({ success: true });
  });
  r.post('/orders', requireUser, (req, res) => {
    const key = text(req.get('Idempotency-Key'), 'Checkout request key', 8, 100);
    const address = addressInput(req.body.address);
    if (!Array.isArray(req.body.items) || !req.body.items.length || req.body.items.length > 50) throw new HttpError(400, 'Cart must contain 1–50 items');
    const items = req.body.items.map((item: Record<string, unknown>) => ({ id: text(item?.productId, 'Product ID'), quantity: integer(item?.quantity, 'Quantity', 1, 99) })).sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id));
    if (new Set(items.map((i: { id: string }) => i.id)).size !== items.length) throw new HttpError(400, 'Duplicate cart items');
    const code = req.body.voucherCode ? text(req.body.voucherCode, 'Voucher', 1, 40).toUpperCase() : null;
    const creditId = req.body.creditId ? text(req.body.creditId, 'Credit ID') : null;
    const hash = createHash('sha256').update(JSON.stringify({ items, address, code, creditId })).digest('hex');
    const existing = s.get<OrderRow>('SELECT * FROM orders WHERE user_id=? AND request_key=?', req.user!.id, key);
    if (existing) { if (existing.request_hash !== hash) throw new HttpError(409, 'Checkout key was already used for a different request'); return res.json({ data: orderDetails(s, existing.id) }); }
    const id = randomUUID();
    s.transaction(() => {
      const cfg = settings(s);
      if (address.country !== cfg.country) throw new HttpError(400, `This store currently ships within ${cfg.country}`);
      const lines: { product: ProductRow; quantity: number }[] = items.map((item: { id: string; quantity: number }) => {
        const product = s.get<ProductRow>('SELECT * FROM products WHERE id=? AND active=1', item.id);
        if (!product || product.stock < item.quantity) throw new HttpError(409, 'A product is unavailable or has insufficient stock');
        return { product, quantity: item.quantity };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
      let discount = 0;
      if (code) {
        const voucher = s.get<{ discount: number; minimum: number }>('SELECT * FROM vouchers WHERE code=? AND active=1 AND uses<max_uses AND expires_at>? AND (owner_id IS NULL OR owner_id=?)', code, new Date().toISOString(), req.user!.id);
        if (!voucher || subtotal < voucher.minimum) throw new HttpError(400, 'Voucher is invalid, expired, exhausted, or minimum spend not met');
        discount = Math.min(voucher.discount, subtotal);
        s.run('UPDATE vouchers SET uses=uses+1 WHERE code=?', code);
      }
      const tax = Math.round((subtotal - discount) * cfg.taxBasisPoints / 10000);
      let total = subtotal - discount + cfg.shippingFee + tax;
      let credited = 0;
      if (creditId) {
        const credit = s.get<{ remaining: number }>("SELECT c.remaining FROM credits c JOIN enrollments e ON e.id=c.enrollment_id WHERE c.id=? AND c.user_id=? AND e.status='matured' AND e.currency=?", creditId, req.user!.id, cfg.currency);
        if (!credit || credit.remaining <= 0) throw new HttpError(400, 'Credit is unavailable');
        credited = Math.min(credit.remaining, total); total -= credited;
      }
      if ((total > 0 && total < 50) || total > 99999999 || (total === 0 && credited === 0)) throw new HttpError(400, 'Payable total must be at least 50 minor currency units or fully covered by savings credit');
      s.run('INSERT INTO orders(id,user_id,currency,subtotal,discount,shipping,tax,total,address,voucher_code,request_key,request_hash,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', id, req.user!.id, cfg.currency, subtotal, discount, cfg.shippingFee, tax, total, JSON.stringify(address), code, key, hash, Date.now() + 1800000);
      if (credited && creditId) {
        s.run('UPDATE credits SET remaining=remaining-? WHERE id=?', credited, creditId);
        s.run('INSERT INTO credit_redemptions(order_id,credit_id,amount) VALUES (?,?,?)', id, creditId, credited);
        s.run('UPDATE orders SET credited=? WHERE id=?', credited, id);
      }
      for (const line of lines) {
        s.run('UPDATE products SET stock=stock-? WHERE id=?', line.quantity, line.product.id);
        s.run('INSERT INTO order_items(order_id,product_id,title,sku,price,quantity,warranty_months) VALUES (?,?,?,?,?,?,?)', id, line.product.id, line.product.title, line.product.sku, line.product.price, line.quantity, line.product.warranty_months);
      }
      s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'pending_payment','Awaiting payment confirmation')", id);
      if (total === 0) {
        s.run("UPDATE orders SET status='paid' WHERE id=?", id);
        s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'paid','Paid using matured savings credit')", id);
        s.run('DELETE FROM carts WHERE user_id=? AND product_id IN (SELECT product_id FROM order_items WHERE order_id=?)', req.user!.id, id);
      }
      audit(s, req.user!.id, 'order.created', id);
    });
    res.status(201).json({ data: orderDetails(s, id) });
  });
  r.get('/orders', requireUser, (req, res) => res.json({ data: s.all<OrderRow>('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 200', req.user!.id).map(o => orderDetails(s, o.id)) }));
  r.get('/orders/:id', requireUser, (req, res) => {
    const o = orderDetails(s, String(req.params.id));
    if (o.user_id !== req.user!.id) throw new HttpError(404, 'Order not found');
    res.json({ data: o });
  });
  r.post('/orders/:id/cancel', requireUser, (req, res) => {
    const o = orderDetails(s, String(req.params.id));
    if (o.user_id !== req.user!.id) throw new HttpError(404, 'Order not found');
    if (o.checkout_id) throw new HttpError(409, 'A payment session exists. Wait for it to expire before cancelling.');
    s.transaction(() => cancelOrder(s, o.id, req.user!.id, 'Cancelled by customer'));
    res.json({ data: orderDetails(s, o.id) });
  });
  r.use('/admin', requireAdmin);
  r.get('/admin/summary', (_req, res) => res.json({ revenue: s.get<{ value: number }>("SELECT COALESCE(SUM(total),0) AS value FROM orders WHERE status IN ('paid','processing','shipped','delivered')")!.value, orders: s.get<{ count: number }>('SELECT COUNT(*) AS count FROM orders')!.count, customers: s.get<{ count: number }>("SELECT COUNT(*) AS count FROM users WHERE role='customer'")!.count, lowStock: s.all('SELECT id,title,stock FROM products WHERE active=1 AND stock<5'), recentOrders: s.all('SELECT id,total,currency,status,created_at FROM orders ORDER BY created_at DESC LIMIT 10') }));
  r.get('/admin/products', (_req, res) => res.json({ data: s.all('SELECT * FROM products ORDER BY created_at DESC') }));
  r.post('/admin/products', (req, res) => {
    const p = productInput(req.body); const id = randomUUID();
    if (s.get('SELECT id FROM products WHERE sku=?', p.sku)) throw new HttpError(409, 'SKU already exists');
    s.run('INSERT INTO products(id,sku,title,brand,category,description,price,stock,image,active,warranty_months) VALUES (?,?,?,?,?,?,?,?,?,?,?)', id, p.sku, p.title, p.brand, p.category, p.description, p.price, p.stock, p.image, p.active, p.warranty_months);
    audit(s, req.user!.id, 'product.created', id);
    res.status(201).json({ data: s.get('SELECT * FROM products WHERE id=?', id) });
  });
  r.put('/admin/products/:id', (req, res) => {
    const id = String(req.params.id); const p = productInput(req.body);
    if (!s.get('SELECT id FROM products WHERE id=?', id)) throw new HttpError(404, 'Product not found');
    if (s.get('SELECT id FROM products WHERE sku=? AND id<>?', p.sku, id)) throw new HttpError(409, 'SKU already exists');
    s.run('UPDATE products SET sku=?,title=?,brand=?,category=?,description=?,price=?,stock=?,image=?,active=?,warranty_months=? WHERE id=?', p.sku, p.title, p.brand, p.category, p.description, p.price, p.stock, p.image, p.active, p.warranty_months, id);
    audit(s, req.user!.id, 'product.updated', id);
    res.json({ data: s.get('SELECT * FROM products WHERE id=?', id) });
  });
  r.get('/admin/orders', (_req, res) => res.json({ data: s.all<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500').map(o => orderDetails(s, o.id)) }));
  r.put('/admin/orders/:id', (req, res) => {
    const id = String(req.params.id); const o = orderDetails(s, id);
    const transitions: Record<string, string[]> = { paid: ['processing', 'shipped'], processing: ['shipped'], shipped: ['delivered'] };
    const status = text(req.body.status, 'Status');
    if (!transitions[o.status]?.includes(status)) throw new HttpError(409, 'Invalid order status transition');
    const carrier = status === 'shipped' ? text(req.body.carrier, 'Carrier', 2, 100) : o.carrier;
    const number = status === 'shipped' ? text(req.body.trackingNumber, 'Tracking number', 2, 100) : o.tracking_number;
    const url = status === 'shipped' ? safeUrl(req.body.trackingUrl) : o.tracking_url;
    s.transaction(() => {
      s.run('UPDATE orders SET status=?,carrier=?,tracking_number=?,tracking_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', status, carrier, number, url, id);
      s.run('INSERT INTO order_events(order_id,status,note) VALUES (?,?,?)', id, status, `Updated by store staff${number ? `: ${carrier} ${number}` : ''}`);
      audit(s, req.user!.id, 'order.status_updated', id, { status });
    });
    res.json({ data: orderDetails(s, id) });
  });
  r.get('/admin/vouchers', (_req, res) => res.json({ data: s.all('SELECT * FROM vouchers ORDER BY code') }));
  r.post('/admin/vouchers', (req, res) => {
    const code = text(req.body.code, 'Code', 3, 40).toUpperCase();
    if (!/^[A-Z0-9_-]+$/.test(code)) throw new HttpError(400, 'Voucher code may contain letters, digits, underscores and hyphens');
    const expiry = new Date(text(req.body.expiresAt, 'Expiry date'));
    if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()) throw new HttpError(400, 'Expiry must be in the future');
    if (s.get('SELECT code FROM vouchers WHERE code=?', code)) throw new HttpError(409, 'Voucher code already exists');
    s.run('INSERT INTO vouchers(code,discount,minimum,max_uses,expires_at) VALUES (?,?,?,?,?)', code, integer(req.body.discount, 'Discount', 1), integer(req.body.minimum, 'Minimum'), integer(req.body.maxUses, 'Maximum uses', 1, 1000000), expiry.toISOString());
    audit(s, req.user!.id, 'voucher.created', code);
    res.status(201).json({ success: true });
  });
  r.delete('/admin/vouchers/:code', (req, res) => { s.run('UPDATE vouchers SET active=0 WHERE code=?', String(req.params.code)); audit(s, req.user!.id, 'voucher.disabled', String(req.params.code)); res.json({ success: true }); });
  r.put('/admin/settings', (req, res) => {
    const previous = settings(s); const b = req.body;
    const currency = text(b.currency, 'Currency', 3, 3).toUpperCase();
    if (!['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'SGD', 'AED'].includes(currency)) throw new HttpError(400, 'Unsupported currency');
    if (currency !== previous.currency && (s.get('SELECT id FROM orders LIMIT 1') || s.get('SELECT id FROM enrollments LIMIT 1'))) throw new HttpError(409, 'Currency cannot change after orders or savings enrollments exist. Use a separate store for another currency.');
    const country = text(b.country, 'Country', 2, 2).toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) throw new HttpError(400, 'Invalid country code');
    const value: Settings = { name: text(b.name, 'Store name', 2, 100), currency, country, shippingFee: integer(b.shippingFee, 'Shipping fee'), taxBasisPoints: integer(b.taxBasisPoints, 'Tax basis points', 0, 10000), supportEmail: text(b.supportEmail || '', 'Support email', 0, 254), address: text(b.address || '', 'Store address', 0, 1000) };
    s.run("UPDATE settings SET value=? WHERE key='store'", JSON.stringify(value));
    audit(s, req.user!.id, 'settings.updated');
    res.json(value);
  });
  r.get('/admin/customers', (_req, res) => res.json({ data: s.all('SELECT id,email,name,phone,phone_verified,kyc_status,disabled,created_at FROM users WHERE role=? ORDER BY created_at DESC LIMIT 500', 'customer') }));
  r.put('/admin/customers/:id', (req, res) => {
    const id = String(req.params.id);
    if (typeof req.body.disabled !== 'boolean') throw new HttpError(400, 'Disabled must be a boolean');
    if (!s.get("SELECT id FROM users WHERE id=? AND role='customer'", id)) throw new HttpError(404, 'Customer not found');
    s.run('UPDATE users SET disabled=? WHERE id=?', req.body.disabled ? 1 : 0, id);
    s.run('DELETE FROM sessions WHERE user_id=?', id);
    audit(s, req.user!.id, req.body.disabled ? 'customer.disabled' : 'customer.enabled', id);
    res.json({ success: true });
  });
  return r;
}

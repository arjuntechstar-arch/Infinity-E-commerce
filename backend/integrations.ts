import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';
import { Store, audit } from './db';
import { Providers } from './providers';
import { HttpError, text } from './http';
import { requireUser, requireAdmin, rateLimit } from './auth';
import { orderDetails, cancelOrder, returnCredit, type OrderRow } from './commerce';
import { savingsEvent } from './savings';

export function stripeWebhook(s: Store, p: Providers) {
  return async (req: Request, res: Response) => {
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new HttpError(503, 'Webhook is not configured');
    let event: Stripe.Event;
    try { event = p.stripe().webhooks.constructEvent(req.body, req.get('stripe-signature') || '', process.env.STRIPE_WEBHOOK_SECRET); }
    catch { throw new HttpError(400, 'Invalid webhook signature'); }
    if (s.get('SELECT id FROM provider_events WHERE id=?', event.id)) return res.json({ received: true });
    await savingsEvent(s, p, event);
    s.transaction(() => {
      if (s.get('SELECT id FROM provider_events WHERE id=?', event.id)) return;
      if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId && session.payment_status === 'paid') {
          const o = s.get<OrderRow>('SELECT * FROM orders WHERE id=?', orderId);
          if (!o || o.checkout_id !== session.id) throw new HttpError(409, 'Checkout has not been recorded yet');
          if (o.total !== session.amount_total || o.currency.toLowerCase() !== session.currency) throw new HttpError(409, 'Payment amount or currency mismatch');
          if (o.status === 'pending_payment') {
            const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
            if (!paymentId) throw new HttpError(409, 'Missing payment reference');
            s.run("UPDATE orders SET status='paid',payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", paymentId, orderId);
            s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'paid','Payment confirmed by Stripe')", orderId);
            s.run('DELETE FROM carts WHERE user_id=? AND product_id IN (SELECT product_id FROM order_items WHERE order_id=?)', o.user_id, orderId);
            audit(s, null, 'payment.confirmed', orderId);
          }
        }
      }
      if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const o = s.get<OrderRow>('SELECT * FROM orders WHERE checkout_id=?', session.id);
        if (o?.status === 'pending_payment') cancelOrder(s, o.id, null, event.type.endsWith('expired') ? 'Payment session expired' : 'Payment failed');
      }
      if (event.type.startsWith('identity.verification_session.')) {
        const v = event.data.object as Stripe.Identity.VerificationSession;
        const local = s.get<{ user_id: string; status: string }>("SELECT * FROM verifications WHERE id=? AND kind='identity'", v.id);
        if (local && (local.status !== 'verified' || v.status === 'verified')) {
          s.run('UPDATE verifications SET status=? WHERE id=?', v.status, v.id);
          s.run('UPDATE users SET kyc_status=? WHERE id=?', v.status, local.user_id);
          audit(s, null, 'identity.' + v.status, local.user_id);
        }
      }
      if (event.type === 'refund.updated' || event.type === 'refund.created' || event.type === 'refund.failed') {
        const ref = event.data.object as Stripe.Refund;
        const row = s.get<{ id: string; order_id: string; previous_status: string; status: string }>('SELECT * FROM refunds WHERE provider_id=? OR id=?', ref.id, ref.metadata?.refundId || '');
        if (row && row.status !== 'succeeded') {
          s.run('UPDATE refunds SET provider_id=?,status=? WHERE id=?', ref.id, ref.status || 'pending', row.id);
          if (ref.status === 'succeeded') {
            returnCredit(s, row.order_id);
            s.run("UPDATE orders SET status='refunded',updated_at=CURRENT_TIMESTAMP WHERE id=?", row.order_id);
            s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'refunded','Refund confirmed by Stripe')", row.order_id);
          } else if (ref.status === 'failed' || ref.status === 'canceled') s.run('UPDATE orders SET status=? WHERE id=?', row.previous_status, row.order_id);
        }
      }
      s.run('INSERT INTO provider_events(id,type) VALUES (?,?)', event.id, event.type);
    });
    res.json({ received: true });
  };
}

export function integrationRoutes(s: Store, p: Providers) {
  const r = Router();
  r.get('/capabilities', (_req, res) => res.json(p.capabilities()));
  r.post('/orders/:id/pay', requireUser, async (req, res) => {
    const order = orderDetails(s, String(req.params.id));
    if (order.user_id !== req.user!.id) throw new HttpError(404, 'Order not found');
    if (order.status !== 'pending_payment') throw new HttpError(409, 'Order is not awaiting payment');
    const stripe = p.stripe(); const url = p.appUrl();
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new HttpError(503, 'Payment confirmation is not configured');
    if (order.checkout_id === 'creating') throw new HttpError(409, 'Payment setup is already running. Try again shortly.');
    if (order.checkout_id) {
      const session = await stripe.checkout.sessions.retrieve(order.checkout_id);
      if (session.status !== 'open' || !session.url) throw new HttpError(409, 'This payment session is no longer open. Refresh the order.');
      return res.json({ url: session.url });
    }
    if (!order.checkout_id && Date.now() > order.expires_at) {
      s.transaction(() => cancelOrder(s, order.id, req.user!.id, 'Reservation expired'));
      throw new HttpError(409, 'Reservation expired. Create a new order.');
    }
    s.run("UPDATE orders SET checkout_id='creating' WHERE id=? AND checkout_id IS NULL", order.id);
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({ mode: 'payment', customer_email: req.user!.email, client_reference_id: order.id, metadata: { orderId: order.id }, payment_intent_data: { metadata: { orderId: order.id } }, line_items: [{ price_data: { currency: order.currency.toLowerCase(), unit_amount: order.total, product_data: { name: `Order ${order.id.slice(0, 8)}` } }, quantity: 1 }], success_url: `${url}/?view=orders&payment=returned`, cancel_url: `${url}/?view=orders` }, { idempotencyKey: 'checkout-' + order.id });
    } catch (error) {
      s.run("UPDATE orders SET checkout_id=NULL WHERE id=? AND checkout_id='creating'", order.id);
      throw error;
    }
    s.run('UPDATE orders SET checkout_id=? WHERE id=?', session.id, order.id);
    if (!session.url) throw new HttpError(502, 'Payment provider did not return a checkout URL');
    res.json({ url: session.url });
  });
  r.post('/phone/send', requireUser, async (req, res) => {
    rateLimit(s, `otp-send:${req.user!.id}`, 5);
    const phone = text(req.body.phone, 'Phone', 8, 16);
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new HttpError(400, 'Use international phone format, e.g. +12025550123');
    const result = await p.verifyPhone(phone);
    if (result.status !== 'pending') throw new HttpError(502, 'Verification could not be started');
    s.run("INSERT INTO verifications(id,user_id,kind,target,status) VALUES (?,?,'phone',?,'pending') ON CONFLICT(id) DO UPDATE SET status='pending'", result.sid, req.user!.id, phone);
    res.json({ success: true });
  });
  r.post('/phone/check', requireUser, async (req, res) => {
    rateLimit(s, `otp-check:${req.user!.id}`, 10);
    const phone = text(req.body.phone, 'Phone', 8, 16); const code = text(req.body.code, 'Code', 4, 10);
    const pending = s.get<{ id: string }>("SELECT id FROM verifications WHERE user_id=? AND kind='phone' AND target=? AND status='pending' ORDER BY created_at DESC LIMIT 1", req.user!.id, phone);
    if (!pending) throw new HttpError(400, 'Request a verification code first');
    const result = await p.verifyPhone(phone, code);
    if (result.status !== 'approved' || result.to !== phone) throw new HttpError(400, 'Incorrect or expired verification code');
    s.transaction(() => {
      s.run("UPDATE verifications SET status='approved' WHERE id=?", pending.id);
      s.run('UPDATE users SET phone=?,phone_verified=1 WHERE id=?', phone, req.user!.id);
      audit(s, req.user!.id, 'phone.verified', req.user!.id);
    });
    res.json({ success: true });
  });
  r.post('/identity/start', requireUser, async (req, res) => {
    rateLimit(s, `identity:${req.user!.id}`, 3, 86400000);
    const stripe = p.stripe(); const url = p.appUrl();
    const previous = s.get<{ id: string }>("SELECT id FROM verifications WHERE user_id=? AND kind='identity' AND status IN ('requires_input','processing') ORDER BY created_at DESC LIMIT 1", req.user!.id);
    const session = previous ? await stripe.identity.verificationSessions.retrieve(previous.id) : await stripe.identity.verificationSessions.create({ type: 'document', metadata: { userId: req.user!.id }, return_url: `${url}/?view=account` }, { idempotencyKey: `identity-${req.user!.id}-${Date.now()}` });
    s.run("INSERT INTO verifications(id,user_id,kind,status) VALUES (?,?,'identity',?) ON CONFLICT(id) DO UPDATE SET status=excluded.status", session.id, req.user!.id, session.status);
    s.run('UPDATE users SET kyc_status=? WHERE id=?', session.status, req.user!.id);
    if (!session.url) throw new HttpError(409, 'Identity verification is already processing. Refresh your account later.');
    res.json({ url: session.url });
  });
  r.post('/admin/orders/:id/refund', requireAdmin, async (req, res) => {
    const order = orderDetails(s, String(req.params.id));
    if (!['paid', 'processing', 'shipped', 'delivered', 'refund_pending'].includes(order.status)) throw new HttpError(409, 'Order cannot be refunded');
    if (order.total === 0) {
      s.transaction(() => { returnCredit(s, order.id); s.run("UPDATE orders SET status='refunded' WHERE id=?", order.id); s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'refunded','Savings credit returned')", order.id); audit(s, req.user!.id, 'refund.credit_returned', order.id); });
      return res.json({ data: 'succeeded' });
    }
    if (!order.payment_id) throw new HttpError(409, 'Payment reference is missing');
    const stripe = p.stripe();
    let record = s.get<{ id: string; status: string }>('SELECT * FROM refunds WHERE order_id=?', order.id);
    if (record && ['failed', 'canceled'].includes(record.status)) throw new HttpError(409, 'Previous refund failed. Resolve it in Stripe and reconcile the order before retrying.');
    if (!record) {
      record = { id: randomUUID(), status: 'requested' };
      s.transaction(() => {
        s.run('INSERT INTO refunds(id,order_id,status,previous_status,amount) VALUES (?,?,?,?,?)', record!.id, order.id, 'requested', order.status, order.total);
        s.run("UPDATE orders SET status='refund_pending' WHERE id=?", order.id);
      });
    }
    const refund = await stripe.refunds.create({ payment_intent: order.payment_id, amount: order.total, metadata: { refundId: record.id } }, { idempotencyKey: 'refund-' + record.id });
    s.transaction(() => {
      s.run('UPDATE refunds SET provider_id=?,status=? WHERE id=?', refund.id, refund.status || 'pending', record!.id);
      if (refund.status === 'succeeded') {
        returnCredit(s, order.id);
        s.run("UPDATE orders SET status='refunded' WHERE id=?", order.id);
        s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'refunded','Refund confirmed by Stripe')", order.id);
      }
      audit(s, req.user!.id, 'refund.requested', order.id);
    });
    res.json({ data: refund.status });
  });
  r.post('/admin/orders/:id/shipping-rates', requireAdmin, async (req, res) => {
    const order = orderDetails(s, String(req.params.id));
    if (!['paid', 'processing'].includes(order.status)) throw new HttpError(409, 'Only paid orders can be shipped');
    let from: object;
    try { from = JSON.parse(process.env.SHIP_FROM_ADDRESS || ''); } catch { throw new HttpError(503, 'Shipping origin is not configured'); }
    const parcel = req.body.parcel;
    for (const field of ['length', 'width', 'height', 'weight']) if (typeof parcel?.[field] !== 'number' || !Number.isFinite(parcel[field]) || parcel[field] <= 0 || parcel[field] > 10000) throw new HttpError(400, 'Provide positive parcel dimensions in cm and weight in kg');
    const a = order.address;
    const shipment = await p.shippo('/shipments/', { address_from: from, address_to: { name: a.name, street1: a.line1, street2: a.line2, city: a.city, state: a.state, zip: a.postalCode, country: a.country, phone: a.phone }, parcels: [{ length: parcel.length, width: parcel.width, height: parcel.height, distance_unit: 'cm', weight: parcel.weight, mass_unit: 'kg' }], async: false });
    if (!shipment.rates?.length) throw new HttpError(422, 'No shipping rates available for this address and parcel');
    s.run('INSERT INTO shipping_quotes VALUES (?,?,?,?)', shipment.object_id, order.id, JSON.stringify(shipment.rates), Date.now() + 1800000);
    res.json({ data: shipment.rates });
  });
  r.post('/admin/orders/:id/shipping-label', requireAdmin, async (req, res) => {
    const order = orderDetails(s, String(req.params.id));
    if (!['paid', 'processing'].includes(order.status)) throw new HttpError(409, 'Order cannot be shipped');
    const rateId = text(req.body.rateId, 'Shipping rate');
    const quote = s.all<{ rates: string }>('SELECT rates FROM shipping_quotes WHERE order_id=? AND expires_at>?', order.id, Date.now()).flatMap(q => JSON.parse(q.rates) as { object_id: string; provider: string }[]).find(q => q.object_id === rateId);
    if (!quote) throw new HttpError(400, 'Select a current rate for this order');
    const existing = s.get<{ provider_id: string; status: string; label_url: string }>('SELECT * FROM shipping_labels WHERE order_id=?', order.id);
    if (existing?.label_url) return res.json({ url: existing.label_url });
    if (existing) throw new HttpError(409, 'A label request is already in progress. Reconcile with Shippo before retrying to prevent duplicate charges.');
    s.run("INSERT INTO shipping_labels(order_id,status,rate_id) VALUES (?,'requesting',?)", order.id, rateId);
    let transaction: Awaited<ReturnType<Providers['shippo']>>;
    try { transaction = await p.shippo('/transactions/', { rate: rateId, label_file_type: 'PDF', async: false, metadata: order.id }); }
    catch (error) {
      // No transaction reference means the provider outcome is unknown. Keep the
      // reservation and block another purchase until the buyer reconciles Shippo.
      s.run("UPDATE shipping_labels SET status='outcome_unknown' WHERE order_id=?", order.id);
      throw error;
    }
    s.run('UPDATE shipping_labels SET provider_id=?,status=?,label_url=? WHERE order_id=?', transaction.object_id, transaction.status, transaction.label_url || '', order.id);
    if (transaction.status !== 'SUCCESS' || !transaction.label_url) throw new HttpError(502, 'Shipping label is not ready. Check the transaction in Shippo.');
    s.transaction(() => {
      s.run("UPDATE orders SET status='shipped',carrier=?,tracking_number=?,tracking_url=? WHERE id=?", quote.provider, transaction.tracking_number, transaction.tracking_url_provider || '', order.id);
      s.run("INSERT INTO order_events(order_id,status,note) VALUES (?,'shipped',?)", order.id, `${quote.provider}: ${transaction.tracking_number}`);
      audit(s, req.user!.id, 'shipping.label_purchased', order.id);
    });
    res.json({ url: transaction.label_url });
  });
  r.post('/admin/orders/:id/shipping-label/reconcile', requireAdmin, async (req, res) => {
    const order = orderDetails(s, String(req.params.id));
    const transaction = s.get<{ provider_id: string; status: string; label_url: string }>('SELECT * FROM shipping_labels WHERE order_id=?', order.id);
    if (!transaction) throw new HttpError(404, 'No shipping label transaction exists');
    if (!transaction.provider_id) throw new HttpError(409, 'No transaction reference was returned. Inspect the order in Shippo using the order ID metadata; contact support to reconcile before purchasing another label.');
    if (transaction.label_url) return res.json({ url: transaction.label_url, status: transaction.status });
    const result = await p.shippo(`/transactions/${encodeURIComponent(transaction.provider_id)}/`);
    s.run('UPDATE shipping_labels SET status=?,label_url=? WHERE order_id=?', result.status, result.label_url || '', order.id);
    if (result.status === 'SUCCESS' && result.label_url) {
      const label = s.get<{ rate_id: string }>('SELECT rate_id FROM shipping_labels WHERE order_id=?', order.id);
      const quote = s.all<{ rates: string }>('SELECT rates FROM shipping_quotes WHERE order_id=? ORDER BY expires_at DESC', order.id).flatMap(q => JSON.parse(q.rates) as { object_id: string; provider: string }[]).find(rate => rate.object_id === label?.rate_id);
      s.transaction(() => {
        s.run("UPDATE orders SET status='shipped',carrier=COALESCE(NULLIF(carrier,''),?),tracking_number=?,tracking_url=? WHERE id=?", quote?.provider || 'Shippo carrier', result.tracking_number || '', result.tracking_url_provider || '', order.id);
        s.run("INSERT INTO order_events(order_id,status,note) SELECT ?,'shipped','Shipping label confirmed from provider' WHERE NOT EXISTS (SELECT 1 FROM order_events WHERE order_id=? AND status='shipped')", order.id, order.id);
        audit(s, req.user!.id, 'shipping.label_reconciled', order.id);
      });
    }
    res.json({ data: result.status, url: result.label_url || null });
  });
  return r;
}

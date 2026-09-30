import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';
import { Store, audit } from './db';
import { Providers } from './providers';
import { HttpError, integer, text } from './http';
import { requireAdmin, requireUser } from './auth';
import { settings } from './commerce';

interface Plan { id: string; name: string; monthly: number; months: number; bonus_bps: number; terms: string }
interface Enrollment { id: string; user_id: string; plan_id: string; currency: string; monthly: number; months: number; bonus_bps: number; status: string; subscription_id: string | null; checkout_id: string | null }
const objectId = (value: string | { id: string } | null | undefined) => typeof value === 'string' ? value : value?.id;

export async function savingsEvent(s: Store, p: Providers, event: Stripe.Event) {
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const enrollmentId = invoice.parent?.subscription_details?.metadata?.enrollmentId;
    if (!enrollmentId) return;
    const e = s.get<Enrollment>('SELECT * FROM enrollments WHERE id=?', enrollmentId);
    if (!e) throw new HttpError(409, 'Enrollment not recorded');
    if (invoice.amount_paid !== e.monthly || invoice.currency !== e.currency.toLowerCase()) throw new HttpError(409, 'Installment amount mismatch');
    const subscriptionId = objectId(invoice.parent?.subscription_details?.subscription);
    if (!subscriptionId) throw new HttpError(409, 'Subscription reference missing');
    const stripe = p.stripe();
    const payments = await stripe.invoicePayments.list({ invoice: invoice.id, status: 'paid', limit: 10 });
    const paymentId = objectId(payments.data.find(payment => payment.payment.type === 'payment_intent')?.payment.payment_intent);
    if (!paymentId) throw new HttpError(409, 'Installment payment reference is not available yet');
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.metadata.enrollmentId !== e.id) throw new HttpError(409, 'Subscription ownership mismatch');
    if (!subscription.cancel_at && subscription.status !== 'canceled') {
      const date = new Date(subscription.billing_cycle_anchor * 1000);
      const day = date.getUTCDate(); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + e.months);
      const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate(); date.setUTCDate(Math.min(day, lastDay));
      const cancelAt = Math.floor(date.getTime() / 1000);
      await stripe.subscriptions.update(subscriptionId, { cancel_at: cancelAt, proration_behavior: 'none' }, { idempotencyKey: 'term-' + e.id });
      s.run('UPDATE enrollments SET cancel_at=? WHERE id=?', cancelAt, e.id);
    }
    s.transaction(() => {
      s.run('INSERT OR IGNORE INTO installments(id,enrollment_id,payment_id,amount) VALUES (?,?,?,?)', invoice.id, e.id, paymentId, invoice.amount_paid);
      s.run('UPDATE enrollments SET subscription_id=? WHERE id=?', subscriptionId, e.id);
      const deposits = s.get<{ count: number; total: number }>('SELECT COUNT(*) AS count,COALESCE(SUM(amount),0) AS total FROM installments WHERE enrollment_id=?', e.id)!;
      const current = s.get<{ status: string }>('SELECT status FROM enrollments WHERE id=?', e.id)!;
      if (['withdrawing', 'withdrawn'].includes(current.status)) return;
      const complete = deposits.count >= e.months;
      s.run('UPDATE enrollments SET status=? WHERE id=?', complete ? 'matured' : 'active', e.id);
      if (complete) {
        const amount = deposits.total + Math.round(deposits.total * e.bonus_bps / 10000);
        s.run('INSERT OR IGNORE INTO credits(id,user_id,enrollment_id,amount,remaining) VALUES (?,?,?,?,?)', randomUUID(), e.user_id, e.id, amount, amount);
      }
      audit(s, null, 'savings.installment_paid', e.id, { invoice: invoice.id });
    });
    const current = s.get<{ status: string }>('SELECT status FROM enrollments WHERE id=?', e.id)!;
    if (['withdrawing', 'withdrawn'].includes(current.status)) {
      const refund = await stripe.refunds.create({ payment_intent: paymentId, amount: invoice.amount_paid, metadata: { installmentId: invoice.id } }, { idempotencyKey: 'withdraw-' + invoice.id });
      s.run('UPDATE installments SET refund_id=?,refund_status=? WHERE id=?', refund.id, refund.status || 'pending', invoice.id);
      if (refund.status !== 'succeeded') s.run("UPDATE enrollments SET status='withdrawing' WHERE id=?", e.id);
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    s.run("UPDATE enrollments SET status='stopped' WHERE subscription_id=? AND status IN ('active','pending')", subscription.id);
  }
  if (['refund.updated', 'refund.created', 'refund.failed'].includes(event.type)) {
    const refund = event.data.object as Stripe.Refund;
    const installment = s.get<{ enrollment_id: string; id: string; refund_status: string }>('SELECT * FROM installments WHERE refund_id=? OR id=?', refund.id, refund.metadata?.installmentId || '');
    if (installment && installment.refund_status !== 'succeeded') {
      s.run('UPDATE installments SET refund_id=?,refund_status=? WHERE id=?', refund.id, refund.status || 'pending', installment.id);
      if (!s.get("SELECT id FROM installments WHERE enrollment_id=? AND refund_status<>'succeeded'", installment.enrollment_id)) s.run("UPDATE enrollments SET status='withdrawn' WHERE id=?", installment.enrollment_id);
    }
  }
}

export function savingsRoutes(s: Store, p: Providers) {
  const r = Router();
  r.get('/schemes', (_req, res) => res.json({ data: s.all('SELECT * FROM scheme_plans WHERE active=1') }));
  r.get('/savings', requireUser, (req, res) => res.json({ data: s.all("SELECT e.*,p.name,(SELECT COALESCE(SUM(amount),0) FROM installments WHERE enrollment_id=e.id) AS deposited,(SELECT COUNT(*) FROM installments WHERE enrollment_id=e.id) AS installments FROM enrollments e JOIN scheme_plans p ON p.id=e.plan_id WHERE user_id=? ORDER BY e.created_at DESC", req.user!.id), credits: s.all('SELECT * FROM credits WHERE user_id=?', req.user!.id) }));
  r.post('/schemes/:id/enroll', requireUser, async (req, res) => {
    if (!req.user!.phone_verified || req.user!.kyc_status !== 'verified') throw new HttpError(409, 'Verify your phone and identity before enrolling');
    if (req.body.acceptTerms !== true) throw new HttpError(400, 'Accept the plan terms to continue');
    const plan = s.get<Plan>('SELECT * FROM scheme_plans WHERE id=? AND active=1', String(req.params.id));
    if (!plan) throw new HttpError(404, 'Savings plan not found');
    const stripe = p.stripe(); const url = p.appUrl();
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new HttpError(503, 'Payment confirmation is not configured');
    let e = s.get<Enrollment>("SELECT * FROM enrollments WHERE user_id=? AND plan_id=? AND status='pending'", req.user!.id, plan.id);
    if (!e) {
      const id = randomUUID();
      s.run('INSERT INTO enrollments(id,user_id,plan_id,currency,monthly,months,bonus_bps) VALUES (?,?,?,?,?,?,?)', id, req.user!.id, plan.id, settings(s).currency, plan.monthly, plan.months, plan.bonus_bps);
      e = s.get<Enrollment>('SELECT * FROM enrollments WHERE id=?', id)!;
    }
    if (e.checkout_id) {
      const existing = await stripe.checkout.sessions.retrieve(e.checkout_id);
      if (existing.status === 'open' && existing.url) return res.json({ url: existing.url });
      if (existing.status === 'expired') { s.run("UPDATE enrollments SET status='expired' WHERE id=?", e.id); throw new HttpError(409, 'Enrollment checkout expired. Start enrollment again.'); }
      throw new HttpError(409, 'Enrollment is awaiting payment confirmation');
    }
    const session = await stripe.checkout.sessions.create({ mode: 'subscription', customer_email: req.user!.email, line_items: [{ price_data: { currency: e.currency.toLowerCase(), unit_amount: e.monthly, recurring: { interval: 'month' }, product_data: { name: plan.name } }, quantity: 1 }], subscription_data: { metadata: { enrollmentId: e.id } }, metadata: { enrollmentId: e.id }, success_url: `${url}/?view=savings`, cancel_url: `${url}/?view=savings` }, { idempotencyKey: 'enroll-' + e.id });
    s.run('UPDATE enrollments SET checkout_id=? WHERE id=?', session.id, e.id);
    audit(s, req.user!.id, 'savings.enrollment_requested', e.id);
    res.json({ url: session.url });
  });
  r.post('/savings/:id/withdraw', requireUser, async (req, res) => {
    const e = s.get<Enrollment>('SELECT * FROM enrollments WHERE id=? AND user_id=?', String(req.params.id), req.user!.id);
    if (!e) throw new HttpError(404, 'Enrollment not found');
    if (!['active', 'stopped', 'matured', 'withdrawing'].includes(e.status)) throw new HttpError(409, 'Enrollment cannot be withdrawn');
    const stripe = p.stripe();
    s.transaction(() => {
      const credit = s.get<{ amount: number; remaining: number }>('SELECT * FROM credits WHERE enrollment_id=?', e.id);
      if (credit && credit.amount !== credit.remaining && e.status !== 'withdrawing') throw new HttpError(409, 'Credit already used or reserved in an order cannot be withdrawn');
      s.run('UPDATE credits SET remaining=0 WHERE enrollment_id=?', e.id);
      s.run("UPDATE enrollments SET status='withdrawing' WHERE id=?", e.id);
    });
    if (e.subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(e.subscription_id);
      if (subscription.status !== 'canceled') await stripe.subscriptions.cancel(e.subscription_id, { prorate: false, invoice_now: false });
    }
    for (const i of s.all<{ id: string; payment_id: string; amount: number; refund_status: string }>('SELECT * FROM installments WHERE enrollment_id=?', e.id)) {
      if (i.refund_status === 'succeeded') continue;
      if (['failed', 'canceled'].includes(i.refund_status)) throw new HttpError(409, 'A refund needs provider reconciliation. Contact support.');
      const refund = await stripe.refunds.create({ payment_intent: i.payment_id, amount: i.amount, metadata: { installmentId: i.id } }, { idempotencyKey: 'withdraw-' + i.id });
      s.run('UPDATE installments SET refund_id=?,refund_status=? WHERE id=?', refund.id, refund.status || 'pending', i.id);
    }
    if (!s.get("SELECT id FROM installments WHERE enrollment_id=? AND refund_status<>'succeeded'", e.id)) s.run("UPDATE enrollments SET status='withdrawn' WHERE id=?", e.id);
    audit(s, req.user!.id, 'savings.withdrawal_requested', e.id);
    res.json({ success: true, message: 'Refunds requested to the original payment methods. Settlement depends on your bank.' });
  });
  r.get('/admin/schemes', requireAdmin, (_req, res) => res.json({ data: s.all('SELECT * FROM scheme_plans'), enrollments: s.all('SELECT e.*,u.email,p.name FROM enrollments e JOIN users u ON u.id=e.user_id JOIN scheme_plans p ON p.id=e.plan_id ORDER BY e.created_at DESC LIMIT 500') }));
  r.post('/admin/schemes', requireAdmin, (req, res) => {
    const id = randomUUID();
    s.run('INSERT INTO scheme_plans(id,name,monthly,months,bonus_bps,terms) VALUES (?,?,?,?,?,?)', id, text(req.body.name, 'Plan name', 3, 100), integer(req.body.monthly, 'Monthly deposit', 50, 10000000), integer(req.body.months, 'Months', 1, 24), integer(req.body.bonusBps, 'Bonus basis points', 0, 5000), text(req.body.terms, 'Plan terms', 20, 5000));
    audit(s, req.user!.id, 'savings.plan_created', id);
    res.status(201).json({ success: true });
  });
  r.delete('/admin/schemes/:id', requireAdmin, (req, res) => { s.run('UPDATE scheme_plans SET active=0 WHERE id=?', String(req.params.id)); audit(s, req.user!.id, 'savings.plan_retired', String(req.params.id)); res.json({ success: true }); });
  return r;
}

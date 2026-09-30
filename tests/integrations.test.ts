import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { Providers } from '../backend/providers';
import { Store } from '../backend/db';
import { testServer } from './helpers';

test('signed Stripe confirmation validates amount, deduplicates payment and handles failed signatures', async () => {
  const oldSecret = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_contract_only';
  const sdk = new Stripe('sk_test_contract_only');
  class TestProviders extends Providers { override stripe() { return sdk; } }
  const app = await testServer(new Store(':memory:'), new TestProviders());
  try {
    app.store.run("INSERT INTO users(id,email,name,password_hash) VALUES ('buyer','buyer@test.local','Buyer','test-only')");
    app.store.run("INSERT INTO orders(id,user_id,currency,subtotal,discount,shipping,tax,total,address,request_key,request_hash,expires_at,checkout_id) VALUES ('order','buyer','USD',5000,0,0,0,5000,'{}','key','hash',9999999999999,'cs_test')");
    const send = async (event: object, valid = true) => {
      const body = JSON.stringify(event);
      const header = sdk.webhooks.generateTestHeaderString({ payload: body, secret: valid ? process.env.STRIPE_WEBHOOK_SECRET! : 'wrong_secret' });
      return fetch(app.base + '/api/webhooks/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': header }, body });
    };
    const session = { id: 'cs_test', metadata: { orderId: 'order' }, payment_status: 'paid', payment_intent: 'pi_test', amount_total: 5000, currency: 'usd' };
    assert.equal((await send({ id: 'evt_bad', type: 'checkout.session.completed', data: { object: session } }, false)).status, 400);
    assert.equal((await send({ id: 'evt_amount', type: 'checkout.session.completed', data: { object: { ...session, amount_total: 1 } } })).status, 409);
    assert.equal(app.store.get<{ status: string }>("SELECT status FROM orders WHERE id='order'")!.status, 'pending_payment');
    const event = { id: 'evt_paid', type: 'checkout.session.completed', data: { object: session } };
    assert.equal((await send(event)).status, 200);
    assert.equal((await send(event)).status, 200);
    assert.equal((await send({ ...event, id: 'evt_also_paid', type: 'checkout.session.async_payment_succeeded' })).status, 200);
    assert.equal(app.store.get<{ status: string }>("SELECT status FROM orders WHERE id='order'")!.status, 'paid');
    assert.equal(app.store.all("SELECT * FROM order_events WHERE status='paid'").length, 1);
  } finally { await app.close(); if (oldSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET; else process.env.STRIPE_WEBHOOK_SECRET = oldSecret; }
});

test('OTP updates phone only after provider approval and mismatched codes remain unverified', async () => {
  class TestProviders extends Providers {
    override async verifyPhone(phone: string, code?: string) { return { sid: 'VE_test', to: phone, status: !code ? 'pending' : code === '123456' ? 'approved' : 'pending' }; }
  }
  const app = await testServer(new Store(':memory:'), new TestProviders());
  try {
    const client = app.client();
    await client.call('/auth/register', 'POST', { name: 'Buyer', email: 'otp@example.test', password: 'secure-password-123' });
    const body = { phone: '+12025550123' };
    assert.equal((await client.call('/phone/send', 'POST', body)).res.status, 200);
    assert.equal((await client.call('/phone/check', 'POST', { ...body, code: '000000' })).res.status, 400);
    assert.equal((await client.call('/auth/session')).data.user.phoneVerified, false);
    assert.equal((await client.call('/phone/check', 'POST', { ...body, code: '123456' })).res.status, 200);
    assert.equal((await client.call('/auth/session')).data.user.phone, body.phone);
    assert.equal((await client.call('/phone/check', 'POST', { ...body, code: '123456' })).res.status, 400);
  } finally { await app.close(); }
});

test('unconfigured provider does not claim success', async () => {
  const saved = process.env.TWILIO_AUTH_TOKEN; delete process.env.TWILIO_AUTH_TOKEN;
  const app = await testServer();
  try {
    const client = app.client();
    await client.call('/auth/register', 'POST', { name: 'Buyer', email: 'unconfigured@example.test', password: 'secure-password-123' });
    assert.equal((await client.call('/phone/send', 'POST', { phone: '+12025550123' })).res.status, 503);
    assert.equal((await client.call('/auth/session')).data.user.phoneVerified, false);
  } finally { await app.close(); if (saved !== undefined) process.env.TWILIO_AUTH_TOKEN = saved; }
});

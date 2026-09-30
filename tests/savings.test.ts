import test from 'node:test';
import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import { Store } from '../backend/db';
import { Providers } from '../backend/providers';
import { savingsEvent } from '../backend/savings';

test('only verified installments create maturity credit; duplicates do not increase balance', async () => {
  const s = new Store(':memory:');
  class TestProviders extends Providers {
    override stripe() {
      return {
        invoicePayments: { list: async () => ({ data: [{ payment: { type: 'payment_intent', payment_intent: 'pi_installment' } }] }) },
        subscriptions: { retrieve: async () => ({ metadata: { enrollmentId: 'e' }, billing_cycle_anchor: 1800000000, cancel_at: 1900000000, status: 'active' }) },
      } as unknown as Stripe;
    }
  }
  try {
    s.run("INSERT INTO users(id,email,name,password_hash) VALUES ('u','u@example.test','User','test-only')");
    s.run("INSERT INTO scheme_plans(id,name,monthly,months,bonus_bps,terms) VALUES ('p','Savings',1000,2,1000,'Test terms')");
    s.run("INSERT INTO enrollments(id,user_id,plan_id,currency,monthly,months,bonus_bps) VALUES ('e','u','p','USD',1000,2,1000)");
    const event = (id: string, amount = 1000) => ({ id: 'evt_' + id, type: 'invoice.payment_succeeded', data: { object: { id, amount_paid: amount, currency: 'usd', parent: { subscription_details: { metadata: { enrollmentId: 'e' }, subscription: 'sub_test' } } } } }) as unknown as Stripe.Event;
    await assert.rejects(savingsEvent(s, new TestProviders(), event('bad', 1)), /amount mismatch/);
    await savingsEvent(s, new TestProviders(), event('in_one'));
    await savingsEvent(s, new TestProviders(), event('in_one'));
    assert.equal(s.all('SELECT * FROM installments').length, 1);
    assert.equal(s.all('SELECT * FROM credits').length, 0);
    await savingsEvent(s, new TestProviders(), event('in_two'));
    await savingsEvent(s, new TestProviders(), event('in_two'));
    assert.equal(s.get<{ remaining: number }>('SELECT remaining FROM credits')!.remaining, 2200);
    assert.equal(s.get<{ status: string }>('SELECT status FROM enrollments')!.status, 'matured');
  } finally { s.close(); }
});

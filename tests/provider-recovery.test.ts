import test from 'node:test';
import assert from 'node:assert/strict';
import { Providers } from '../backend/providers';
import { testServer } from './helpers';
const shippingAddress = { name: 'Test Customer', line1: '123 Main Street', city: 'New York', state: 'NY', postalCode: '10001', country: 'US' };

test('a queued Shippo label reconciles without purchasing a second label', async () => {
  const env = ['SHIPPO_TOKEN', 'SHIP_FROM_ADDRESS'].map(key => [key, process.env[key]] as const);
  process.env.SHIPPO_TOKEN = 'test-token';
  process.env.SHIP_FROM_ADDRESS = JSON.stringify({ name: 'Store', street1: '1 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' });
  let transactionsCreated = 0;
  class TestProviders extends Providers {
    override async shippo(endpoint: string, _body?: object) {
      if (endpoint === '/shipments/') return { object_id: 'shipment-1', status: 'SUCCESS', label_url: '', tracking_number: '', tracking_url_provider: '', rates: [{ object_id: 'rate-1', provider: 'Test Carrier', amount: '5.00', currency: 'USD', servicelevel: { name: 'Ground' } }] };
      if (endpoint === '/transactions/') { transactionsCreated++; return { object_id: 'transaction-1', status: 'QUEUED', label_url: '', tracking_number: '', tracking_url_provider: '' }; }
      if (endpoint === '/transactions/transaction-1/') return { object_id: 'transaction-1', status: 'SUCCESS', label_url: 'https://labels.example.test/label.pdf', tracking_number: 'TRACK-123', tracking_url_provider: 'https://carrier.example.test/TRACK-123' };
      throw new Error(`Unexpected Shippo endpoint ${endpoint}`);
    }
  }
  const app = await testServer(undefined, new TestProviders());
  try {
    const admin = app.client(), buyer = app.client();
    const registered = await admin.call('/auth/register', 'POST', { name: 'Admin', email: 'label-admin@example.test', password: 'secure-admin-password' });
    app.store.run("UPDATE users SET role='admin' WHERE id=?", registered.data.user.id);
    await buyer.call('/auth/register', 'POST', { name: 'Buyer', email: 'label-buyer@example.test', password: 'secure-buyer-password' });
    const product = await admin.call('/admin/products', 'POST', { sku: 'LABEL-1', title: 'Label test product', category: 'Test', price: 1000, stock: 1, warranty_months: 12 });
    const order = await buyer.call('/orders', 'POST', { address: shippingAddress, items: [{ productId: product.data.data.id, quantity: 1 }] }, { 'Idempotency-Key': 'label-recovery-key' });
    app.store.run("UPDATE orders SET status='paid' WHERE id=?", order.data.data.id);
    const path = `/admin/orders/${order.data.data.id}`;
    assert.equal((await admin.call(`${path}/shipping-rates`, 'POST', { parcel: { length: 10, width: 10, height: 10, weight: 1 } })).res.status, 200);
    assert.equal((await admin.call(`${path}/shipping-label`, 'POST', { rateId: 'rate-1' })).res.status, 502);
    assert.equal((await admin.call(`${path}/shipping-label`, 'POST', { rateId: 'rate-1' })).res.status, 409);
    const reconciled = await admin.call(`${path}/shipping-label/reconcile`, 'POST');
    assert.equal(reconciled.res.status, 200);
    assert.equal(reconciled.data.url, 'https://labels.example.test/label.pdf');
    assert.equal(app.store.get<{ status: string; tracking_number: string }>('SELECT status,tracking_number FROM orders WHERE id=?', order.data.data.id)?.tracking_number, 'TRACK-123');
    assert.equal(transactionsCreated, 1);
  } finally {
    await app.close();
    for (const [key, value] of env) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

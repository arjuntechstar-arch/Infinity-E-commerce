import test from 'node:test';
import assert from 'node:assert/strict';
import { testServer } from './helpers';

export const shippingAddress = { name: 'Test Customer', line1: '123 Main Street', city: 'New York', state: 'NY', postalCode: '10001', country: 'US' };
test('commerce uses authoritative prices, atomic stock, ownership and idempotency', async () => {
  const app = await testServer();
  try {
    const admin = app.client(), buyer = app.client(), other = app.client();
    const registered = await admin.call('/auth/register', 'POST', { name: 'Admin', email: 'admin@example.test', password: 'secure-admin-password' });
    app.store.run("UPDATE users SET role='admin' WHERE id=?", registered.data.user.id);
    await buyer.call('/auth/register', 'POST', { name: 'Buyer', email: 'buyer@example.test', password: 'secure-buyer-password' });
    await other.call('/auth/register', 'POST', { name: 'Other', email: 'other@example.test', password: 'secure-other-password' });
    const product = { sku: 'CAM-1', title: 'Camera', category: 'Cameras', price: 10000, stock: 2, warranty_months: 24 };
    assert.equal((await buyer.call('/admin/products', 'POST', product)).res.status, 403);
    const created = await admin.call('/admin/products', 'POST', product);
    assert.equal(created.res.status, 201);
    const id = created.data.data.id;
    const body = { address: shippingAddress, items: [{ productId: id, quantity: 1, price: 1 }] };
    const headers = { 'Idempotency-Key': 'checkout-key-123' };
    const order = await buyer.call('/orders', 'POST', body, headers);
    assert.equal(order.res.status, 201);
    assert.equal(order.data.data.total, 10000);
    assert.equal(order.data.data.status, 'pending_payment');
    const retry = await buyer.call('/orders', 'POST', body, headers);
    assert.equal(retry.data.data.id, order.data.data.id);
    assert.equal((await buyer.call('/orders', 'POST', { ...body, items: [{ productId: id, quantity: 2 }] }, headers)).res.status, 409);
    assert.equal((await other.call('/orders/' + order.data.data.id)).res.status, 404);
    assert.equal((await admin.call('/admin/orders/' + order.data.data.id, 'PUT', { status: 'delivered' })).res.status, 409);
    const attempts = await Promise.all([
      buyer.call('/orders', 'POST', body, { 'Idempotency-Key': 'concurrent-1' }),
      other.call('/orders', 'POST', body, { 'Idempotency-Key': 'concurrent-2' }),
    ]);
    assert.deepEqual(attempts.map(a => a.res.status).sort(), [201, 409]);
    assert.equal(app.store.get<{ stock: number }>('SELECT stock FROM products WHERE id=?', id)!.stock, 0);
    assert.equal((await buyer.call('/orders/' + order.data.data.id + '/cancel', 'POST')).res.status, 200);
    assert.equal(app.store.get<{ stock: number }>('SELECT stock FROM products WHERE id=?', id)!.stock, 1);
    assert.equal((await buyer.call('/orders/' + order.data.data.id + '/cancel', 'POST')).res.status, 409);
    assert.equal((await buyer.call('/orders', 'POST', { ...body, items: [{ productId: id, quantity: -1 }] }, { 'Idempotency-Key': 'bad-quantity' })).res.status, 400);
    assert.equal((await admin.call('/admin/vouchers', 'POST', { code: 'SAVE', discount: 1000, minimum: 20000, maxUses: 1, expiresAt: '2099-01-01' })).res.status, 201);
    assert.equal((await buyer.call('/orders', 'POST', { ...body, voucherCode: 'SAVE' }, { 'Idempotency-Key': 'bad-voucher-1' })).res.status, 400);
    assert.equal(app.store.get<{ uses: number }>("SELECT uses FROM vouchers WHERE code='SAVE'")!.uses, 0);
    assert.equal(app.store.get<{ stock: number }>('SELECT stock FROM products WHERE id=?', id)!.stock, 1);
  } finally { await app.close(); }
});

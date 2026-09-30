import test from 'node:test';
import assert from 'node:assert/strict';
import { testServer } from './helpers';

test('support persists replies, restricts access and issues a personal trade-in voucher after receipt', async () => {
  const app = await testServer();
  try {
    const admin = app.client(), customer = app.client(), other = app.client();
    const a = await admin.call('/auth/register', 'POST', { name: 'Admin', email: 'a@workflow.test', password: 'secure-admin-password' });
    app.store.run("UPDATE users SET role='admin' WHERE id=?", a.data.user.id);
    await customer.call('/auth/register', 'POST', { name: 'Customer', email: 'b@workflow.test', password: 'secure-customer-password' });
    await other.call('/auth/register', 'POST', { name: 'Other', email: 'c@workflow.test', password: 'secure-other-password' });
    const t = await customer.call('/tickets', 'POST', { kind: 'trade-in', subject: 'Used camera', message: 'Camera in good condition, including charger and original box.' });
    assert.equal(t.res.status, 201); const id = t.data.data.id;
    assert.equal((await other.call(`/tickets/${id}/messages`, 'POST', { message: 'Unauthorized reply' })).res.status, 404);
    assert.equal((await admin.call(`/admin/tickets/${id}`, 'PUT', { status: 'received' })).res.status, 409);
    assert.equal((await admin.call(`/admin/tickets/${id}`, 'PUT', { status: 'quoted', quoteAmount: 2500 })).res.status, 200);
    assert.equal((await customer.call(`/tickets/${id}/accept`, 'POST')).res.status, 200);
    assert.equal((await admin.call(`/admin/tickets/${id}`, 'PUT', { status: 'received' })).res.status, 200);
    assert.equal((await admin.call(`/admin/tickets/${id}`, 'PUT', { status: 'received' })).res.status, 409);
    const vouchers = app.store.all<{ discount: number; owner_id: string }>('SELECT * FROM vouchers');
    assert.equal(vouchers.length, 1); assert.equal(vouchers[0].discount, 2500); assert.ok(vouchers[0].owner_id);
    await admin.call(`/tickets/${id}/messages`, 'POST', { message: 'Received and checked. Your voucher is ready.' });
    const saved = await customer.call('/tickets'); assert.equal(saved.data.data[0].messages.length, 2);
  } finally { await app.close(); }
});

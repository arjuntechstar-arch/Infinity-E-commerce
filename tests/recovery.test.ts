import test from 'node:test';
import assert from 'node:assert/strict';
import { testServer } from './helpers';
import { Store } from '../backend/db';
import { Providers } from '../backend/providers';
test('email recovery tokens are hashed, single-use, and revoke old sessions', async () => {
  let resetUrl = '';
  class TestProviders extends Providers {
    override mailConfigured() { return true; }
    override appUrl() { return 'https://store.example.test'; }
    override async sendReset(_email: string, url: string) { resetUrl = url; }
  }
  const app = await testServer(new Store(':memory:'), new TestProviders());
  try {
    const user = app.client(), recovery = app.client();
    await user.call('/auth/register', 'POST', { name: 'Recovery', email: 'reset@example.test', password: 'old-password-secure' });
    assert.equal((await recovery.call('/auth/forgot-password', 'POST', { email: 'reset@example.test' })).res.status, 200);
    const token = new URL(resetUrl).searchParams.get('reset'); assert.ok(token);
    const record = app.store.get<{ token_hash: string }>('SELECT * FROM password_resets')!; assert.notEqual(record.token_hash, token);
    assert.equal((await recovery.call('/auth/reset-password', 'POST', { token, password: 'new-password-secure' })).res.status, 200);
    assert.equal((await user.call('/auth/session')).data.user, null);
    assert.equal((await recovery.call('/auth/reset-password', 'POST', { token, password: 'another-password-secure' })).res.status, 400);
    assert.equal((await recovery.call('/auth/login', 'POST', { email: 'reset@example.test', password: 'new-password-secure' })).res.status, 200);
  } finally { await app.close(); }
});

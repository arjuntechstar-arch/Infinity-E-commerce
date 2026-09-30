import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Store } from '../backend/db';
import { testServer } from './helpers';

test('accounts enforce roles, CSRF, isolated profiles, passwords and revocable sessions', async () => {
  const app = await testServer();
  try {
    const alice = app.client(), bob = app.client(), anonymous = app.client();
    assert.equal((await anonymous.call('/admin/audit')).res.status, 401);
    assert.equal((await alice.call('/auth/register', 'POST', { name: 'Alice', email: 'alice@example.test', password: 'a-secure-password', role: 'admin' })).res.status, 200);
    assert.equal((await alice.call('/auth/session')).data.user.role, 'customer');
    assert.equal((await alice.call('/admin/audit')).res.status, 403);
    assert.equal((await bob.call('/auth/register', 'POST', { name: 'Bob', email: 'bob@example.test', password: 'b-secure-password' })).res.status, 200);
    assert.equal((await alice.call('/auth/profile', 'PUT', { name: 'Changed Alice', address: 'Private address' }, { 'X-CSRF-Token': '' })).res.status, 403);
    assert.equal((await alice.call('/auth/profile', 'PUT', { name: 'Changed Alice', address: 'Private address' }, { Origin: 'https://attacker.test' })).res.status, 403);
    assert.equal((await alice.call('/auth/profile', 'PUT', { name: 'Changed Alice', address: 'Private address' })).res.status, 200);
    assert.equal((await bob.call('/auth/session')).data.user.address, '');
    const oldCookie = alice.cookie;
    assert.equal((await alice.call('/auth/password', 'POST', { oldPassword: 'wrong', newPassword: 'another-secure-password' })).res.status, 400);
    assert.equal((await alice.call('/auth/password', 'POST', { oldPassword: 'a-secure-password', newPassword: 'another-secure-password' })).res.status, 200);
    const revoked = await fetch(app.base + '/api/auth/session', { headers: { Cookie: oldCookie } });
    assert.equal((await revoked.json()).user, null);
    assert.equal((await alice.call('/auth/logout', 'POST')).res.status, 200);
    assert.equal((await alice.call('/auth/session')).data.user, null);
    assert.equal((await alice.call('/auth/login', 'POST', { email: 'alice@example.test', password: 'a-secure-password' })).res.status, 401);
    assert.equal((await alice.call('/auth/login', 'POST', { email: 'alice@example.test', password: 'another-secure-password' })).res.status, 200);
    const user = (await alice.call('/auth/session')).data.user;
    app.store.run("UPDATE users SET role='admin' WHERE id=?", user.id);
    assert.equal((await alice.call('/admin/audit')).res.status, 200);
    assert.equal(JSON.stringify(user).includes('password_hash'), false);
  } finally { await app.close(); }
});

test('database migration and user data persist across reopen', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'voltmart-test-'));
  const filename = path.join(directory, 'store.sqlite');
  try {
    const first = new Store(filename);
    first.run("INSERT INTO users(id,email,name,password_hash) VALUES ('test','persist@example.test','Persist','unused-test-only')");
    first.close();
    const second = new Store(filename);
    assert.equal(second.get<{ name: string }>("SELECT name FROM users WHERE id='test'")?.name, 'Persist');
    assert.ok(second.all('SELECT * FROM migrations').length >= 1);
    second.close();
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('voltmart-test-'));
    rmSync(directory, { recursive: true });
  }
});

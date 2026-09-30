import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server';
import { Store } from '../backend/db';

test('production serves assets and deep links, with JSON API failures', async () => {
  const store = new Store(':memory:');
  const server = (await createApp(true, store)).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    for (const route of ['/', '/admin/orders']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.ok(html.includes('id="root"'));
      assert.ok(!html.includes('cdn.tailwindcss.com'));
      const css = html.match(/href="([^" ]+\.css)"/);
      assert.ok(css, 'production must include compiled CSS');
      assert.equal((await fetch(base + css[1])).status, 200);
    }
    assert.equal((await fetch(base + '/api/health')).status, 200);
    const missing = await fetch(base + '/api/nonexistent');
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).success, false);
    const malformed = await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).message, 'Invalid JSON');
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); store.close(); }
});

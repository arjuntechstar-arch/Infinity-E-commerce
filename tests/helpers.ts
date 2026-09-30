import { once } from 'node:events';
import { createApp } from '../server';
import { Store } from '../backend/db';
import { Providers } from '../backend/providers';

export async function testServer(store = new Store(':memory:'), providers = new Providers()) {
  const server = (await createApp(true, store, providers)).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('No test port');
  const base = `http://127.0.0.1:${addr.port}`;
  const client = () => {
    let cookie = ''; let csrf = '';
    return {
      async call(path: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}) {
        const res = await fetch(base + '/api' + path, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf, ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
        const data = await res.json();
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) cookie = setCookie.split(';')[0];
        if (data.csrf) csrf = data.csrf;
        return { res, data };
      },
      get cookie() { return cookie; },
      get csrf() { return csrf; },
    };
  };
  return { base, store, client, async close() { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); store.close(); } };
}

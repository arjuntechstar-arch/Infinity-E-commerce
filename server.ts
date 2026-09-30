import express, { type ErrorRequestHandler } from 'express';
import { createApi } from './backend/api';
import { Store } from './backend/db';
import { HttpError } from './backend/http';
import { Providers } from './backend/providers';
import { stripeWebhook } from './backend/integrations';
import path from 'path';
import { fileURLToPath } from 'url';

export async function createApp(production = process.env.NODE_ENV === 'production', store = new Store(), providers = new Providers()) {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    if (production) res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
    next();
  });
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json', limit: '1mb' }), stripeWebhook(store, providers));
  app.use(express.json({ limit: '128kb' }));
  app.use((req, _res, next) => {
    if (req.body === undefined) req.body = {};
    if (req.body === null || Array.isArray(req.body) || typeof req.body !== 'object') throw new HttpError(400, 'Request body must be a JSON object');
    next();
  });
  app.use('/documentation', express.static(path.resolve('documentation')));

  // Mount API endpoints
  app.use('/api', createApi(store, production, providers));

  app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'API endpoint not found' }));
  const onError: ErrorRequestHandler = (error, _req, res, _next) => {
    const badJson = error instanceof SyntaxError && 'body' in error;
    if (!badJson && !(error instanceof HttpError)) console.error(error);
    const status = badJson ? 400 : error instanceof HttpError ? error.status : error?.type === 'entity.too.large' ? 413 : 500;
    res.status(status).json({ success: false, message: badJson ? 'Invalid JSON' : error instanceof HttpError ? error.message : 'Internal server error' });
  };
  app.use(onError);

  if (!production) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist/client')));
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/client/index.html'));
    });
  }

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  const server = (await createApp()).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`VoltMart listening on ${port}`));
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.close(() => process.exit(0)));
}

import { Router } from 'express';
import { Store } from './db';
import { authRoutes, security, requireAdmin } from './auth';
import { commerceRoutes } from './commerce';
import { Providers } from './providers';
import { integrationRoutes } from './integrations';
import { savingsRoutes } from './savings';
import { workflows } from './workflows';

export function createApi(store: Store, production: boolean, providers = new Providers()) {
  const api = Router();
  api.use(security(store, production));
  api.get('/health', (_req, res) => { store.get('SELECT 1'); res.json({ status: 'healthy' }); });
  api.use('/auth', authRoutes(store, production, providers));
  api.use(integrationRoutes(store, providers));
  api.use(savingsRoutes(store, providers));
  api.use(workflows(store));
  api.use(commerceRoutes(store));
  api.get('/admin/audit', requireAdmin, (_req, res) => res.json({ data: store.all('SELECT id,actor_id,action,entity_id,created_at FROM audit_logs ORDER BY id DESC LIMIT 200') }));
  return api;
}

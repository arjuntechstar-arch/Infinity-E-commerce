import { Store } from '../backend/db';
import { cancelOrder } from '../backend/commerce';
const store = new Store();
try {
  const expired = store.all<{ id: string }>("SELECT id FROM orders WHERE status='pending_payment' AND checkout_id IS NULL AND expires_at<?", Date.now());
  for (const order of expired) store.transaction(() => cancelOrder(store, order.id, null, 'Unpaid stock reservation expired'));
  store.run('DELETE FROM sessions WHERE expires_at<?', Date.now());
  store.run('DELETE FROM password_resets WHERE expires_at<?', Date.now());
  store.run('DELETE FROM shipping_quotes WHERE expires_at<?', Date.now());
  store.run('DELETE FROM rate_limits WHERE expires_at<?', Date.now());
  console.log(`Maintenance completed. Released ${expired.length} expired reservations.`);
} finally { store.close(); }

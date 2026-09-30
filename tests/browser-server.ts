import { Store } from '../backend/db';
import { passwordHash } from '../backend/auth';
import { createApp } from '../server';
// Test fixture: this entry point is excluded from the buyer package and production entry point.
const s = new Store(':memory:');
s.run("INSERT INTO users(id,email,name,password_hash,role) VALUES ('test-admin','admin@example.test','Test Administrator',?,'admin')", await passwordHash('test-admin-password'));
const app = await createApp(true, s);
app.listen(4173, 'localhost', () => console.log('Browser fixture ready'));

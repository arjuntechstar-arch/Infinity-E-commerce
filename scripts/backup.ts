import { backup } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { Store } from '../backend/db';
const directory = path.resolve(process.env.BACKUP_DIRECTORY || 'data/backups');
mkdirSync(directory, { recursive: true });
const destination = path.join(directory, `voltmart-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
const store = new Store();
try { await backup(store.db, destination); console.log(`Consistent database snapshot saved: ${destination}`); } finally { store.close(); }

import { build } from 'esbuild';
await build({ entryPoints: ['server.ts'], outfile: 'dist/server.mjs', bundle: true, packages: 'external', platform: 'node', target: 'node24', format: 'esm' });
await build({ entryPoints: ['scripts/create-admin.ts', 'scripts/backup.ts', 'scripts/maintenance.ts'], outdir: 'dist/scripts', outExtension: { '.js': '.mjs' }, bundle: true, packages: 'external', platform: 'node', target: 'node24', format: 'esm' });

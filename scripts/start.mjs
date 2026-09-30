process.env.NODE_ENV = 'production';
const { createApp } = await import('../dist/server.mjs');
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
const server = (await createApp(true)).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`VoltMart production server listening on ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));

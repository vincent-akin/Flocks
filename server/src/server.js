const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Flocks API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line no-console
    console.error('[server] Unhandled promise rejection:', err);
  });
}

start();

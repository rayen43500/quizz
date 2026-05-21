import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { setupSocket } from './socket/index.js';

async function start() {
  await connectDatabase();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: config.corsOrigin, credentials: true },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  app.set('io', io);
  setupSocket(io);

  server.listen(config.port, () => {
    console.log(`[Quisi API] Running on http://localhost:${config.port}`);
    console.log(`[Quisi API] Environment: ${config.nodeEnv}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

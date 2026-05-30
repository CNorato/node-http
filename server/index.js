import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import config from './config.js';
import authRoutes from './auth/routes.js';
import { authMiddleware } from './auth/middleware.js';
import endpointRoutes from './endpoints/routes.js';
import * as endpointStore from './endpoints/store.js';
import dynamicHandler from './endpoints/handler.js';
import logRoutes from './logs/routes.js';
import * as wsServer from './websocket/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// 1. JSON body parser with raw body capture for logging
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.length > 0 ? buf.toString('utf8') : null;
  }
}));

// 2. Unprotected auth route
app.use('/api/auth', authRoutes);

// 3. Auth middleware for management APIs
app.use('/api/endpoints', authMiddleware);
app.use('/api/logs', authMiddleware);

// 4. Endpoint CRUD routes
app.use('/api/endpoints', endpointRoutes);

// 5. Log query routes
app.use('/api/logs', logRoutes);

// 6. Production: serve static client build
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// 7. Catch-all: dynamic endpoint handler (LAST)
app.all('/{*path}', dynamicHandler);

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server
wsServer.create(server);

// Load persisted endpoints
endpointStore.load();
console.log(`Loaded ${endpointStore.getAll().length} endpoints from storage`);

// Start server
server.listen(config.port, () => {
  console.log(`HTTP Request Receiver running on http://localhost:${config.port}`);
  console.log(`Management UI: http://localhost:${config.port}`);
});

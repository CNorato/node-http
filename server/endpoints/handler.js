import { v4 as uuidv4 } from 'uuid';
import * as store from './store.js';
import * as logWriter from '../logs/writer.js';
import * as wsServer from '../websocket/server.js';

export default function dynamicHandler(req, res) {
  const endpoints = store.getAll();
  const match = endpoints.find(ep => {
    if (!ep.enabled) return false;
    if (ep.method !== 'ANY' && ep.method !== req.method.toUpperCase()) return false;
    return ep.path === req.path;
  });

  const logEntry = {
    id: uuidv4(),
    endpointId: match ? match.id : null,
    timestamp: new Date().toISOString(),
    method: req.method.toUpperCase(),
    path: req.path,
    queryParams: req.query || {},
    requestHeaders: {
      'content-type': req.headers['content-type'] || '',
      'user-agent': req.headers['user-agent'] || '',
      'accept': req.headers['accept'] || '',
    },
    requestBody: req.rawBody || null,
    responseStatus: match ? match.statusCode : 404,
    matched: !!match,
    remoteAddress: req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '',
  };

  if (match) {
    res.status(match.statusCode);
    for (const [key, value] of Object.entries(match.responseHeaders)) {
      res.setHeader(key, value);
    }
    res.send(match.responseBody);
  } else {
    res.status(404).json({ error: 'No endpoint configured for this request' });
  }

  logWriter.append(logEntry);
  wsServer.broadcast({ type: 'request_log', data: logEntry });
}

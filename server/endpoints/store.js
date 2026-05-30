import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_PATH = path.resolve(__dirname, '..', 'storage', 'endpoints.json');

const endpoints = new Map();

function persist() {
  const dir = path.dirname(STORAGE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmp = STORAGE_PATH + '.tmp';
  const data = JSON.stringify([...endpoints.values()], null, 2);
  fs.writeFileSync(tmp, data, 'utf8');
  fs.renameSync(tmp, STORAGE_PATH);
}

export function load() {
  if (fs.existsSync(STORAGE_PATH)) {
    try {
      const data = fs.readFileSync(STORAGE_PATH, 'utf8');
      const arr = JSON.parse(data);
      for (const ep of arr) {
        endpoints.set(ep.id, ep);
      }
    } catch (err) {
      console.error('Failed to load endpoints.json, starting with empty store:', err.message);
    }
  }
}

export function create(config) {
  const now = new Date().toISOString();
  const endpoint = {
    id: uuidv4(),
    path: config.path,
    method: config.method.toUpperCase(),
    statusCode: config.statusCode || 200,
    responseHeaders: config.responseHeaders || {},
    responseBody: config.responseBody || '',
    bodyType: config.bodyType || 'text',
    enabled: config.enabled !== undefined ? config.enabled : true,
    createdAt: now,
    updatedAt: now,
  };
  endpoints.set(endpoint.id, endpoint);
  persist();
  return endpoint;
}

export function getById(id) {
  return endpoints.get(id);
}

export function getAll() {
  return [...endpoints.values()];
}

export function update(id, partial) {
  const existing = endpoints.get(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...partial,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  if (partial.method) updated.method = partial.method.toUpperCase();
  endpoints.set(id, updated);
  persist();
  return updated;
}

export function remove(id) {
  const existed = endpoints.delete(id);
  if (existed) persist();
  return existed;
}

import { Router } from 'express';
import * as store from './store.js';

const router = Router();

const VALID_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'ANY'];

function validateEndpoint(body) {
  const errors = [];
  if (!body.path || typeof body.path !== 'string' || !body.path.startsWith('/')) {
    errors.push('path must be a string starting with /');
  }
  if (!body.method || !VALID_METHODS.includes(body.method.toUpperCase())) {
    errors.push(`method must be one of: ${VALID_METHODS.join(', ')}`);
  }
  if (body.statusCode !== undefined) {
    const code = Number(body.statusCode);
    if (!Number.isInteger(code) || code < 100 || code > 599) {
      errors.push('statusCode must be an integer between 100 and 599');
    }
  }
  return errors;
}

router.get('/', (_req, res) => {
  res.json(store.getAll());
});

router.post('/', (req, res) => {
  const errors = validateEndpoint(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const endpoint = store.create(req.body);
  res.status(201).json(endpoint);
});

router.get('/:id', (req, res) => {
  const endpoint = store.getById(req.params.id);
  if (!endpoint) return res.status(404).json({ error: 'Endpoint not found' });
  res.json(endpoint);
});

router.put('/:id', (req, res) => {
  const existing = store.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Endpoint not found' });

  if (req.body.path !== undefined && (typeof req.body.path !== 'string' || !req.body.path.startsWith('/'))) {
    return res.status(400).json({ error: 'path must be a string starting with /' });
  }
  if (req.body.method !== undefined && !VALID_METHODS.includes(req.body.method.toUpperCase())) {
    return res.status(400).json({ error: `method must be one of: ${VALID_METHODS.join(', ')}` });
  }

  const updated = store.update(req.params.id, req.body);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Endpoint not found' });
  res.json({ success: true });
});

export default router;

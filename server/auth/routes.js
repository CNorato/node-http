import { Router } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config.js';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const input = Buffer.from(String(password));
  const expected = Buffer.from(String(config.adminPassword));

  if (input.length !== expected.length) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  if (!crypto.timingSafeEqual(input, expected)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ sub: 'admin' }, config.jwtSecret, { expiresIn: '24h' });
  res.json({ token });
});

export default router;

import { Router } from 'express';
import * as reader from './reader.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { endpointId, date, limit } = req.query;
    const logs = await reader.getLogs({
      endpointId,
      date,
      limit: limit ? parseInt(limit, 10) : 500,
    });
    res.json(logs);
  } catch (err) {
    console.error('Failed to read logs:', err.message);
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

export default router;

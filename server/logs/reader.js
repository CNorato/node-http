import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.resolve(__dirname, '..', 'storage', 'logs');

export async function getLogs({ endpointId, date, limit = 500 }) {
  const endpointDir = endpointId || '_unmatched';
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const filePath = path.join(LOGS_DIR, endpointDir, `${dateStr}.log`);

  if (!fs.existsSync(filePath)) return [];

  const entries = [];
  const rl = createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        entries.push(JSON.parse(line));
      } catch {
        // skip malformed lines
      }
    }
  }

  return entries.slice(-limit);
}

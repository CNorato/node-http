import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.resolve(__dirname, '..', 'storage', 'logs');

export function append(logEntry) {
  const endpointDir = logEntry.endpointId || '_unmatched';
  const date = logEntry.timestamp.slice(0, 10);
  const dirPath = path.join(LOGS_DIR, endpointDir);
  const filePath = path.join(dirPath, `${date}.log`);

  fs.mkdirSync(dirPath, { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(logEntry) + '\n');
}

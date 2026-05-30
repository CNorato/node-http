import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 3456,
  jwtSecret: process.env.JWT_SECRET,
  adminPassword: process.env.ADMIN_PASSWORD,
});

if (!config.jwtSecret || !config.adminPassword) {
  console.error('Missing required environment variables: JWT_SECRET and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

export default config;

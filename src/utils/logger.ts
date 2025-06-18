import { pino } from 'pino';
import { config } from 'dotenv';

config(); // loads .env when present

export const logger = pino(
  { level: process.env.LOG_LEVEL || 'info', timestamp: pino.stdTimeFunctions.isoTime },
  pino.destination(2) // 2 = stderr (stdout left 100% JSON-RPC)
);
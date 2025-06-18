#!/usr/bin/env node

import { startServer } from './server.js';
import { logger } from './utils/logger.js';

startServer().catch((error) => {
  logger.error(error, 'Failed to start server');
  process.exit(1);
});
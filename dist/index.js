#!/usr/bin/env node
// Silence Snowflake SDK stdout logging BEFORE importing anything
import './utils/silence-snowflake.js';
import { startServer } from './server.js';
import { logger } from './utils/logger.js';
startServer().catch((error) => {
    logger.error(error, 'Failed to start server');
    process.exit(1);
});
//# sourceMappingURL=index.js.map
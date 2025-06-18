import { QueryService } from '../services/queries.js';
import { logger } from './logger.js';

export const hasSnowflakeCreds = ['SNOWFLAKE_ACCOUNT', 'SNOWFLAKE_USER', 'SNOWFLAKE_PASSWORD']
  .every(k => !!process.env[k]);

export function createQueryService() {
  if (!hasSnowflakeCreds) {
    const missingCreds = ['SNOWFLAKE_ACCOUNT', 'SNOWFLAKE_USER', 'SNOWFLAKE_PASSWORD']
      .filter(k => !process.env[k]);
    
    logger.error({ missingCreds }, 'Snowflake credentials are missing');
    throw new Error(
      `Missing required Snowflake credentials: ${missingCreds.join(', ')}. ` +
      'Please configure these environment variables to connect to Fresha Data Connector.'
    );
  }
  
  return new QueryService();
}
import snowflake from 'snowflake-sdk';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

// Environment validation schema
const SnowflakeConfigSchema = z.object({
  SNOWFLAKE_ACCOUNT: z.string(),
  SNOWFLAKE_USER: z.string(),
  SNOWFLAKE_PASSWORD: z.string(),
  SNOWFLAKE_DATABASE: z.string(),
  SNOWFLAKE_SCHEMA: z.string(),
  SNOWFLAKE_WAREHOUSE: z.string(),
});

export type SnowflakeConfig = z.infer<typeof SnowflakeConfigSchema>;

export class SnowflakeService {
  private connection: snowflake.Connection | null = null;
  private config: SnowflakeConfig;

  constructor() {
    // Validate environment variables
    try {
      this.config = SnowflakeConfigSchema.parse(process.env);
    } catch (error) {
      logger.error('Missing required Snowflake environment variables');
      throw new Error('Invalid Snowflake configuration');
    }
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    const connectionOptions = {
      account: this.config.SNOWFLAKE_ACCOUNT.replace('https://', '').replace('.snowflakecomputing.com', ''),
      username: this.config.SNOWFLAKE_USER,
      password: this.config.SNOWFLAKE_PASSWORD,
      database: this.config.SNOWFLAKE_DATABASE,
      schema: this.config.SNOWFLAKE_SCHEMA,
      warehouse: this.config.SNOWFLAKE_WAREHOUSE,
      clientSessionKeepAlive: true,
      clientSessionKeepAliveHeartbeatFrequency: 3600,
    };

    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection(connectionOptions);

      this.connection.connect((err, conn) => {
        if (err) {
          logger.error({ error: err }, 'Failed to connect to Snowflake');
          this.connection = null;
          reject(err);
        } else {
          logger.info('Successfully connected to Snowflake');
          resolve();
        }
      });
    });
  }

  async execute<T = any>(query: string, binds: any[] = []): Promise<T[]> {
    if (!this.connection) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.connection!.execute({
        sqlText: query,
        binds,
        complete: (err, stmt, rows) => {
          if (err) {
            logger.error({ error: err, query }, 'Query execution failed');
            reject(err);
          } else {
            resolve(rows as T[]);
          }
        },
      });
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.connection!.destroy((err) => {
        if (err) {
          logger.error({ error: err }, 'Failed to disconnect from Snowflake');
          reject(err);
        } else {
          this.connection = null;
          logger.info('Disconnected from Snowflake');
          resolve();
        }
      });
    });
  }
}

// Singleton instance
let snowflakeService: SnowflakeService | null = null;

export function getSnowflakeService(): SnowflakeService {
  if (!snowflakeService) {
    snowflakeService = new SnowflakeService();
  }
  return snowflakeService;
}
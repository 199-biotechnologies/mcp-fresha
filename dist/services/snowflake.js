import snowflake from 'snowflake-sdk';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
// TODO: For production long-running servers, consider using connection pooling:
// const pool = snowflake.createPool(connectionOptions, {
//   evictionRunIntervalMillis: 60000,
//   idleTimeoutMillis: 60000,
//   max: 10,
//   min: 0
// });
// Environment validation schema
const SnowflakeConfigSchema = z.object({
    SNOWFLAKE_ACCOUNT: z.string(),
    SNOWFLAKE_USER: z.string(),
    SNOWFLAKE_PASSWORD: z.string(),
    SNOWFLAKE_DATABASE: z.string(),
    SNOWFLAKE_SCHEMA: z.string(),
    SNOWFLAKE_WAREHOUSE: z.string(),
});
export class SnowflakeService {
    connection = null;
    config;
    connectionAttempts = 0;
    MAX_RETRY_ATTEMPTS = 3;
    constructor() {
        // Validate environment variables
        try {
            this.config = SnowflakeConfigSchema.parse(process.env);
        }
        catch (error) {
            logger.error('Missing required Snowflake environment variables');
            logger.error('Required: SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA, SNOWFLAKE_WAREHOUSE');
            throw new Error('Invalid Snowflake configuration - check environment variables');
        }
    }
    async connect() {
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
            // Support proxy from environment variables
            useEnvProxy: true,
        };
        return new Promise((resolve, reject) => {
            this.connection = snowflake.createConnection(connectionOptions);
            this.connection.connect((err, conn) => {
                if (err) {
                    logger.error({ error: err, attempt: this.connectionAttempts + 1 }, 'Failed to connect to Snowflake');
                    this.connection = null;
                    // Handle specific error cases
                    const errorMessage = this.getDetailedErrorMessage(err);
                    // Retry logic for transient errors
                    if (this.shouldRetryConnection(err) && this.connectionAttempts < this.MAX_RETRY_ATTEMPTS) {
                        this.connectionAttempts++;
                        logger.info(`Retrying connection (attempt ${this.connectionAttempts}/${this.MAX_RETRY_ATTEMPTS})...`);
                        setTimeout(() => {
                            this.connect().then(resolve).catch(reject);
                        }, 1000 * this.connectionAttempts); // Exponential backoff
                    }
                    else {
                        this.connectionAttempts = 0;
                        reject(new Error(errorMessage));
                    }
                }
                else {
                    logger.info('Successfully connected to Snowflake');
                    this.connectionAttempts = 0;
                    resolve();
                }
            });
        });
    }
    shouldRetryConnection(err) {
        // Retry on network errors or temporary failures
        const retryableErrors = [
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ENOTFOUND',
            'ENETUNREACH',
            'EAI_AGAIN',
        ];
        return retryableErrors.some(code => err.code === code || err.message?.includes(code));
    }
    getDetailedErrorMessage(err) {
        if (err.code === 'ENOTFOUND' || err.message?.includes('ENOTFOUND')) {
            return `Cannot reach Snowflake account. Please check SNOWFLAKE_ACCOUNT is correct (current: ${this.config.SNOWFLAKE_ACCOUNT})`;
        }
        if (err.code === '390100' || err.message?.includes('Incorrect username or password')) {
            return 'Authentication failed. Please verify SNOWFLAKE_USER and SNOWFLAKE_PASSWORD are correct.';
        }
        if (err.message?.includes('does not exist')) {
            return `Database or schema not found. Please verify SNOWFLAKE_DATABASE (${this.config.SNOWFLAKE_DATABASE}) and SNOWFLAKE_SCHEMA (${this.config.SNOWFLAKE_SCHEMA}) exist.`;
        }
        if (err.message?.includes('warehouse')) {
            return `Warehouse issue. Please verify SNOWFLAKE_WAREHOUSE (${this.config.SNOWFLAKE_WAREHOUSE}) exists and is accessible.`;
        }
        return `Snowflake connection failed: ${err.message || err}`;
    }
    async execute(query, binds = []) {
        if (!this.connection) {
            await this.connect();
        }
        return new Promise((resolve, reject) => {
            this.connection.execute({
                sqlText: query,
                binds,
                complete: (err, stmt, rows) => {
                    if (err) {
                        logger.error({
                            error: err,
                            query: query.substring(0, 500), // Truncate long queries in logs
                            binds: binds.length > 0 ? `${binds.length} parameters` : 'none'
                        }, 'Query execution failed');
                        // Provide more specific error messages
                        let errorMessage = 'Query execution failed: ';
                        if (err.code?.toString() === '002003' || err.message?.includes('does not exist')) {
                            errorMessage += 'Table or column not found. ';
                        }
                        else if (err.code?.toString() === '090106' || err.message?.includes('Warehouse')) {
                            errorMessage += 'Warehouse is suspended or does not exist. ';
                        }
                        else if (err.message?.includes('syntax error')) {
                            errorMessage += 'SQL syntax error. ';
                        }
                        errorMessage += err.message || err;
                        reject(new Error(errorMessage));
                    }
                    else {
                        resolve(rows);
                    }
                },
            });
        });
    }
    async disconnect() {
        if (!this.connection) {
            return;
        }
        return new Promise((resolve, reject) => {
            this.connection.destroy((err) => {
                if (err) {
                    logger.error({ error: err }, 'Failed to disconnect from Snowflake');
                    reject(err);
                }
                else {
                    this.connection = null;
                    logger.info('Disconnected from Snowflake');
                    resolve();
                }
            });
        });
    }
}
// Singleton instance
let snowflakeService = null;
export function getSnowflakeService() {
    if (!snowflakeService) {
        snowflakeService = new SnowflakeService();
    }
    return snowflakeService;
}
//# sourceMappingURL=snowflake.js.map
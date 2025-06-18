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
// Configure Snowflake SDK globally to respect proxy environment variables
snowflake.configure({ useEnvProxy: true });
export class SnowflakeService {
    connection = null;
    connectionPromise = null;
    config;
    connectionAttempts = 0;
    MAX_RETRY_ATTEMPTS = 3;
    BASE_RETRY_DELAY = 1000;
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
        // Return existing connection
        if (this.connection) {
            return;
        }
        // Return in-progress connection to prevent race conditions
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        // Create new connection promise
        this.connectionPromise = this.connectWithRetry();
        try {
            await this.connectionPromise;
        }
        finally {
            this.connectionPromise = null;
        }
    }
    async connectWithRetry() {
        const connectionOptions = {
            account: this.config.SNOWFLAKE_ACCOUNT.replace('https://', '').replace('.snowflakecomputing.com', ''),
            username: this.config.SNOWFLAKE_USER,
            password: this.config.SNOWFLAKE_PASSWORD,
            database: this.config.SNOWFLAKE_DATABASE,
            schema: this.config.SNOWFLAKE_SCHEMA,
            warehouse: this.config.SNOWFLAKE_WAREHOUSE,
            clientSessionKeepAlive: true,
            clientSessionKeepAliveHeartbeatFrequency: 900, // Snowflake recommended: 15 minutes
            // Proxy settings from environment variables are handled by global config
        };
        let lastError = null;
        this.connectionAttempts = 0;
        while (this.connectionAttempts <= this.MAX_RETRY_ATTEMPTS) {
            try {
                await this.attemptConnection(connectionOptions);
                this.connectionAttempts = 0;
                return;
            }
            catch (err) {
                lastError = err;
                if (!this.shouldRetryConnection(err) || this.connectionAttempts >= this.MAX_RETRY_ATTEMPTS) {
                    throw new Error(this.getDetailedErrorMessage(err));
                }
                const delay = Math.pow(2, this.connectionAttempts) * this.BASE_RETRY_DELAY;
                logger.info(`Retrying connection in ${delay}ms (attempt ${this.connectionAttempts + 1}/${this.MAX_RETRY_ATTEMPTS})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                this.connectionAttempts++;
            }
        }
        throw lastError || new Error('Failed to connect after maximum retries');
    }
    attemptConnection(options) {
        return new Promise((resolve, reject) => {
            this.connection = snowflake.createConnection(options);
            this.connection.connect((err, conn) => {
                if (err) {
                    logger.error({
                        error: {
                            code: err.code,
                            message: err.message,
                            // Don't log full error to avoid leaking credentials
                        },
                        attempt: this.connectionAttempts + 1
                    }, 'Failed to connect to Snowflake');
                    this.connection = null;
                    reject(err);
                }
                else {
                    logger.info('Successfully connected to Snowflake');
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
        const errorCode = err.code || err.number;
        if (err.code === 'ENOTFOUND' || err.message?.includes('ENOTFOUND')) {
            return `Cannot reach Snowflake account. Please check SNOWFLAKE_ACCOUNT is correct (current: ${this.config.SNOWFLAKE_ACCOUNT})`;
        }
        if (errorCode === '390100' || errorCode === 390100 || err.message?.includes('Incorrect username or password')) {
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
                        // Sanitize error for logging - don't include full SQL or error object
                        logger.error({
                            error: {
                                code: err.code,
                                number: err.number,
                                message: err.message?.substring(0, 200), // Truncate to avoid leaking SQL
                                state: err.state,
                            },
                            queryLength: query.length,
                            binds: binds.length > 0 ? `${binds.length} parameters` : 'none'
                        }, 'Query execution failed');
                        // Provide more specific error messages
                        let errorMessage = 'Query execution failed: ';
                        const errorCode = err.code || err.number;
                        if (errorCode?.toString() === '002003' || err.message?.includes('does not exist')) {
                            errorMessage += 'Table or column not found. ';
                        }
                        else if (errorCode?.toString() === '090106' || err.message?.includes('Warehouse')) {
                            errorMessage += 'Warehouse is suspended or does not exist. ';
                        }
                        else if (err.message?.includes('syntax error')) {
                            errorMessage += 'SQL syntax error. ';
                        }
                        // Don't include full error message which might contain SQL
                        errorMessage += `Error code: ${errorCode}`;
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
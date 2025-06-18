import { z } from 'zod';
declare const SnowflakeConfigSchema: z.ZodObject<{
    SNOWFLAKE_ACCOUNT: z.ZodString;
    SNOWFLAKE_USER: z.ZodString;
    SNOWFLAKE_PASSWORD: z.ZodString;
    SNOWFLAKE_DATABASE: z.ZodString;
    SNOWFLAKE_SCHEMA: z.ZodString;
    SNOWFLAKE_WAREHOUSE: z.ZodString;
}, "strip", z.ZodTypeAny, {
    SNOWFLAKE_ACCOUNT: string;
    SNOWFLAKE_USER: string;
    SNOWFLAKE_PASSWORD: string;
    SNOWFLAKE_DATABASE: string;
    SNOWFLAKE_SCHEMA: string;
    SNOWFLAKE_WAREHOUSE: string;
}, {
    SNOWFLAKE_ACCOUNT: string;
    SNOWFLAKE_USER: string;
    SNOWFLAKE_PASSWORD: string;
    SNOWFLAKE_DATABASE: string;
    SNOWFLAKE_SCHEMA: string;
    SNOWFLAKE_WAREHOUSE: string;
}>;
export type SnowflakeConfig = z.infer<typeof SnowflakeConfigSchema>;
export declare class SnowflakeService {
    private connection;
    private config;
    constructor();
    connect(): Promise<void>;
    execute<T = any>(query: string, binds?: any[]): Promise<T[]>;
    disconnect(): Promise<void>;
}
export declare function getSnowflakeService(): SnowflakeService;
export {};
//# sourceMappingURL=snowflake.d.ts.map
import { QueryService } from '../services/queries.js';
import { MockQueryService } from '../services/mock-queries.js';
import { logger } from '../utils/logger.js';
export class TablesController {
    queryService;
    constructor() {
        // Use mock service if credentials are not properly configured
        const hasCredentials = process.env.SNOWFLAKE_ACCOUNT && process.env.SNOWFLAKE_USER && process.env.SNOWFLAKE_PASSWORD;
        this.queryService = hasCredentials ? new QueryService() : new MockQueryService();
        if (!hasCredentials) {
            logger.warn('Using mock service - Snowflake credentials not configured');
        }
    }
    async listTables(pattern) {
        try {
            const tables = await this.queryService.listTables(pattern);
            if (tables.length === 0) {
                return 'No tables or views found.';
            }
            // Format as markdown table
            let markdown = `# Available Tables and Views\n\n`;
            markdown += `| Name | Type | Database | Schema | Comment |\n`;
            markdown += `|------|------|----------|--------|----------|\n`;
            for (const table of tables) {
                markdown += `| ${table.name} | ${table.kind} | ${table.database_name} | ${table.schema_name} | ${table.comment || '-'} |\n`;
            }
            markdown += `\n**Total:** ${tables.length} objects`;
            return markdown;
        }
        catch (error) {
            logger.error({ error, pattern }, 'Failed to list tables');
            throw new Error(`Failed to list tables: ${error}`);
        }
    }
    async getTableList(pattern) {
        const tables = await this.queryService.listTables(pattern);
        return tables.map(table => ({
            name: table.name,
            type: table.kind,
        }));
    }
}
//# sourceMappingURL=tables.js.map
import { QueryService } from '../services/queries.js';
import { logger } from '../utils/logger.js';
import { createQueryService } from '../utils/snowflake-helpers.js';

export class TablesController {
  private queryService: QueryService;

  constructor() {
    try {
      this.queryService = createQueryService();
    } catch (error) {
      logger.error({ error }, 'Failed to initialize TablesController');
      throw error;
    }
  }

  async listTables(pattern?: string): Promise<string> {
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
    } catch (error) {
      logger.error({ error, pattern }, 'Failed to list tables');
      throw new Error(`Failed to list tables: ${error}`);
    }
  }

  async getTableList(pattern?: string): Promise<{ name: string; type: string }[]> {
    const tables = await this.queryService.listTables(pattern);
    
    return tables.map(table => ({
      name: table.name,
      type: table.kind,
    }));
  }
}
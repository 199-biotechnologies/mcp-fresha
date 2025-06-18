import { logger } from '../utils/logger.js';
import { createQueryService } from '../utils/snowflake-helpers.js';
import { getTableMetadata } from '../utils/table-metadata.js';
export class TablesController {
    queryService;
    constructor() {
        try {
            this.queryService = createQueryService();
        }
        catch (error) {
            logger.error({ error }, 'Failed to initialize TablesController');
            throw error;
        }
    }
    async listTables(pattern) {
        try {
            const tables = await this.queryService.listTables(pattern);
            if (tables.length === 0) {
                return 'No tables or views found.';
            }
            // Format as detailed report with metadata
            let markdown = `# Fresha Data Connector Tables\n\n`;
            markdown += `**Total:** ${tables.length} tables/views available\n\n`;
            // Group tables by category
            const categories = {
                'Financial & Sales': ['CASH_FLOW', 'SALES', 'SALE_ITEMS', 'PAYMENTS', 'COMMISSIONS', 'SERVICE_CHARGES', 'TAXES', 'TIPS', 'WAGES', 'DEPOSITS', 'GIFT_CARDS'],
                'Bookings & Appointments': ['BOOKINGS', 'WAITLIST'],
                'Client Management': ['CLIENTS', 'CLIENT_NOTES', 'MEMBERSHIPS'],
                'Inventory & Products': ['PRODUCTS', 'STOCK_MOVEMENTS', 'STOCK_ORDERS'],
                'Business Operations': ['LOCATIONS', 'SERVICES', 'TEAM_MEMBERS', 'OCCUPANCY', 'TIMESHEETS', 'TIME_OFF']
            };
            for (const [category, tableNames] of Object.entries(categories)) {
                markdown += `## ${category}\n\n`;
                for (const tableName of tableNames) {
                    const tableInfo = tables.find(t => t.name === tableName);
                    if (!tableInfo)
                        continue;
                    const metadata = getTableMetadata(tableName);
                    markdown += `### ${tableName}\n`;
                    if (metadata) {
                        markdown += `**Description:** ${metadata.description}\n`;
                        if (metadata.detailedDescription) {
                            markdown += `\n${metadata.detailedDescription}\n`;
                        }
                        if (metadata.keyColumns && metadata.keyColumns.length > 0) {
                            markdown += `\n**Key Columns:** ${metadata.keyColumns.join(', ')}\n`;
                        }
                        if (metadata.keyMetrics && metadata.keyMetrics.length > 0) {
                            markdown += `\n**Key Metrics:**\n`;
                            metadata.keyMetrics.forEach(metric => {
                                markdown += `- ${metric}\n`;
                            });
                        }
                        if (metadata.dateColumn) {
                            markdown += `\n**Date Column:** ${metadata.dateColumn}\n`;
                        }
                        if (metadata.commonFilters && metadata.commonFilters.length > 0) {
                            markdown += `**Common Filters:** ${metadata.commonFilters.join(', ')}\n`;
                        }
                    }
                    markdown += `\n---\n\n`;
                }
            }
            // Add any tables not in our metadata
            const uncategorized = tables.filter(t => !Object.values(categories).flat().includes(t.name));
            if (uncategorized.length > 0) {
                markdown += `## Other Tables/Views\n\n`;
                markdown += `| Name | Type | Comment |\n`;
                markdown += `|------|------|----------|\n`;
                for (const table of uncategorized) {
                    markdown += `| ${table.name} | ${table.kind} | ${table.comment || '-'} |\n`;
                }
            }
            markdown += `\n## Usage Examples\n\n`;
            markdown += `- **Recent Sales:** \`get_fresha_report(report_name="SALES", start_date="2024-01-01", limit=100)\`\n`;
            markdown += `- **Client Analysis:** \`get_fresha_report(report_name="CLIENTS", filters={"IS_DELETED": false})\`\n`;
            markdown += `- **Today's Bookings:** \`get_fresha_report(report_name="BOOKINGS", start_date="today", end_date="today")\`\n`;
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
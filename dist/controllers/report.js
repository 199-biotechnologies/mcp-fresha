import { logger } from '../utils/logger.js';
import { createQueryService } from '../utils/snowflake-helpers.js';
import { getTableMetadata } from '../utils/table-metadata.js';
export class ReportController {
    queryService;
    constructor() {
        try {
            this.queryService = createQueryService();
        }
        catch (error) {
            logger.error({ error }, 'Failed to initialize ReportController');
            throw error;
        }
    }
    async getReport(params) {
        try {
            const { report_name, start_date, end_date, limit = 1000, order_by, filters = {} } = params;
            // Get table metadata
            const metadata = getTableMetadata(report_name);
            if (!metadata) {
                throw new Error(`Unknown report: ${report_name}. Use list_fresha_reports to see available reports.`);
            }
            // Get the data
            const data = await this.queryService.getReportData({
                tableName: metadata.name,
                startDate: start_date,
                endDate: end_date,
                dateColumn: metadata.dateColumn,
                limit,
                orderBy: order_by || metadata.defaultOrderBy,
                filters,
            });
            // Format the response
            return this.formatReport(metadata, data, params);
        }
        catch (error) {
            logger.error({ error, params }, 'Failed to get report');
            throw new Error(`Failed to retrieve report: ${error}`);
        }
    }
    formatReport(metadata, data, params) {
        let markdown = `# ${metadata.description}\n\n`;
        // Add query parameters info
        markdown += `**Report:** ${metadata.name}\n`;
        if (params.start_date || params.end_date) {
            markdown += `**Period:** ${params.start_date || 'start'} to ${params.end_date || 'end'}\n`;
        }
        markdown += `**Records:** ${data.length}`;
        if (data.length === params.limit) {
            markdown += ` (limited to ${params.limit})`;
        }
        markdown += `\n\n`;
        // Handle empty results
        if (data.length === 0) {
            markdown += `*No records found for the specified criteria.*\n\n`;
            markdown += `This could mean:\n`;
            markdown += `- No data exists for the specified filters\n`;
            markdown += `- The date range is outside available data\n`;
            markdown += `- The filters are too restrictive\n`;
            return markdown;
        }
        // Add summary if applicable
        if (metadata.summaryFields && data.length > 0) {
            markdown += `## Summary\n\n`;
            markdown += `| Metric | Value |\n`;
            markdown += `|--------|-------|\n`;
            for (const field of metadata.summaryFields) {
                if (data[0][field] !== undefined) {
                    const sum = data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
                    const isAmount = field.includes('AMOUNT') || field.includes('SALES') || field.includes('BALANCE');
                    const value = isAmount ? `£${sum.toFixed(2)}` : sum.toString();
                    markdown += `| Total ${field.replace(/_/g, ' ').toLowerCase()} | ${value} |\n`;
                }
            }
            markdown += `\n`;
        }
        // Add data table
        markdown += `## Data\n\n`;
        // Get all unique keys from the data
        const allKeys = [...new Set(data.flatMap(row => Object.keys(row)))];
        // Create table header
        markdown += `| ${allKeys.join(' | ')} |\n`;
        markdown += `|${allKeys.map(() => '---').join('|')}|\n`;
        // Add first 20 rows (to avoid huge responses)
        const displayRows = Math.min(data.length, 20);
        for (let i = 0; i < displayRows; i++) {
            const row = data[i];
            const values = allKeys.map(key => {
                const value = row[key];
                if (value === null || value === undefined)
                    return '';
                if (value instanceof Date)
                    return value.toISOString().split('T')[0];
                if (typeof value === 'number' && (key.includes('AMOUNT') || key.includes('PRICE'))) {
                    return `£${value.toFixed(2)}`;
                }
                return String(value);
            });
            markdown += `| ${values.join(' | ')} |\n`;
        }
        if (data.length > displayRows) {
            markdown += `\n*Showing first ${displayRows} of ${data.length} records*\n`;
        }
        return markdown;
    }
}
//# sourceMappingURL=report.js.map
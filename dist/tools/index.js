import { z } from 'zod';
import { ReportController } from '../controllers/report.js';
import { TablesController } from '../controllers/tables.js';
// Tool input schemas
export const ListTablesSchema = z.object({
    pattern: z.string().optional().describe('Optional glob pattern to filter tables'),
});
export const GetReportSchema = z.object({
    report_name: z.string().describe('Name of the Fresha report/table (e.g., CASH_FLOW, SALES, BOOKINGS)'),
    start_date: z.string().optional().describe('Start date filter in ISO format (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date filter in ISO format (YYYY-MM-DD)'),
    limit: z.number().optional().default(1000).describe('Maximum number of records to return'),
    order_by: z.string().optional().describe('Column to sort by (e.g., "SALE_DATE DESC")'),
    filters: z.record(z.any()).optional().describe('Additional filters as key-value pairs'),
});
// Controllers - initialized lazily to allow server to start even without credentials
let reportController = null;
let tablesController = null;
function getReportController() {
    if (!reportController) {
        reportController = new ReportController();
    }
    return reportController;
}
function getTablesController() {
    if (!tablesController) {
        tablesController = new TablesController();
    }
    return tablesController;
}
// Tool definitions
export const tools = [
    {
        name: 'list_fresha_reports',
        description: 'List all available Fresha reports, tables and views in the database',
        inputSchema: {
            type: 'object',
            properties: {
                pattern: {
                    type: 'string',
                    description: 'Optional glob pattern to filter tables',
                },
            },
        },
    },
    {
        name: 'get_fresha_report',
        description: 'Get data from any Fresha report/table with flexible filtering options. Available reports: BOOKINGS, CASH_FLOW, CLIENT_NOTES, CLIENTS, COMMISSIONS, DEPOSITS, GIFT_CARDS, LOCATIONS, MEMBERSHIPS, OCCUPANCY, PAYMENTS, PRODUCTS, SALE_ITEMS, SALES, SERVICE_CHARGES, SERVICES, STOCK_MOVEMENTS, STOCK_ORDERS, TAXES, TEAM_MEMBERS, TIME_OFF, TIMESHEETS, TIPS, WAGES, WAITLIST',
        inputSchema: {
            type: 'object',
            properties: {
                report_name: {
                    type: 'string',
                    description: 'Name of the Fresha report/table. Available: BOOKINGS, CASH_FLOW, CLIENT_NOTES, CLIENTS, COMMISSIONS, DEPOSITS, GIFT_CARDS, LOCATIONS, MEMBERSHIPS, OCCUPANCY, PAYMENTS, PRODUCTS, SALE_ITEMS, SALES, SERVICE_CHARGES, SERVICES, STOCK_MOVEMENTS, STOCK_ORDERS, TAXES, TEAM_MEMBERS, TIME_OFF, TIMESHEETS, TIPS, WAGES, WAITLIST',
                },
                start_date: {
                    type: 'string',
                    description: 'Start date filter in ISO format (YYYY-MM-DD)',
                },
                end_date: {
                    type: 'string',
                    description: 'End date filter in ISO format (YYYY-MM-DD)',
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of records to return (default: 1000)',
                },
                order_by: {
                    type: 'string',
                    description: 'Column to sort by (e.g., "SALE_DATE DESC")',
                },
                filters: {
                    type: 'object',
                    description: 'Additional filters as key-value pairs',
                    additionalProperties: true,
                },
            },
            required: ['report_name'],
        },
    },
];
// Tool handlers
export async function handleToolCall(name, args) {
    switch (name) {
        case 'list_fresha_reports': {
            const input = ListTablesSchema.parse(args);
            const result = await getTablesController().listTables(input.pattern);
            return {
                content: [
                    {
                        type: 'text',
                        text: result,
                    },
                ],
            };
        }
        case 'get_fresha_report': {
            const input = GetReportSchema.parse(args);
            const result = await getReportController().getReport(input);
            return {
                content: [
                    {
                        type: 'text',
                        text: result,
                    },
                ],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
//# sourceMappingURL=index.js.map
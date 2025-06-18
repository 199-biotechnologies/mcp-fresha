import { z } from 'zod';
import { CashFlowController } from '../controllers/cash-flow.js';
import { TablesController } from '../controllers/tables.js';
// Tool input schemas
export const ListTablesSchema = z.object({
    pattern: z.string().optional().describe('Optional glob pattern to filter tables'),
});
export const GetCashFlowSchema = z.object({
    start_date: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
    end_date: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
});
// Controllers - initialized lazily to allow server to start even without credentials
let cashFlowController = null;
let tablesController = null;
function getCashFlowController() {
    if (!cashFlowController) {
        cashFlowController = new CashFlowController();
    }
    return cashFlowController;
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
        name: 'get_fresha_cash_flow',
        description: 'Get Fresha cash flow statement for a date range with detailed transaction breakdown',
        inputSchema: {
            type: 'object',
            properties: {
                start_date: {
                    type: 'string',
                    description: 'Start date in ISO format (YYYY-MM-DD)',
                },
                end_date: {
                    type: 'string',
                    description: 'End date in ISO format (YYYY-MM-DD)',
                },
            },
            required: ['start_date', 'end_date'],
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
        case 'get_fresha_cash_flow': {
            const input = GetCashFlowSchema.parse(args);
            const result = await getCashFlowController().getCashFlowStatement(input.start_date, input.end_date);
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
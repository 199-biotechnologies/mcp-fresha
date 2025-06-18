import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
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
let cashFlowController: CashFlowController | null = null;
let tablesController: TablesController | null = null;

function getCashFlowController(): CashFlowController {
  if (!cashFlowController) {
    cashFlowController = new CashFlowController();
  }
  return cashFlowController;
}

function getTablesController(): TablesController {
  if (!tablesController) {
    tablesController = new TablesController();
  }
  return tablesController;
}

// Tool definitions
export const tools: Tool[] = [
  {
    name: 'list_tables',
    description: 'List all tables and views in the Fresha database',
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
    name: 'get_cash_flow_statement',
    description: 'Get cash flow statement for a date range with transaction breakdown',
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
export async function handleToolCall(name: string, args: any) {
  switch (name) {
    case 'list_tables': {
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
    
    case 'get_cash_flow_statement': {
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
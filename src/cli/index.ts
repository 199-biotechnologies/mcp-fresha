#!/usr/bin/env node

import { Command } from 'commander';
import { CashFlowController } from '../controllers/cash-flow.js';
import { TablesController } from '../controllers/tables.js';
import { logger } from '../utils/logger.js';
import { config } from 'dotenv';

config();

const program = new Command();
const cashFlowController = new CashFlowController();
const tablesController = new TablesController();

program
  .name('fresha-mcp')
  .description('CLI for Fresha MCP Server')
  .version('0.1.0');

program
  .command('list-tables')
  .description('List all tables and views in the Fresha database')
  .option('-p, --pattern <pattern>', 'Filter tables by pattern')
  .action(async (options) => {
    try {
      const result = await tablesController.listTables(options.pattern);
      console.log(result);
    } catch (error) {
      logger.error(error, 'Failed to list tables');
      process.exit(1);
    }
  });

program
  .command('cash-flow')
  .description('Get cash flow statement for a date range')
  .requiredOption('-f, --from <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('-t, --to <date>', 'End date (YYYY-MM-DD)')
  .action(async (options) => {
    try {
      const result = await cashFlowController.getCashFlowStatement(options.from, options.to);
      console.log(result);
    } catch (error) {
      logger.error(error, 'Failed to get cash flow');
      process.exit(1);
    }
  });

program.parse();
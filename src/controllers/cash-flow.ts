import { QueryService } from '../services/queries.js';
import { MockQueryService } from '../services/mock-queries.js';
import { logger } from '../utils/logger.js';

export class CashFlowController {
  private queryService: QueryService | MockQueryService;

  constructor() {
    // Use mock service if credentials are not properly configured
    const hasCredentials = process.env.SNOWFLAKE_ACCOUNT && process.env.SNOWFLAKE_USER && process.env.SNOWFLAKE_PASSWORD;
    this.queryService = hasCredentials ? new QueryService() : new MockQueryService();
    
    if (!hasCredentials) {
      logger.warn('Using mock service - Snowflake credentials not configured');
    }
  }

  async getCashFlowStatement(startDate: string, endDate: string): Promise<string> {
    try {
      const summary = await this.queryService.getCashFlowSummary(startDate, endDate);
      
      // Format as markdown table
      let markdown = `# Cash Flow Statement\n\n`;
      markdown += `**Period:** ${startDate} to ${endDate}\n\n`;
      markdown += `## Summary\n\n`;
      markdown += `| Metric | Amount (${summary.rawData[0]?.CURRENCY || 'GBP'}) |\n`;
      markdown += `|--------|--------|\n`;
      markdown += `| Opening Balance | £${summary.openingBalance.toFixed(2)} |\n`;
      markdown += `| Total Inflow | £${summary.totalInflow.toFixed(2)} |\n`;
      markdown += `| Total Outflow | £${summary.totalOutflow.toFixed(2)} |\n`;
      markdown += `| Net Cash Flow | £${summary.netCashFlow.toFixed(2)} |\n`;
      markdown += `| Closing Balance | £${summary.closingBalance.toFixed(2)} |\n`;
      markdown += `| Total Transactions | ${summary.totalTransactions} |\n\n`;
      
      markdown += `## Transaction Breakdown\n\n`;
      markdown += `| Type | Count | Total Amount |\n`;
      markdown += `|------|-------|-------------|\n`;
      
      for (const [type, data] of Object.entries(summary.transactionsByType)) {
        markdown += `| ${type} | ${data.count} | £${data.amount.toFixed(2)} |\n`;
      }
      
      return markdown;
    } catch (error) {
      logger.error({ error, startDate, endDate }, 'Failed to get cash flow statement');
      throw new Error(`Failed to retrieve cash flow data: ${error}`);
    }
  }

  async formatCashFlowData(startDate: string, endDate: string): Promise<any> {
    const summary = await this.queryService.getCashFlowSummary(startDate, endDate);
    
    return {
      period: summary.period,
      summary: {
        totalTransactions: summary.totalTransactions,
        totalInflow: summary.totalInflow,
        totalOutflow: summary.totalOutflow,
        netCashFlow: summary.netCashFlow,
        openingBalance: summary.openingBalance,
        closingBalance: summary.closingBalance,
      },
      transactionsByType: summary.transactionsByType,
    };
  }
}
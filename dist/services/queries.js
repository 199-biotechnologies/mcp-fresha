import { getSnowflakeService } from './snowflake.js';
import { logger } from '../utils/logger.js';
export class QueryService {
    snowflake = getSnowflakeService();
    async listTables(pattern) {
        logger.info({ pattern }, 'Listing tables');
        let query = 'SHOW TABLES';
        if (pattern) {
            query += ` LIKE '${pattern}'`;
        }
        const tables = await this.snowflake.execute(query);
        // Also get views
        query = 'SHOW VIEWS';
        if (pattern) {
            query += ` LIKE '${pattern}'`;
        }
        const views = await this.snowflake.execute(query);
        return [...tables, ...views];
    }
    async getCashFlow(startDate, endDate) {
        logger.info({ startDate, endDate }, 'Getting cash flow data');
        const query = `
      SELECT *
      FROM CASH_FLOW
      WHERE PAYMENT_DATE BETWEEN ? AND ?
      ORDER BY PAYMENT_DATE ASC
    `;
        return await this.snowflake.execute(query, [startDate, endDate]);
    }
    async getCashFlowSummary(startDate, endDate) {
        const cashFlowData = await this.getCashFlow(startDate, endDate);
        // Calculate summary metrics
        let totalInflow = 0;
        let totalOutflow = 0;
        const transactionsByType = new Map();
        for (const row of cashFlowData) {
            const amount = Number(row.AMOUNT);
            if (amount > 0) {
                totalInflow += amount;
            }
            else {
                totalOutflow += Math.abs(amount);
            }
            // Group by transaction type
            const existing = transactionsByType.get(row.TRANSACTION_TYPE) || { count: 0, amount: 0 };
            existing.count++;
            existing.amount += amount;
            transactionsByType.set(row.TRANSACTION_TYPE, existing);
        }
        return {
            period: { startDate, endDate },
            totalTransactions: cashFlowData.length,
            totalInflow,
            totalOutflow,
            netCashFlow: totalInflow - totalOutflow,
            openingBalance: cashFlowData[0]?.OPENING_BALANCE || 0,
            closingBalance: cashFlowData[cashFlowData.length - 1]?.CLOSING_BALANCE || 0,
            transactionsByType: Object.fromEntries(transactionsByType),
            rawData: cashFlowData,
        };
    }
}
//# sourceMappingURL=queries.js.map
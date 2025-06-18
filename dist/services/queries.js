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
    async getReportData(params) {
        const { tableName, startDate, endDate, dateColumn, limit = 1000, orderBy, filters = {} } = params;
        logger.info({ tableName, startDate, endDate, limit }, 'Getting report data');
        // Build query
        let query = `SELECT * FROM ${tableName}`;
        const conditions = [];
        const binds = [];
        // Add date filter if applicable
        if ((startDate || endDate) && dateColumn) {
            if (startDate && endDate) {
                conditions.push(`${dateColumn} BETWEEN ? AND ?`);
                binds.push(startDate, endDate);
            }
            else if (startDate) {
                conditions.push(`${dateColumn} >= ?`);
                binds.push(startDate);
            }
            else if (endDate) {
                conditions.push(`${dateColumn} <= ?`);
                binds.push(endDate);
            }
        }
        // Add custom filters
        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== null) {
                conditions.push(`${key} = ?`);
                binds.push(value);
            }
        }
        // Add WHERE clause if conditions exist
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        // Add ORDER BY
        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }
        // Add LIMIT
        query += ` LIMIT ${limit}`;
        return await this.snowflake.execute(query, binds);
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
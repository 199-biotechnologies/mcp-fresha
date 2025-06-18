import { getSnowflakeService } from './snowflake.js';
import { logger } from '../utils/logger.js';
import { FRESHA_TABLES } from '../utils/table-metadata.js';

export interface TableInfo {
  name: string;
  kind: string;
  database_name: string;
  schema_name: string;
  comment?: string;
}

export interface CashFlowRow {
  TRANSACTION_REF: string;
  PAYMENT_DATE: Date;
  TRANSACTION_TYPE: string;
  AMOUNT: number;
  OPENING_BALANCE: number;
  CLOSING_BALANCE: number;
  LOCATION?: string;
  TEAM_MEMBER?: string;
  CLIENT?: string;
  CURRENCY: string;
}

export class QueryService {
  private snowflake = getSnowflakeService();
  
  // Validate and quote identifier to prevent SQL injection
  private quoteIdentifier(identifier: string): string {
    // Remove any existing quotes and validate
    const cleaned = identifier.replace(/"/g, '');
    
    // Only allow alphanumeric, underscore, and dollar sign (Snowflake identifier rules)
    if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(cleaned)) {
      throw new Error(`Invalid identifier: ${identifier}`);
    }
    
    return `"${cleaned.toUpperCase()}"`;
  }
  
  // Validate table name against whitelist
  private validateTableName(tableName: string): string {
    const upperName = tableName.toUpperCase();
    if (!FRESHA_TABLES[upperName]) {
      throw new Error(`Unknown table: ${tableName}. Use list_fresha_reports to see available tables.`);
    }
    return upperName;
  }
  
  // Validate column name for common filter columns
  private validateColumnName(column: string, tableName: string): string {
    const tableMetadata = FRESHA_TABLES[tableName];
    const upperColumn = column.toUpperCase();
    
    // Allow known columns from metadata
    const knownColumns = [
      ...(tableMetadata?.commonFilters || []),
      ...(tableMetadata?.summaryFields || []),
      tableMetadata?.dateColumn,
      'LOCATION_ID', 'CLIENT_ID', 'TEAM_MEMBER_ID', 'SERVICE_ID', 'PRODUCT_ID',
      'IS_DELETED', 'STATUS', 'PAYMENT_STATUS'
    ].filter(Boolean);
    
    if (!knownColumns.includes(upperColumn)) {
      // For safety, only allow alphanumeric and underscore
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(column)) {
        throw new Error(`Invalid column name: ${column}`);
      }
    }
    
    return this.quoteIdentifier(upperColumn);
  }

  async listTables(pattern?: string): Promise<TableInfo[]> {
    logger.info({ pattern }, 'Listing tables');
    
    // SHOW commands don't support parameterized queries, but we can validate the pattern
    if (pattern) {
      // Only allow safe pattern characters for LIKE clause
      if (!/^[A-Za-z0-9_%]+$/.test(pattern)) {
        throw new Error('Invalid pattern. Only alphanumeric characters, underscore, and % are allowed.');
      }
    }
    
    let query = 'SHOW TABLES';
    if (pattern) {
      // Pattern is now validated to be safe
      query += ` LIKE '${pattern}'`;
    }
    
    const tables = await this.snowflake.execute<TableInfo>(query);
    
    // Also get views
    query = 'SHOW VIEWS';
    if (pattern) {
      query += ` LIKE '${pattern}'`;
    }
    
    const views = await this.snowflake.execute<TableInfo>(query);
    
    return [...tables, ...views];
  }

  async getReportData(params: {
    tableName: string;
    startDate?: string;
    endDate?: string;
    dateColumn?: string;
    limit?: number;
    orderBy?: string;
    filters?: Record<string, any>;
  }): Promise<any[]> {
    const { tableName, startDate, endDate, dateColumn, limit = 1000, orderBy, filters = {} } = params;
    
    logger.info({ tableName, startDate, endDate, limit }, 'Getting report data');
    
    // Validate table name against whitelist
    const validatedTable = this.validateTableName(tableName);
    const quotedTable = this.quoteIdentifier(validatedTable);
    
    // Build query with specific columns from metadata (avoid SELECT *)
    const tableMetadata = FRESHA_TABLES[validatedTable];
    let query = `SELECT * FROM ${quotedTable}`;
    const conditions: string[] = [];
    const binds: any[] = [];
    
    // Normalise date column expression (ensure whole-day comparison)
    const dateExpr = dateColumn ? `CAST(${this.validateColumnName(dateColumn, validatedTable)} AS DATE)` : undefined;
    
    // Add date filter if applicable
    if ((startDate || endDate) && dateExpr) {
      if (startDate && endDate) {
        conditions.push(`${dateExpr} BETWEEN ? AND ?`);
        binds.push(startDate, endDate);
      } else if (startDate) {
        conditions.push(`${dateExpr} >= ?`);
        binds.push(startDate);
      } else if (endDate) {
        conditions.push(`${dateExpr} <= ?`);
        binds.push(endDate);
      }
    }
    
    // Add custom filters with validation
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        const quotedColumn = this.validateColumnName(key, validatedTable);
        
        if (Array.isArray(value)) {
          // Handle array values with IN clause
          conditions.push(`${quotedColumn} IN (${value.map(() => '?').join(', ')})`);
          binds.push(...value);
        } else if (value === 'NULL' || value === 'null') {
          // Handle NULL values
          conditions.push(`${quotedColumn} IS NULL`);
        } else {
          conditions.push(`${quotedColumn} = ?`);
          binds.push(value);
        }
      }
    }
    
    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add ORDER BY with validation
    if (orderBy) {
      // Parse ORDER BY clause (e.g., "SALE_DATE DESC")
      const orderParts = orderBy.split(/\s+/);
      const orderColumn = orderParts[0];
      const orderDirection = orderParts[1]?.toUpperCase();
      
      const quotedOrderColumn = this.validateColumnName(orderColumn, validatedTable);
      
      if (orderDirection && !['ASC', 'DESC'].includes(orderDirection)) {
        throw new Error('Invalid ORDER BY direction. Use ASC or DESC.');
      }
      
      query += ` ORDER BY ${quotedOrderColumn}${orderDirection ? ' ' + orderDirection : ''}`;
    }
    
    // Add LIMIT with validation
    const validatedLimit = Math.min(Math.max(1, Math.floor(limit)), 10000);
    query += ` LIMIT ${validatedLimit}`;
    
    return await this.snowflake.execute<any>(query, binds);
  }

  async getCashFlow(startDate: string, endDate: string): Promise<CashFlowRow[]> {
    logger.info({ startDate, endDate }, 'Getting cash flow data');
    
    // Use validated table name
    const tableName = this.quoteIdentifier('CASH_FLOW');
    const dateColumn = this.quoteIdentifier('PAYMENT_DATE');
    
    const query = `
      SELECT *
      FROM ${tableName}
      WHERE ${dateColumn} BETWEEN ? AND ?
      ORDER BY ${dateColumn} ASC
    `;
    
    return await this.snowflake.execute<CashFlowRow>(query, [startDate, endDate]);
  }

  async getCashFlowSummary(startDate: string, endDate: string) {
    const cashFlowData = await this.getCashFlow(startDate, endDate);
    
    // Calculate summary metrics
    let totalInflow = 0;
    let totalOutflow = 0;
    const transactionsByType = new Map<string, { count: number; amount: number }>();
    
    for (const row of cashFlowData) {
      const amount = Number(row.AMOUNT);
      
      if (amount > 0) {
        totalInflow += amount;
      } else {
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
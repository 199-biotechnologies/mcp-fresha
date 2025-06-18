import { TableInfo, CashFlowRow } from './queries.js';
import { logger } from '../utils/logger.js';

export class MockQueryService {
  async listTables(pattern?: string): Promise<TableInfo[]> {
    logger.info({ pattern }, 'Mock: Listing tables');
    
    const mockTables: TableInfo[] = [
      { name: 'CASH_FLOW', kind: 'VIEW', database_name: 'FRESHA_DATA_CONNECTOR', schema_name: 'FRESHA_DATA_113', comment: 'Cash flow transactions' },
      { name: 'BOOKINGS', kind: 'VIEW', database_name: 'FRESHA_DATA_CONNECTOR', schema_name: 'FRESHA_DATA_113', comment: 'Customer bookings' },
      { name: 'CLIENTS', kind: 'VIEW', database_name: 'FRESHA_DATA_CONNECTOR', schema_name: 'FRESHA_DATA_113', comment: 'Client information' },
      { name: 'LOCATIONS', kind: 'VIEW', database_name: 'FRESHA_DATA_CONNECTOR', schema_name: 'FRESHA_DATA_113', comment: 'Business locations' },
      { name: 'TEAM_MEMBERS', kind: 'VIEW', database_name: 'FRESHA_DATA_CONNECTOR', schema_name: 'FRESHA_DATA_113', comment: 'Staff members' },
    ];
    
    if (pattern) {
      return mockTables.filter(t => t.name.includes(pattern.toUpperCase()));
    }
    return mockTables;
  }

  async getCashFlow(startDate: string, endDate: string): Promise<CashFlowRow[]> {
    logger.info({ startDate, endDate }, 'Mock: Getting cash flow data');
    
    // Generate mock cash flow data
    const mockData: CashFlowRow[] = [
      {
        TRANSACTION_REF: 'TXN001',
        PAYMENT_DATE: new Date(startDate),
        TRANSACTION_TYPE: 'sale',
        AMOUNT: 150.00,
        OPENING_BALANCE: 1000.00,
        CLOSING_BALANCE: 1150.00,
        LOCATION: 'Main Branch',
        TEAM_MEMBER: 'John Doe',
        CLIENT: 'Jane Smith',
        CURRENCY: 'GBP'
      },
      {
        TRANSACTION_REF: 'TXN002',
        PAYMENT_DATE: new Date(startDate),
        TRANSACTION_TYPE: 'deposit_collection',
        AMOUNT: 50.00,
        OPENING_BALANCE: 1150.00,
        CLOSING_BALANCE: 1200.00,
        LOCATION: 'Main Branch',
        TEAM_MEMBER: 'John Doe',
        CLIENT: 'Bob Johnson',
        CURRENCY: 'GBP'
      },
      {
        TRANSACTION_REF: 'TXN003',
        PAYMENT_DATE: new Date(endDate),
        TRANSACTION_TYPE: 'fresha_pay_fee',
        AMOUNT: -5.25,
        OPENING_BALANCE: 1200.00,
        CLOSING_BALANCE: 1194.75,
        LOCATION: 'Main Branch',
        CURRENCY: 'GBP'
      },
      {
        TRANSACTION_REF: 'TXN004',
        PAYMENT_DATE: new Date(endDate),
        TRANSACTION_TYPE: 'payout',
        AMOUNT: -500.00,
        OPENING_BALANCE: 1194.75,
        CLOSING_BALANCE: 694.75,
        LOCATION: 'Main Branch',
        CURRENCY: 'GBP'
      }
    ];
    
    return mockData;
  }

  async getCashFlowSummary(startDate: string, endDate: string) {
    const cashFlowData = await this.getCashFlow(startDate, endDate);
    
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
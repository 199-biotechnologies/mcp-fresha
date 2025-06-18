import { TableInfo, CashFlowRow } from './queries.js';
export declare class MockQueryService {
    listTables(pattern?: string): Promise<TableInfo[]>;
    getCashFlow(startDate: string, endDate: string): Promise<CashFlowRow[]>;
    getCashFlowSummary(startDate: string, endDate: string): Promise<{
        period: {
            startDate: string;
            endDate: string;
        };
        totalTransactions: number;
        totalInflow: number;
        totalOutflow: number;
        netCashFlow: number;
        openingBalance: number;
        closingBalance: number;
        transactionsByType: {
            [k: string]: {
                count: number;
                amount: number;
            };
        };
        rawData: CashFlowRow[];
    }>;
}
//# sourceMappingURL=mock-queries.d.ts.map
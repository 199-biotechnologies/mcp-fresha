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
export declare class QueryService {
    private snowflake;
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
//# sourceMappingURL=queries.d.ts.map
export interface TableMetadata {
    name: string;
    description: string;
    dateColumn?: string;
    defaultOrderBy?: string;
    commonFilters?: string[];
    summaryFields?: string[];
}
export declare const FRESHA_TABLES: Record<string, TableMetadata>;
export declare function getTableMetadata(tableName: string): TableMetadata | undefined;
//# sourceMappingURL=table-metadata.d.ts.map
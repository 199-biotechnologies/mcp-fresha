export declare class TablesController {
    private queryService;
    constructor();
    listTables(pattern?: string): Promise<string>;
    getTableList(pattern?: string): Promise<{
        name: string;
        type: string;
    }[]>;
}
//# sourceMappingURL=tables.d.ts.map
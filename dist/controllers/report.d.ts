export declare class ReportController {
    private queryService;
    constructor();
    getReport(params: {
        report_name: string;
        start_date?: string;
        end_date?: string;
        limit?: number;
        order_by?: string;
        filters?: Record<string, any>;
    }): Promise<string>;
    private formatReport;
}
//# sourceMappingURL=report.d.ts.map
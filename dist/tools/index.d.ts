import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const ListTablesSchema: z.ZodObject<{
    pattern: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pattern?: string | undefined;
}, {
    pattern?: string | undefined;
}>;
export declare const GetReportSchema: z.ZodObject<{
    report_name: z.ZodString;
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    order_by: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    report_name: string;
    filters?: Record<string, any> | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    order_by?: string | undefined;
}, {
    report_name: string;
    limit?: number | undefined;
    filters?: Record<string, any> | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    order_by?: string | undefined;
}>;
export declare const tools: Tool[];
export declare function handleToolCall(name: string, args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=index.d.ts.map
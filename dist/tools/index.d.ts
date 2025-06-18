import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const ListTablesSchema: z.ZodObject<{
    pattern: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pattern?: string | undefined;
}, {
    pattern?: string | undefined;
}>;
export declare const GetCashFlowSchema: z.ZodObject<{
    start_date: z.ZodString;
    end_date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
}, {
    start_date: string;
    end_date: string;
}>;
export declare const tools: Tool[];
export declare function handleToolCall(name: string, args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=index.d.ts.map
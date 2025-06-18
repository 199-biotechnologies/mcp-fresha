import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { logger } from './utils/logger.js';
import { tools, handleToolCall } from './tools/index.js';
export function createServer() {
    const server = new Server({
        name: 'mcp-fresha',
        version: '0.3.3',
    }, {
        capabilities: {
            tools: { list: true, call: true },
        },
    });
    // Register tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        logger.info({ tool: name, args }, 'Tool called');
        try {
            const result = await handleToolCall(name, args);
            return result;
        }
        catch (error) {
            logger.error({ error, tool: name }, 'Tool execution failed');
            throw error;
        }
    });
    return server;
}
export async function startServer() {
    logger.info('Starting Fresha MCP Server...');
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Fresha MCP Server started successfully');
}
//# sourceMappingURL=server.js.map
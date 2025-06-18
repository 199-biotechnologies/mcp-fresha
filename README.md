# Fresha MCP Server

MCP (Model Context Protocol) server for accessing Fresha Data Connector via Snowflake. This allows AI tools like Claude to query your Fresha business data directly.

## Installation

```bash
npm install -g @fresha/mcp-server
# or run directly with npx
npx @fresha/mcp-server
```

## Configuration

### Environment Variables

Create a `.env` file with your Snowflake credentials (from Fresha Data Connector):

```env
SNOWFLAKE_ACCOUNT=your-account.snowflakecomputing.com
SNOWFLAKE_USER=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=FRESHA_DATA_CONNECTOR
SNOWFLAKE_SCHEMA=FRESHA_DATA_113
SNOWFLAKE_WAREHOUSE=FRESHA_DATA_113
LOG_LEVEL=info
```

### Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "fresha": {
      "command": "npx",
      "args": ["@fresha/mcp-server"],
      "env": {
        "SNOWFLAKE_ACCOUNT": "your-account.snowflakecomputing.com",
        "SNOWFLAKE_USER": "your-username",
        "SNOWFLAKE_PASSWORD": "your-password",
        "SNOWFLAKE_DATABASE": "FRESHA_DATA_CONNECTOR",
        "SNOWFLAKE_SCHEMA": "FRESHA_DATA_113",
        "SNOWFLAKE_WAREHOUSE": "FRESHA_DATA_113"
      }
    }
  }
}
```

## Available Tools

### `list_tables`
List all tables and views available in your Fresha database.

Example queries:
- "Show me all available tables"
- "List tables matching 'CASH'"

### `get_cash_flow_statement`
Generate a cash flow statement for a specific date range.

Parameters:
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format

Example queries:
- "Show me yesterday's cash flow"
- "Get cash flow statement for June 2025"
- "What was my net cash flow last week?"

## CLI Usage

The package includes a CLI for direct database queries:

```bash
# List all tables
fresha-mcp list-tables

# Filter tables by pattern
fresha-mcp list-tables --pattern CASH

# Get cash flow statement
fresha-mcp cash-flow --from 2025-06-01 --to 2025-06-17
```

## Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## Security

- Never commit your `.env` file
- Use environment variables for all sensitive credentials
- The server operates in read-only mode by default
- Snowflake credentials are validated on startup

## Troubleshooting

### Mock Mode
If Snowflake credentials are not configured, the server runs in mock mode with sample data. You'll see a warning in the logs: "Using mock service - Snowflake credentials not configured"

### Connection Issues
- Verify your Snowflake account URL format (remove https:// prefix)
- Check that your credentials match those from Fresha Data Connector
- Ensure your IP is whitelisted if using network policies

### Rate Limits
Fresha Data Connector has a fair use policy of 8 hours per day. The server doesn't currently track usage, so monitor your usage through Fresha's interface.

## License

MIT
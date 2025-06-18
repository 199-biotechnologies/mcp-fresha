# mcp-fresha

MCP (Model Context Protocol) server for accessing Fresha Data Connector via Snowflake. Query your Fresha business data directly through AI assistants like Claude.

## Quick Start

```bash
npm install -g mcp-fresha
```

## Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fresha": {
      "command": "mcp-fresha",
      "env": {
        "SNOWFLAKE_ACCOUNT": "your-account.snowflakecomputing.com",
        "SNOWFLAKE_USER": "FRESHA_DATA_XXX_XXX",
        "SNOWFLAKE_PASSWORD": "your-password",
        "SNOWFLAKE_DATABASE": "FRESHA_DATA_CONNECTOR",
        "SNOWFLAKE_SCHEMA": "FRESHA_DATA_XXX",
        "SNOWFLAKE_WAREHOUSE": "FRESHA_DATA_XXX"
      }
    }
  }
}
```

**Important**: If your password contains `#`, wrap it in quotes: `"password#123"`

Get these credentials from your Fresha Data Connector settings.

## Available Tools

### `list_fresha_reports`
Lists all available tables and views in your Fresha database.

**Example**: "Show me all tables"

### `get_fresha_report`
Get data from any Fresha report/table with flexible filtering options.

**Parameters**:
- `report_name` (required) - Name of the table (e.g., CASH_FLOW, SALES, BOOKINGS)
- `start_date` (optional) - Start date filter (YYYY-MM-DD)
- `end_date` (optional) - End date filter (YYYY-MM-DD)
- `limit` (optional) - Max records to return (default: 1000)
- `order_by` (optional) - Column to sort by (e.g., "SALE_DATE DESC")
- `filters` (optional) - Additional filters as key-value pairs

**Examples**: 
- "Get yesterday's cash flow"
- "Show me top 10 clients by appointment count"
- "Get all bookings for this week"
- "Show sales from location 123"

## Available Tables

Your Fresha database includes:
- `CASH_FLOW` - Transaction-level cash flow data
- `BOOKINGS` - Service bookings and appointments
- `CLIENTS` - Client information and history
- `PAYMENTS` - Payment transactions
- `SALES` - Sales records
- `LOCATIONS` - Business locations
- `TEAM_MEMBERS` - Staff information
- And more...

## Troubleshooting

### Authentication Failed
- Ensure credentials match exactly from Fresha Data Connector
- Check for special characters in password (especially `#`)
- Remove `https://` from account URL if present

### No Data Returned
- Verify you have the correct database and schema names
- Check Fresha Data Connector is active (8-hour daily limit)

## Development

```bash
# Clone and install
git clone https://github.com/199-biotechnologies/mcp-fresha.git
cd mcp-fresha/fresha-mcp-server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Build and test
npm run build
npm test
```

## License

MIT
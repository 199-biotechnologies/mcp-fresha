# mcp-fresha

MCP (Model Context Protocol) server for accessing Fresha Data Connector via Snowflake. Query your Fresha business data directly through AI assistants like Claude.

**Author**: Boris Djordjevic

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

## Features

- **Real-time Data Access**: Direct connection to your Fresha business data through Snowflake
- **Flexible Querying**: Support for date ranges, custom filters, sorting, and pagination
- **Smart Date Parsing**: Natural language date inputs like "yesterday", "last week", "this month"
- **Comprehensive Schema Discovery**: Automatic discovery of all available tables and their structures
- **Type-safe Operations**: Built with TypeScript for reliability and maintainability
- **Mock Mode**: Development mode with sample data when Snowflake credentials are not available
- **Structured Logging**: Detailed logging with Pino for debugging and monitoring

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

## Security

### Best Practices
- **Environment Variables**: All sensitive credentials are stored as environment variables, never in code
- **No Credential Logging**: The server automatically masks Snowflake credentials in logs
- **Read-Only Access**: Designed for read-only operations to prevent accidental data modifications
- **Input Validation**: All tool inputs are validated using Zod schemas to prevent injection attacks
- **Parameterized Queries**: All database queries use parameterized statements to prevent SQL injection
- **Session Management**: Each connection is properly managed with automatic cleanup

### Data Protection
- Credentials are never exposed in error messages or logs
- Mock mode prevents accidental production data access during development
- All database connections are encrypted using Snowflake's secure protocols

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

# Development mode with mock data
npm run dev

# Watch mode for development
npm run watch

# Lint and type check
npm run lint
npm run typecheck
```

### Architecture

The project follows a clean architecture pattern:
- **Controllers**: Business logic for handling data queries and transformations
- **Services**: Data access layer with Snowflake connection management
- **Tools**: MCP tool definitions that expose functionality to AI assistants
- **Utils**: Shared utilities for logging, date parsing, and error handling

## Contributing

Contributions are welcome! Please ensure:
- All code passes linting (`npm run lint`)
- TypeScript types are properly defined
- New features include appropriate error handling
- Security best practices are followed

## License

MIT
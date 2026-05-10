# ListSnap MCP Server v2

Official MCP (Model Context Protocol) server for ListSnap, built with the `@modelcontextprotocol/sdk`.

## Tools

| Tool | Description |
|------|-------------|
| `list_inventory` | List all items, optionally filtered by status |
| `search_inventory` | Search items by keyword (title, brand, model) |
| `get_item` | Get a single item by ID |
| `create_item` | Create a new inventory item |
| `update_item` | Update an existing item |
| `delete_item` | Delete an item by ID |

## Deploy to Render

1. Push these files to your GitHub repo root
2. Render → **New Web Service** → connect repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** `20`
4. Add environment variables:
   - `BASE44_APP_ID` — your Base44 app ID
   - `BASE44_API_KEY` — your Base44 API key
5. Deploy!

## Connect to Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "listsnap": {
      "url": "https://mcp-server-mo5g.onrender.com/sse"
    }
  }
}
```

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Then fully quit and restart Claude Desktop.

## Health Check

```
GET https://mcp-server-mo5g.onrender.com/health
```

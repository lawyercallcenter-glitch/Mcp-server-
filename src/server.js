import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "lawyercallcenter-mcp-server",
  version: "1.0.0"
});

server.registerTool(
  "ping",
  {
    description: "Simple health check tool"
  },
  async () => ({
    content: [
      {
        type: "text",
        text: "pong"
      }
    ]
  })
);

server.registerTool(
  "sync_status",
  {
    description: "Returns basic sync status details",
    inputSchema: z.object({
      source: z.string().optional()
    })
  },
  async ({ source }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            status: "ok",
            syncedAt: new Date().toISOString(),
            source: source ?? "default"
          },
          null,
          2
        )
      }
    ]
  })
);

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server started on stdio");
}

start().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});

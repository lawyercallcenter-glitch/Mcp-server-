import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import process from "process";

const BASE44_API = "https://api.base44.com/api/apps";
const APP_ID = process.env.BASE44_APP_ID;
const API_KEY = process.env.BASE44_API_KEY;

async function base44Fetch(path, options = {}) {
  const url = `${BASE44_API}/${APP_ID}/entities${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "ApiKey": API_KEY,
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Base44 API error ${res.status}: ${text}`);
  }
  return res.json();
}

const server = new McpServer({ name: "listsnap-mcp", version: "1.0.0" });

server.tool("list_inventory", "List all inventory items from ListSnap. Optionally filter by status.", {
  status: z.enum(["draft", "ready", "listed", "sold"]).optional()
}, async ({ status }) => {
  const items = await base44Fetch("/InventoryItem/");
  const filtered = status ? items.filter(i => i.status === status) : items;
  return { content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }] };
});

server.tool("get_item", "Get details of a specific inventory item by ID", {
  id: z.string()
}, async ({ id }) => {
  const item = await base44Fetch(`/InventoryItem/${id}`);
  return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
});

server.tool("create_item", "Create a new inventory item in ListSnap", {
  title: z.string(),
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  price: z.number().optional(),
  cost_basis: z.number().optional(),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"]).optional(),
  status: z.enum(["draft", "ready", "listed", "sold"]).optional().default("draft"),
  category: z.string().optional(),
  tags: z.string().optional()
}, async (args) => {
  const item = await base44Fetch("/InventoryItem/", { method: "POST", body: JSON.stringify(args) });
  return { content: [{ type: "text", text: `Created: ${item.id}\n${JSON.stringify(item, null, 2)}` }] };
});

server.tool("update_item", "Update an existing inventory item", {
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  cost_basis: z.number().optional(),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"]).optional(),
  status: z.enum(["draft", "ready", "listed", "sold"]).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  tags: z.string().optional()
}, async ({ id, ...updates }) => {
  const item = await base44Fetch(`/InventoryItem/${id}`, { method: "PUT", body: JSON.stringify(updates) });
  return { content: [{ type: "text", text: `Updated ${id}\n${JSON.stringify(item, null, 2)}` }] };
});

server.tool("delete_item", "Delete an inventory item by ID", {
  id: z.string()
}, async ({ id }) => {
  await base44Fetch(`/InventoryItem/${id}`, { method: "DELETE" });
  return { content: [{ type: "text", text: `Deleted item ${id}` }] };
});

server.tool("search_inventory", "Search inventory items by keyword", {
  query: z.string(),
  status: z.enum(["draft", "ready", "listed", "sold"]).optional()
}, async ({ query, status }) => {
  const items = await base44Fetch("/InventoryItem/");
  const q = query.toLowerCase();
  let results = items.filter(i =>
    i.title?.toLowerCase().includes(q) ||
    i.brand?.toLowerCase().includes(q) ||
    i.model?.toLowerCase().includes(q) ||
    i.description?.toLowerCase().includes(q)
  );
  if (status) results = results.filter(i => i.status === status);
  return { content: [{ type: "text", text: `Found ${results.length} items:\n${JSON.stringify(results, null, 2)}` }] };
});

const app = express();
app.use(express.json());
const transports = new Map();

app.get("/sse", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const transport = new SSEServerTransport("/message", res);
  transports.set(transport.sessionId, transport);
  res.on("close", () => transports.delete(transport.sessionId));
  await server.connect(transport);
});

app.post("/message", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);
  if (!transport) return res.status(404).json({ error: "Session not found" });
  await transport.handlePostMessage(req, res);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", server: "listsnap-mcp", version: "2.0.0" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ListSnap MCP running on port ${PORT}`));

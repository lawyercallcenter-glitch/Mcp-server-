import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 7331;
const MCP_TOKEN = process.env.MCP_TOKEN || "";

// If MCP_TOKEN is set, require Authorization: Bearer <token>; otherwise allow.
function requireAuthIfConfigured(req, res, next) {
  if (!MCP_TOKEN) return next();
  const auth = req.header("authorization") || "";
  if (auth !== `Bearer ${MCP_TOKEN}`) return res.status(401).send("Unauthorized");
  next();
}

app.get("/", (req, res) => {
  res.json({ ok: true, service: "base44-mcp-server", sse: "/sse" });
});

/**
 * SSE endpoint (Base44 expects the MCP URL to end with /sse).
 * Keeps the connection open and emits keepalive pings.
 */
app.get("/sse", requireAuthIfConfigured, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  if (typeof res.flushHeaders === "function") res.flushHeaders();

  res.write(`event: open\ndata: ${JSON.stringify({ ok: true, message: "SSE connected" })}\n\n`);

  const interval = setInterval(() => {
    res.write(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`);
  }, 15000);

  req.on("close", () => clearInterval(interval));
});

/**
 * Helper endpoint to validate the service + auth is working.
 */
app.post("/tools/ping", requireAuthIfConfigured, (req, res) => {
  const message = req.body?.message ?? "ping";
  res.json({ ok: true, echo: message, t: Date.now() });
});

app.listen(PORT, () => {
  console.log(`base44-mcp-server listening on port ${PORT}`);
});

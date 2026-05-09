# Mcp-server-

Minimal runnable MCP server for Base44-style integrations.

## Requirements

- Node.js 18+

## Install

```bash
npm install
```

## Run

```bash
npm start
```

The server uses stdio transport and exposes:

- `ping` — returns `pong`
- `sync_status` — returns basic sync health info with timestamp

## Local sanity check

```bash
npm test
```

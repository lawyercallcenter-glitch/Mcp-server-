# Base44 MCP Server (SSE)

This repository contains a small Node.js server intended to be added to **Base44 → Settings → MCP connections**.

Base44 expects a server URL like:

- `https://<your-host>/sse`

> Important: the `/sse` endpoint must be publicly reachable.

## Endpoints

- `GET /` health check
- `GET /sse` SSE stream (this is the URL you paste into Base44)
- `POST /tools/ping` helper endpoint for quick testing

## Authentication (recommended)

This server supports an optional shared secret:

- Set environment variable: `MCP_TOKEN`
- Then Base44 (and any client) must send:
  - `Authorization: Bearer <MCP_TOKEN>`

If `MCP_TOKEN` is **not** set, the server allows unauthenticated requests.

## Run locally

```bash
npm install
MCP_TOKEN=changeme npm start
```

Test locally:

```bash
curl -i http://localhost:7331/
curl -i -H "Authorization: Bearer changeme" http://localhost:7331/sse

curl -i \
  -H "Authorization: Bearer changeme" \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}' \
  http://localhost:7331/tools/ping
```

## Deploy on Render (recommended)

1. Go to **Render Dashboard → New + → Web Service**
2. Connect GitHub and select this repository
3. Use:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variable:
   - `MCP_TOKEN` = a long random secret
5. Deploy

After deploy, Render will show a URL like:

- `https://your-service.onrender.com`

Your Base44 MCP URL will be:

- `https://your-service.onrender.com/sse`

## Configure Base44

Base44 → Settings → MCP connections → Add custom MCP

- **URL:** `https://your-service.onrender.com/sse`
- **Authentication:** Not required (we’re using a header)
- **Custom header:**
  - Name: `Authorization`
  - Value: `Bearer <MCP_TOKEN>`

Click **Test**.

## If Base44 Test fails

Copy/paste the exact Base44 error message.

Some MCP clients expect a specific MCP-over-SSE protocol framing beyond a basic SSE stream. If Base44 requires that, we’ll update this server accordingly.

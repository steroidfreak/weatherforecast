# Kanban MCP Server

MCP server that provides an interactive Kanban board widget for AI assistants.

## Setup

1. Install dependencies:
```bash
npm install
cd web && npm install && cd ..
```

1. Build the React app:

```bash
npm run build:web
```

1. Start the server:

```bash
npm start
```

1. Expose with ngrok:

```bash
ngrok http 3000
```

1. Add to ChatGPT:
- Go to ChatGPT settings
- Add MCP server with your ngrok URL: `https://YOUR_ID.ngrok.io/mcp`

## Development

- Edit React components in `web/src/`
- Rebuild with `npm run build:web`
- Restart server with `npm start`

## Project Structure

- `server.js` - MCP server implementation
- `web/` - React + Vite Kanban board UI

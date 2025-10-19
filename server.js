import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';
import { readFileSync } from 'node:fs';

// Create an MCP server
const server = new McpServer({
    name: 'kanban-server',
    version: '1.0.0'
});

// Load locally built assets (produced by your component build)
const KANBAN_JS = readFileSync('web/dist/kanban.js', 'utf8');
const KANBAN_CSS = (() => {
    try {
        return readFileSync('web/dist/kanban.css', 'utf8');
    } catch {
        return ''; // CSS optional
    }
})();

// UI resource (no inline data assignment; host will inject data)
server.registerResource(
    'kanban-widget',
    'ui://widget/kanban-board.html',
    {
        title: 'Kanban Board Widget',
        description: 'Interactive Kanban board UI'
    },
    async () => ({
        contents: [
            {
                uri: 'ui://widget/kanban-board.html',
                mimeType: 'text/html+skybridge',
                text: `
<div id="kanban-root"></div>
${KANBAN_CSS ? `<style>${KANBAN_CSS}</style>` : ''}
<script type="module">${KANBAN_JS}</script>
                `.trim(),
                _meta: {
                    'openai/widgetPrefersBorder': true,
                    'openai/widgetDomain': 'https://chatgpt.com',
                    'openai/widgetCSP': {
                        connect_domains: ['https://chatgpt.com'],
                        resource_domains: ['https://*.oaistatic.com']
                    }
                }
            }
        ]
    })
);

server.registerTool(
    'kanban-board',
    {
        title: 'Show Kanban Board',
        description: 'Display an interactive Kanban board',
        _meta: {
            'openai/outputTemplate': 'ui://widget/kanban-board.html',
            'openai/toolInvocation/invoking': 'Displaying the board',
            'openai/toolInvocation/invoked': 'Displayed the board'
        },
        inputSchema: { 
            tasks: z.string().optional().describe('JSON string of tasks to display')
        }
    },
    async ({ tasks }) => {
        return {
            content: [{ type: 'text', text: 'Displayed the kanban board!' }],
            structuredContent: { tasks: tasks || '{}' }
        };
    }
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`Kanban MCP Server running on http://localhost:${port}/mcp`);
    console.log(`Expose with: ngrok http ${port}`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});

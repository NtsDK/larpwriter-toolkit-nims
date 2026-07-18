'use strict';

const { randomUUID } = require('crypto');
const { requireMcpAuth, mountAuthRoute } = require('./auth');

const characters = require('./tools/characters');
const stories = require('./tools/stories');
const events = require('./tools/events');
const relations = require('./tools/relations');
const groups = require('./tools/groups');
const briefings = require('./tools/briefings');
const meta = require('./tools/meta');
const database = require('./tools/database');
const resources = require('./resources');

const toolModules = [characters, stories, events, relations, groups, briefings, meta, database];

async function registerTools(server, db, user, mode) {
    toolModules.forEach((mod) => {
        mod.registerReadTools(server, db, user);
        if (mode === 'full') {
            mod.registerWriteTools(server, db, user);
        }
    });
    await resources.registerResources(server, db, user);
}

async function createMcpServer(name, db, user, mode) {
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');

    const server = new McpServer({
        name,
        version: '0.7.2',
    });

    await registerTools(server, db, user, mode);
    return server;
}

async function mountMcpEndpoint(app, path, db, mode) {
    const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');

    const sessions = new Map();

    app.post(path, requireMcpAuth, async (req, res) => {
        try {
            const sessionId = req.headers['mcp-session-id'];
            let transport;

            if (sessionId && sessions.has(sessionId)) {
                transport = sessions.get(sessionId);
            } else {
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (id) => {
                        sessions.set(id, transport);
                    },
                });

                transport.onclose = () => {
                    if (transport.sessionId) {
                        sessions.delete(transport.sessionId);
                    }
                };

                const server = await createMcpServer(
                    mode === 'full' ? 'nims-mcp' : 'nims-mcp-readonly',
                    db,
                    req.mcpUser,
                    mode
                );
                await server.connect(transport);
            }

            await transport.handleRequest(req, res, req.body);
        } catch (err) {
            console.error('[MCP] Error handling POST request:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal MCP server error' });
            }
        }
    });

    app.get(path, requireMcpAuth, async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        if (!sessionId || !sessions.has(sessionId)) {
            res.status(400).json({ error: 'Invalid or missing session ID' });
            return;
        }
        const transport = sessions.get(sessionId);
        try {
            await transport.handleRequest(req, res);
        } catch (err) {
            console.error('[MCP] Error handling GET request:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal MCP server error' });
            }
        }
    });

    app.delete(path, requireMcpAuth, async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        if (!sessionId || !sessions.has(sessionId)) {
            res.status(400).json({ error: 'Invalid or missing session ID' });
            return;
        }
        const transport = sessions.get(sessionId);
        try {
            await transport.handleRequest(req, res, req.body);
        } catch (err) {
            console.error('[MCP] Error handling DELETE request:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal MCP server error' });
            }
        }
    });
}

module.exports = function (app, dbms) {
    mountAuthRoute(app, dbms.db);

    Promise.all([
        mountMcpEndpoint(app, '/mcp', dbms.preparedDb, 'full'),
        mountMcpEndpoint(app, '/mcp/readonly', dbms.preparedDb, 'readonly'),
    ]).then(() => {
        console.log('[MCP] Servers mounted: /mcp (full), /mcp/readonly (readonly) — auth required');
    }).catch((err) => {
        console.error('[MCP] Failed to initialize MCP servers:', err);
    });
};

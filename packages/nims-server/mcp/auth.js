'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const config = require('../config');

const tokenStore = new Map();
const authPageHtml = fs.readFileSync(path.join(__dirname, 'authPage.html'), 'utf8');

function getTokenTtlMs() {
    return config.get('mcp:tokenTtlMs') || 24 * 60 * 60 * 1000;
}

function createToken(user) {
    const token = randomUUID();
    const userForSession = {
        name: user.name,
        role: user.role,
    };
    tokenStore.set(token, {
        user: userForSession,
        expiresAt: Date.now() + getTokenTtlMs(),
    });
    return { token, user: userForSession };
}

function validateToken(token) {
    const entry = tokenStore.get(token);
    if (!entry) {
        return null;
    }
    if (entry.expiresAt < Date.now()) {
        tokenStore.delete(token);
        return null;
    }
    return entry.user;
}

function extractBearerToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7).trim();
}

function authenticateRequest(req) {
    const token = extractBearerToken(req);
    if (!token) {
        return null;
    }
    return validateToken(token);
}

function requireMcpAuth(req, res, next) {
    const user = authenticateRequest(req);
    if (!user) {
        res.status(401).json({ error: 'Unauthorized. Obtain a token at GET /mcp/auth' });
        return;
    }
    req.mcpUser = user;
    next();
}

function mountAuthRoute(app, rawDb) {
    app.get('/mcp/auth', (req, res) => {
        const ttlMs = getTokenTtlMs();
        const html = authPageHtml.replace(
            'window.__MCP_TOKEN_TTL_MS__ || 86400000',
            String(ttlMs)
        );
        res.type('html').send(html);
    });

    app.post('/mcp/auth', async (req, res) => {
        const { username, password } = req.body || {};
        if (!username || !password) {
            res.status(400).json({ error: 'username and password are required' });
            return;
        }
        try {
            const user = await rawDb.login({ username, password });
            const session = createToken(user);
            res.json(session);
        } catch (err) {
            res.status(401).json({
                error: 'Invalid credentials',
                messageId: err.messageId || undefined,
            });
        }
    });
}

module.exports = {
    mountAuthRoute,
    requireMcpAuth,
    authenticateRequest,
    createToken,
    validateToken,
};

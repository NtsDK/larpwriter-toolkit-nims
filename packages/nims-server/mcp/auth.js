'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const config = require('../config');

const { createRateLimiter } = require('../middlewares/rateLimit');

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TTL_MS = DAY_MS;
const DEFAULT_LONG_LIVED_TTL_MS = 90 * DAY_MS; // 90 days

const mcpAuthRateLimit = createRateLimiter({
    windowMs: 60_000,
    max: 20,
    message: 'Too many MCP auth attempts, try again later',
});

const tokenStore = new Map();
const authPageHtml = fs.readFileSync(path.join(__dirname, 'authPage.html'), 'utf8');
const tokensFilePath = path.join(__dirname, '../data/mcp-tokens.json');

function getTokenTtlMs() {
    return config.get('mcp:tokenTtlMs') || DEFAULT_TTL_MS;
}

function getLongLivedTokenTtlMs() {
    return config.get('mcp:longLivedTokenTtlMs') || DEFAULT_LONG_LIVED_TTL_MS;
}

function loadPersistedTokens() {
    try {
        if (!fs.existsSync(tokensFilePath)) return;
        const raw = JSON.parse(fs.readFileSync(tokensFilePath, 'utf8'));
        const now = Date.now();
        let loaded = 0;
        for (const [token, entry] of Object.entries(raw || {})) {
            if (!entry || !entry.user) continue;
            if (entry.expiresAt != null && entry.expiresAt < now) continue;
            tokenStore.set(token, entry);
            loaded += 1;
        }
        if (loaded > 0) {
            console.log(`[MCP] Loaded ${loaded} persisted token(s)`);
        }
    } catch (err) {
        console.warn('[MCP] Failed to load persisted tokens:', err.message);
    }
}

function persistTokens() {
    try {
        const dir = path.dirname(tokensFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const obj = {};
        for (const [token, entry] of tokenStore.entries()) {
            obj[token] = entry;
        }
        fs.writeFileSync(tokensFilePath, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
        console.warn('[MCP] Failed to persist tokens:', err.message);
    }
}

function createToken(user, { longLived = false } = {}) {
    const token = randomUUID();
    const ttlMs = longLived ? getLongLivedTokenTtlMs() : getTokenTtlMs();
    const userForSession = {
        name: user.name,
        role: user.role,
    };
    const expiresAt = Date.now() + ttlMs;
    tokenStore.set(token, {
        user: userForSession,
        expiresAt,
        longLived: !!longLived,
    });
    persistTokens();
    return {
        token,
        user: userForSession,
        expiresAt,
        ttlMs,
        longLived: !!longLived,
    };
}

function validateToken(token) {
    const entry = tokenStore.get(token);
    if (!entry) {
        return null;
    }
    if (entry.expiresAt != null && entry.expiresAt < Date.now()) {
        tokenStore.delete(token);
        persistTokens();
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
        res.status(401).json({ error: 'Unauthorized. Obtain a token via MCP dialog or POST /mcp/auth' });
        return;
    }
    req.mcpUser = user;
    next();
}

function denyPlayerUser(user) {
    return !user || user.role === 'player';
}

function mountAuthRoute(app, rawDb) {
    loadPersistedTokens();

    app.get('/mcp/auth', (req, res) => {
        const ttlMs = getTokenTtlMs();
        const longLivedTtlMs = getLongLivedTokenTtlMs();
        let html = authPageHtml.replace(
            'window.__MCP_TOKEN_TTL_MS__ || 86400000',
            String(ttlMs)
        );
        html = html.replace(
            'window.__MCP_LONG_LIVED_TTL_MS__ || 7776000000',
            String(longLivedTtlMs)
        );
        res.type('html').send(html);
    });

    app.post('/mcp/auth', mcpAuthRateLimit, async (req, res) => {
        const { username, password, longLived } = req.body || {};
        if (!username || !password) {
            res.status(400).json({ error: 'username and password are required' });
            return;
        }
        try {
            const user = await rawDb.login({ username, password });
            if (denyPlayerUser(user)) {
                res.status(403).json({ error: 'Players cannot use MCP' });
                return;
            }
            const session = createToken(user, { longLived: !!longLived });
            res.json(session);
        } catch (err) {
            res.status(401).json({
                error: 'Invalid credentials',
                messageId: err.messageId || undefined,
            });
        }
    });

    /** Mint a token for the currently logged-in browser session (cookie). */
    app.post('/mcp/token', (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Not logged in' });
            return;
        }
        if (denyPlayerUser(req.user)) {
            res.status(403).json({ error: 'Players cannot use MCP' });
            return;
        }
        const longLived = req.body?.longLived !== false;
        const session = createToken(req.user, { longLived });
        res.json(session);
    });
}

module.exports = {
    mountAuthRoute,
    requireMcpAuth,
    authenticateRequest,
    createToken,
    validateToken,
    getTokenTtlMs,
    getLongLivedTokenTtlMs,
};

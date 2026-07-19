'use strict';

/**
 * Simple in-memory sliding-window rate limiter.
 * Not distributed — enough for single-process NIMS.
 */
function createRateLimiter({ windowMs = 60_000, max = 20, message = 'Too many requests' } = {}) {
    const hits = new Map();

    function clientKey(req) {
        return req.ip
            || req.headers['x-forwarded-for']
            || req.connection?.remoteAddress
            || 'unknown';
    }

    function prune(now, key) {
        const arr = hits.get(key);
        if (!arr) return;
        const fresh = arr.filter((t) => now - t < windowMs);
        if (fresh.length === 0) hits.delete(key);
        else hits.set(key, fresh);
    }

    return function rateLimit(req, res, next) {
        const now = Date.now();
        const key = String(clientKey(req));
        prune(now, key);
        const arr = hits.get(key) || [];
        if (arr.length >= max) {
            res.status(429).json({ error: message });
            return;
        }
        arr.push(now);
        hits.set(key, arr);
        next();
    };
}

module.exports = { createRateLimiter };

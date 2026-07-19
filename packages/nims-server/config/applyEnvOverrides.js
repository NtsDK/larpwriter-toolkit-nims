'use strict';

/**
 * Map NIMS_* env vars onto nconf keys and enforce production secrets.
 * Called after config files are loaded.
 */
function applyEnvOverrides(nconf) {
    if (process.env.NIMS_SESSION_SECRET) {
        nconf.set('session:secret', process.env.NIMS_SESSION_SECRET);
    }
    if (process.env.NIMS_SESSION_KEY) {
        nconf.set('session:key', process.env.NIMS_SESSION_KEY);
    }
    if (process.env.NIMS_ADMIN_LOGIN) {
        nconf.set('inits:adminLogin', process.env.NIMS_ADMIN_LOGIN);
    }
    if (process.env.NIMS_ADMIN_PASS) {
        nconf.set('inits:adminPass', process.env.NIMS_ADMIN_PASS);
    }
    if (process.env.NIMS_ENSURE_ADMIN === '1' || process.env.NIMS_ENSURE_ADMIN === 'true') {
        nconf.set('inits:ensureAdmin', true);
    }
    if (process.env.NIMS_COOKIE_SECURE === '1' || process.env.NIMS_COOKIE_SECURE === 'true') {
        nconf.set('session:cookie:secure', true);
    }
    if (process.env.NIMS_CORS_ORIGINS) {
        nconf.set('api:corsOrigins', process.env.NIMS_CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean));
    }

    const cookie = nconf.get('session:cookie') || {};
    if (!Object.prototype.hasOwnProperty.call(cookie, 'sameSite')) {
        nconf.set('session:cookie:sameSite', 'lax');
    }
    if (!Object.prototype.hasOwnProperty.call(cookie, 'httpOnly')) {
        nconf.set('session:cookie:httpOnly', true);
    }

    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
        const secret = nconf.get('session:secret');
        if (!secret || secret === 'CHANGE_ME' || String(secret).startsWith('nims-prod-change-me')) {
            throw new Error('NIMS_SESSION_SECRET is required in production (set env or session.secret)');
        }
        const adminPass = nconf.get('inits:adminPass');
        const ensureAdmin = nconf.get('inits:ensureAdmin');
        if (ensureAdmin && (!adminPass || adminPass === 'CHANGE_ME')) {
            throw new Error('NIMS_ADMIN_PASS is required when NIMS_ENSURE_ADMIN is set in production');
        }
    }
}

module.exports = { applyEnvOverrides };

'use strict';

const { denyPlayer, requireAdmin, requireOrganizer } = require('./permissions');

function formatError(err) {
    if (err && err.messageId) {
        const params = err.parameters ? ` (${JSON.stringify(err.parameters)})` : '';
        return `Error: ${err.messageId}${params}`;
    }
    return `Error: ${err && err.message ? err.message : err}`;
}

function callDb(db, method, args, user) {
    denyPlayer(user);
    if (args === undefined || args === null) {
        return db[method](user);
    }
    return db[method](args, user);
}

function callDbAdmin(db, method, args, user) {
    requireAdmin(user, db);
    if (args === undefined || args === null) {
        return db[method](user);
    }
    return db[method](args, user);
}

module.exports = { callDb, callDbAdmin, formatError };

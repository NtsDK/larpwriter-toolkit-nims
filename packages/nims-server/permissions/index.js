'use strict';

const { ValidationError } = require('nims-dbms');
const { applyPermissionProxy } = require('./permissionProxy');

function makeValidationError(err) {
    let parts = err;
    if (Array.isArray(err) && Array.isArray(err[0])) {
        parts = err[0];
    }
    if (!Array.isArray(parts)) {
        return new ValidationError(String(parts));
    }
    const messageId = parts[0];
    const parameters = parts.length > 1
        ? (Array.isArray(parts[1]) ? parts[1] : parts.slice(1))
        : [];
    return new ValidationError(messageId, parameters);
}

function wrapWithPermissions(db) {
    return applyPermissionProxy(makeValidationError, db);
}

module.exports = { makeValidationError, wrapWithPermissions, applyPermissionProxy };

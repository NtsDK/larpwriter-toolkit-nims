const path = require('path');
const util = require('util');
const http = require('http');

/* eslint-disable prefer-rest-params */

function HttpError(status, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Error';
}

util.inherits(HttpError, Error);

HttpError.prototype.name = 'HttpError';

function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);

    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

function PermissionError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, PermissionError);

    this.message = message;
}

util.inherits(PermissionError, Error);

PermissionError.prototype.name = 'PermissionError';

exports.PermissionError = PermissionError;

exports.AuthError = AuthError;

exports.HttpError = HttpError;

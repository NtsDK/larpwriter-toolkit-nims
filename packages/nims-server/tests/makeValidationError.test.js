'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { makeValidationError } = require('../permissions');

describe('makeValidationError', () => {
    it('builds ValidationError from [messageId]', () => {
        const err = makeValidationError(['errors-forbidden']);
        assert.equal(err.name, 'ValidationError');
        assert.equal(err.messageId, 'errors-forbidden');
        assert.deepEqual(err.parameters, []);
    });

    it('builds ValidationError from [messageId, params]', () => {
        const err = makeValidationError(['errors-forbidden-for-role', ['player']]);
        assert.equal(err.messageId, 'errors-forbidden-for-role');
        assert.deepEqual(err.parameters, ['player']);
    });

    it('unwraps nested or() error arrays', () => {
        const err = makeValidationError([
            ['errors-a', ['x']],
            ['errors-b'],
        ]);
        assert.equal(err.messageId, 'errors-a');
        assert.deepEqual(err.parameters, ['x']);
    });

    it('accepts plain string', () => {
        const err = makeValidationError('boom');
        assert.equal(err.messageId, 'boom');
    });
});

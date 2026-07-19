'use strict';

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { applyEnvOverrides } = require('../config/applyEnvOverrides');

function fakeNconf(initial = {}) {
    const store = { ...initial };
    return {
        get(key) { return store[key]; },
        set(key, value) { store[key] = value; },
        _store: store,
    };
}

describe('applyEnvOverrides', () => {
    const prev = { ...process.env };

    afterEach(() => {
        for (const k of Object.keys(process.env)) {
            if (!(k in prev)) delete process.env[k];
        }
        Object.assign(process.env, prev);
    });

    it('fails production start without session secret', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.NIMS_SESSION_SECRET;
        const nconf = fakeNconf({ 'session:secret': 'CHANGE_ME' });
        assert.throws(() => applyEnvOverrides(nconf), /NIMS_SESSION_SECRET/);
    });

    it('applies NIMS_SESSION_SECRET from env', () => {
        process.env.NODE_ENV = 'development';
        process.env.NIMS_SESSION_SECRET = 'from-env-secret';
        const nconf = fakeNconf({ 'session:secret': 'CHANGE_ME' });
        applyEnvOverrides(nconf);
        assert.equal(nconf.get('session:secret'), 'from-env-secret');
    });
});

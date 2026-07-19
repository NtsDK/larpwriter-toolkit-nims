'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const emptyBase = require('nims-resources/emptyBase');
const { createServerDbms } = require('nims-dbms');

describe('login roles (raw DBMS)', () => {
    it('admin logs in as organizer', async () => {
        const db = createServerDbms(structuredClone(emptyBase.data), {
            adminLogin: 'admin',
            adminPass: 'Secret1!',
        });
        const user = await db.login({ username: 'admin', password: 'Secret1!' });
        assert.equal(user.role, 'organizer');
        assert.equal(user.name, 'admin');
    });

    it('player logs in as player', async () => {
        const db = createServerDbms(structuredClone(emptyBase.data), {
            adminLogin: 'admin',
            adminPass: 'Secret1!',
        });
        await db.createPlayer({ userName: 'p1', password: 'Player1!' });
        const user = await db.login({ username: 'p1', password: 'Player1!' });
        assert.equal(user.role, 'player');
    });

    it('rejects bad password', async () => {
        const db = createServerDbms(structuredClone(emptyBase.data), {
            adminLogin: 'admin',
            adminPass: 'Secret1!',
        });
        await assert.rejects(
            () => db.login({ username: 'admin', password: 'wrong' }),
            /not-found|password|Invalid|errors/i,
        );
    });
});

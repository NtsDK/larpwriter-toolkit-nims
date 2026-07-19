'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const emptyBase = require('nims-resources/emptyBase');
const { createServerDbms } = require('nims-dbms');

describe('password hashing', () => {
    it('stores new passwords as scrypt$ salt', async () => {
        const db = createServerDbms(structuredClone(emptyBase.data), {
            adminLogin: 'admin',
            adminPass: 'AdminPass1!',
        });
        const user = await db.getUser({ username: 'admin', type: 'organizer' });
        assert.ok(user.salt.startsWith('scrypt$'));
        const session = await db.login({ username: 'admin', password: 'AdminPass1!' });
        assert.equal(session.role, 'organizer');
    });

    it('accepts legacy HMAC-SHA1 and upgrades on login', async () => {
        const db = createServerDbms(structuredClone(emptyBase.data));
        const salt = '0.123456789';
        const hashedPassword = crypto.createHmac('sha1', salt).update('Legacy1!').digest('hex');
        db.database.ManagementInfo.UsersInfo.legacy = {
            name: 'legacy',
            salt,
            hashedPassword,
            stories: [],
            characters: [],
            players: [],
            groups: [],
        };
        const session = await db.login({ username: 'legacy', password: 'Legacy1!' });
        assert.equal(session.name, 'legacy');
        const user = await db.getUser({ username: 'legacy', type: 'organizer' });
        assert.ok(user.salt.startsWith('scrypt$'));
        // Still works after upgrade
        await db.login({ username: 'legacy', password: 'Legacy1!' });
    });
});

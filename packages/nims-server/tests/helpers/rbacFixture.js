'use strict';

const emptyBase = require('nims-resources/emptyBase');
const { createServerDbms } = require('nims-dbms');
const { wrapWithPermissions } = require('../../permissions');

const PASS = 'TestPass1!';

/**
 * In-memory DBMS + permission proxy with admin / org / editor / player.
 */
async function createRbacFixture() {
    const raw = createServerDbms(structuredClone(emptyBase.data), {
        adminLogin: 'admin',
        adminPass: PASS,
    });
    const db = wrapWithPermissions(raw);
    const admin = { name: 'admin', role: 'organizer' };

    await db.createOrganizer({ name: 'org', password: PASS }, admin);
    await db.createOrganizer({ name: 'editor', password: PASS }, admin);
    await db.createPlayer({ userName: 'player', password: PASS }, admin);

    // Seed content before enabling editor lock (creates require editor mode check).
    await db.createStory({ storyName: 'AdminStory' }, admin);
    await db.createProfile({ type: 'character', characterName: 'AdminChar' }, admin);
    await db.createGroup({ groupName: 'AdminGroup' }, admin);

    await db.assignEditor({ name: 'editor' }, admin);

    return {
        raw,
        db,
        pass: PASS,
        users: {
            admin,
            org: { name: 'org', role: 'organizer' },
            editor: { name: 'editor', role: 'organizer' },
            player: { name: 'player', role: 'player' },
            nobody: undefined,
        },
    };
}

async function expectAllowed(promise) {
    try {
        await promise;
        return true;
    } catch (err) {
        const detail = err && (err.messageId || err.message) ? `${err.messageId || err.message}` : String(err);
        throw new Error(`expected allow, got deny: ${detail}`);
    }
}

async function expectDenied(promise, messageIdSubstring) {
    try {
        await promise;
        throw new Error('expected deny, but call succeeded');
    } catch (err) {
        if (err.message && err.message.startsWith('expected deny')) throw err;
        if (messageIdSubstring) {
            const hay = `${err.messageId || ''} ${err.message || ''}`;
            if (!hay.includes(messageIdSubstring)) {
                throw new Error(`expected message containing "${messageIdSubstring}", got: ${hay}`);
            }
        }
        return err;
    }
}

module.exports = { createRbacFixture, expectAllowed, expectDenied, PASS };

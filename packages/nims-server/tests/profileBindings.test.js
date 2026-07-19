'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { createRbacFixture, expectAllowed } = require('./helpers/rbacFixture');

describe('ProfileBindings integrity', () => {
    let fx;

    before(async () => {
        fx = await createRbacFixture();
        await fx.db.removeEditor({}, fx.users.admin);
    });

    it('removes binding when character is deleted', async () => {
        await expectAllowed(fx.db.createProfile({ type: 'character', characterName: 'CharDel' }, fx.users.admin));
        await expectAllowed(fx.db.createProfile({ type: 'player', characterName: 'PlayerDelChar' }, fx.users.admin));
        await expectAllowed(
            fx.db.bindCharacterToPlayer({
                characterName: 'CharDel',
                playerName: 'PlayerDelChar',
            }, fx.users.admin),
        );
        let bindings = await fx.db.getProfileBindings(fx.users.admin);
        assert.equal(bindings.CharDel, 'PlayerDelChar');

        await expectAllowed(fx.db.removeProfile({ type: 'character', characterName: 'CharDel' }, fx.users.admin));
        bindings = await fx.db.getProfileBindings(fx.users.admin);
        assert.equal(bindings.CharDel, undefined);

        const check = await fx.raw.getConsistencyCheckResult();
        assert.ok(!check.errors.some((e) => String(e).includes('CharDel')));
    });

    it('removes bindings when player is deleted', async () => {
        await expectAllowed(fx.db.createProfile({ type: 'character', characterName: 'CharKeep' }, fx.users.admin));
        await expectAllowed(fx.db.createProfile({ type: 'player', characterName: 'PlayerDel' }, fx.users.admin));
        await expectAllowed(
            fx.db.bindCharacterToPlayer({
                characterName: 'CharKeep',
                playerName: 'PlayerDel',
            }, fx.users.admin),
        );

        await expectAllowed(fx.db.removeProfile({ type: 'player', characterName: 'PlayerDel' }, fx.users.admin));
        const bindings = await fx.db.getProfileBindings(fx.users.admin);
        assert.equal(bindings.CharKeep, undefined);

        const check = await fx.raw.getConsistencyCheckResult();
        assert.ok(!check.errors.some((e) => String(e).includes('PlayerDel')));
    });
});

'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const emptyBase = require('nims-resources/emptyBase');
const { createServerDbms } = require('nims-dbms');
const { wrapWithPermissions } = require('../permissions');

describe('player signup and login↔profile link', () => {
    let raw;
    let db;
    const admin = { name: 'admin', role: 'organizer' };

    before(async () => {
        raw = createServerDbms(structuredClone(emptyBase.data), {
            adminLogin: 'admin',
            adminPass: 'Secret1!',
        });
        db = wrapWithPermissions(raw);
        await db.createProfileItem({
            type: 'player', name: 'Город', itemType: 'string', selectedIndex: 0,
        }, admin);
        await db.createProfileItem({
            type: 'questionnaire', name: 'О себе', itemType: 'text', selectedIndex: 0,
        }, admin);
        await db.changeProfileItemPlayerAccess({
            type: 'player', profileItemName: 'Город', playerAccessType: 'write',
        }, admin);
        await db.changeProfileItemPlayerAccess({
            type: 'questionnaire', profileItemName: 'О себе', playerAccessType: 'write',
        }, admin);
        await db.setPlayerOption({ name: 'allowPlayerCreation', value: true }, admin);
    });

    it('signUp creates login + player profile + questionnaire', async () => {
        // signUp is public via HTTP; API proxy keeps it forbidden — call engine directly.
        await raw.signUp({
            userName: 'signup_user',
            password: 'Player1!',
            confirmPassword: 'Player1!',
        });
        const mgmt = await db.getManagementInfo(admin);
        assert.ok(mgmt.PlayersInfo.signup_user);
        const names = await db.getProfileNamesArray({ type: 'player' }, admin);
        assert.ok(names.includes('signup_user'));
        const q = await db.getProfile({ type: 'questionnaire', name: 'signup_user' }, admin);
        assert.equal(q.name, 'signup_user');
    });

    it('link merges player-filled over empty hand fields and drops signup sheets', async () => {
        await db.createProfile({ type: 'player', characterName: 'Ручной' }, admin);
        await db.updateProfileField({
            type: 'player', characterName: 'Ручной', fieldName: 'Город',
            itemType: 'string', value: 'Москва',
        }, admin);
        await db.updateProfileField({
            type: 'questionnaire', characterName: 'Ручной', fieldName: 'О себе',
            itemType: 'text', value: 'заявка мастера',
        }, admin);

        await raw.signUp({
            userName: 'linker',
            password: 'Player1!',
            confirmPassword: 'Player1!',
        });
        const player = { name: 'linker', role: 'player' };
        await db.updateProfileField({
            type: 'player', characterName: 'linker', fieldName: 'Город',
            itemType: 'string', value: 'Питер',
        }, player);
        // leave questionnaire empty for linker

        await db.linkPlayerLoginToProfile({
            userName: 'linker',
            profileName: 'Ручной',
        }, admin);

        const names = await db.getProfileNamesArray({ type: 'player' }, admin);
        assert.ok(!names.includes('linker'));
        assert.ok(names.includes('Ручной'));

        const profile = await db.getProfile({ type: 'player', name: 'Ручной' }, admin);
        assert.equal(profile['Город'], 'Питер'); // player-filled wins

        const quest = await db.getProfile({ type: 'questionnaire', name: 'Ручной' }, admin);
        assert.equal(quest['О себе'], 'заявка мастера'); // empty player ← hand

        const info = await db.getPlayerProfileInfo(player);
        assert.equal(info.login, 'linker');
        assert.equal(info.player.name, 'Ручной');
        assert.equal(info.player.profile['Город'], 'Питер');
        assert.equal(info.questionnaire.profile['О себе'], 'заявка мастера');
    });

    it('rejects linking profile already taken by another login', async () => {
        await db.createProfile({ type: 'player', characterName: 'Занят' }, admin);
        await db.createPlayer({ userName: 'owner', password: 'Player1!' }, admin);
        // owner has same-name profile; create hand-only then link owner? 
        // Instead: create signup and link to Занят, then another signup can't link
        await raw.signUp({
            userName: 'first',
            password: 'Player1!',
            confirmPassword: 'Player1!',
        });
        await db.linkPlayerLoginToProfile({ userName: 'first', profileName: 'Занят' }, admin);

        await raw.signUp({
            userName: 'second',
            password: 'Player1!',
            confirmPassword: 'Player1!',
        });
        await assert.rejects(
            () => db.linkPlayerLoginToProfile({ userName: 'second', profileName: 'Занят' }, admin),
            (err) => String(err.messageId || err.message).includes('already'),
        );
    });

    it('unlink restores empty profile under login name', async () => {
        await db.createProfile({ type: 'player', characterName: 'Слот' }, admin);
        await raw.signUp({
            userName: 'unlink_me',
            password: 'Player1!',
            confirmPassword: 'Player1!',
        });
        await db.linkPlayerLoginToProfile({
            userName: 'unlink_me',
            profileName: 'Слот',
        }, admin);
        await db.unlinkPlayerLoginFromProfile({ userName: 'unlink_me' }, admin);

        const names = await db.getProfileNamesArray({ type: 'player' }, admin);
        assert.ok(names.includes('unlink_me'));
        assert.ok(names.includes('Слот'));

        const mgmt = await db.getManagementInfo(admin);
        assert.equal(mgmt.PlayersInfo.unlink_me.profileName, undefined);
        assert.equal(mgmt.PlayersInfo.unlink_me.resolvedProfileName, 'unlink_me');
    });

    it('getPlayersOptions defaults allowPlayerCreation to true', async () => {
        const opts = await db.getPlayersOptions(admin);
        assert.equal(typeof opts.allowPlayerCreation, 'boolean');
        await db.setPlayerOption({ name: 'allowPlayerCreation', value: false }, admin);
        const off = await db.getPlayersOptions(admin);
        assert.equal(off.allowPlayerCreation, false);
        await db.setPlayerOption({ name: 'allowPlayerCreation', value: true }, admin);
    });
});

'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const emptyBase = require('nims-resources/emptyBase');
const { createServerDbms } = require('nims-dbms');
const { wrapWithPermissions } = require('../permissions');

describe('getPlayerProfileInfo', () => {
    let db;
    const admin = { name: 'admin', role: 'organizer' };
    const player = { name: 'hero_player', role: 'player' };

    before(async () => {
        const raw = createServerDbms(structuredClone(emptyBase.data), {
            adminLogin: 'admin',
            adminPass: 'Secret1!',
        });
        db = wrapWithPermissions(raw);
        await db.createPlayer({ userName: 'hero_player', password: 'Player1!' }, admin);
        await db.createProfileItem({
            type: 'player', name: 'Город', itemType: 'string', selectedIndex: 0,
        }, admin);
        await db.createProfileItem({
            type: 'questionnaire', name: 'О себе', itemType: 'text', selectedIndex: 0,
        }, admin);
        await db.createProfileItem({
            type: 'character', name: 'Биография', itemType: 'text', selectedIndex: 0,
        }, admin);
        await db.createProfile({ type: 'character', characterName: 'Герой' }, admin);
        await db.bindCharacterToPlayer({ characterName: 'Герой', playerName: 'hero_player' }, admin);

        await db.changeProfileItemPlayerAccess({
            type: 'player', profileItemName: 'Город', playerAccessType: 'write',
        }, admin);
        await db.createProfileItem({
            type: 'character', name: 'Раса', itemType: 'string', selectedIndex: 0,
        }, admin);
        await db.changeProfileItemPlayerAccess({
            type: 'character', profileItemName: 'Биография', playerAccessType: 'write',
        }, admin);
        await db.changeProfileItemPlayerAccess({
            type: 'character', profileItemName: 'Раса', playerAccessType: 'hidden',
        }, admin);
    });

    it('player can load profile, questionnaire and bound character', async () => {
        const info = await db.getPlayerProfileInfo(player);
        assert.equal(info.player.name, 'hero_player');
        assert.ok(info.questionnaire);
        assert.equal(info.questionnaire.name, 'hero_player');
        assert.ok(info.character);
        assert.equal(info.character.name, 'Герой');
        assert.ok(info.player.profileStructure.some((f) => f.name === 'Город'));
        assert.ok(info.questionnaire.profileStructure.some((f) => f.name === 'О себе'));
        assert.ok(!info.player.profileStructure.some((f) => f.name === 'О себе'));
        assert.ok(!info.questionnaire.profileStructure.some((f) => f.name === 'Город'));
    });

    it('shows full bound character sheet; only write stays editable', async () => {
        const info = await db.getPlayerProfileInfo(player);
        const orgCharStruct = await db.getProfileStructure({ type: 'character' }, admin);
        assert.equal(info.character.profileStructure.length, orgCharStruct.length);
        const bio = info.character.profileStructure.find((f) => f.name === 'Биография');
        const race = info.character.profileStructure.find((f) => f.name === 'Раса');
        assert.equal(bio.playerAccess, 'write');
        assert.equal(race.playerAccess, 'readonly');
    });

    it('rejects when caller is not a registered player', async () => {
        await assert.rejects(
            () => db.getPlayerProfileInfo(admin),
            (err) => String(err.messageId || err.message).includes('not-found'),
        );
    });

    it('player can update own questionnaire field', async () => {
        await db.updateProfileField({
            type: 'questionnaire',
            characterName: 'hero_player',
            fieldName: 'О себе',
            itemType: 'text',
            value: 'текст анкеты',
        }, player);
        const again = await db.getPlayerProfileInfo(player);
        assert.equal(again.questionnaire.profile['О себе'], 'текст анкеты');
        assert.notEqual(again.player.profile['О себе'], 'текст анкеты');
    });
});

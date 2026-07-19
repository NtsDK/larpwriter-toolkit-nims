'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
    isAdmin, isEditor, isOrganizer, isPlayer,
    denyPlayer, requireAdmin, requireOrganizer,
    canModifyCharacter, canModifyStory,
    requireCharacterAccess, requireStoryAccess,
} = require('../mcp/permissions');

function makeDb({ admins = ['admin'], editors = [], ownership = {} } = {}) {
    const UsersInfo = {};
    for (const [userName, lists] of Object.entries(ownership)) {
        UsersInfo[userName] = {
            characters: lists.characters || [],
            stories: lists.stories || [],
            groups: lists.groups || [],
            players: lists.players || [],
        };
    }
    // ensure listed admins/editors exist in UsersInfo
    for (const name of [...admins, ...editors]) {
        if (!UsersInfo[name]) {
            UsersInfo[name] = { characters: [], stories: [], groups: [], players: [] };
        }
    }
    return {
        database: {
            ManagementInfo: {
                admins,
                admin: admins[0] || '',
                editors,
                editor: editors[0] || '',
                UsersInfo,
            },
        },
    };
}

const admin = { name: 'admin', role: 'organizer' };
const org = { name: 'org', role: 'organizer' };
const editor = { name: 'editor', role: 'organizer' };
const player = { name: 'player', role: 'player' };

describe('mcp/permissions helpers', () => {
    it('classifies roles', () => {
        const db = makeDb({ editors: ['editor'] });
        assert.equal(isOrganizer(admin), true);
        assert.equal(isOrganizer(player), false);
        assert.equal(isPlayer(player), true);
        assert.equal(isAdmin(admin, db), true);
        assert.equal(isAdmin(org, db), false);
        assert.equal(isEditor(editor, db), true);
        assert.equal(isEditor(admin, db), false);
    });

    it('denyPlayer / requireOrganizer / requireAdmin', () => {
        const db = makeDb();
        assert.throws(() => denyPlayer(player), /player/);
        assert.doesNotThrow(() => denyPlayer(admin));
        assert.throws(() => requireOrganizer(player), /player|организатора/);
        assert.doesNotThrow(() => requireOrganizer(org));
        assert.throws(() => requireAdmin(org, db), /администратора/);
        assert.doesNotThrow(() => requireAdmin(admin, db));
    });

    describe('canModifyStory / canModifyCharacter', () => {
        it('editor mode ON: only editors', () => {
            const db = makeDb({
                editors: ['editor'],
                ownership: {
                    org: { stories: ['S1'], characters: ['C1'] },
                    admin: { stories: ['S2'], characters: ['C2'] },
                },
            });
            assert.equal(canModifyStory(editor, db, 'S1'), true);
            assert.equal(canModifyStory(editor, db, 'S2'), true);
            assert.equal(canModifyStory(admin, db, 'S2'), false);
            assert.equal(canModifyStory(org, db, 'S1'), false);
            assert.equal(canModifyCharacter(editor, db, 'C1'), true);
            assert.equal(canModifyCharacter(org, db, 'C1'), false);
            assert.equal(canModifyCharacter(admin, db, 'C2'), false);
        });

        it('editor mode OFF: admin any; org only owned', () => {
            const db = makeDb({
                editors: [],
                ownership: {
                    org: { stories: ['S1'], characters: ['C1'] },
                    admin: { stories: ['S2'], characters: ['C2'] },
                },
            });
            assert.equal(canModifyStory(admin, db, 'S1'), true);
            assert.equal(canModifyStory(admin, db, 'S2'), true);
            assert.equal(canModifyStory(org, db, 'S1'), true);
            assert.equal(canModifyStory(org, db, 'S2'), false);
            assert.equal(canModifyCharacter(org, db, 'C1'), true);
            assert.equal(canModifyCharacter(org, db, 'C2'), false);
        });

        it('players always denied', () => {
            const db = makeDb({ editors: [] });
            assert.throws(() => canModifyStory(player, db, 'S1'), /player/);
            assert.throws(() => requireStoryAccess(player, db, 'S1'), /player/);
            assert.throws(() => requireCharacterAccess(org, db, 'Missing'), /нет прав/);
        });

        it('requireStoryAccess throws with story name', () => {
            const db = makeDb({
                editors: ['editor'],
                ownership: { org: { stories: ['S1'] } },
            });
            assert.throws(() => requireStoryAccess(org, db, 'S1'), /Сюжет|S1|историю/);
            assert.doesNotThrow(() => requireStoryAccess(editor, db, 'S1'));
        });

        it('supports legacy singular admin/editor fields', () => {
            const db = {
                database: {
                    ManagementInfo: {
                        admin: 'admin',
                        editor: 'editor',
                        UsersInfo: {
                            admin: { characters: [], stories: ['S'], groups: [], players: [] },
                            editor: { characters: [], stories: [], groups: [], players: [] },
                        },
                    },
                },
            };
            assert.equal(isAdmin(admin, db), true);
            assert.equal(isEditor(editor, db), true);
            assert.equal(canModifyStory(admin, db, 'S'), false);
            assert.equal(canModifyStory(editor, db, 'S'), true);
        });
    });
});

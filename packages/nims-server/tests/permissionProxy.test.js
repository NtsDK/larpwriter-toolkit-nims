'use strict';

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { createRbacFixture, expectAllowed, expectDenied } = require('./helpers/rbacFixture');

describe('permissionProxy RBAC', () => {
    let fx;

    before(async () => {
        fx = await createRbacFixture();
    });

    beforeEach(async () => {
        // Reset editor mode to assigned editor between cases that clear it
        const { db, users } = fx;
        const mgmt = await db.getManagementInfo(users.admin);
        if (!(mgmt.editors || []).includes('editor')) {
            await db.assignEditor({ name: 'editor' }, users.admin);
        }
    });

    describe('player', () => {
        it('cannot read organizer data', async () => {
            await expectDenied(fx.db.getMetaInfo(fx.users.player), 'forbidden-for-role');
            await expectDenied(fx.db.getStoryNamesArray(fx.users.player), 'forbidden-for-role');
            await expectDenied(fx.db.getProfileNamesArray({ type: 'character' }, fx.users.player), 'forbidden-for-role');
        });

        it('cannot mutate content or admin ops', async () => {
            await expectDenied(fx.db.createStory({ storyName: 'Hack' }, fx.users.player), 'forbidden-for-role');
            await expectDenied(fx.db.setDatabase({ database: {} }, fx.users.player), 'forbidden-for-role');
            await expectDenied(
                fx.db.setWriterStory({ storyName: 'AdminStory', value: 'x' }, fx.users.player),
                'forbidden-for-role',
            );
        });

        it('unauthenticated user is denied', async () => {
            await expectDenied(fx.db.getMetaInfo(fx.users.nobody), 'user-is-not-logged');
        });
    });

    describe('organizer (без флагов)', () => {
        it('can read project data', async () => {
            await expectAllowed(fx.db.getMetaInfo(fx.users.org));
            await expectAllowed(fx.db.getStoryNamesArray(fx.users.org));
            await expectAllowed(fx.db.getAllProfiles({ type: 'character' }, fx.users.org));
            await expectAllowed(fx.db.getManagementInfo(fx.users.org));
        });

        it('cannot do admin-only ops', async () => {
            await expectDenied(
                fx.db.setMetaInfoString({ name: 'name', value: 'Hack' }, fx.users.org),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.setDatabase({ database: { Meta: {} } }, fx.users.org),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.createProfileItem({
                    type: 'character', name: 'hack', itemType: 'text', selectedIndex: 0,
                }, fx.users.org),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.assignEditor({ name: 'org' }, fx.users.org),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.createOrganizer({ name: 'x', password: 'Xpass1!' }, fx.users.org),
                'forbidden-for-non-admin',
            );
        });

        it('gets ownership on create (editor mode off)', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            await expectAllowed(fx.db.createStory({ storyName: 'OrgOwnStory' }, fx.users.org));
            await expectAllowed(fx.db.createProfile({ type: 'character', characterName: 'OrgChar' }, fx.users.org));
            await expectAllowed(fx.db.createGroup({ groupName: 'OrgGroup' }, fx.users.org));

            const mgmt = await fx.db.getManagementInfo(fx.users.org);
            assert.ok(mgmt.usersInfo.org.stories.includes('OrgOwnStory'));
            assert.ok(mgmt.usersInfo.org.characters.includes('OrgChar'));
            assert.ok(mgmt.usersInfo.org.groups.includes('OrgGroup'));
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });

        it('cannot create entities when editor mode on', async () => {
            await expectDenied(
                fx.db.createStory({ storyName: 'OrgBlockedCreate' }, fx.users.org),
                'forbidden-for-non-editor',
            );
            await expectDenied(
                fx.db.createProfile({ type: 'character', characterName: 'BlockedChar' }, fx.users.org),
                'forbidden-for-non-editor',
            );
        });

        it('cannot edit others entities (editor mode off)', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            await expectDenied(
                fx.db.setWriterStory({ storyName: 'AdminStory', value: 'stolen' }, fx.users.org),
                'organizer-is-not-an-owner',
            );
            await expectDenied(
                fx.db.removeProfile({ type: 'character', characterName: 'AdminChar' }, fx.users.org),
                'organizer-is-not-an-owner',
            );
            await expectDenied(
                fx.db.removeGroup({ groupName: 'AdminGroup' }, fx.users.org),
                'organizer-is-not-an-owner',
            );
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });

        it('can edit own entities when editor mode off', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            // ensure own story exists from previous test or create
            const mgmt = await fx.db.getManagementInfo(fx.users.org);
            if (!mgmt.usersInfo.org.stories.includes('OrgOwnStory')) {
                await fx.db.createStory({ storyName: 'OrgOwnStory' }, fx.users.org);
            }
            await expectAllowed(
                fx.db.setWriterStory({ storyName: 'OrgOwnStory', value: 'мой текст' }, fx.users.org),
            );
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });

        it('cannot edit even own entities when editor mode on', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            const mgmt = await fx.db.getManagementInfo(fx.users.org);
            if (!mgmt.usersInfo.org.stories.includes('OrgLocked')) {
                await fx.db.createStory({ storyName: 'OrgLocked' }, fx.users.org);
            }
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
            await expectDenied(
                fx.db.setWriterStory({ storyName: 'OrgLocked', value: 'x' }, fx.users.org),
                'forbidden-for-non-editor',
            );
            await expectDenied(
                fx.db.createEvent({ storyName: 'OrgLocked', eventName: 'E1' }, fx.users.org),
                'forbidden-for-non-editor',
            );
        });

        it('cannot change player passwords or create player logins', async () => {
            await expectDenied(
                fx.db.changePlayerPassword({ userName: 'player', newPassword: 'Hack1!' }, fx.users.org),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.createPlayer({ userName: 'evil', password: 'Evil1!' }, fx.users.org),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.removePlayerLogin({ userName: 'player' }, fx.users.org),
                'forbidden-for-non-admin',
            );
        });
    });

    describe('редактор', () => {
        it('can edit any story/character while editor mode is on', async () => {
            await expectAllowed(
                fx.db.setWriterStory({ storyName: 'AdminStory', value: 'правка редактора' }, fx.users.editor),
            );
            await expectAllowed(
                fx.db.renameProfile({
                    type: 'character', fromName: 'AdminChar', toName: 'AdminChar2',
                }, fx.users.editor),
            );
            await expectAllowed(
                fx.db.renameProfile({
                    type: 'character', fromName: 'AdminChar2', toName: 'AdminChar',
                }, fx.users.editor),
            );
        });

        it('cannot do admin-only ops', async () => {
            await expectDenied(
                fx.db.setMetaInfoString({ name: 'name', value: 'Hack' }, fx.users.editor),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.setDatabase({ database: { Meta: {} } }, fx.users.editor),
                'forbidden-for-non-admin',
            );
            await expectDenied(
                fx.db.assignAdmin({ name: 'editor' }, fx.users.editor),
                'forbidden-for-non-admin',
            );
        });

        it('cannot removeEditor (admin only)', async () => {
            await expectDenied(fx.db.removeEditor({}, fx.users.editor), 'forbidden-for-non-admin');
            await expectDenied(
                fx.db.revokeEditor({ name: 'editor' }, fx.users.editor),
                'forbidden-for-non-admin',
            );
        });
    });

    describe('админ', () => {
        it('can always do admin ops', async () => {
            await expectAllowed(
                fx.db.setMetaInfoString({ name: 'description', value: 'rbac' }, fx.users.admin),
            );
            await expectAllowed(fx.db.getDatabase(fx.users.admin));
        });

        it('getDatabase includes password hashes for backup/restore', async () => {
            const dump = await fx.db.getDatabase(fx.users.org);
            const adminUser = dump.ManagementInfo?.UsersInfo?.admin;
            assert.ok(adminUser?.salt);
            assert.ok(adminUser?.hashedPassword);
        });

        it('can manage player logins', async () => {
            await expectAllowed(
                fx.db.changePlayerPassword({ userName: 'player', newPassword: 'Player2!' }, fx.users.admin),
            );
        });

        it('cannot mutate content when editor mode is on', async () => {
            await expectDenied(
                fx.db.setWriterStory({ storyName: 'AdminStory', value: 'admin blocked' }, fx.users.admin),
                'forbidden-for-non-editor',
            );
            await expectDenied(
                fx.db.removeStory({ storyName: 'AdminStory' }, fx.users.admin),
                'forbidden-for-non-editor',
            );
        });

        it('can mutate any content when editor mode is off', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            await expectAllowed(
                fx.db.setWriterStory({ storyName: 'AdminStory', value: 'admin ok' }, fx.users.admin),
            );
            // org-owned story if present
            const mgmt = await fx.db.getManagementInfo(fx.users.admin);
            const orgStory = (mgmt.usersInfo.org.stories || [])[0];
            if (orgStory) {
                await expectAllowed(
                    fx.db.setWriterStory({ storyName: orgStory, value: 'admin edits org' }, fx.users.admin),
                );
            }
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });

        it('can assign/revoke admin and editor', async () => {
            await expectAllowed(fx.db.assignAdmin({ name: 'org' }, fx.users.admin));
            let mgmt = await fx.db.getManagementInfo(fx.users.admin);
            assert.ok(mgmt.admins.includes('org'));
            await expectAllowed(fx.db.revokeAdmin({ name: 'org' }, fx.users.admin));
            mgmt = await fx.db.getManagementInfo(fx.users.admin);
            assert.ok(!mgmt.admins.includes('org'));
        });
    });

    describe('ownership side-effects', () => {
        it('rename updates owner list', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            await fx.db.createStory({ storyName: 'RenameMe' }, fx.users.org);
            await expectAllowed(
                fx.db.renameStory({ fromName: 'RenameMe', toName: 'Renamed' }, fx.users.org),
            );
            const mgmt = await fx.db.getManagementInfo(fx.users.org);
            assert.ok(mgmt.usersInfo.org.stories.includes('Renamed'));
            assert.ok(!mgmt.usersInfo.org.stories.includes('RenameMe'));
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });

        it('remove clears owner list', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            await fx.db.createStory({ storyName: 'DeleteMe' }, fx.users.org);
            await expectAllowed(fx.db.removeStory({ storyName: 'DeleteMe' }, fx.users.org));
            const mgmt = await fx.db.getManagementInfo(fx.users.org);
            assert.ok(!mgmt.usersInfo.org.stories.includes('DeleteMe'));
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });

        it('assigned stories grant org edit rights (editor mode off)', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            const before = (await fx.db.getManagementInfo(fx.users.admin)).usersInfo.org.stories.slice();
            await expectAllowed(
                fx.db.assignStoriesToOrganizer({
                    userName: 'org',
                    stories: [...before, 'AdminStory'],
                }, fx.users.admin),
            );
            await expectAllowed(
                fx.db.setWriterStory({ storyName: 'AdminStory', value: 'assigned' }, fx.users.org),
            );
            await fx.db.assignStoriesToOrganizer({ userName: 'org', stories: before }, fx.users.admin);
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });
    });

    describe('unknown / forbidden methods', () => {
        it('rejects unknown API commands', async () => {
            await expectDenied(fx.db.totallyFakeMethod({}, fx.users.admin), 'unknown-command');
        });

        it('forbids direct login/password APIs via proxy', async () => {
            await expectDenied(
                fx.db.login({ username: 'admin', password: fx.pass }, fx.users.admin),
                'forbidden',
            );
            await expectDenied(
                fx.db.setPassword({ username: 'org', type: 'organizer', password: 'x' }, fx.users.admin),
                'forbidden',
            );
        });
    });

    describe('story events under editor mode', () => {
        it('editor can create events; org and admin cannot', async () => {
            await expectAllowed(
                fx.db.createEvent({ storyName: 'AdminStory', eventName: 'Evt1' }, fx.users.editor),
            );
            await expectDenied(
                fx.db.createEvent({ storyName: 'AdminStory', eventName: 'EvtOrg' }, fx.users.org),
                'forbidden-for-non-editor',
            );
            await expectDenied(
                fx.db.createEvent({ storyName: 'AdminStory', eventName: 'EvtAdmin' }, fx.users.admin),
                'forbidden-for-non-editor',
            );
        });
    });

    describe('relations', () => {
        it('organizer can read relations; player cannot', async () => {
            await expectAllowed(fx.db.getRelations(fx.users.org));
            await expectAllowed(fx.db.getRelations(fx.users.editor));
            await expectDenied(fx.db.getRelations(fx.users.player), 'forbidden-for-role');
        });

        it('non-editor cannot mutate relations when editor mode on', async () => {
            await expectDenied(
                fx.db.createCharacterRelation({
                    fromCharacter: 'AdminChar', toCharacter: 'OrgChar',
                }, fx.users.org),
                'forbidden-for-non-editor',
            );
            await expectAllowed(
                fx.db.createCharacterRelation({
                    fromCharacter: 'AdminChar', toCharacter: 'OrgChar',
                }, fx.users.editor),
            );
        });
    });

    describe('bindings', () => {
        it('non-owner cannot rebind character when editor mode off', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            await expectDenied(
                fx.db.bindCharacterToPlayer({
                    characterName: 'AdminChar', playerName: 'player',
                }, fx.users.org),
                'organizer-is-not-an-owner',
            );
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });

        it('owner can bind when editor mode off', async () => {
            await fx.db.removeEditor({}, fx.users.admin);
            await expectAllowed(
                fx.db.bindCharacterToPlayer({
                    characterName: 'OrgChar', playerName: 'player',
                }, fx.users.org),
            );
            await expectAllowed(
                fx.db.unbindCharacterFromPlayer({ characterName: 'OrgChar' }, fx.users.org),
            );
            await fx.db.assignEditor({ name: 'editor' }, fx.users.admin);
        });
    });
});

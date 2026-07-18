'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');
const { requireCharacterAccess } = require('../permissions');

function registerReadTools(server, db, user) {
    server.tool(
        'list_characters',
        'Get the list of all character names in the project',
        {},
        async () => {
            try {
                const names = await callDb(db, 'getProfileNamesArray', { type: 'character' }, user);
                return { content: [{ type: 'text', text: JSON.stringify(names, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_character',
        'Get the full profile of a character by name',
        { name: z.string().describe('Character name') },
        async ({ name }) => {
            try {
                const profile = await callDb(db, 'getProfile', { type: 'character', name }, user);
                return { content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_profile_structure',
        'Get the profile field structure (schema) for characters or players. Shows field names, types, and default values.',
        { type: z.enum(['character', 'player']).describe('Profile type') },
        async ({ type }) => {
            try {
                const structure = await callDb(db, 'getProfileStructure', { type }, user);
                return { content: [{ type: 'text', text: JSON.stringify(structure, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

function registerWriteTools(server, db, user) {
    server.tool(
        'create_character',
        'Create a new character with the given name',
        { characterName: z.string().describe('Name for the new character') },
        async ({ characterName }) => {
            try {
                await callDb(db, 'createProfile', { type: 'character', characterName }, user);
                if (db.database && db.database.ManagementInfo && db.database.ManagementInfo.UsersInfo) {
                    const userInfo = db.database.ManagementInfo.UsersInfo[user.name];
                    if (userInfo && userInfo.characters && !userInfo.characters.includes(characterName)) {
                        userInfo.characters.push(characterName);
                    }
                }
                return { content: [{ type: 'text', text: `Character "${characterName}" created successfully.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'update_character_field',
        'Update a specific field of a character profile. The itemType must match the field type in the profile structure (text, string, enum, multiEnum, number, checkbox).',
        {
            characterName: z.string().describe('Character name'),
            fieldName: z.string().describe('Profile field name to update'),
            itemType: z.enum(['text', 'string', 'enum', 'multiEnum', 'number', 'checkbox']).describe('Field type as defined in the profile structure'),
            value: z.union([z.string(), z.number(), z.boolean()]).describe('New value for the field'),
        },
        async ({ characterName, fieldName, itemType, value }) => {
            try {
                await callDb(db, 'updateProfileField', {
                    type: 'character', characterName, fieldName, itemType, value,
                }, user);
                return { content: [{ type: 'text', text: `Field "${fieldName}" of "${characterName}" updated.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'rename_character',
        'Rename an existing character',
        {
            fromName: z.string().describe('Current character name'),
            toName: z.string().describe('New character name'),
        },
        async ({ fromName, toName }) => {
            try {
                requireCharacterAccess(user, db, fromName);
                await callDb(db, 'renameProfile', { type: 'character', fromName, toName }, user);
                return { content: [{ type: 'text', text: `Character renamed from "${fromName}" to "${toName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'remove_character',
        'Remove a character from the project (irreversible)',
        { characterName: z.string().describe('Character name to remove') },
        async ({ characterName }) => {
            try {
                requireCharacterAccess(user, db, characterName);
                await callDb(db, 'removeProfile', { type: 'character', characterName }, user);
                return { content: [{ type: 'text', text: `Character "${characterName}" removed.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

module.exports = { registerReadTools, registerWriteTools };

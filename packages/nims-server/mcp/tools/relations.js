'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');

function registerReadTools(server, db, user) {
    server.tool(
        'get_relations',
        'Get all character relations in the project',
        {},
        async () => {
            try {
                const relations = await callDb(db, 'getRelations', null, user);
                return { content: [{ type: 'text', text: JSON.stringify(relations, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_character_relation',
        'Get the relation between two specific characters',
        {
            fromCharacter: z.string().describe('First character name'),
            toCharacter: z.string().describe('Second character name'),
        },
        async ({ fromCharacter, toCharacter }) => {
            try {
                const relation = await callDb(db, 'getCharacterRelation', { fromCharacter, toCharacter }, user);
                return { content: [{ type: 'text', text: JSON.stringify(relation, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

function registerWriteTools(server, db, user) {
    server.tool(
        'create_relation',
        'Create a new relation between two characters',
        {
            fromCharacter: z.string().describe('First character name (starter)'),
            toCharacter: z.string().describe('Second character name (ender)'),
        },
        async ({ fromCharacter, toCharacter }) => {
            try {
                await callDb(db, 'createCharacterRelation', { fromCharacter, toCharacter }, user);
                return { content: [{ type: 'text', text: `Relation created between "${fromCharacter}" and "${toCharacter}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'set_relation_text',
        'Set the relation text from one character\'s perspective',
        {
            fromCharacter: z.string().describe('First character in the relation'),
            toCharacter: z.string().describe('Second character in the relation'),
            character: z.string().describe('The character whose perspective text is being set (must be fromCharacter or toCharacter)'),
            text: z.string().describe('Relation text from this character\'s perspective'),
        },
        async ({ fromCharacter, toCharacter, character, text }) => {
            try {
                await callDb(db, 'setCharacterRelationText', {
                    fromCharacter, toCharacter, character, text,
                }, user);
                return { content: [{ type: 'text', text: `Relation text for "${character}" in relation "${fromCharacter}"-"${toCharacter}" updated.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'remove_relation',
        'Remove the relation between two characters',
        {
            fromCharacter: z.string().describe('First character name'),
            toCharacter: z.string().describe('Second character name'),
        },
        async ({ fromCharacter, toCharacter }) => {
            try {
                await callDb(db, 'removeCharacterRelation', { fromCharacter, toCharacter }, user);
                return { content: [{ type: 'text', text: `Relation between "${fromCharacter}" and "${toCharacter}" removed.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

module.exports = { registerReadTools, registerWriteTools };

'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');

function registerReadTools(server, db, user) {
    server.tool(
        'list_stories',
        'Get the list of all story names in the project',
        {},
        async () => {
            try {
                const names = await callDb(db, 'getStoryNamesArray', null, user);
                return { content: [{ type: 'text', text: JSON.stringify(names, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_story',
        'Get the full story data including events, characters, and master text',
        { storyName: z.string().describe('Story name') },
        async ({ storyName }) => {
            try {
                const story = await callDb(db, 'getStory', { storyName }, user);
                return { content: [{ type: 'text', text: JSON.stringify(story, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_story_events',
        'Get the ordered list of events for a story',
        { storyName: z.string().describe('Story name') },
        async ({ storyName }) => {
            try {
                const events = await callDb(db, 'getStoryEvents', { storyName }, user);
                return { content: [{ type: 'text', text: JSON.stringify(events, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_story_characters',
        'Get characters participating in a story with their activity settings',
        { storyName: z.string().describe('Story name') },
        async ({ storyName }) => {
            try {
                const characters = await callDb(db, 'getStoryCharacters', { storyName }, user);
                return { content: [{ type: 'text', text: JSON.stringify(characters, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

function registerWriteTools(server, db, user) {
    server.tool(
        'create_story',
        'Create a new story',
        { storyName: z.string().describe('Name for the new story') },
        async ({ storyName }) => {
            try {
                await callDb(db, 'createStory', { storyName }, user);
                return { content: [{ type: 'text', text: `Story "${storyName}" created.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'set_story_text',
        'Set the master/writer text for a story (the origin narrative)',
        {
            storyName: z.string().describe('Story name'),
            value: z.string().describe('Story text content'),
        },
        async ({ storyName, value }) => {
            try {
                await callDb(db, 'setWriterStory', { storyName, value }, user);
                return { content: [{ type: 'text', text: `Story text for "${storyName}" updated.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'rename_story',
        'Rename an existing story',
        {
            fromName: z.string().describe('Current story name'),
            toName: z.string().describe('New story name'),
        },
        async ({ fromName, toName }) => {
            try {
                await callDb(db, 'renameStory', { fromName, toName }, user);
                return { content: [{ type: 'text', text: `Story renamed from "${fromName}" to "${toName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'remove_story',
        'Remove a story from the project (irreversible)',
        { storyName: z.string().describe('Story name to remove') },
        async ({ storyName }) => {
            try {
                await callDb(db, 'removeStory', { storyName }, user);
                return { content: [{ type: 'text', text: `Story "${storyName}" removed.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'add_character_to_story',
        'Add a character to participate in a story',
        {
            storyName: z.string().describe('Story name'),
            characterName: z.string().describe('Character name to add'),
        },
        async ({ storyName, characterName }) => {
            try {
                await callDb(db, 'addStoryCharacter', { storyName, characterName }, user);
                return { content: [{ type: 'text', text: `Character "${characterName}" added to story "${storyName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'remove_character_from_story',
        'Remove a character from a story',
        {
            storyName: z.string().describe('Story name'),
            characterName: z.string().describe('Character name to remove from story'),
        },
        async ({ storyName, characterName }) => {
            try {
                await callDb(db, 'removeStoryCharacter', { storyName, characterName }, user);
                return { content: [{ type: 'text', text: `Character "${characterName}" removed from story "${storyName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

module.exports = { registerReadTools, registerWriteTools };

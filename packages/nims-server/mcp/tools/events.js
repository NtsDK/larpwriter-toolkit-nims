'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');

function registerReadTools() {
    // Read tools for events are in stories.js (get_story_events)
}

function registerWriteTools(server, db, user) {
    server.tool(
        'create_event',
        'Create a new event in a story at the specified position',
        {
            storyName: z.string().describe('Story name'),
            eventName: z.string().describe('Event name/title'),
            selectedIndex: z.number().describe('Position index to insert the event (0 = beginning)'),
        },
        async ({ storyName, eventName, selectedIndex }) => {
            try {
                await callDb(db, 'createEvent', { storyName, eventName, selectedIndex }, user);
                return { content: [{ type: 'text', text: `Event "${eventName}" created in story "${storyName}" at position ${selectedIndex}.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'update_event',
        'Update a property (name, text, or time) of a story event',
        {
            storyName: z.string().describe('Story name'),
            index: z.number().describe('Event index in the events array (0-based)'),
            property: z.enum(['name', 'text', 'time']).describe('Property to update'),
            value: z.string().describe('New value for the property'),
        },
        async ({ storyName, index, property, value }) => {
            try {
                await callDb(db, 'setEventOriginProperty', { storyName, index, property, value }, user);
                return { content: [{ type: 'text', text: `Event ${index} property "${property}" updated in story "${storyName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'remove_event',
        'Remove an event from a story by index',
        {
            storyName: z.string().describe('Story name'),
            index: z.number().describe('Event index to remove (0-based)'),
        },
        async ({ storyName, index }) => {
            try {
                await callDb(db, 'removeEvent', { storyName, index }, user);
                return { content: [{ type: 'text', text: `Event at index ${index} removed from story "${storyName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'set_event_adaptation',
        'Set the adaptation text/time/ready status for a character in a specific event',
        {
            storyName: z.string().describe('Story name'),
            eventIndex: z.number().describe('Event index (0-based)'),
            characterName: z.string().describe('Character name'),
            type: z.enum(['text', 'time', 'ready']).describe('Adaptation property to set'),
            value: z.union([z.string(), z.boolean()]).describe('New value (string for text/time, boolean for ready)'),
        },
        async ({ storyName, eventIndex, characterName, type, value }) => {
            try {
                await callDb(db, 'setEventAdaptationProperty', {
                    storyName, eventIndex, characterName, type, value,
                }, user);
                return { content: [{ type: 'text', text: `Adaptation "${type}" for "${characterName}" in event ${eventIndex} of "${storyName}" updated.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'add_character_to_event',
        'Add a character to participate in a specific event within a story',
        {
            storyName: z.string().describe('Story name'),
            eventIndex: z.number().describe('Event index (0-based)'),
            characterName: z.string().describe('Character name (must already be in the story)'),
        },
        async ({ storyName, eventIndex, characterName }) => {
            try {
                await callDb(db, 'addCharacterToEvent', { storyName, eventIndex, characterName }, user);
                return { content: [{ type: 'text', text: `Character "${characterName}" added to event ${eventIndex} in story "${storyName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'remove_character_from_event',
        'Remove a character from a specific event',
        {
            storyName: z.string().describe('Story name'),
            eventIndex: z.number().describe('Event index (0-based)'),
            characterName: z.string().describe('Character name to remove from event'),
        },
        async ({ storyName, eventIndex, characterName }) => {
            try {
                await callDb(db, 'removeCharacterFromEvent', { storyName, eventIndex, characterName }, user);
                return { content: [{ type: 'text', text: `Character "${characterName}" removed from event ${eventIndex} in story "${storyName}".` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

module.exports = { registerReadTools, registerWriteTools };

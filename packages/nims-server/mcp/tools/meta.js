'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');
const { requireAdmin } = require('../permissions');

function registerReadTools(server, db, user) {
    server.tool(
        'get_meta',
        'Get project meta information: game name, description, dates',
        {},
        async () => {
            try {
                const meta = await callDb(db, 'getMetaInfo', null, user);
                return { content: [{ type: 'text', text: JSON.stringify(meta, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'search_text',
        'Full-text search across the project database. Available text types: writerStory, eventOrigins, eventAdaptations, characterProfiles, playerProfiles, relations, groups',
        {
            searchStr: z.string().describe('Search string'),
            textTypes: z.array(z.enum([
                'writerStory', 'eventOrigins', 'eventAdaptations',
                'characterProfiles', 'playerProfiles', 'relations', 'groups',
            ])).describe('Types of text to search in'),
            caseSensitive: z.boolean().optional().describe('Case sensitive search (default: false)'),
        },
        async ({ searchStr, textTypes, caseSensitive }) => {
            try {
                const results = await callDb(db, 'getTexts', {
                    searchStr,
                    textTypes,
                    caseSensitive: caseSensitive || false,
                }, user);
                return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_statistics',
        'Get project statistics: entity counts, completion metrics, histograms',
        {},
        async () => {
            try {
                const stats = await callDb(db, 'getStatistics', null, user);
                return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

function registerWriteTools(server, db, user) {
    server.tool(
        'set_meta',
        'Update a project meta field. String fields: name, description. Date fields: date, preGameDate',
        {
            name: z.enum(['name', 'description', 'date', 'preGameDate']).describe('Meta field name'),
            value: z.string().describe('New value (for date fields use format like "2024-09-15")'),
        },
        async ({ name, value }) => {
            try {
                requireAdmin(user, db);
                if (name === 'name' || name === 'description') {
                    await callDb(db, 'setMetaInfoString', { name, value }, user);
                } else {
                    await callDb(db, 'setMetaInfoDate', { name, value }, user);
                }
                return { content: [{ type: 'text', text: `Meta field "${name}" updated.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

module.exports = { registerReadTools, registerWriteTools };

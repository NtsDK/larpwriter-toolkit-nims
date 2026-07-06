'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');

function registerReadTools(server, db, user) {
    server.tool(
        'get_briefing',
        'Get assembled player briefing data (вводные) for selected characters and stories. Same JSON as export_briefings; use export_briefings with format markdown for readable output.',
        {
            selCharacters: z.array(z.string()).optional().describe('Character names to include (omit for all)'),
            selStories: z.array(z.string()).optional().describe('Story names to include (omit for all)'),
            exportOnlyFinishedStories: z.boolean().optional().describe('Only include stories where all adaptations are marked as ready (default: false)'),
        },
        async ({ selCharacters, selStories, exportOnlyFinishedStories }) => {
            try {
                const data = await callDb(db, 'getBriefingData', {
                    selCharacters: selCharacters || null,
                    selStories: selStories || null,
                    exportOnlyFinishedStories: exportOnlyFinishedStories || false,
                }, user);
                return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_character_report',
        'Get a report for a character: which stories they participate in, adaptation progress, inventory, activity, and who they meet',
        { characterName: z.string().describe('Character name') },
        async ({ characterName }) => {
            try {
                const report = await callDb(db, 'getCharacterReport', { characterName }, user);
                return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

function registerWriteTools() {
    // Briefings are read-only by nature
}

module.exports = { registerReadTools, registerWriteTools };

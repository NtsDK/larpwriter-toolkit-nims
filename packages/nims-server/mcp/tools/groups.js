'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');

function registerReadTools(server, db, user) {
    server.tool(
        'list_groups',
        'Get the list of all group names in the project',
        {},
        async () => {
            try {
                const names = await callDb(db, 'getGroupNamesArray', null, user);
                return { content: [{ type: 'text', text: JSON.stringify(names, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_group',
        'Get group details including filter model and descriptions',
        { groupName: z.string().describe('Group name') },
        async ({ groupName }) => {
            try {
                const group = await callDb(db, 'getGroup', { groupName }, user);
                return { content: [{ type: 'text', text: JSON.stringify(group, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

function registerWriteTools(server, db, user) {
    server.tool(
        'create_group',
        'Create a new character group',
        { groupName: z.string().describe('Name for the new group') },
        async ({ groupName }) => {
            try {
                await callDb(db, 'createGroup', { groupName }, user);
                return { content: [{ type: 'text', text: `Group "${groupName}" created.` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

module.exports = { registerReadTools, registerWriteTools };

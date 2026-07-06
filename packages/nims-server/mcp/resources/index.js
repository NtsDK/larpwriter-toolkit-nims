'use strict';

const { callDb } = require('../dbCall');

async function registerResources(server, db, user) {
    const { ResourceTemplate } = await import('@modelcontextprotocol/sdk/server/mcp.js');

    server.resource(
        'meta',
        'nims://meta',
        { description: 'Project meta information (game name, dates, description)' },
        async (uri) => {
            try {
                const meta = await callDb(db, 'getMetaInfo', null, user);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(meta, null, 2),
                    }],
                };
            } catch (err) {
                return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${err}` }] };
            }
        }
    );

    server.resource(
        'characters_list',
        'nims://characters',
        { description: 'List of all characters with their profile summaries' },
        async (uri) => {
            try {
                const profiles = await callDb(db, 'getAllProfiles', { type: 'character' }, user);
                const summary = Object.entries(profiles).map(([name, profile]) => {
                    const fields = Object.entries(profile)
                        .filter(([key]) => key !== 'name')
                        .reduce((acc, [key, val]) => { acc[key] = val; return acc; }, {});
                    return { name, ...fields };
                });
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(summary, null, 2),
                    }],
                };
            } catch (err) {
                return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${err}` }] };
            }
        }
    );

    server.resource(
        'stories_list',
        'nims://stories',
        { description: 'List of all stories with event counts and character participation' },
        async (uri) => {
            try {
                const stories = await callDb(db, 'getAllStories', null, user);
                const summary = Object.entries(stories).map(([name, story]) => ({
                    name,
                    eventCount: story.events.length,
                    characters: Object.keys(story.characters),
                    storyTextPreview: story.story ? story.story.substring(0, 200) : '',
                }));
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(summary, null, 2),
                    }],
                };
            } catch (err) {
                return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${err}` }] };
            }
        }
    );

    const characterTemplate = new ResourceTemplate('nims://character/{name}', { list: undefined });
    server.resource(
        'character',
        characterTemplate,
        { description: 'Full profile of a specific character' },
        async (uri, { name }) => {
            try {
                const profile = await callDb(db, 'getProfile', { type: 'character', name }, user);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(profile, null, 2),
                    }],
                };
            } catch (err) {
                return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${err}` }] };
            }
        }
    );

    const storyTemplate = new ResourceTemplate('nims://story/{name}', { list: undefined });
    server.resource(
        'story',
        storyTemplate,
        { description: 'Full story data including events, characters, and master text' },
        async (uri, { name }) => {
            try {
                const story = await callDb(db, 'getStory', { storyName: name }, user);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(story, null, 2),
                    }],
                };
            } catch (err) {
                return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${err}` }] };
            }
        }
    );

    server.resource(
        'database',
        'nims://database',
        { description: 'Full NIMS database export (without ManagementInfo)' },
        async (uri) => {
            try {
                const database = await callDb(db, 'getDatabase', null, user);
                if (database.ManagementInfo) {
                    delete database.ManagementInfo;
                }
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(database, null, 2),
                    }],
                };
            } catch (err) {
                return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${err}` }] };
            }
        }
    );

    server.resource(
        'briefings',
        'nims://briefings',
        { description: 'Player briefings (вводные) for all characters, JSON' },
        async (uri) => {
            try {
                const data = await callDb(db, 'getBriefingData', {
                    selCharacters: null,
                    selStories: null,
                    exportOnlyFinishedStories: false,
                }, user);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(data, null, 2),
                    }],
                };
            } catch (err) {
                return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${err}` }] };
            }
        }
    );
}

module.exports = { registerResources };

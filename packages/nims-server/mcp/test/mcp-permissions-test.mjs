#!/usr/bin/env node
/**
 * MCP access-control tests: admin, organizer, editor, player.
 * Creates test users via /api (admin session), then checks MCP tools per role.
 *
 * Usage: node mcp-permissions-test.mjs [baseUrl]
 * Env: NIMS_USER, NIMS_PASS (admin credentials for setup)
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const BASE = process.argv[2] || 'http://localhost:3001';
const ADMIN_USER = process.env.NIMS_USER || 'admin';
const ADMIN_PASS = process.env.NIMS_PASS || 'zxpoYR65';

const USERS = {
    org: { name: 'mcp_org', password: 'McpOrgPass1!' },
    editor: { name: 'mcp_editor', password: 'McpEditorPass1!' },
    player: { name: 'mcp_player', password: 'McpPlayerPass1!' },
};

const ADMIN_CHAR = 'ГеройАдмина';
const ADMIN_STORY = 'СюжетАдмина';
const ORG_STORY = 'СюжетОрганизатора';

const results = [];
let passed = 0;
let failed = 0;
let skipped = 0;

function record(name, status, detail = '') {
    results.push({ name, status, detail });
    const icon = status === 'pass' ? '✓' : status === 'skip' ? '○' : '✗';
    console.log(`${icon} ${name}${detail ? `: ${detail}` : ''}`);
    if (status === 'pass') passed += 1;
    else if (status === 'skip') skipped += 1;
    else failed += 1;
}

async function waitForServer(maxMs = 30000) {
    const deadline = Date.now() + maxMs;
    while (Date.now() < deadline) {
        try {
            await fetch(`${BASE}/`);
            return;
        } catch {
            /* retry */
        }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Server not reachable at ${BASE}`);
}

async function loginSession(username, password) {
    const res = await fetch(`${BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
        redirect: 'manual',
    });
    const setCookies = res.headers.getSetCookie?.() || [];
    const single = res.headers.get('set-cookie');
    const parts = setCookies.length ? setCookies : (single ? [single] : []);
    const cookie = parts.map((c) => c.split(';')[0]).join('; ');
    if (!cookie) throw new Error(`Login failed for ${username}: HTTP ${res.status}`);
    return cookie;
}

async function apiPut(cookie, command, args) {
    const res = await fetch(`${BASE}/api/${command}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify([args]),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${command}: HTTP ${res.status} — ${text.slice(0, 200)}`);
    }
}

async function apiPutOk(cookie, command, args) {
    try {
        await apiPut(cookie, command, args);
        return true;
    } catch (err) {
        return err.message;
    }
}

async function fetchToken(username, password) {
    const res = await fetch(`${BASE}/mcp/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error(`MCP auth failed for ${username}: ${res.status}`);
    const data = await res.json();
    return { token: data.token, user: data.user };
}

async function connectMcp(path, token) {
    const client = new Client({ name: 'nims-mcp-perms', version: '0.7.2' });
    const transport = new StreamableHTTPClientTransport(new URL(`${BASE}${path}`), {
        requestInit: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json, text/event-stream',
            },
        },
    });
    await client.connect(transport);
    return { client, transport };
}

function textOf(result) {
    return result?.content?.find((c) => c.type === 'text')?.text || '';
}

function isError(result) {
    return result?.isError === true || textOf(result).startsWith('Error:');
}

async function callTool(client, name, args = {}) {
    return client.callTool({ name, arguments: args });
}

async function expectToolOk(client, label, name, args) {
    try {
        const res = await callTool(client, name, args);
        if (isError(res)) {
            record(label, 'fail', textOf(res).slice(0, 160));
            return false;
        }
        record(label, 'pass');
        return true;
    } catch (err) {
        record(label, 'fail', err.message);
        return false;
    }
}

async function expectToolDenied(client, label, name, args) {
    try {
        const res = await callTool(client, name, args);
        if (isError(res)) {
            record(label, 'pass', textOf(res).slice(0, 100));
            return true;
        }
        record(label, 'fail', 'unexpected success');
        return false;
    } catch (err) {
        record(label, 'pass', err.message.slice(0, 100));
        return true;
    }
}

async function setupUsers(adminCookie) {
    console.log('\n=== Setup: create test users (admin API) ===');

    const adminMcp = await fetchToken(ADMIN_USER, ADMIN_PASS);
    const { client, transport } = await connectMcp('/mcp', adminMcp.token);
    await callTool(client, 'load_database_preset', { preset: 'empty' });
    await transport.close();

    for (const u of [USERS.org, USERS.editor]) {
        const err = await apiPutOk(adminCookie, 'createOrganizer', { name: u.name, password: u.password });
        if (err === true) record(`createOrganizer ${u.name}`, 'pass');
        else record(`createOrganizer ${u.name}`, 'fail', String(err));
    }

    const playerErr = await apiPutOk(adminCookie, 'createPlayer', {
        userName: USERS.player.name,
        password: USERS.player.password,
    });
    if (playerErr === true) record(`createPlayer ${USERS.player.name}`, 'pass');
    else record(`createPlayer ${USERS.player.name}`, 'fail', String(playerErr));

    const editorErr = await apiPutOk(adminCookie, 'assignEditor', { name: USERS.editor.name });
    if (editorErr === true) record('assignEditor mcp_editor', 'pass');
    else record('assignEditor mcp_editor', 'fail', String(editorErr));

    const { client: c2, transport: t2 } = await connectMcp('/mcp', adminMcp.token);
    await callTool(c2, 'create_character', { characterName: ADMIN_CHAR });
    await callTool(c2, 'create_story', { storyName: ADMIN_STORY });
    await callTool(c2, 'set_story_text', { storyName: ADMIN_STORY, value: 'Текст админа.' });
    await t2.close();

    for (const u of [USERS.org, USERS.editor]) {
        const auth = await fetchToken(u.name, u.password);
        record(`MCP auth ${u.name}`, auth.user.role === 'organizer' ? 'pass' : 'fail', auth.user.role);
    }
}

async function testPlayer() {
    console.log('\n=== Player (mcp_player) ===');
    // Players are denied MCP tokens entirely (stricter than tool-level deny).
    try {
        await fetchToken(USERS.player.name, USERS.player.password);
        record('player: MCP auth denied', 'fail', 'unexpected token issued');
    } catch (err) {
        record('player: MCP auth denied', /403/.test(err.message) ? 'pass' : 'fail', err.message.slice(0, 100));
    }
}

async function testOrganizer() {
    console.log('\n=== Organizer without editor (mcp_org) ===');
    const { token } = await fetchToken(USERS.org.name, USERS.org.password);
    const { client, transport } = await connectMcp('/mcp', token);

    await expectToolOk(client, 'org: list_characters', 'list_characters', {});
    await expectToolOk(client, 'org: get_meta', 'get_meta', {});
    await expectToolOk(client, 'org: export_database', 'export_database', { includeManagementInfo: false });

    await expectToolDenied(client, 'org: set_meta denied (admin only)', 'set_meta', { name: 'name', value: 'Hack' });
    await expectToolDenied(client, 'org: load_database_preset denied', 'load_database_preset', { preset: 'empty' });
    await expectToolDenied(client, 'org: import_database denied', 'import_database', { database: { Meta: {} } });

    await expectToolOk(client, 'org: create_character own', 'create_character', { characterName: 'ГеройОрга' });
    await expectToolDenied(client, 'org: remove admin character denied', 'remove_character', { characterName: ADMIN_CHAR });
    await expectToolDenied(client, 'org: rename admin character denied', 'rename_character', {
        fromName: ADMIN_CHAR,
        toName: 'Украден',
    });

    await expectToolOk(client, 'org: create_story own', 'create_story', { storyName: ORG_STORY });
    await expectToolDenied(client, 'org: set_story_text admin story denied', 'set_story_text', {
        storyName: ADMIN_STORY,
        value: 'Взлом.',
    });
    await expectToolDenied(client, 'org: set_story_text own story denied (editor mode)', 'set_story_text', {
        storyName: ORG_STORY,
        value: 'Свой текст.',
    });
    await expectToolDenied(client, 'org: remove admin story denied', 'remove_story', { storyName: ADMIN_STORY });

    await transport.close();
}

async function testEditor() {
    console.log('\n=== Editor (mcp_editor) ===');
    const { token } = await fetchToken(USERS.editor.name, USERS.editor.password);
    const { client, transport } = await connectMcp('/mcp', token);

    await expectToolOk(client, 'editor: list_characters', 'list_characters', {});
    await expectToolDenied(client, 'editor: set_meta denied (admin only)', 'set_meta', { name: 'name', value: 'Hack' });
    await expectToolDenied(client, 'editor: load_database_preset denied', 'load_database_preset', { preset: 'demo' });

    await expectToolOk(client, 'editor: set_story_text admin story', 'set_story_text', {
        storyName: ADMIN_STORY,
        value: 'Правка редактора.',
    });
    await expectToolOk(client, 'editor: set_story_text org story', 'set_story_text', {
        storyName: ORG_STORY,
        value: 'Редактор правит чужой сюжет.',
    });
    await expectToolOk(client, 'editor: remove_character admin char', 'remove_character', { characterName: ADMIN_CHAR });

    await transport.close();
}

async function testAdminAfterEditor() {
    console.log('\n=== Admin with active editor mode ===');
    const { token } = await fetchToken(ADMIN_USER, ADMIN_PASS);
    const { client, transport } = await connectMcp('/mcp', token);

    await expectToolOk(client, 'admin: list_characters', 'list_characters', {});
    await expectToolOk(client, 'admin: load_database_preset', 'load_database_preset', { preset: 'empty' });
    await expectToolDenied(client, 'admin: set_story_text denied when editor assigned', 'set_story_text', {
        storyName: ORG_STORY,
        value: 'Админ не редактор.',
    });

    await transport.close();
}

async function cleanup(adminCookie) {
    console.log('\n=== Cleanup ===');
    await apiPutOk(adminCookie, 'removeEditor', {});
    record('removeEditor', 'pass');

    for (const u of [USERS.org, USERS.editor]) {
        const err = await apiPutOk(adminCookie, 'removeOrganizer', { name: u.name });
        record(`removeOrganizer ${u.name}`, err === true ? 'pass' : 'fail', err === true ? '' : String(err));
    }
    const pErr = await apiPutOk(adminCookie, 'removePlayerLogin', { userName: USERS.player.name });
    record(`removePlayerLogin ${USERS.player.name}`, pErr === true ? 'pass' : 'fail', pErr === true ? '' : String(pErr));
    const profErr = await apiPutOk(adminCookie, 'removeProfile', {
        type: 'player',
        characterName: USERS.player.name,
    });
    record(`removeProfile ${USERS.player.name}`, profErr === true ? 'pass' : 'fail', profErr === true ? '' : String(profErr));
}

async function main() {
    console.log(`NIMS MCP permissions tests → ${BASE}`);
    const start = Date.now();
    let adminCookie;
    try {
        await waitForServer();
        adminCookie = await loginSession(ADMIN_USER, ADMIN_PASS);
        record('admin web login', 'pass');

        await setupUsers(adminCookie);
        await testPlayer();
        await testOrganizer();
        await testEditor();
        await testAdminAfterEditor();
    } catch (err) {
        console.error('\nFATAL:', err);
        failed += 1;
    } finally {
        if (adminCookie) {
            try {
                await cleanup(adminCookie);
            } catch (err) {
                record('cleanup', 'fail', err.message);
            }
        }
    }

    const sec = ((Date.now() - start) / 1000).toFixed(1);
    console.log('\n========== SUMMARY ==========');
    console.log(`Passed: ${passed}  Failed: ${failed}  Skipped: ${skipped}  (${sec}s)`);
    if (failed > 0) {
        console.log('\nFailures:');
        results.filter((r) => r.status === 'fail').forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
        process.exit(1);
    }
    console.log('\nAccess control works as expected.');
}

main();

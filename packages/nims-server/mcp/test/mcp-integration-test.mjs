#!/usr/bin/env node
/**
 * Full MCP integration test suite for NIMS.
 * Usage: node mcp-integration-test.mjs [baseUrl]
 * Env: NIMS_USER, NIMS_PASS
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const BASE = process.argv[2] || 'http://localhost:3001';
const USER = process.env.NIMS_USER || 'admin';
const PASS = process.env.NIMS_PASS || 'zxpoYR65';

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

async function fetchToken() {
    const res = await fetch(`${BASE}/mcp/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USER, password: PASS }),
    });
    if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
    const data = await res.json();
    return data.token;
}

async function connectMcp(path, token) {
    const client = new Client({ name: 'nims-mcp-test', version: '0.7.2' });
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
    const block = result?.content?.find((c) => c.type === 'text');
    return block?.text || '';
}

function parseJson(result) {
    const t = textOf(result);
    try {
        return JSON.parse(t);
    } catch {
        const delim = t.indexOf('\n\n');
        if (delim >= 0) {
            try {
                return JSON.parse(t.slice(delim + 2));
            } catch {
                /* fall through */
            }
        }
        const start = Math.min(
            t.indexOf('{') >= 0 ? t.indexOf('{') : Infinity,
            t.indexOf('[') >= 0 ? t.indexOf('[') : Infinity,
        );
        if (start < Infinity) {
            try {
                return JSON.parse(t.slice(start));
            } catch {
                /* fall through */
            }
        }
        return t;
    }
}

function isError(result) {
    return result?.isError === true || textOf(result).startsWith('Error:');
}

async function callTool(client, name, args = {}) {
    return client.callTool({ name, arguments: args });
}

async function expectToolOk(client, name, args, check) {
    try {
        const res = await callTool(client, name, args);
        if (isError(res)) {
            record(name, 'fail', textOf(res).slice(0, 200));
            return null;
        }
        if (check) {
            const msg = check(res);
            if (msg) {
                record(name, 'fail', msg);
                return null;
            }
        }
        record(name, 'pass');
        return res;
    } catch (err) {
        record(name, 'fail', err.message);
        return null;
    }
}

async function expectToolFail(client, name, args, label) {
    try {
        const res = await callTool(client, name, args);
        if (isError(res)) {
            record(label || `${name} (should fail)`, 'pass', 'correctly rejected');
            return true;
        }
        record(label || `${name} (should fail)`, 'fail', 'unexpected success');
        return false;
    } catch (err) {
        record(label || `${name} (should fail)`, 'pass', err.message.slice(0, 120));
        return true;
    }
}

async function testHttpAuth() {
    console.log('\n=== HTTP Auth ===');
    async function postMcpNoAuth(body) {
        for (let i = 0; i < 3; i += 1) {
            const res = await fetch(`${BASE}/mcp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
                body: JSON.stringify(body),
            });
            if (res.status !== 404) return res;
            await new Promise((r) => setTimeout(r, 500));
        }
        return fetch(`${BASE}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
            body: JSON.stringify(body),
        });
    }

    const noAuth = await postMcpNoAuth({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    if (noAuth.status === 401) record('POST /mcp without token → 401', 'pass');
    else record('POST /mcp without token → 401', 'fail', `got ${noAuth.status}`);

    const bad = await fetch(`${BASE}/mcp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
            Authorization: 'Bearer 00000000-0000-0000-0000-000000000000',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-03-26',
                capabilities: {},
                clientInfo: { name: 't', version: '1' },
            },
        }),
    });
    if (bad.status === 401) record('POST /mcp invalid token → 401', 'pass');
    else record('POST /mcp invalid token → 401', 'fail', `got ${bad.status}`);

    const authPage = await fetch(`${BASE}/mcp/auth`);
    if (authPage.status === 200 && (await authPage.text()).includes('MCP')) {
        record('GET /mcp/auth page', 'pass');
    } else {
        record('GET /mcp/auth page', 'fail', `status ${authPage.status}`);
    }

    const badLogin = await fetch(`${BASE}/mcp/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'wrong-password' }),
    });
    if (badLogin.status === 401) record('POST /mcp/auth bad password → 401', 'pass');
    else record('POST /mcp/auth bad password → 401', 'fail', `got ${badLogin.status}`);
}

async function testReadonly(token) {
    console.log('\n=== Readonly mode ===');
    const { client, transport } = await connectMcp('/mcp/readonly', token);
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    record('readonly listTools', 'pass', `${names.length} tools`);

    const writeTools = ['create_character', 'import_database', 'set_meta', 'create_story'];
    const leaked = writeTools.filter((t) => names.includes(t));
    if (leaked.length === 0) record('readonly excludes write tools', 'pass');
    else record('readonly excludes write tools', 'fail', `found: ${leaked.join(', ')}`);

    await expectToolOk(client, 'list_characters', {});
    await expectToolOk(client, 'export_database', { includeManagementInfo: false });
    await expectToolFail(client, 'create_character', { characterName: 'Hacker' }, 'readonly blocks create_character');

    const resources = await client.listResources();
    record('readonly listResources', 'pass', `${resources.resources.length} resources`);

    await transport.close();
}

async function testFullWorkflow(token) {
    console.log('\n=== Full mode: preset & meta ===');
    const { client, transport } = await connectMcp('/mcp', token);

    const tools = await client.listTools();
    record('full listTools', 'pass', `${tools.tools.length} tools`);

    await expectToolOk(client, 'load_database_preset', { preset: 'empty' });
    await expectToolOk(client, 'get_consistency_check', {}, (r) => {
        const data = parseJson(r);
        if (data.errors?.length) return `consistency errors: ${data.errors.join('; ')}`;
        return null;
    });
    await expectToolOk(client, 'list_database_presets', {}, (r) => {
        const arr = parseJson(r);
        if (!Array.isArray(arr) || !arr.includes('empty')) return 'missing empty preset';
        return null;
    });
    await expectToolOk(client, 'set_meta', { name: 'name', value: 'MCP Test Game' });
    await expectToolOk(client, 'set_meta', { name: 'description', value: 'Automated MCP integration test run' });
    await expectToolOk(client, 'get_meta', {}, (r) => {
        const m = parseJson(r);
        if (m.name !== 'MCP Test Game') return `name=${m.name}`;
        return null;
    });

    console.log('\n=== Characters ===');
    await expectToolOk(client, 'create_character', { characterName: 'Тестовый герой' });
    await expectToolOk(client, 'create_character', { characterName: 'Второй персонаж' });
    await expectToolFail(client, 'create_character', { characterName: 'Тестовый герой' }, 'duplicate character rejected');
    await expectToolOk(client, 'list_characters', {}, (r) => {
        const list = parseJson(r);
        if (!list.includes('Тестовый герой')) return 'hero missing';
        return null;
    });
    await expectToolOk(client, 'get_character', { name: 'Тестовый герой' });
    await expectToolOk(client, 'get_profile_structure', { type: 'character' });

    console.log('\n=== Stories & events ===');
    await expectToolOk(client, 'list_stories', {}, (r) => {
        const list = parseJson(r);
        if (!Array.isArray(list)) return 'not an array';
        return null;
    });
    await expectToolOk(client, 'create_story', { storyName: 'Сюжет MCP' });
    await expectToolOk(client, 'set_story_text', {
        storyName: 'Сюжет MCP',
        value: 'Мастер-текст сюжета для проверки MCP.\nВторая строка.',
    });
    await expectToolOk(client, 'add_character_to_story', {
        storyName: 'Сюжет MCP',
        characterName: 'Тестовый герой',
    });
    await expectToolOk(client, 'create_event', {
        storyName: 'Сюжет MCP',
        eventName: 'Первая сцена',
        selectedIndex: 0,
    });
    await expectToolOk(client, 'add_character_to_event', {
        storyName: 'Сюжет MCP',
        eventIndex: 0,
        characterName: 'Тестовый герой',
    });
    await expectToolOk(client, 'update_event', {
        storyName: 'Сюжет MCP',
        index: 0,
        property: 'text',
        value: 'Общий текст события на камине.',
    });
    await expectToolOk(client, 'update_event', {
        storyName: 'Сюжет MCP',
        index: 0,
        property: 'time',
        value: '21:00',
    });
    await expectToolOk(client, 'set_event_adaptation', {
        storyName: 'Сюжет MCP',
        eventIndex: 0,
        characterName: 'Тестовый герой',
        type: 'text',
        value: 'Персональная адаптация: вы видите негритят на полке.',
    });
    await expectToolOk(client, 'set_event_adaptation', {
        storyName: 'Сюжет MCP',
        eventIndex: 0,
        characterName: 'Тестовый герой',
        type: 'ready',
        value: true,
    });
    await expectToolOk(client, 'set_event_adaptation', {
        storyName: 'Сюжет MCP',
        eventIndex: 0,
        characterName: 'Тестовый герой',
        type: 'time',
        value: '21:15',
    });
    await expectToolOk(client, 'get_story', { storyName: 'Сюжет MCP' }, (r) => {
        const s = parseJson(r);
        if (!s.events?.[0]?.characters?.['Тестовый герой']?.text) return 'adaptation missing';
        return null;
    });
    await expectToolOk(client, 'get_story_events', { storyName: 'Сюжет MCP' });
    await expectToolOk(client, 'get_story_characters', { storyName: 'Сюжет MCP' });

    await expectToolOk(client, 'remove_character_from_event', {
        storyName: 'Сюжет MCP',
        eventIndex: 0,
        characterName: 'Тестовый герой',
    });
    await expectToolOk(client, 'add_character_to_event', {
        storyName: 'Сюжет MCP',
        eventIndex: 0,
        characterName: 'Тестовый герой',
    });
    await expectToolOk(client, 'add_character_to_story', {
        storyName: 'Сюжет MCP',
        characterName: 'Второй персонаж',
    });
    await expectToolOk(client, 'remove_character_from_story', {
        storyName: 'Сюжет MCP',
        characterName: 'Второй персонаж',
    });
    await expectToolOk(client, 'add_character_to_story', {
        storyName: 'Сюжет MCP',
        characterName: 'Второй персонаж',
    });
    await expectToolOk(client, 'create_event', {
        storyName: 'Сюжет MCP',
        eventName: 'Вторая сцена (удаляемая)',
        selectedIndex: 1,
    });
    await expectToolOk(client, 'remove_event', {
        storyName: 'Сюжет MCP',
        index: 1,
    });

    console.log('\n=== Relations ===');
    await expectToolOk(client, 'create_relation', {
        fromCharacter: 'Тестовый герой',
        toCharacter: 'Второй персонаж',
    });
    await expectToolOk(client, 'set_relation_text', {
        fromCharacter: 'Тестовый герой',
        toCharacter: 'Второй персонаж',
        character: 'Тестовый герой',
        text: 'Мы оба помним ту ночь на острове.',
    });
    await expectToolOk(client, 'get_relations', {});
    await expectToolOk(client, 'get_character_relation', {
        fromCharacter: 'Тестовый герой',
        toCharacter: 'Второй персонаж',
    });

    console.log('\n=== Groups ===');
    await expectToolOk(client, 'create_group', { groupName: 'Группа MCP' });
    await expectToolOk(client, 'list_groups', {}, (r) => {
        const g = parseJson(r);
        if (!g.includes('Группа MCP')) return 'group not listed';
        return null;
    });
    await expectToolOk(client, 'get_group', { groupName: 'Группа MCP' });

    console.log('\n=== Search & stats ===');
    await expectToolOk(client, 'search_text', {
        searchStr: 'негритят',
        textTypes: ['eventAdaptations', 'writerStory'],
    });
    await expectToolOk(client, 'get_statistics', {});

    console.log('\n=== Вводные (briefings) ===');
    await expectToolOk(client, 'get_briefing', {
        selCharacters: ['Тестовый герой'],
        selStories: ['Сюжет MCP'],
    }, (r) => {
        const d = parseJson(r);
        if (!d.briefings?.[0]?.charName) return 'no briefings';
        return null;
    });
    const briefingsJson = await expectToolOk(client, 'export_briefings', {
        selCharacters: ['Тестовый герой'],
        format: 'json',
    });
    await expectToolOk(client, 'export_briefings', {
        selCharacters: ['Тестовый герой'],
        format: 'markdown',
    }, (r) => {
        const t = textOf(r);
        if (!t.includes('Тестовый герой')) return 'markdown missing character';
        return null;
    });
    await expectToolOk(client, 'get_character_report', { characterName: 'Тестовый герой' });

    if (briefingsJson) {
        const briefingData = parseJson(briefingsJson);
        const ev = briefingData.briefings?.[0]?.eventsInfo?.[0];
        if (!ev) {
            record('import_briefings', 'skip', 'no events in briefing');
        } else {
            ev.text = 'Обновлённый текст вводной через import_briefings.';
            await expectToolOk(client, 'import_briefings', { data: briefingData });
            await expectToolOk(client, 'get_story', { storyName: 'Сюжет MCP' }, (r) => {
                const s = parseJson(r);
                const t = s.events?.[0]?.characters?.['Тестовый герой']?.text || '';
                if (!t.includes('Обновлённый текст вводной')) return 'import_briefings did not apply';
                return null;
            });
        }
    }

    console.log('\n=== Database export/import ===');
    const exported = await expectToolOk(client, 'export_database', { includeManagementInfo: false });
    if (exported) {
        const db = parseJson(exported);
        if (!db || typeof db !== 'object' || !db.Meta) {
            record('export_database parse', 'fail', 'invalid database JSON');
        } else {
            const size = JSON.stringify(db).length;
            record('export_database size', size > 500 ? 'pass' : 'fail', `${size} bytes`);
            const snapshot = JSON.parse(JSON.stringify(db));
            snapshot.Meta = { ...snapshot.Meta, name: 'MCP Roundtrip Test' };
            await expectToolOk(client, 'import_database', {
                database: snapshot,
                preserveManagementInfo: true,
            });
            await expectToolOk(client, 'get_meta', {}, (r) => {
                const m = parseJson(r);
                if (m.name !== 'MCP Roundtrip Test') return `name=${m.name}`;
                return null;
            });
            await expectToolOk(client, 'get_consistency_check', {}, (r) => {
                const data = parseJson(r);
                if (data.errors?.length) return `errors after import: ${data.errors.length}`;
                return null;
            });
        }
    }

    console.log('\n=== Cleanup & mutations ===');
    await expectToolOk(client, 'remove_relation', {
        fromCharacter: 'Тестовый герой',
        toCharacter: 'Второй персонаж',
    });
    await expectToolOk(client, 'create_character', { characterName: 'Удаляемый' });
    await expectToolOk(client, 'rename_character', { fromName: 'Удаляемый', toName: 'Переименованный' });
    await expectToolOk(client, 'remove_character', { characterName: 'Переименованный' });
    await expectToolOk(client, 'create_story', { storyName: 'Временный' });
    await expectToolOk(client, 'rename_story', { fromName: 'Временный', toName: 'Временный2' });
    await expectToolOk(client, 'remove_story', { storyName: 'Временный2' });

    console.log('\n=== Demo preset ===');
    await expectToolOk(client, 'load_database_preset', { preset: 'demo' });
    await expectToolOk(client, 'list_characters', {}, (r) => {
        const list = parseJson(r);
        if (list.length < 5) return `expected many chars, got ${list.length}`;
        return null;
    });
    await expectToolOk(client, 'create_character', { characterName: 'MCP Полевой тест' });
    await expectToolOk(client, 'update_character_field', {
        characterName: 'MCP Полевой тест',
        fieldName: 'Блок',
        itemType: 'enum',
        value: 'Тёмный',
    });
    await expectToolOk(client, 'get_character', { name: 'MCP Полевой тест' }, (r) => {
        const p = parseJson(r);
        if (p.Блок !== 'Тёмный') return `Блок=${p.Блок}`;
        return null;
    });
    await expectToolOk(client, 'remove_character', { characterName: 'MCP Полевой тест' });

    console.log('\n=== Negriat preset ===');
    const presetsRes = await callTool(client, 'list_database_presets', {});
    const presets = parseJson(presetsRes);
    if (!Array.isArray(presets) || !presets.includes('negriat')) {
        record('negriat preset', 'skip', 'not available on server');
    } else {
        await expectToolOk(client, 'load_database_preset', { preset: 'negriat' });
        await expectToolOk(client, 'get_meta', {}, (r) => {
            const m = parseJson(r);
            if (!m.name?.toLowerCase().includes('негритят')) return `name=${m.name}`;
            return null;
        });
        await expectToolOk(client, 'list_characters', {}, (r) => {
            const list = parseJson(r);
            if (list.length !== 10) return `expected 10 chars, got ${list.length}`;
            return null;
        });
        await expectToolOk(client, 'list_stories', {}, (r) => {
            const list = parseJson(r);
            if (list.length < 10) return `expected 10+ stories, got ${list.length}`;
            return null;
        });
        await expectToolOk(client, 'export_briefings', { format: 'markdown' }, (r) => {
            const t = textOf(r);
            if (!t.includes('Вера Клейторн')) return 'negriat briefings incomplete';
            return null;
        });
    }

    console.log('\n=== Resources ===');
    const resources = await client.listResources();
    const uris = resources.resources.map((r) => r.uri);
    for (const uri of ['nims://meta', 'nims://characters', 'nims://stories', 'nims://database', 'nims://briefings']) {
        if (uris.includes(uri)) {
            const res = await client.readResource({ uri });
            const len = res.contents?.[0]?.text?.length || 0;
            record(`resource ${uri}`, len > 2 ? 'pass' : 'fail', `${len} chars`);
        } else {
            record(`resource ${uri}`, 'fail', 'not listed');
        }
    }
    const charList = parseJson(await callTool(client, 'list_characters', {}));
    if (Array.isArray(charList) && charList[0]) {
        const charUri = `nims://character/${encodeURIComponent(charList[0])}`;
        const charRes = await client.readResource({ uri: charUri });
        const charLen = charRes.contents?.[0]?.text?.length || 0;
        record('resource nims://character/{name}', charLen > 10 ? 'pass' : 'fail', charList[0]);
    } else {
        record('resource nims://character/{name}', 'skip', 'no characters');
    }
    const storyList = parseJson(await callTool(client, 'list_stories', {}));
    if (Array.isArray(storyList) && storyList[0]) {
        const storyUri = `nims://story/${encodeURIComponent(storyList[0])}`;
        const storyRes = await client.readResource({ uri: storyUri });
        const storyLen = storyRes.contents?.[0]?.text?.length || 0;
        record('resource nims://story/{name}', storyLen > 10 ? 'pass' : 'fail', storyList[0]);
    } else {
        record('resource nims://story/{name}', 'skip', 'no stories');
    }

    await expectToolFail(client, 'get_character', { name: 'НесуществующийXYZ' }, 'missing character error');

    await transport.close();
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

async function main() {
    console.log(`NIMS MCP integration tests → ${BASE}`);
    const start = Date.now();
    try {
        await waitForServer();
        await testHttpAuth();
        const token = await fetchToken();
        record('POST /mcp/auth', 'pass');
        await testReadonly(token);
        await testFullWorkflow(token);
    } catch (err) {
        console.error('\nFATAL:', err);
        failed += 1;
    }
    const sec = ((Date.now() - start) / 1000).toFixed(1);
    console.log('\n========== SUMMARY ==========');
    console.log(`Passed: ${passed}  Failed: ${failed}  Skipped: ${skipped}  (${sec}s)`);
    if (failed > 0) {
        console.log('\nFailures:');
        results.filter((r) => r.status === 'fail').forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
        process.exit(1);
    }
    console.log('\nAll tests passed — MCP ready for users.');
}

main();

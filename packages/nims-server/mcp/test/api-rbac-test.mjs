#!/usr/bin/env node
/**
 * Web API RBAC matrix: admin / editor / organizer (мастер) / player.
 * Usage: node api-rbac-test.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3001';
const ADMIN_USER = process.env.NIMS_USER || 'admin';
const ADMIN_PASS = process.env.NIMS_PASS || 'zxpoYR65';

const USERS = {
    org: { name: 'rbac_org', password: 'RbacOrgPass1!' },
    editor: { name: 'rbac_editor', password: 'RbacEditorPass1!' },
    player: { name: 'rbac_player', password: 'RbacPlayerPass1!' },
};

const ADMIN_STORY = 'СюжетАдминаRBAC';
const ORG_STORY = 'СюжетОргаRBAC';
const ADMIN_CHAR = 'ГеройАдминаRBAC';

let passed = 0;
let failed = 0;
const failures = [];

function record(name, ok, detail = '') {
    if (ok) {
        passed += 1;
        console.log(`✓ ${name}`);
    } else {
        failed += 1;
        failures.push(`${name}: ${detail}`);
        console.log(`✗ ${name}: ${detail}`);
    }
}

async function login(username, password) {
    const res = await fetch(`${BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        redirect: 'manual',
    });
    const setCookies = res.headers.getSetCookie?.() || [];
    const single = res.headers.get('set-cookie');
    const parts = setCookies.length ? setCookies : (single ? [single] : []);
    const cookie = parts.map((c) => c.split(';')[0]).join('; ');
    if (!cookie || res.status >= 400) {
        throw new Error(`Login failed for ${username}: HTTP ${res.status}`);
    }
    return cookie;
}

async function api(cookie, method, command, args) {
    const url = method === 'GET'
        ? `${BASE}/api/${command}?params=${encodeURIComponent(JSON.stringify(args ? [args] : []))}`
        : `${BASE}/api/${command}`;
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Cookie: cookie,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: method === 'PUT' ? JSON.stringify(args ? [args] : []) : undefined,
    });
    const text = await res.text();
    let body = text;
    try { body = text ? JSON.parse(text) : null; } catch { /* keep text */ }
    return { status: res.status, body, text };
}

async function expectOk(cookie, label, method, command, args) {
    const r = await api(cookie, method, command, args);
    const ok = r.status >= 200 && r.status < 300;
    record(label, ok, ok ? '' : `HTTP ${r.status} ${String(r.text).slice(0, 160)}`);
    return ok;
}

async function expectDenied(cookie, label, method, command, args) {
    const r = await api(cookie, method, command, args);
    const denied = r.status >= 400;
    const msg = typeof r.body === 'object' && r.body?.messageId ? r.body.messageId : String(r.text).slice(0, 120);
    record(label, denied, denied ? msg : 'unexpected success');
    return denied;
}

async function setup(adminCookie) {
    console.log('\n=== Setup ===');
    // Clear editor mode if leftover
    await api(adminCookie, 'PUT', 'removeEditor', {});

    for (const u of [USERS.org, USERS.editor]) {
        await api(adminCookie, 'PUT', 'removeOrganizer', { name: u.name }).catch(() => {});
        const ok = await expectOk(adminCookie, `createOrganizer ${u.name}`, 'PUT', 'createOrganizer', {
            name: u.name,
            password: u.password,
        });
        if (!ok) return false;
    }
    await api(adminCookie, 'PUT', 'removePlayerLogin', { userName: USERS.player.name }).catch(() => {});
    await api(adminCookie, 'PUT', 'removeProfile', { type: 'player', characterName: USERS.player.name }).catch(() => {});
    await expectOk(adminCookie, 'createPlayer', 'PUT', 'createPlayer', {
        userName: USERS.player.name,
        password: USERS.player.password,
    });

    await expectOk(adminCookie, 'createStory admin', 'PUT', 'createStory', { storyName: ADMIN_STORY });
    await expectOk(adminCookie, 'createProfile admin', 'PUT', 'createProfile', {
        type: 'character',
        characterName: ADMIN_CHAR,
    });
    await expectOk(adminCookie, 'assignEditor', 'PUT', 'assignEditor', { name: USERS.editor.name });
    return true;
}

async function testUnauthenticated() {
    console.log('\n=== Unauthenticated ===');
    const res = await fetch(`${BASE}/api/getMetaInfo`);
    record('anon: /api without cookie → 401', res.status === 401, `HTTP ${res.status}`);
    const me = await fetch(`${BASE}/me`);
    record('anon: /me → 401', me.status === 401, `HTTP ${me.status}`);
}

async function testPlayer(cookie) {
    console.log('\n=== Player ===');
    await expectDenied(cookie, 'player: getMetaInfo denied', 'GET', 'getMetaInfo');
    await expectDenied(cookie, 'player: createStory denied', 'PUT', 'createStory', { storyName: 'Хак' });
    await expectDenied(cookie, 'player: setDatabase denied', 'PUT', 'setDatabase', { database: {} });
    await expectDenied(cookie, 'player: getStoryNamesArray denied', 'GET', 'getStoryNamesArray');
    await expectDenied(cookie, 'player: createGroup denied', 'PUT', 'createGroup', { groupName: 'Хак' });
    await expectDenied(cookie, 'player: getRelations denied', 'GET', 'getRelations');
    const me = await fetch(`${BASE}/me`, { headers: { Cookie: cookie } });
    const meBody = await me.json();
    record('player: /me role=player', me.ok && meBody.user?.role === 'player', JSON.stringify(meBody));
}

async function testOrganizer(cookie) {
    console.log('\n=== Organizer (мастер), editor mode ON ===');
    await expectOk(cookie, 'org: getMetaInfo', 'GET', 'getMetaInfo');
    await expectOk(cookie, 'org: getStoryNamesArray', 'GET', 'getStoryNamesArray');
    await expectDenied(cookie, 'org: setMetaInfoString denied', 'PUT', 'setMetaInfoString', {
        name: 'name',
        value: 'Hack',
    });
    await expectDenied(cookie, 'org: setDatabase denied', 'PUT', 'setDatabase', { database: { Meta: {} } });
    await expectDenied(cookie, 'org: createProfileItem denied', 'PUT', 'createProfileItem', {
        type: 'character',
        name: 'hack',
        itemType: 'text',
        selectedIndex: 0,
    });

    // create allowed, but content edits blocked by editor mode
    await expectOk(cookie, 'org: createStory own', 'PUT', 'createStory', { storyName: ORG_STORY });
    await expectDenied(cookie, 'org: setWriterStory own denied (editor mode)', 'PUT', 'setWriterStory', {
        storyName: ORG_STORY,
        value: 'Текст',
    });
    await expectDenied(cookie, 'org: setWriterStory admin denied', 'PUT', 'setWriterStory', {
        storyName: ADMIN_STORY,
        value: 'Взлом',
    });
    await expectDenied(cookie, 'org: removeStory admin denied', 'PUT', 'removeStory', { storyName: ADMIN_STORY });
    await expectOk(cookie, 'org: createGroup own', 'PUT', 'createGroup', { groupName: 'ГруппаОргаRBAC' });
    await expectDenied(cookie, 'org: renameGroup denied (editor mode)', 'PUT', 'renameGroup', {
        fromName: 'ГруппаОргаRBAC',
        toName: 'ГруппаОргаRBAC2',
    });
    await expectOk(cookie, 'org: getRelations', 'GET', 'getRelations');
}

async function testEditor(cookie) {
    console.log('\n=== Editor ===');
    await expectOk(cookie, 'editor: getMetaInfo', 'GET', 'getMetaInfo');
    await expectDenied(cookie, 'editor: setMetaInfoString denied', 'PUT', 'setMetaInfoString', {
        name: 'name',
        value: 'Hack',
    });
    await expectOk(cookie, 'editor: setWriterStory admin story', 'PUT', 'setWriterStory', {
        storyName: ADMIN_STORY,
        value: 'Правка редактора',
    });
    await expectOk(cookie, 'editor: setWriterStory org story', 'PUT', 'setWriterStory', {
        storyName: ORG_STORY,
        value: 'Редактор правит чужой',
    });
    await expectOk(cookie, 'editor: removeProfile admin char', 'PUT', 'removeProfile', {
        type: 'character',
        characterName: ADMIN_CHAR,
    });
}

async function testAdminWithEditor(cookie) {
    console.log('\n=== Admin with editor mode ON ===');
    await expectOk(cookie, 'admin: getMetaInfo', 'GET', 'getMetaInfo');
    await expectOk(cookie, 'admin: setMetaInfoString (admin ops)', 'PUT', 'setMetaInfoString', {
        name: 'description',
        value: 'RBAC test',
    });
    await expectDenied(cookie, 'admin: setWriterStory denied when editor assigned', 'PUT', 'setWriterStory', {
        storyName: ORG_STORY,
        value: 'Админ не редактор',
    });
}

async function testAdminWithoutEditor(adminCookie, orgCookie) {
    console.log('\n=== After removeEditor ===');
    await expectOk(adminCookie, 'removeEditor', 'PUT', 'removeEditor', {});
    await expectOk(adminCookie, 'admin: setWriterStory after editor cleared', 'PUT', 'setWriterStory', {
        storyName: ORG_STORY,
        value: 'Админ снова может',
    });
    // org owns ORG_STORY → can edit; cannot edit ADMIN_STORY
    await expectOk(orgCookie, 'org: setWriterStory own after editor cleared', 'PUT', 'setWriterStory', {
        storyName: ORG_STORY,
        value: 'Свой текст орга',
    });
    await expectDenied(orgCookie, 'org: setWriterStory admin still denied', 'PUT', 'setWriterStory', {
        storyName: ADMIN_STORY,
        value: 'Чужой',
    });
}

async function cleanup(adminCookie) {
    console.log('\n=== Cleanup ===');
    await api(adminCookie, 'PUT', 'removeEditor', {});
    for (const name of [ADMIN_STORY, ORG_STORY]) {
        await api(adminCookie, 'PUT', 'removeStory', { storyName: name }).catch(() => {});
    }
    await api(adminCookie, 'PUT', 'removeGroup', { groupName: 'ГруппаОргаRBAC' }).catch(() => {});
    await api(adminCookie, 'PUT', 'removeGroup', { groupName: 'ГруппаОргаRBAC2' }).catch(() => {});
    await api(adminCookie, 'PUT', 'removeProfile', { type: 'character', characterName: ADMIN_CHAR }).catch(() => {});
    for (const u of [USERS.org, USERS.editor]) {
        await api(adminCookie, 'PUT', 'removeOrganizer', { name: u.name }).catch(() => {});
    }
    await api(adminCookie, 'PUT', 'removePlayerLogin', { userName: USERS.player.name }).catch(() => {});
    await api(adminCookie, 'PUT', 'removeProfile', {
        type: 'player',
        characterName: USERS.player.name,
    }).catch(() => {});
}

async function main() {
    console.log(`NIMS API RBAC tests → ${BASE}`);
    let adminCookie;
    try {
        await testUnauthenticated();

        adminCookie = await login(ADMIN_USER, ADMIN_PASS);
        record('admin login', true);
        if (!(await setup(adminCookie))) throw new Error('setup failed');

        const playerCookie = await login(USERS.player.name, USERS.player.password);
        record('player login', true);
        await testPlayer(playerCookie);

        const orgCookie = await login(USERS.org.name, USERS.org.password);
        record('org login', true);
        await testOrganizer(orgCookie);

        const editorCookie = await login(USERS.editor.name, USERS.editor.password);
        record('editor login', true);
        await testEditor(editorCookie);

        await testAdminWithEditor(adminCookie);
        await testAdminWithoutEditor(adminCookie, orgCookie);
    } catch (err) {
        console.error('\nFATAL:', err);
        failed += 1;
        failures.push(String(err.message || err));
    } finally {
        if (adminCookie) {
            try { await cleanup(adminCookie); } catch (e) { console.error('cleanup error', e); }
        }
    }

    console.log('\n========== SUMMARY ==========');
    console.log(`Passed: ${passed}  Failed: ${failed}`);
    if (failed > 0) {
        console.log('\nFailures:');
        failures.forEach((f) => console.log(`  - ${f}`));
        process.exit(1);
    }
    console.log('\nAPI RBAC works as expected.');
}

main();

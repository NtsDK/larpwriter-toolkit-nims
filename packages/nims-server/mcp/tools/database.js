'use strict';

const { z } = require('zod');
const { callDb, formatError } = require('../dbCall');
const { formatBriefingsMarkdown } = require('../formatBriefings');

const emptyBase = require('nims-resources/emptyBase');
const demoBase = require('nims-resources/demoBase');

let buildNegriatBase;
try {
    buildNegriatBase = require('../../scripts/negriat-data').buildNegriatBase;
} catch (e) {
    buildNegriatBase = null;
}

const PRESETS = {
    empty: () => emptyBase.data,
    demo: () => demoBase.data,
    negriat: (managementInfo) => (buildNegriatBase ? buildNegriatBase(managementInfo) : null),
};

async function fetchBriefingData(db, user, opts) {
    return callDb(db, 'getBriefingData', {
        selCharacters: opts.selCharacters || null,
        selStories: opts.selStories || null,
        exportOnlyFinishedStories: opts.exportOnlyFinishedStories || false,
    }, user);
}

async function getManagementInfo(db, user) {
    const database = await callDb(db, 'getDatabase', null, user);
    return database.ManagementInfo;
}

async function prepareDatabaseForImport(db, user, database, preserveManagementInfo) {
    if (!preserveManagementInfo) {
        return database;
    }
    const current = await callDb(db, 'getDatabase', null, user);
    if (current.ManagementInfo) {
        return { ...database, ManagementInfo: current.ManagementInfo };
    }
    return database;
}

function findEventIndex(story, eventName) {
    return story.events.findIndex((ev) => ev.name === eventName);
}

async function importBriefings(db, user, briefings) {
    const errors = [];
    let updated = 0;

    for (const briefing of briefings) {
        const charName = briefing.charName;
        const events = briefing.eventsInfo
            || (briefing.storiesInfo || []).flatMap((s) => (s.eventsInfo || []).map((ev) => ({
                ...ev,
                storyName: ev.storyName || s.storyName,
            })));

        for (const ev of events) {
            try {
                const story = await callDb(db, 'getStory', { storyName: ev.storyName }, user);
                const eventIndex = findEventIndex(story, ev.eventName);
                if (eventIndex < 0) {
                    errors.push(`${charName}: событие «${ev.eventName}» не найдено в «${ev.storyName}»`);
                    continue;
                }
                if (ev.text !== undefined && ev.text !== '') {
                    await callDb(db, 'setEventAdaptationProperty', {
                        storyName: ev.storyName,
                        eventIndex,
                        characterName: charName,
                        type: 'text',
                        value: String(ev.text),
                    }, user);
                    updated += 1;
                }
                if (ev.displayTime !== undefined && ev.displayTime !== '') {
                    await callDb(db, 'setEventAdaptationProperty', {
                        storyName: ev.storyName,
                        eventIndex,
                        characterName: charName,
                        type: 'time',
                        value: String(ev.displayTime),
                    }, user);
                }
            } catch (err) {
                errors.push(`${charName} / ${ev.storyName} / ${ev.eventName}: ${formatError(err)}`);
            }
        }
    }

    return { updated, errors };
}

const briefingExportParams = {
    selCharacters: z.array(z.string()).optional().describe('Имена персонажей (все, если не указано)'),
    selStories: z.array(z.string()).optional().describe('Имена сюжетов (все, если не указано)'),
    exportOnlyFinishedStories: z.boolean().optional().describe('Только сюжеты с готовыми адаптациями'),
    format: z.enum(['json', 'markdown']).optional().describe('Формат выгрузки вводных (по умолчанию json)'),
};

function registerReadTools(server, db, user) {
    server.tool(
        'export_database',
        'Выгрузить полную базу NIMS (JSON). По умолчанию без ManagementInfo — только игровые данные.',
        {
            includeManagementInfo: z.boolean().optional().describe('Включить ManagementInfo (пользователи, права). По умолчанию false'),
        },
        async ({ includeManagementInfo }) => {
            try {
                const database = await callDb(db, 'getDatabase', null, user);
                if (!includeManagementInfo && database.ManagementInfo) {
                    delete database.ManagementInfo;
                }
                const text = JSON.stringify(database, null, 2);
                return {
                    content: [{
                        type: 'text',
                        text: `Размер: ${text.length} символов.\n\n${text}`,
                    }],
                };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'export_briefings',
        'Выгрузить вводные для персонажей: профиль, снаряжение, сюжеты, события, группы, отношения. Формат json или markdown.',
        briefingExportParams,
        async (params) => {
            try {
                const data = await fetchBriefingData(db, user, params);
                if ((params.format || 'json') === 'markdown') {
                    return { content: [{ type: 'text', text: formatBriefingsMarkdown(data) }] };
                }
                return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'get_consistency_check',
        'Проверить базу на ошибки схемы и ссылочной целостности',
        {},
        async () => {
            try {
                const result = await callDb(db, 'getConsistencyCheckResult', null, user);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'list_database_presets',
        'Список встроенных пресетов для загрузки базы: empty, demo, negriat',
        {},
        async () => {
            const presets = Object.keys(PRESETS).filter((name) => name !== 'negriat' || buildNegriatBase);
            return { content: [{ type: 'text', text: JSON.stringify(presets, null, 2) }] };
        }
    );
}

function registerWriteTools(server, db, user) {
    server.tool(
        'import_database',
        'Загрузить полную базу NIMS из JSON. Требуются права admin. По умолчанию сохраняет текущий ManagementInfo (пользователи и права).',
        {
            database: z.record(z.string(), z.unknown()).describe('Объект базы NIMS (как из export_database)'),
            preserveManagementInfo: z.boolean().optional().describe('Сохранить ManagementInfo текущего сервера (по умолчанию true)'),
        },
        async ({ database, preserveManagementInfo }) => {
            try {
                const prepared = await prepareDatabaseForImport(
                    db, user, database, preserveManagementInfo !== false
                );
                await callDb(db, 'setDatabase', { database: prepared }, user);
                const check = await callDb(db, 'getConsistencyCheckResult', null, user);
                const errCount = (check.errors || []).length;
                const summary = {
                    meta: prepared.Meta && prepared.Meta.name,
                    characters: Object.keys(prepared.Characters || {}).length,
                    stories: Object.keys(prepared.Stories || {}).length,
                    relations: (prepared.Relations || []).length,
                    consistencyErrors: errCount,
                };
                return {
                    content: [{
                        type: 'text',
                        text: `База загружена.\n${JSON.stringify(summary, null, 2)}${errCount ? `\n\nОшибки:\n${check.errors.join('\n')}` : ''}`,
                    }],
                };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'import_briefings',
        'Загрузить вводные обратно в базу: обновляет тексты и время адаптаций событий. Принимает массив briefings или полный JSON из export_briefings.',
        {
            data: z.union([
                z.object({
                    briefings: z.array(z.record(z.string(), z.unknown())),
                    gameName: z.string().optional(),
                }),
                z.array(z.record(z.string(), z.unknown())),
            ]).describe('briefings[] или { briefings, gameName } из export_briefings'),
        },
        async ({ data }) => {
            try {
                const briefings = Array.isArray(data) ? data : data.briefings;
                const { updated, errors } = await importBriefings(db, user, briefings);
                const text = `Обновлено адаптаций: ${updated}.${errors.length ? `\n\nПредупреждения:\n${errors.join('\n')}` : ''}`;
                return {
                    content: [{ type: 'text', text }],
                    isError: errors.length > 0 && updated === 0,
                };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );

    server.tool(
        'load_database_preset',
        'Загрузить встроенный пресет базы. empty — пустая, demo — Властелин колец, negriat — Десять негритят. Требуются права admin.',
        {
            preset: z.enum(['empty', 'demo', 'negriat']).describe('Имя пресета'),
            preserveManagementInfo: z.boolean().optional().describe('Сохранить ManagementInfo (по умолчанию true)'),
        },
        async ({ preset, preserveManagementInfo }) => {
            try {
                const managementInfo = preserveManagementInfo !== false
                    ? await getManagementInfo(db, user)
                    : undefined;
                const factory = PRESETS[preset];
                if (!factory) {
                    return { content: [{ type: 'text', text: `Пресет «${preset}» недоступен.` }], isError: true };
                }
                const database = factory(managementInfo);
                if (!database) {
                    return { content: [{ type: 'text', text: `Пресет «${preset}» не найден на сервере.` }], isError: true };
                }
                await callDb(db, 'setDatabase', { database }, user);
                return {
                    content: [{
                        type: 'text',
                        text: `Пресет «${preset}» загружен. Проект: «${database.Meta && database.Meta.name}».`,
                    }],
                };
            } catch (err) {
                return { content: [{ type: 'text', text: formatError(err) }], isError: true };
            }
        }
    );
}

module.exports = { registerReadTools, registerWriteTools };

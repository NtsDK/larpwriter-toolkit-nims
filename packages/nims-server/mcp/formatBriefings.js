'use strict';

function formatBriefingsMarkdown({ briefings, gameName } = {}) {
    const lines = [`# Вводные: ${gameName || 'без названия'}`, ''];
    (briefings || []).forEach((b) => {
        lines.push(`## ${b.charName}`);
        if (b.playerName) {
            lines.push(`*Игрок: ${b.playerName}*`);
        }
        if (b.inventory) {
            lines.push(`**Снаряжение:** ${b.inventory}`);
        }
        lines.push('');
        if (b.profileInfoArray) {
            lines.push('### Профиль');
            b.profileInfoArray.filter((item) => item.notEmpty).forEach((item) => {
                lines.push(`**${item.itemName}:** ${item.value}`);
            });
            lines.push('');
        }
        if (b.groupTexts && b.groupTexts.length) {
            lines.push('### Группы');
            b.groupTexts.forEach((g) => {
                lines.push(`**${g.groupName}**`);
                lines.push(g.text || '');
                lines.push('');
            });
        }
        if (b.relations && b.relations.length) {
            lines.push('### Отношения');
            b.relations.forEach((r) => {
                lines.push(`**${r.toCharacter}** (${r.stories || '—'})`);
                lines.push(r.text || '');
                lines.push('');
            });
        }
        if (b.storiesInfo && b.storiesInfo.length) {
            lines.push('### Сюжеты');
            b.storiesInfo.forEach((s) => {
                lines.push(`#### ${s.storyName}`);
                (s.eventsInfo || []).forEach((ev) => {
                    lines.push(`**${ev.displayTime || ev.time} — ${ev.eventName}**`);
                    lines.push(ev.text || '');
                    lines.push('');
                });
            });
        } else if (b.eventsInfo && b.eventsInfo.length) {
            lines.push('### События');
            b.eventsInfo.forEach((ev) => {
                lines.push(`**${ev.displayTime || ev.time} — ${ev.storyName}: ${ev.eventName}**`);
                lines.push(ev.text || '');
                lines.push('');
            });
        }
        lines.push('---');
        lines.push('');
    });
    return lines.join('\n');
}

module.exports = { formatBriefingsMarkdown };

/**
 * DOCX export shaped like classic NIMS (templateByStory / templateByTime),
 * with clearer typography and profile fields as internal subsections.
 */
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, AlignmentType,
} from 'docx';

export interface BriefingEvent {
  eventName: string;
  time: string;
  displayTime: string;
  text: string;
  storyName?: string;
}

export interface BriefingChar {
  charName: string;
  playerName?: string;
  inventory?: string;
  profileInfoArray?: Array<{ itemName: string; value: string | number | boolean; notEmpty: boolean }>;
  groupTexts?: Array<{ groupName: string; text: string }>;
  relations?: Array<{ toCharacter: string; text: string; stories: string }>;
  storiesInfo?: Array<{
    storyName: string;
    eventsInfo: BriefingEvent[];
  }>;
}

export type DocxGroupMode = 'stories' | 'timeline';

/** Half-points: 24 = 12pt */
const SIZE = {
  charName: 36,   // 18pt
  section: 28,    // 14pt
  subsection: 24, // 12pt
  body: 24,       // 12pt
  meta: 22,       // 11pt
} as const;

const COLOR = {
  ink: '1A1A1A',
  muted: '555555',
  accent: '2C4A6E',
  rule: 'B8C4CE',
} as const;

function run(text: string, opts?: {
  bold?: boolean;
  italics?: boolean;
  size?: number;
  color?: string;
}): TextRun {
  return new TextRun({
    text: text || ' ',
    bold: opts?.bold,
    italics: opts?.italics,
    size: opts?.size ?? SIZE.body,
    font: 'Calibri',
    color: opts?.color ?? COLOR.ink,
  });
}

function para(children: TextRun[], opts?: {
  before?: number;
  after?: number;
  heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
  pageBreakBefore?: boolean;
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  borderBottom?: boolean;
}): Paragraph {
  return new Paragraph({
    heading: opts?.heading,
    pageBreakBefore: opts?.pageBreakBefore,
    alignment: opts?.align,
    spacing: {
      before: opts?.before ?? 0,
      after: opts?.after ?? 100,
      line: 276, // ~1.15
    },
    border: opts?.borderBottom ? {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR.rule, space: 6 },
    } : undefined,
    children: children.length ? children : [run(' ')],
  });
}

function charTitle(name: string, pageBreakBefore: boolean): Paragraph {
  return para([run(name, { bold: true, size: SIZE.charName, color: COLOR.accent })], {
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore,
    before: 0,
    after: 80,
  });
}

/** Major block: Досье, Инвентарь, Отношения… */
function sectionHeading(title: string): Paragraph {
  return para([run(title.toUpperCase(), { bold: true, size: SIZE.section, color: COLOR.accent })], {
    before: 360,
    after: 140,
    borderBottom: true,
  });
}

/** Inner block: profile field like «Скелет», relation target, group name, story name */
function subHeading(title: string): Paragraph {
  return para([run(title, { bold: true, size: SIZE.subsection, color: COLOR.ink })], {
    before: 220,
    after: 80,
  });
}

function bodyLines(text: string): Paragraph[] {
  const raw = (text || '').replace(/\r\n/g, '\n');
  if (!raw.trim()) return [];
  return raw.split('\n').map((line) => para([run(line || ' ', { size: SIZE.body })], { after: 80 }));
}

function buildCharacterSheet(b: BriefingChar, mode: DocxGroupMode, pageBreakBefore: boolean): Paragraph[] {
  const out: Paragraph[] = [];

  out.push(charTitle(b.charName, pageBreakBefore));

  if (b.playerName) {
    out.push(para([
      run('Игрок: ', { italics: true, size: SIZE.meta, color: COLOR.muted }),
      run(b.playerName, { italics: true, size: SIZE.meta, color: COLOR.muted }),
    ], { after: 160 }));
  }

  // —— Досье: каждое поле — внутренний подзаголовок (Скелет, Возраст, …)
  const profile = (b.profileInfoArray || []).filter(
    (item) => item.notEmpty && String(item.value ?? '').trim() !== '',
  );
  if (profile.length > 0) {
    out.push(sectionHeading('Досье'));
    for (const item of profile) {
      const value = String(item.value ?? '').trim();
      const label = item.itemName.replace(/:\s*$/, '');
      out.push(subHeading(label));
      out.push(...bodyLines(value));
    }
  }

  const inventory = (b.inventory || '').trim();
  if (inventory) {
    out.push(sectionHeading('Инвентарь'));
    out.push(...bodyLines(inventory));
  }

  const relations = (b.relations || []).filter((r) => (r.text || '').trim());
  if (relations.length > 0) {
    out.push(sectionHeading('Отношения'));
    for (const rel of relations) {
      out.push(subHeading(rel.toCharacter));
      out.push(...bodyLines(rel.text));
    }
  }

  const groups = (b.groupTexts || []).filter((g) => (g.text || '').trim());
  if (groups.length > 0) {
    out.push(sectionHeading('Группы'));
    for (const g of groups) {
      out.push(subHeading(g.groupName));
      out.push(...bodyLines(g.text));
    }
  }

  if (mode === 'timeline') {
    const events: BriefingEvent[] = [];
    for (const s of b.storiesInfo || []) {
      for (const ev of s.eventsInfo || []) {
        events.push({ ...ev, storyName: s.storyName });
      }
    }
    events.sort((a, c) => (a.displayTime || a.time || '').localeCompare(c.displayTime || c.time || ''));

    out.push(sectionHeading('События'));
    if (events.length === 0) {
      out.push(para([run('—', { italics: true, color: COLOR.muted })], {}));
    } else {
      for (const ev of events) {
        const time = ev.displayTime || ev.time || '';
        out.push(subHeading(time || ev.eventName));
        if (ev.eventName && time) {
          out.push(para([run(ev.eventName, { italics: true, size: SIZE.meta, color: COLOR.muted })], { after: 60 }));
        }
        out.push(...bodyLines(ev.text));
      }
    }
  } else {
    const stories = b.storiesInfo || [];
    out.push(sectionHeading('Истории'));
    if (stories.length === 0) {
      out.push(para([run('—', { italics: true, color: COLOR.muted })], {}));
    } else {
      for (const s of stories) {
        out.push(subHeading(s.storyName));
        for (const ev of s.eventsInfo || []) {
          const time = ev.displayTime || ev.time || '';
          if (time) {
            out.push(para([run(time, { bold: true, size: SIZE.meta, color: COLOR.accent })], {
              before: 160,
              after: 60,
            }));
          }
          out.push(...bodyLines(ev.text));
        }
      }
    }
  }

  return out;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportBriefingsDocx(opts: {
  gameName: string;
  briefings: BriefingChar[];
  mode: DocxGroupMode;
  filename?: string;
}): Promise<void> {
  const { gameName, briefings, mode } = opts;
  const children: Paragraph[] = [];

  briefings.forEach((b, i) => {
    children.push(...buildCharacterSheet(b, mode, i > 0));
  });

  if (children.length === 0) {
    children.push(para([run('Нет данных для выгрузки', { italics: true, color: COLOR.muted })], {}));
  }

  const doc = new Document({
    creator: 'NIMS',
    title: `Вводные — ${gameName || 'NIMS'}`,
    description: mode === 'timeline' ? 'По времени' : 'По историям',
    styles: {
      default: {
        document: {
          styles: {
            // Fallback if runs omit font
            // (run-level Georgia still wins for our paragraphs)
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const date = new Date().toISOString().slice(0, 10);
  const suffix = mode === 'timeline' ? 'by-time' : 'by-stories';
  downloadBlob(blob, opts.filename || `briefings-${suffix}-${date}.docx`);
}

export async function exportBriefingsDocxPerCharacter(opts: {
  gameName: string;
  briefings: BriefingChar[];
  mode: DocxGroupMode;
}): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  for (const b of opts.briefings) {
    const safeName = b.charName.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80);
    await exportBriefingsDocx({
      gameName: opts.gameName,
      briefings: [b],
      mode: opts.mode,
      filename: `${safeName}-${date}.docx`,
    });
  }
}

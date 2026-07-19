/**
 * Classic NIMS advanced briefing export: Docxtemplater templates + Mustache text.
 */
import Docxtemplater from 'docxtemplater';
import Mustache from 'mustache';
import PizZip from 'pizzip';
import { exportTemplates, type ExportTemplateName } from '@/assets/exportTemplates';
import type { BriefingChar } from './exportBriefingsDocx';

export interface BriefingExportPayload {
  gameName: string;
  briefings: BriefingChar[];
}

type AnyRec = Record<string, unknown>;

function splitLines(text: unknown): Array<{ string: string }> {
  return String(text ?? '').replace(/\r\n/g, '\n').split('\n').map((string) => ({ string }));
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80) || 'character';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function base64ToBinary(base64: string): string {
  return atob(base64);
}

/** Enrich API briefing data for classic Mustache / Docxtemplater templates. */
export function prepareBriefingExportData(data: BriefingExportPayload): AnyRec {
  const briefings = (data.briefings || []).map((b) => {
    const profileInfoArray = (b.profileInfoArray || []).map((item) => ({
      ...item,
      splittedText: splitLines(item.value),
    }));

    const storiesInfo = (b.storiesInfo || []).map((s) => ({
      ...s,
      eventsInfo: (s.eventsInfo || []).map((ev) => ({
        ...ev,
        storyName: s.storyName,
        splittedText: splitLines(ev.text),
      })),
    }));

    const eventsInfo: AnyRec[] = [];
    for (const s of storiesInfo) {
      for (const ev of s.eventsInfo || []) {
        eventsInfo.push({ ...ev, storyName: s.storyName });
      }
    }
    eventsInfo.sort((a, c) =>
      String(a.displayTime || a.time || '').localeCompare(String(c.displayTime || c.time || '')),
    );

    const enriched: AnyRec = {
      ...b,
      gameName: data.gameName,
      inventory: b.inventory || '',
      playerName: b.playerName || '',
      profileInfoArray,
      storiesInfo,
      eventsInfo,
      groupTexts: (b.groupTexts || []).map((g) => ({
        ...g,
        splittedText: splitLines(g.text),
      })),
      relations: (b.relations || []).map((r) => ({
        ...r,
        splittedText: splitLines(r.text),
      })),
    };

    for (const item of profileInfoArray) {
      enriched[`profileInfo-${item.itemName}`] = item.value;
    }

    return enriched;
  });

  return { gameName: data.gameName || '', briefings };
}

export function buildDefaultTextTemplate(profileFieldNames: string[]): string {
  const fields = profileFieldNames
    .map((name) => `{{profileInfo-${name}}}\n`)
    .join('');
  return exportTemplates.textTemplate.replace(/\{0\}/g, fields);
}

export function renderMustacheBriefings(template: string, data: BriefingExportPayload): string {
  return Mustache.render(template, prepareBriefingExportData(data));
}

function renderDocxFromBase64(base64Template: string, data: AnyRec): Uint8Array {
  const zip = new PizZip(base64ToBinary(base64Template));
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  doc.render(data);
  return doc.getZip().generate({ type: 'uint8array' });
}

export function renderClassicDocxTemplate(
  templateName: ExportTemplateName,
  data: BriefingExportPayload,
): Blob {
  const bytes = renderDocxFromBase64(exportTemplates[templateName], prepareBriefingExportData(data));
  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function renderCustomDocxTemplate(
  templateBinary: ArrayBuffer | string,
  data: BriefingExportPayload,
): Blob {
  const zip = typeof templateBinary === 'string'
    ? new PizZip(templateBinary)
    : new PizZip(templateBinary);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  doc.render(prepareBriefingExportData(data));
  const bytes = doc.getZip().generate({ type: 'uint8array' });
  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/** Convert Mustache-ish text template into a simple DOCX via genericTemplate. */
export function convertTextTemplateToDocx(textTemplate: string): Blob {
  const replaceBrackets = (s: string) =>
    s.replace(/{{{/g, '{').replace(/}}}/g, '}').replace(/{{/g, '{').replace(/}}/g, '}');
  const splittedText = replaceBrackets(textTemplate).split('\n').map((string) => ({ string }));
  const bytes = renderDocxFromBase64(exportTemplates.genericTemplate, { splittedText });
  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export async function exportClassicDocx(opts: {
  data: BriefingExportPayload;
  templateName: ExportTemplateName;
  separateFiles?: boolean;
}): Promise<void> {
  const prepared = prepareBriefingExportData(opts.data);
  const date = new Date().toISOString().slice(0, 10);
  const suffix = opts.templateName;

  if (opts.separateFiles) {
    const zip = new PizZip();
    for (const briefing of prepared.briefings as AnyRec[]) {
      const one = { gameName: prepared.gameName, briefings: [briefing] };
      const bytes = renderDocxFromBase64(exportTemplates[opts.templateName], one);
      const name = safeFileName(
        String(briefing.charName) + (briefing.playerName ? `_${briefing.playerName}` : ''),
      );
      zip.file(`${name}.docx`, bytes);
    }
    const archive = zip.generate({ type: 'blob' });
    downloadBlob(archive, `briefings-${suffix}-${date}.zip`);
    return;
  }

  const blob = renderClassicDocxTemplate(opts.templateName, opts.data);
  downloadBlob(blob, `briefings-${suffix}-${date}.docx`);
}

export async function exportCustomDocx(opts: {
  data: BriefingExportPayload;
  templateBinary: ArrayBuffer | string;
  separateFiles?: boolean;
}): Promise<void> {
  const prepared = prepareBriefingExportData(opts.data);
  const date = new Date().toISOString().slice(0, 10);

  if (opts.separateFiles) {
    const zip = new PizZip();
    for (const briefing of prepared.briefings as AnyRec[]) {
      const one = { gameName: prepared.gameName, briefings: [briefing] };
      const blob = renderCustomDocxTemplate(opts.templateBinary, one as BriefingExportPayload);
      const buf = new Uint8Array(await blob.arrayBuffer());
      const name = safeFileName(
        String(briefing.charName) + (briefing.playerName ? `_${briefing.playerName}` : ''),
      );
      zip.file(`${name}.docx`, buf);
    }
    downloadBlob(zip.generate({ type: 'blob' }), `briefings-custom-${date}.zip`);
    return;
  }

  downloadBlob(
    renderCustomDocxTemplate(opts.templateBinary, opts.data),
    `briefings-custom-${date}.docx`,
  );
}

export function exportTextBriefings(opts: {
  data: BriefingExportPayload;
  template: string;
  extension: string;
  separateFiles?: boolean;
  transform?: (text: string) => string;
}): void {
  const prepared = prepareBriefingExportData(opts.data);
  const date = new Date().toISOString().slice(0, 10);
  const ext = opts.extension.replace(/^\./, '') || 'txt';
  const transform = opts.transform || ((t) => t);

  if (opts.separateFiles) {
    const zip = new PizZip();
    for (const briefing of prepared.briefings as AnyRec[]) {
      const one = { gameName: prepared.gameName, briefings: [briefing] };
      const text = transform(Mustache.render(opts.template, one));
      const name = safeFileName(
        String(briefing.charName) + (briefing.playerName ? `_${briefing.playerName}` : ''),
      );
      zip.file(`${name}.${ext}`, text);
    }
    downloadBlob(zip.generate({ type: 'blob' }), `briefings-text-${date}.zip`);
    return;
  }

  const text = transform(Mustache.render(opts.template, prepared));
  downloadBlob(
    new Blob([text], { type: 'text/plain;charset=utf-8' }),
    `briefings-${date}.${ext}`,
  );
}

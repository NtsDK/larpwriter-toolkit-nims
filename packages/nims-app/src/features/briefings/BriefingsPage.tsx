import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Title, Stack, Card, Text, Button, Accordion, Badge, Group, Switch,
  Radio, Select, TextInput, Checkbox, ScrollArea, SimpleGrid, Divider,
  Tabs, FileInput } from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';
import { useIsMobile } from '@/hooks/useIsMobile';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import {
  exportBriefingsDocx,
  exportBriefingsDocxPerCharacter,
  type BriefingChar,
  type DocxGroupMode } from '@/utils/exportBriefingsDocx';
import {
  buildDefaultTextTemplate,
  exportClassicDocx,
  exportCustomDocx,
  exportTextBriefings,
  convertTextTemplateToDocx,
  prepareBriefingExportData,
  renderMustacheBriefings } from '@/utils/exportBriefingsAdvanced';

const RANGE_SIZES = ['1', '5', '10', '20', '50'];

type CharMode = 'all' | 'range' | 'set';
type StoryMode = 'all' | 'set';

function MultiCheckList({
  items,
  value,
  onChange,
  height = 280 }: {
  items: string[];
  value: string[];
  onChange: (next: string[]) => void;
  height?: number;
}) {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState('');
  const filtered = filter
    ? items.filter((n) => n.toLowerCase().includes(filter.toLowerCase()))
    : items;

  const toggle = (name: string, checked: boolean) => {
    if (checked) onChange([...value, name]);
    else onChange(value.filter((v) => v !== name));
  };

  const listHeight = isMobile ? Math.min(height, 220) : height;

  return (
    <Stack gap={6} style={{ minWidth: isMobile ? 0 : 220, flex: 1, width: '100%' }}>
      <TextInput
        size="xs"
        placeholder="Фильтр..."
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />
      <Group gap="xs">
        <Button
          size="compact-xs"
          variant="subtle"
          onClick={() => onChange(Array.from(new Set([...value, ...filtered])))}
        >
          Выбрать видимые
        </Button>
        <Button
          size="compact-xs"
          variant="subtle"
          color="gray"
          onClick={() => onChange(value.filter((v) => !filtered.includes(v)))}
        >
          Снять видимые
        </Button>
      </Group>
      <ScrollArea h={listHeight} type="auto" offsetScrollbars>
        <Stack gap={4}>
          {filtered.map((name) => (
            <Checkbox
              key={name}
              size={isMobile ? 'sm' : 'xs'}
              label={name}
              checked={value.includes(name)}
              onChange={(e) => toggle(name, e.currentTarget.checked)}
              styles={isMobile ? { body: { minHeight: 40, alignItems: 'center' } } : undefined}
            />
          ))}
          {filtered.length === 0 && (
            <Text size="xs" c="dimmed">Нет совпадений</Text>
          )}
        </Stack>
      </ScrollArea>
      <Text size="xs" c="dimmed">
        Выбрано: {value.length} из {items.length}
      </Text>
    </Stack>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function BriefingsPage() {
  const { t } = useTranslation();
  const { api } = useRootStore();
  const isMobile = useIsMobile();
  const [charNames, setCharNames] = useState<string[]>([]);
  const [storyNames, setStoryNames] = useState<string[]>([]);
  const [charMode, setCharMode] = useState<CharMode>('all');
  const [storyMode, setStoryMode] = useState<StoryMode>('all');
  const [selChars, setSelChars] = useState<string[]>([]);
  const [selStories, setSelStories] = useState<string[]>([]);
  const [rangeSize, setRangeSize] = useState('10');
  const [rangeIndex, setRangeIndex] = useState<string | null>(null);
  const [onlyFinished, setOnlyFinished] = useState(false);
  const [separateFiles, setSeparateFiles] = useState(false);
  const [briefingData, setBriefingData] = useState<{ briefings: BriefingChar[]; gameName: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportTab, setExportTab] = useState<string | null>('simple');
  const [textTemplate, setTextTemplate] = useState('');
  const [textPreview, setTextPreview] = useState('');
  const [textExt, setTextExt] = useState('txt');
  const [customDocx, setCustomDocx] = useState<ArrayBuffer | null>(null);
  const [customDocxName, setCustomDocxName] = useState<string | null>(null);

  useEffect(() => {
    api.get<string[]>('getProfileNamesArray', { type: 'character' }).then((d) => {
      setCharNames(Array.isArray(d) ? d : []);
    });
    api.get<string[]>('getStoryNamesArray').then((d) => {
      setStoryNames(Array.isArray(d) ? d : []);
    });
    api.get<Array<{ name: string; doExport?: boolean }>>('getProfileStructure', { type: 'character' })
      .then((structure) => {
        const names = (Array.isArray(structure) ? structure : [])
          .filter((f) => f.doExport !== false)
          .map((f) => f.name);
        setTextTemplate(buildDefaultTextTemplate(names));
      })
      .catch(() => setTextTemplate(buildDefaultTextTemplate([])));
  }, []);

  const ranges = useMemo(() => {
    const size = Math.max(1, parseInt(rangeSize, 10) || 10);
    const chunks: string[][] = [];
    for (let i = 0; i < charNames.length; i += size) {
      chunks.push(charNames.slice(i, i + size));
    }
    return chunks.map((chunk, i) => ({
      value: String(i),
      label: chunk.length === 1
        ? chunk[0]
        : `${chunk[0]} — ${chunk[chunk.length - 1]} (${chunk.length})`,
      names: chunk }));
  }, [charNames, rangeSize]);

  useEffect(() => {
    if (ranges.length === 0) {
      setRangeIndex(null);
      return;
    }
    if (!rangeIndex || !ranges.some((r) => r.value === rangeIndex)) {
      setRangeIndex(ranges[0].value);
    }
  }, [ranges, rangeIndex]);

  const resolveSelection = (): { characters: string[] | null; stories: string[] | null } => {
    let characters: string[] | null = null;
    if (charMode === 'set') characters = selChars;
    else if (charMode === 'range') {
      characters = ranges.find((r) => r.value === rangeIndex)?.names ?? [];
    }

    let stories: string[] | null = null;
    if (storyMode === 'set') stories = selStories;

    return { characters, stories };
  };

  const ensureData = async (): Promise<{ briefings: BriefingChar[]; gameName: string } | null> => {
    if (briefingData?.briefings?.length) return briefingData;

    const { characters, stories } = resolveSelection();
    if (charMode === 'set' && characters?.length === 0) {
      notifications.show({ title: 'Выбор', message: 'Выберите хотя бы одного персонажа', color: 'yellow' });
      return null;
    }
    if (charMode === 'range' && (!characters || characters.length === 0)) {
      notifications.show({ title: 'Выбор', message: 'Выберите диапазон персонажей', color: 'yellow' });
      return null;
    }
    if (storyMode === 'set' && (!stories || stories.length === 0)) {
      notifications.show({ title: 'Выбор', message: 'Выберите хотя бы одну историю', color: 'yellow' });
      return null;
    }

    setLoading(true);
    try {
      const data = await api.get<{ briefings: BriefingChar[]; gameName: string }>('getBriefingData', {
        selCharacters: characters,
        selStories: stories,
        exportOnlyFinishedStories: onlyFinished });
      setBriefingData(data);
      return data;
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    const data = await ensureData();
    if (data) {
      notifications.show({
        title: 'Готово',
        message: `Сформировано: ${data.briefings.length} персонаж(ей)`,
        color: 'green' });
    }
  };

  const withExport = async (fn: (data: { briefings: BriefingChar[]; gameName: string }) => Promise<void> | void) => {
    const data = await ensureData();
    if (!data?.briefings?.length) {
      if (data) notifications.show({ title: 'Пусто', message: 'Нет данных для выгрузки', color: 'yellow' });
      return;
    }
    setExporting(true);
    try {
      await fn(data);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка экспорта', message: e.message || String(e), color: 'red' });
    } finally {
      setExporting(false);
    }
  };

  const runModernDocx = (mode: DocxGroupMode, perCharacter: boolean) => withExport(async (data) => {
    if (perCharacter) {
      await exportBriefingsDocxPerCharacter({ gameName: data.gameName, briefings: data.briefings, mode });
      notifications.show({ title: 'Готово', message: `Скачано файлов: ${data.briefings.length}`, color: 'green' });
    } else {
      await exportBriefingsDocx({ gameName: data.gameName, briefings: data.briefings, mode });
      notifications.show({ title: 'Готово', message: 'DOCX скачан', color: 'green' });
    }
  });

  const runClassicDocx = (templateName: 'templateByStory' | 'templateByTime' | 'inventoryTemplate') =>
    withExport(async (data) => {
      await exportClassicDocx({ data, templateName, separateFiles });
      notifications.show({ title: 'Готово', message: separateFiles ? 'ZIP скачан' : 'DOCX скачан', color: 'green' });
    });

  const runCustomDocx = () => withExport(async (data) => {
    if (!customDocx) {
      notifications.show({ title: 'Шаблон', message: 'Сначала загрузите DOCX-шаблон', color: 'yellow' });
      return;
    }
    await exportCustomDocx({ data, templateBinary: customDocx, separateFiles });
    notifications.show({ title: 'Готово', message: separateFiles ? 'ZIP скачан' : 'DOCX скачан', color: 'green' });
  });

  const runTextExport = (asMarkdownHtml = false) => withExport(async (data) => {
    exportTextBriefings({
      data,
      template: textTemplate,
      extension: asMarkdownHtml ? 'html' : textExt,
      separateFiles,
      transform: asMarkdownHtml
        ? (text) => `<!DOCTYPE html><html><body>${text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>\n')}</body></html>`
        : undefined });
    notifications.show({ title: 'Готово', message: 'Текст скачан', color: 'green' });
  });

  const previewMustache = () => withExport(async (data) => {
    setTextPreview(renderMustacheBriefings(textTemplate, data));
  });

  const previewRaw = () => withExport(async (data) => {
    setTextPreview(JSON.stringify(prepareBriefingExportData(data), null, 2));
  });

  const downloadTextAsDocxTemplate = () => {
    try {
      const blob = convertTextTemplateToDocx(textTemplate);
      downloadBlob(blob, `briefing-template-${new Date().toISOString().slice(0, 10)}.docx`);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message || String(e), color: 'red' });
    }
  };

  const generateByConvertedDocx = () => withExport(async (data) => {
    const templateBlob = convertTextTemplateToDocx(textTemplate);
    const buf = await templateBlob.arrayBuffer();
    await exportCustomDocx({ data, templateBinary: buf, separateFiles });
    notifications.show({ title: 'Готово', message: 'DOCX скачан', color: 'green' });
  });

  const onCustomTemplate = async (file: File | null) => {
    setCustomDocx(null);
    setCustomDocxName(null);
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      setCustomDocx(buf);
      setCustomDocxName(file.name);
      notifications.show({ title: 'Шаблон', message: `Загружен: ${file.name}`, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message || 'Не удалось прочитать файл', color: 'red' });
    }
  };

  const selectionSummary = (() => {
    const { characters, stories } = resolveSelection();
    const charsLabel = characters === null
      ? `все (${charNames.length})`
      : `${characters.length} персонаж(ей)`;
    const storiesLabel = stories === null
      ? `все (${storyNames.length})`
      : `${stories.length} историй`;
    return `${charsLabel} · ${storiesLabel}`;
  })();

  return (
    <Stack gap="lg">
      <Title order={2}>{t('briefings.title')}</Title>

      <Card shadow="sm" padding="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="sm">Параметры выборки</Text>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Stack gap="sm" style={isMobile ? { paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}>
              <Text size="sm" fw={500}>{isMobile ? '1. Персонажи' : 'Персонажи'}</Text>
              <Radio.Group value={charMode} onChange={(v) => setCharMode(v as CharMode)}>
                <Stack gap={6}>
                  <Radio value="all" label={`Все (${charNames.length})`} />
                  <Radio value="range" label="Диапазон" />
                  <Radio value="set" label="Точный выбор" />
                </Stack>
              </Radio.Group>

              {charMode === 'range' && (
                <Stack gap="xs" mt="xs">
                  <Select
                    size="xs"
                    label="Размер порции"
                    data={RANGE_SIZES}
                    value={rangeSize}
                    onChange={(v) => setRangeSize(v || '10')}
                    allowDeselect={false}
                  />
                  <Select
                    size="xs"
                    label="Диапазон"
                    data={ranges.map(({ value, label }) => ({ value, label }))}
                    value={rangeIndex}
                    onChange={setRangeIndex}
                    searchable
                    allowDeselect={false}
                    nothingFoundMessage="Нет персонажей"
                  />
                </Stack>
              )}

              {charMode === 'set' && (
                <MultiCheckList items={charNames} value={selChars} onChange={setSelChars} />
              )}
            </Stack>

            <Stack gap="sm">
              <Text size="sm" fw={500}>{isMobile ? '2. Истории' : 'Истории'}</Text>
              <Radio.Group value={storyMode} onChange={(v) => setStoryMode(v as StoryMode)}>
                <Stack gap={6}>
                  <Radio value="all" label={`Все (${storyNames.length})`} />
                  <Radio value="set" label="Точный выбор" />
                </Stack>
              </Radio.Group>

              {storyMode === 'set' && (
                <MultiCheckList items={storyNames} value={selStories} onChange={setSelStories} />
              )}
            </Stack>

            <Stack gap="sm" style={isMobile ? { paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}>
              <Text size="sm" fw={500}>{isMobile ? '3. Опции и действие' : 'Опции'}</Text>
              <Switch
                label="Только завершённые истории"
                description="Истории, где все адаптации отмечены готовыми"
                checked={onlyFinished}
                onChange={(e) => setOnlyFinished(e.currentTarget.checked)}
              />
              <Switch
                label="Каждая вводная в свой файл"
                description="Для классических шаблонов — ZIP-архив"
                checked={separateFiles}
                onChange={(e) => setSeparateFiles(e.currentTarget.checked)}
              />
              <Divider my="xs" />
              <Text size="xs" c="dimmed">Сейчас: {selectionSummary}</Text>
              <Button onClick={handleLoad} loading={loading} size={isMobile ? 'md' : 'sm'} fullWidth={isMobile}>
                Сформировать / обновить превью
              </Button>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Card>

      <Card shadow="sm" padding="md" withBorder>
        <Tabs value={exportTab} onChange={setExportTab} keepMounted={false}>
          <ScrollableTabsList>
            <Tabs.Tab value="simple">Простая выгрузка</Tabs.Tab>
            <Tabs.Tab value="docx">Продвинутая DOCX</Tabs.Tab>
            <Tabs.Tab value="text">Продвинутая текст</Tabs.Tab>
          </ScrollableTabsList>

          <Tabs.Panel value="simple" pt="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Современный DOCX (как в новой версии) и быстрый Markdown.
              </Text>
              <Group wrap="wrap">
                <Button loading={exporting} onClick={() => runModernDocx('stories', separateFiles)} fullWidth={isMobile}>
                  DOCX по историям
                </Button>
                <Button loading={exporting} variant="light" onClick={() => runModernDocx('timeline', separateFiles)} fullWidth={isMobile}>
                  DOCX по времени
                </Button>
                <Button
                  variant="default"
                  loading={exporting}
                  fullWidth={isMobile}
                  onClick={() => withExport(async (data) => {
                    const lines: string[] = [`# Вводные: ${data.gameName}\n`];
                    for (const b of data.briefings) {
                      lines.push(`## ${b.charName}\n`);
                      if (b.playerName) lines.push(`**Игрок:** ${b.playerName}\n`);
                      if (b.inventory) lines.push(`**Снаряжение:** ${b.inventory}\n`);
                      for (const s of b.storiesInfo || []) {
                        lines.push(`### ${s.storyName}\n`);
                        for (const ev of s.eventsInfo || []) {
                          const time = ev.displayTime || ev.time || '';
                          lines.push(`**${ev.eventName}** ${time ? `(${time})` : ''}\n`);
                          lines.push(`${ev.text}\n`);
                        }
                      }
                      lines.push('---\n');
                    }
                    downloadBlob(
                      new Blob([lines.join('\n')], { type: 'text/markdown' }),
                      `briefings-${new Date().toISOString().slice(0, 10)}.md`,
                    );
                  })}
                >
                  Markdown
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="docx" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Классические шаблоны НИМС (Docxtemplater) и свой DOCX-шаблон.
              </Text>
              <Group>
                <Button loading={exporting} onClick={() => runClassicDocx('templateByStory')}>
                  Классический DOCX по историям
                </Button>
                <Button loading={exporting} variant="light" onClick={() => runClassicDocx('templateByTime')}>
                  Классический DOCX по времени
                </Button>
                <Button loading={exporting} variant="default" onClick={() => runClassicDocx('inventoryTemplate')}>
                  Список инвентаря
                </Button>
              </Group>
              <Divider label="Свой шаблон" labelPosition="left" />
              <Group align="flex-end">
                <FileInput
                  label="Загрузить DOCX-шаблон"
                  placeholder={customDocxName || 'Выберите .docx'}
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={onCustomTemplate}
                  clearable
                  style={{ flex: 1, minWidth: 240 }}
                />
                <Button loading={exporting} onClick={runCustomDocx} disabled={!customDocx}>
                  Выгрузить по шаблону
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="text" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Mustache-шаблон (как в старом НИМС): превью, сырые данные, текстовый экспорт и конвертация в DOCX.
              </Text>
              <Group align="flex-end">
                <TextInput
                  label="Расширение файла"
                  value={textExt}
                  onChange={(e) => setTextExt(e.currentTarget.value || 'txt')}
                  w={120}
                />
                <Button loading={exporting} variant="light" onClick={previewMustache}>Превью</Button>
                <Button loading={exporting} variant="light" onClick={previewRaw}>Сырые данные</Button>
                <Button loading={exporting} onClick={() => runTextExport(false)}>Экспорт текста</Button>
                <Button loading={exporting} variant="default" onClick={() => runTextExport(true)}>
                  Markdown→HTML
                </Button>
                <Button variant="default" onClick={downloadTextAsDocxTemplate}>
                  В DOCX-шаблон
                </Button>
                <Button loading={exporting} variant="default" onClick={generateByConvertedDocx}>
                  Сгенерировать DOCX из текста
                </Button>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Textarea label="Шаблон"
                  value={textTemplate}
                  onChange={(e) => setTextTemplate(e.currentTarget.value)}
                  rows={16}
                  styles={{ input: { fontFamily: 'ui-monospace, monospace', fontSize: '0.95rem' } }}
                />
                <Textarea label="Превью / результат"
                  value={textPreview}
                  readOnly
                  rows={16}
                  styles={{ input: { fontFamily: 'ui-monospace, monospace', fontSize: '0.95rem' } }}
                />
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {briefingData && (
          <Text size="sm" c="dimmed" mt="md">
            В превью: {briefingData.briefings.length} персонаж(ей)
            {briefingData.gameName ? ` · «${briefingData.gameName}»` : ''}
          </Text>
        )}
      </Card>

      {briefingData && briefingData.briefings && briefingData.briefings.length > 0 && (
        <Accordion multiple>
          {briefingData.briefings.map((b) => (
            <Accordion.Item key={b.charName} value={b.charName}>
              <Accordion.Control>
                <Group>
                  <Text fw={500}>{b.charName}</Text>
                  {b.playerName && <Badge size="sm" variant="outline">Игрок: {b.playerName}</Badge>}
                  <Badge size="sm" variant="light">
                    {(b.storiesInfo || []).reduce((n, s) => n + (s.eventsInfo?.length || 0), 0)} событий
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  {b.inventory && <Text size="sm"><b>Снаряжение:</b> {b.inventory}</Text>}
                  {(b.storiesInfo || []).map((s) => (
                    <Card key={s.storyName} padding="xs" withBorder>
                      <Text fw={500} size="sm" mb={4}>{s.storyName}</Text>
                      {(s.eventsInfo || []).map((ev, i) => (
                        <Card key={i} padding="xs" ml="sm" mt={4} withBorder>
                          <Group gap="xs" mb={2}>
                            <Text size="xs" fw={500}>{ev.eventName}</Text>
                            {(ev.displayTime || ev.time) && (
                              <Badge size="xs" variant="light">{ev.displayTime || ev.time}</Badge>
                            )}
                          </Group>
                          <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>{ev.text}</Text>
                        </Card>
                      ))}
                    </Card>
                  ))}
                  {(!b.storiesInfo || b.storiesInfo.length === 0) && (
                    <Text size="sm" c="dimmed">Нет событий в историях</Text>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {briefingData && briefingData.briefings && briefingData.briefings.length === 0 && (
        <Text c="dimmed">Нет данных для формирования вводных</Text>
      )}
    </Stack>
  );
}

export default observer(BriefingsPage);

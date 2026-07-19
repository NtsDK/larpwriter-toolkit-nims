import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Title, Stack, Button, TextInput, Group, ActionIcon, Modal,
  Card, Text, Tabs, Badge, Select, Table, Checkbox, Tooltip, Anchor,
  Accordion } from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { type EntityListStatus } from '@/components/EntitySidebar';
import { EntityPageLayout } from '@/components/EntityPageLayout';
import { DeleteEntityButton } from '@/components/DeleteEntityButton';
import { EmptyState } from '@/components/EmptyState';
import { OwnerBadge } from '@/components/OwnerBadge';
import { useEntityOwners } from '@/hooks/useEntityOwners';
import { PermissionHint } from '@/components/PermissionHint';
import { HScroll } from '@/components/HScroll';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';

interface StoryEvent {
  name: string;
  text: string;
  time: string;
  characters: Record<string, { text: string; ready: boolean; time?: string }>;
}

interface StoryCharacterInfo {
  name: string;
  inventory: string;
  activity: Partial<Record<'active' | 'follower' | 'defensive' | 'passive', boolean>>;
}

const ACTIVITY_TYPES: Array<{ key: 'active' | 'follower' | 'defensive' | 'passive'; short: string; label: string }> = [
  { key: 'active', short: 'А', label: 'Актив' },
  { key: 'follower', short: 'С', label: 'Спутник' },
  { key: 'defensive', short: 'З', label: 'Защита' },
  { key: 'passive', short: 'П', label: 'Пассив' },
];

interface StoryStatusRow {
  storyName: string;
  isFinished: boolean;
  isEmpty: boolean;
}

function StoriesPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const [searchParams] = useSearchParams();
  const [names, setNames] = useState<string[]>([]);
  const { owners } = useEntityOwners('story', names.length);
  const [statuses, setStatuses] = useState<Record<string, EntityListStatus>>({});
  const [allChars, setAllChars] = useState<string[]>([]);
  const [storyChars, setStoryChars] = useState<string[]>([]);
  const [storyCharInfo, setStoryCharInfo] = useState<Record<string, StoryCharacterInfo>>({});
  const [selected, setSelected] = useState<string | null>(searchParams.get('select'));
  const [events, setEvents] = useState<StoryEvent[]>([]);
  const [writerText, setWriterText] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [eventOpened, { open: openEvent, close: closeEvent }] = useDisclosure(false);
  const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false);
  const [newName, setNewName] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [renameTo, setRenameTo] = useState('');
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('events');
  const [statusFilter, setStatusFilter] = useState<'all' | EntityListStatus>('all');

  const loadNames = async () => {
    try {
      const rows = await api.get<StoryStatusRow[]>('getFilteredStoryNames', {
        showOnlyUnfinishedStories: false });
      if (Array.isArray(rows) && rows.length > 0 && typeof rows[0] === 'object') {
        const nextNames = rows.map((r) => r.storyName);
        const nextStatuses: Record<string, EntityListStatus> = {};
        for (const r of rows) {
          if (r.isEmpty) nextStatuses[r.storyName] = 'empty';
          else if (r.isFinished) nextStatuses[r.storyName] = 'done';
          else nextStatuses[r.storyName] = 'wip';
        }
        setNames(nextNames);
        setStatuses(nextStatuses);
        return;
      }
    } catch {
      /* fallback below */
    }
    const data = await api.get<string[]>('getStoryNamesArray');
    setNames(Array.isArray(data) ? data : []);
    setStatuses({});
  };

  const loadAllChars = async () => {
    const data = await api.get<string[]>('getProfileNamesArray', { type: 'character' });
    setAllChars(Array.isArray(data) ? data : []);
  };

  const loadStory = async (name: string) => {
    try {
      const ev = await api.get<StoryEvent[]>('getStoryEvents', { storyName: name });
      setEvents(Array.isArray(ev) ? ev : []);
    } catch { setEvents([]); }
    try {
      const wt = await api.get<string>('getWriterStory', { storyName: name });
      setWriterText(typeof wt === 'string' ? wt : '');
    } catch { setWriterText(''); }
    try {
      const sc = await api.get<string[]>('getStoryCharacterNamesArray', { storyName: name });
      setStoryChars(Array.isArray(sc) ? sc : []);
    } catch { setStoryChars([]); }
    try {
      const info = await api.get<Record<string, StoryCharacterInfo>>('getStoryCharacters', { storyName: name });
      setStoryCharInfo(info && typeof info === 'object' ? info : {});
    } catch { setStoryCharInfo({}); }
  };

  useEffect(() => { loadNames(); loadAllChars(); }, []);
  useEffect(() => {
    const fromUrl = searchParams.get('select');
    if (fromUrl) setSelected(fromUrl);
  }, [searchParams]);
  useEffect(() => {
    if (selected) loadStory(selected);
    else { setEvents([]); setWriterText(''); setStoryChars([]); setStoryCharInfo({}); }
  }, [selected]);

  const refreshSelected = async () => {
    if (selected) await loadStory(selected);
    await loadNames();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const n = newName.trim();
      await api.call('createStory', { storyName: n });
      close();
      await loadNames();
      setSelected(n);
      setActiveTab('events');
      setNewName('');
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRemove = async (name: string) => {
    await api.call('removeStory', { storyName: name });
    if (selected === name) setSelected(null);
    await loadNames();
    notifications.show({ title: 'Удалено', message: `«${name}»`, color: 'gray' });
  };

  const handleRename = async () => {
    if (!renameTo.trim() || !selected) return;
    try {
      const n = renameTo.trim();
      await api.call('renameStory', { fromName: selected, toName: n });
      closeRename();
      await loadNames();
      setSelected(n);
      setRenameTo('');
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleCreateEvent = async () => {
    if (!newEventName.trim() || !selected) return;
    try {
      await api.call('createEvent', { storyName: selected, eventName: newEventName.trim() });
      closeEvent();
      setNewEventName('');
      await refreshSelected();
      setActiveTab('events');
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRemoveEvent = async (idx: number) => {
    if (!selected) return;
    if (!confirm(`Удалить событие «${events[idx]?.name}»?`)) return;
    await api.call('removeEvent', { storyName: selected, index: idx });
    await refreshSelected();
  };

  const handleCloneEvent = async (idx: number) => {
    if (!selected) return;
    await api.call('cloneEvent', { storyName: selected, index: idx });
    await refreshSelected();
  };

  const handleMergeEvents = async (idx: number) => {
    if (!selected) return;
    if (!confirm(`Слить «${events[idx]?.name}» со следующим «${events[idx + 1]?.name}»? Это необратимо.`)) return;
    await api.call('mergeEvents', { storyName: selected, index: idx });
    await refreshSelected();
  };

  const handleEventTextSave = async (idx: number, text: string) => {
    if (!selected) return;
    try {
      await api.call('setEventOriginProperty', { storyName: selected, index: idx, property: 'text', value: text });
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleEventTimeSave = async (idx: number, time: string) => {
    if (!selected) return;
    try {
      await api.call('setEventOriginProperty', { storyName: selected, index: idx, property: 'time', value: time });
      await refreshSelected();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleEventNameSave = async (idx: number, name: string) => {
    if (!selected || !name.trim() || name.trim() === events[idx]?.name) return;
    try {
      await api.call('setEventOriginProperty', { storyName: selected, index: idx, property: 'name', value: name.trim() });
      await refreshSelected();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleWriterSave = async () => {
    if (!selected || !permissions.canEditEntity(owners[selected])) return;
    await api.call('setWriterStory', { storyName: selected, value: writerText });
    notifications.show({ title: 'Сохранено', message: 'Мастерский текст обновлён', color: 'green' });
  };

  const handleAddStoryChar = async (charName: string) => {
    if (!selected) return;
    try {
      await api.call('addStoryCharacter', { storyName: selected, characterName: charName });
      await refreshSelected();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRemoveStoryChar = async (charName: string) => {
    if (!selected) return;
    if (!confirm(`Убрать «${charName}» из истории? Все адаптации будут удалены.`)) return;
    await api.call('removeStoryCharacter', { storyName: selected, characterName: charName });
    await refreshSelected();
  };

  const handleInventorySave = async (charName: string, inventory: string) => {
    if (!selected) return;
    const prev = storyCharInfo[charName]?.inventory || '';
    if (inventory === prev) return;
    try {
      await api.call('updateCharacterInventory', { storyName: selected, characterName: charName, inventory });
      setStoryCharInfo((m) => ({
        ...m,
        [charName]: { ...(m[charName] || { name: charName, activity: {} }), inventory } }));
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleActivityToggle = async (
    charName: string,
    activityType: 'active' | 'follower' | 'defensive' | 'passive',
    checked: boolean,
  ) => {
    if (!selected) return;
    try {
      await api.call('onChangeCharacterActivity', {
        storyName: selected, characterName: charName, activityType, checked });
      setStoryCharInfo((m) => {
        const cur = m[charName] || { name: charName, inventory: '', activity: {} };
        const activity = { ...(cur.activity || {}) };
        if (checked) activity[activityType] = true;
        else delete activity[activityType];
        return { ...m, [charName]: { ...cur, activity } };
      });
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleAddCharToEvent = async (evIdx: number, charName: string) => {
    if (!selected) return;
    try {
      await api.call('addCharacterToEvent', { storyName: selected, eventIndex: evIdx, characterName: charName });
      await refreshSelected();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRemoveCharFromEvent = async (evIdx: number, charName: string) => {
    if (!selected) return;
    const evName = events[evIdx]?.name || `событие #${evIdx + 1}`;
    const adapt = events[evIdx]?.characters?.[charName];
    const hasText = !!(adapt?.text || '').trim();
    const ok = confirm(
      hasText
        ? `Убрать «${charName}» из «${evName}»?\n\nТекст адаптации будет удалён безвозвратно.`
        : `Убрать «${charName}» из «${evName}»?`,
    );
    if (!ok) return;
    try {
      await api.call('removeCharacterFromEvent', { storyName: selected, eventIndex: evIdx, characterName: charName });
      await refreshSelected();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleAdaptationSave = async (evIdx: number, charName: string, text: string) => {
    if (!selected) return;
    try {
      await api.call('setEventAdaptationProperty', {
        storyName: selected, eventIndex: evIdx, characterName: charName, type: 'text', value: text });
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleAdaptationReady = async (evIdx: number, charName: string, ready: boolean) => {
    if (!selected) return;
    try {
      await api.call('setEventAdaptationProperty', {
        storyName: selected, eventIndex: evIdx, characterName: charName, type: 'ready', value: ready });
      await refreshSelected();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleMoveEvent = async (idx: number, direction: 'up' | 'down') => {
    if (!selected) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= events.length) return;
    try {
      await api.call('moveEvent', { storyName: selected, index: idx, newIndex: newIdx });
      await refreshSelected();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const sidebarItems = statusFilter === 'all'
    ? names
    : names.filter((n) => statuses[n] === statusFilter);

  const selectedStatus = selected ? statuses[selected] : undefined;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>{t('stories.title')}</Title>
        <Button onClick={open}>{t('stories.create')}</Button>
      </Group>

      {names.length === 0 ? (
        <EmptyState
          title="Нет историй"
          description="Создайте историю, добавьте события и персонажей."
          actionLabel={t('stories.create')}
          onAction={open}
        />
      ) : (
        <EntityPageLayout
          selected={selected}
          onMobileBack={() => setSelected(null)}
          emptySelectTitle="Выберите историю"
          emptySelectDescription="Слева — список со статусами. Справа — события, персонажи и присутствие."
          sidebar={{
            items: sidebarItems,
            selected,
            onSelect: (name) => {
              setSelected(name);
              setActiveTab('events');
            },
            filter,
            onFilterChange: setFilter,
            itemStatuses: statuses,
            statusLegend: true,
            owners,
            width: 280,
            footer: (
              <Group gap={4} px={4} wrap="wrap" mt={4}>
                {([
                  ['all', 'Все'],
                  ['wip', 'В работе'],
                  ['done', 'Готовые'],
                  ['empty', 'Пустые'],
                ] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    size="compact-xs"
                    variant={statusFilter === value ? 'filled' : 'subtle'}
                    onClick={() => setStatusFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </Group>
            ),
          }}
        >
          {selected && (
              <Stack gap="md" key={selected}>
                <PermissionHint reason={permissions.contentEditBlockedReason(owners[selected])} />
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm">
                    <Title order={4}>{selected}</Title>
                    <OwnerBadge owner={owners[selected]} />
                    {selectedStatus === 'done' && <Badge color="green">Завершена</Badge>}
                    {selectedStatus === 'wip' && <Badge color="orange">Незавершена</Badge>}
                    {selectedStatus === 'empty' && <Badge color="gray">Пустая</Badge>}
                  </Group>
                  <Button
                    size="xs"
                    variant="subtle"
                    disabled={!permissions.canEditEntity(owners[selected])}
                    onClick={() => { setRenameTo(selected); openRename(); }}
                  >
                    {t('common.rename')}
                  </Button>
                </Group>

                <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
                  <ScrollableTabsList>
                    <Tabs.Tab value="events">События ({events.length})</Tabs.Tab>
                    <Tabs.Tab value="characters">Персонажи ({storyChars.length})</Tabs.Tab>
                    <Tabs.Tab value="presence">Присутствие</Tabs.Tab>
                    <Tabs.Tab value="writer">Мастерский текст</Tabs.Tab>
                  </ScrollableTabsList>

                  <Tabs.Panel value="events" pt="md">
                    <Stack gap="md">
                      <Button
                        size="xs"
                        onClick={openEvent}
                        w="fit-content"
                        disabled={!permissions.canEditEntity(owners[selected])}
                      >
                        Добавить событие
                      </Button>

                      <Accordion>
                        {events.map((ev, evIdx) => {
                          const chars = Object.entries(ev.characters || {});
                          const readyCount = chars.filter(([, a]) => a.ready).length;
                          return (
                            <Accordion.Item key={`${selected}-ev-${evIdx}-${ev.name}`} value={`ev-${evIdx}`}>
                              <Accordion.Control>
                                <Group gap="xs">
                                  <ActionIcon size="xs" variant="subtle" disabled={evIdx === 0}
                                    onClick={(e) => { e.stopPropagation(); handleMoveEvent(evIdx, 'up'); }}>↑</ActionIcon>
                                  <ActionIcon size="xs" variant="subtle" disabled={evIdx === events.length - 1}
                                    onClick={(e) => { e.stopPropagation(); handleMoveEvent(evIdx, 'down'); }}>↓</ActionIcon>
                                  <Text fw={500}>{ev.name}</Text>
                                  {ev.time && <Badge size="sm" variant="light">{ev.time}</Badge>}
                                  <Badge size="sm" color="gray">{chars.length} перс.</Badge>
                                  <Badge size="sm" color={chars.length > 0 && readyCount === chars.length ? 'green' : 'gray'}>
                                    {readyCount}/{chars.length}
                                  </Badge>
                                </Group>
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Stack gap="sm">
                                  <TextInput
                                    key={`${selected}-evname-${evIdx}-${ev.name}`}
                                    label="Название"
                                    size="xs"
                                    defaultValue={ev.name}
                                    onBlur={(e) => handleEventNameSave(evIdx, e.currentTarget.value)}
                                  />
                                  <TextInput
                                    key={`${selected}-evtime-${evIdx}-${ev.time}`}
                                    label="Время"
                                    defaultValue={ev.time || ''}
                                    size="xs"
                                    onBlur={(e) => handleEventTimeSave(evIdx, e.currentTarget.value)}
                                  />
                                  <Textarea key={`${selected}-evtext-${evIdx}`}
                                    label="Описание события (origin)"
                                    defaultValue={ev.text || ''}
                                    rows={5}
                                    onBlur={(e) => handleEventTextSave(evIdx, e.currentTarget.value)}
                                  />

                                  <Text size="sm" fw={500}>Персонажи в событии:</Text>
                                  {chars.map(([charName, adaptation]) => (
                                    <Card key={`${selected}-${evIdx}-${charName}`} padding="xs" withBorder>
                                      <Group justify="space-between" mb={4}>
                                        <Anchor
                                          component={Link}
                                          to={`/characters?select=${encodeURIComponent(charName)}`}
                                          size="sm"
                                        >
                                          {charName}
                                        </Anchor>
                                        <Group gap={4}>
                                          <Badge
                                            size="xs"
                                            color={adaptation.ready ? 'green' : 'gray'}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAdaptationReady(evIdx, charName, !adaptation.ready)}
                                          >
                                            {adaptation.ready ? 'Готово' : 'Черновик'}
                                          </Badge>
                                          <ActionIcon
                                            size="xs"
                                            color="red"
                                            variant="subtle"
                                            onClick={() => handleRemoveCharFromEvent(evIdx, charName)}
                                          >
                                            ✕
                                          </ActionIcon>
                                        </Group>
                                      </Group>
                                      <Textarea key={`${selected}-${evIdx}-${charName}-text`}
                                        placeholder="Адаптация..."
                                        defaultValue={adaptation.text || ''}
                                        rows={4}
                                        onBlur={(e) => handleAdaptationSave(evIdx, charName, e.currentTarget.value)}
                                      />
                                    </Card>
                                  ))}

                                  <Select
                                    size="xs"
                                    placeholder="Добавить персонажа в событие..."
                                    data={storyChars.filter((c) => !Object.keys(ev.characters || {}).includes(c))}
                                    value={null}
                                    onChange={(v) => v && handleAddCharToEvent(evIdx, v)}
                                    searchable
                                    clearable
                                  />

                                  <Group justify="flex-end" gap="xs">
                                    <Button size="xs" variant="subtle" disabled={!permissions.canEditEntity(owners[selected])} onClick={() => handleCloneEvent(evIdx)}>Клонировать</Button>
                                    {evIdx < events.length - 1 && (
                                      <Button size="xs" variant="subtle" color="orange" disabled={!permissions.canEditEntity(owners[selected])} onClick={() => handleMergeEvents(evIdx)}>
                                        Слить со след.
                                      </Button>
                                    )}
                                    <Button size="xs" color="red" variant="subtle" disabled={!permissions.canEditEntity(owners[selected])} onClick={() => handleRemoveEvent(evIdx)}>
                                      Удалить
                                    </Button>
                                  </Group>
                                </Stack>
                              </Accordion.Panel>
                            </Accordion.Item>
                          );
                        })}
                      </Accordion>

                      {events.length === 0 && <Text c="dimmed" size="sm">Нет событий</Text>}
                    </Stack>
                  </Tabs.Panel>

                  <Tabs.Panel value="characters" pt="md">
                    <Stack gap="sm">
                      <Text size="sm" c="dimmed">
                        Персонажи истории: активность (А/С/З/П), инвентарь, участие в событиях.
                      </Text>
                      <Select
                        size="sm"
                        placeholder="Добавить персонажа в историю..."
                        data={allChars.filter((c) => !storyChars.includes(c))}
                        value={null}
                        onChange={(v) => v && handleAddStoryChar(v)}
                        searchable
                        clearable
                      />

                      {storyChars.length > 0 ? (
                        <HScroll minWidth={640}>
                          <Table striped withTableBorder>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Персонаж</Table.Th>
                                {ACTIVITY_TYPES.map((a) => (
                                  <Table.Th key={a.key} style={{ textAlign: 'center', width: 40 }}>
                                    <Tooltip label={a.label} withArrow>
                                      <Text size="xs" fw={600}>{a.short}</Text>
                                    </Tooltip>
                                  </Table.Th>
                                ))}
                                <Table.Th>Инвентарь</Table.Th>
                                <Table.Th>События</Table.Th>
                                <Table.Th />
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {storyChars.map((charName) => {
                                let total = 0;
                                let ready = 0;
                                for (const ev of events) {
                                  if (ev.characters?.[charName]) {
                                    total++;
                                    if (ev.characters[charName].ready) ready++;
                                  }
                                }
                                const info = storyCharInfo[charName];
                                const activity = info?.activity || {};
                                return (
                                  <Table.Tr key={charName}>
                                    <Table.Td>
                                      <Anchor
                                        component={Link}
                                        to={`/characters?select=${encodeURIComponent(charName)}`}
                                        size="sm"
                                      >
                                        {charName}
                                      </Anchor>
                                    </Table.Td>
                                    {ACTIVITY_TYPES.map((a) => (
                                      <Table.Td key={a.key} style={{ textAlign: 'center' }}>
                                        <Checkbox
                                          size="xs"
                                          aria-label={`${charName}: ${a.label}`}
                                          checked={!!activity[a.key]}
                                          onChange={(e) => handleActivityToggle(charName, a.key, e.currentTarget.checked)}
                                        />
                                      </Table.Td>
                                    ))}
                                    <Table.Td>
                                      <TextInput
                                        key={`${selected}-${charName}-inv-${info?.inventory ?? ''}`}
                                        size="xs"
                                        defaultValue={info?.inventory || ''}
                                        placeholder="Инвентарь..."
                                        onBlur={(e) => handleInventorySave(charName, e.currentTarget.value)}
                                      />
                                    </Table.Td>
                                    <Table.Td>
                                      <Badge color={ready === total && total > 0 ? 'green' : 'gray'} size="sm">
                                        {ready}/{total}
                                      </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                      <ActionIcon
                                        size="xs"
                                        color="red"
                                        variant="subtle"
                                        onClick={() => handleRemoveStoryChar(charName)}
                                      >
                                        ✕
                                      </ActionIcon>
                                    </Table.Td>
                                  </Table.Tr>
                                );
                              })}
                            </Table.Tbody>
                          </Table>
                        </HScroll>
                      ) : (
                        <Text size="sm" c="dimmed">Пока никого нет — добавьте персонажа выше.</Text>
                      )}
                    </Stack>
                  </Tabs.Panel>

                  <Tabs.Panel value="presence" pt="md">
                    <Stack gap="sm">
                      <Text size="sm" c="dimmed">
                        Строки — события, столбцы — персонажи. Галочка = персонаж в событии; зелёная = адаптация готова.
                      </Text>
                      {events.length > 0 && storyChars.length > 0 ? (
                        <HScroll minWidth={480}>
                          <Table striped withTableBorder stickyHeader>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th style={{ minWidth: 180, position: 'sticky', left: 0, zIndex: 2, background: 'var(--mantine-color-body)' }}>
                                  Событие
                                </Table.Th>
                                {storyChars.map((charName) => (
                                  <Table.Th key={charName} style={{ minWidth: 96, maxWidth: 140 }}>
                                    <Tooltip label={charName} withArrow>
                                      <Text size="xs" fw={500} lineClamp={2} style={{ whiteSpace: 'normal' }}>
                                        {charName}
                                      </Text>
                                    </Tooltip>
                                  </Table.Th>
                                ))}
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {events.map((ev, evIdx) => (
                                <Table.Tr key={`${ev.name}-${evIdx}`}>
                                  <Table.Td style={{ position: 'sticky', left: 0, zIndex: 1, background: 'var(--mantine-color-body)' }}>
                                    <Text size="sm" fw={500}>{ev.name}</Text>
                                    {ev.time && <Text size="xs" c="dimmed">{ev.time}</Text>}
                                  </Table.Td>
                                  {storyChars.map((charName) => {
                                    const inEvent = !!ev.characters?.[charName];
                                    const isReady = !!ev.characters?.[charName]?.ready;
                                    return (
                                      <Table.Td key={charName} style={{ textAlign: 'center' }}>
                                        <Checkbox
                                          size="sm"
                                          checked={inEvent}
                                          color={isReady ? 'green' : undefined}
                                          aria-label={`${charName} в «${ev.name}»`}
                                          onChange={() => {
                                            if (inEvent) handleRemoveCharFromEvent(evIdx, charName);
                                            else handleAddCharToEvent(evIdx, charName);
                                          }}
                                        />
                                      </Table.Td>
                                    );
                                  })}
                                </Table.Tr>
                              ))}
                            </Table.Tbody>
                          </Table>
                        </HScroll>
                      ) : (
                        <Text c="dimmed" size="sm">
                          Добавьте персонажей (вкладка «Персонажи») и события (вкладка «События»).
                        </Text>
                      )}
                    </Stack>
                  </Tabs.Panel>

                  <Tabs.Panel value="writer" pt="md">
                    <Stack>
                      <Textarea value={writerText}
                        onChange={(e) => setWriterText(e.currentTarget.value)}
                        rows={12}
                        readOnly={!permissions.canEditEntity(owners[selected])}
                      />
                      <Group justify="flex-end">
                        <Button
                          onClick={handleWriterSave}
                          disabled={!permissions.canEditEntity(owners[selected])}
                        >
                          {t('common.save')}
                        </Button>
                      </Group>
                    </Stack>
                  </Tabs.Panel>
                </Tabs>

                <DeleteEntityButton
                  entityLabel="историю"
                  entityName={selected}
                  disabled={!permissions.canEditEntity(owners[selected])}
                  onConfirm={() => handleRemove(selected)}
                />
              </Stack>
          )}
        </EntityPageLayout>
      )}

      <Modal opened={opened} onClose={close} title={t('stories.create')}>
        <Stack>
          <TextInput
            label={t('stories.namePrompt')}
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={eventOpened} onClose={closeEvent} title="Создать событие">
        <Stack>
          <TextInput
            label="Название события"
            value={newEventName}
            onChange={(e) => setNewEventName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateEvent()}
            autoFocus
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeEvent}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateEvent}>{t('common.create')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={renameOpened} onClose={closeRename} title={t('common.rename')}>
        <Stack>
          <TextInput
            label="Новое название"
            value={renameTo}
            onChange={(e) => setRenameTo(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeRename}>{t('common.cancel')}</Button>
            <Button onClick={handleRename}>{t('common.rename')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default observer(StoriesPage);

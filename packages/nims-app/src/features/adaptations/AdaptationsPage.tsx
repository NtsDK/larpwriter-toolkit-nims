import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Title, Stack, Card, Text, Badge, Group, TextInput, Checkbox, Anchor, UnstyledButton, SegmentedControl,
} from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { EntityPageLayout } from '@/components/EntityPageLayout';
import { EmptyState } from '@/components/EmptyState';
import { OwnerBadge } from '@/components/OwnerBadge';
import { useEntityOwners } from '@/hooks/useEntityOwners';
import { PermissionHint } from '@/components/PermissionHint';
import { useIsMobile } from '@/hooks/useIsMobile';

interface StoryEvent {
  name: string;
  text: string;
  time: string;
  characters: Record<string, { text: string; ready: boolean; time?: string }>;
}

function AdaptationsPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [storyNames, setStoryNames] = useState<string[]>([]);
  const { owners } = useEntityOwners('story', storyNames.length);
  const [storyChars, setStoryChars] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState<string | null>(searchParams.get('story'));
  const [selectedChar, setSelectedChar] = useState<string | null>(searchParams.get('character'));
  const [showOnlyUnfinished, setShowOnlyUnfinished] = useState(false);
  const [events, setEvents] = useState<StoryEvent[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<string[]>('getStoryNamesArray').then((names) => {
      setStoryNames(Array.isArray(names) ? names : []);
    });
  }, []);

  useEffect(() => {
    if (!selectedStory) {
      setEvents([]);
      setStoryChars([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [ev, sc] = await Promise.all([
          api.get<StoryEvent[]>('getStoryEvents', { storyName: selectedStory }),
          api.get<string[]>('getStoryCharacterNamesArray', { storyName: selectedStory }),
        ]);
        if (cancelled) return;
        setEvents(Array.isArray(ev) ? ev : []);
        const chars = Array.isArray(sc) ? sc : [];
        setStoryChars(chars);
        if (selectedChar && !chars.includes(selectedChar)) {
          setSelectedChar(null);
        }
      } catch (e: any) {
        if (cancelled) return;
        notifications.show({ title: 'Ошибка', message: e.message || 'Не удалось загрузить историю', color: 'red' });
        setEvents([]);
        setStoryChars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedStory]);

  const canEditStory = selectedStory ? permissions.canEditEntity(owners[selectedStory]) : false;

  const handleSave = async (evIdx: number, charName: string, text: string) => {
    if (!selectedStory || !canEditStory) return;
    try {
      await api.call('setEventAdaptationProperty', {
        storyName: selectedStory, eventIndex: evIdx, characterName: charName, type: 'text', value: text });
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleTimeSave = async (evIdx: number, charName: string, time: string) => {
    if (!selectedStory || !canEditStory) return;
    try {
      await api.call('setEventAdaptationProperty', {
        storyName: selectedStory, eventIndex: evIdx, characterName: charName, type: 'time', value: time });
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleToggleReady = async (evIdx: number, charName: string, ready: boolean) => {
    if (!selectedStory || !canEditStory) return;
    try {
      await api.call('setEventAdaptationProperty', {
        storyName: selectedStory, eventIndex: evIdx, characterName: charName, type: 'ready', value: ready });
      const ev = await api.get<StoryEvent[]>('getStoryEvents', { storyName: selectedStory });
      setEvents(Array.isArray(ev) ? ev : []);
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const unfinishedByChar: Record<string, number> = {};
  for (const name of storyChars) {
    unfinishedByChar[name] = events.filter((ev) => {
      const a = ev.characters?.[name];
      return a && !a.ready;
    }).length;
  }

  const filteredEvents = events
    .map((ev, idx) => ({ ...ev, _idx: idx }))
    .filter((ev) => {
      if (selectedChar && !(ev.characters && selectedChar in ev.characters)) return false;
      if (showOnlyUnfinished) {
        const chars = Object.entries(ev.characters || {});
        if (selectedChar) {
          if (ev.characters?.[selectedChar]?.ready) return false;
        } else if (chars.length > 0 && chars.every(([, a]) => a.ready)) {
          return false;
        }
      }
      return true;
    });

  return (
    <Stack gap="lg">
      <Title order={2}>{t('adaptations.title')}</Title>

      {storyNames.length === 0 ? (
        <EmptyState
          title="Нет историй"
          description="Сначала создайте историю и события — адаптации пишутся по событиям."
        />
      ) : (
        <EntityPageLayout
          selected={selectedStory}
          loading={loading}
          onMobileBack={() => { setSelectedStory(null); setSelectedChar(null); }}
          emptySelectTitle="Выберите историю"
          emptySelectDescription="Слева — истории. Справа — адаптации событий по персонажам."
          sidebar={{
            items: storyNames,
            selected: selectedStory,
            onSelect: (name) => {
              setSelectedStory(name);
              setSelectedChar(null);
            },
            filter,
            onFilterChange: setFilter,
            owners }}
        >
          {selectedStory && (
            <Stack gap="md" key={selectedStory}>
              <PermissionHint reason={permissions.contentEditBlockedReason(owners[selectedStory])} />
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" align="center">
                  <Title order={4}>{selectedStory}</Title>
                  <OwnerBadge owner={owners[selectedStory]} />
                </Group>
                <Checkbox
                  label="Только незавершённые"
                  checked={showOnlyUnfinished}
                  onChange={(e) => setShowOnlyUnfinished(e.currentTarget.checked)}
                />
              </Group>

              {storyChars.length > 0 && (
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">Персонаж</Text>
                  <Group gap="xs">
                    <UnstyledButton
                      onClick={() => setSelectedChar(null)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid var(--mantine-color-default-border)',
                        background: !selectedChar ? 'var(--mantine-color-blue-light)' : undefined,
                        fontWeight: !selectedChar ? 600 : 400,
                        fontSize: 13 }}
                    >
                      Все
                    </UnstyledButton>
                    {storyChars.map((name) => {
                      const active = selectedChar === name;
                      const left = unfinishedByChar[name] || 0;
                      return (
                        <UnstyledButton
                          key={name}
                          onClick={() => setSelectedChar(active ? null : name)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid var(--mantine-color-default-border)',
                            background: active ? 'var(--mantine-color-blue-light)' : undefined,
                            fontWeight: active ? 600 : 400,
                            fontSize: 13 }}
                        >
                          {name}
                          {left > 0 && (
                            <Text span size="xs" c="orange" ml={6}>{left}</Text>
                          )}
                        </UnstyledButton>
                      );
                    })}
                  </Group>
                </Stack>
              )}

              {filteredEvents.map((event) => (
                <Card key={event._idx} padding="sm" withBorder>
                  <Group mb="xs">
                    <Text fw={600}>{event.name}</Text>
                    {event.time && <Badge variant="light" size="sm">{event.time}</Badge>}
                  </Group>
                  {event.text && (
                    <Text size="sm" c="dimmed" mb="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {event.text}
                    </Text>
                  )}

                  <Stack gap="xs">
                    {Object.entries(event.characters || {})
                      .filter(([name]) => !selectedChar || name === selectedChar)
                      .map(([charName, adaptation]) => (
                        <Card key={`${event._idx}-${charName}`} padding="sm" withBorder>
                          <Stack gap="xs" mb={4}>
                            <Anchor
                              component={Link}
                              to={`/characters?select=${encodeURIComponent(charName)}`}
                              size="sm"
                              fw={500}
                            >
                              {charName}
                            </Anchor>
                            <SegmentedControl
                              size={isMobile ? 'md' : 'xs'}
                              fullWidth={isMobile}
                              value={adaptation.ready ? 'ready' : 'draft'}
                              onChange={(v) => handleToggleReady(event._idx, charName, v === 'ready')}
                              data={[
                                { value: 'draft', label: 'Черновик' },
                                { value: 'ready', label: 'Готово' },
                              ]}
                              color={adaptation.ready ? 'green' : undefined}
                              disabled={!canEditStory}
                            />
                          </Stack>
                          <Textarea key={`${selectedStory}-${event._idx}-${charName}-text`}
                            defaultValue={adaptation.text || ''}
                            rows={isMobile ? 10 : 5}
                            placeholder="Текст адаптации..."
                            readOnly={!canEditStory}
                            onBlur={(e) => handleSave(event._idx, charName, e.currentTarget.value)}
                          />
                          <TextInput
                            key={`${selectedStory}-${event._idx}-${charName}-time`}
                            size="xs"
                            label="Субъективное время"
                            mt={4}
                            defaultValue={adaptation.time || ''}
                            placeholder="напр. утро, до событий..."
                            readOnly={!canEditStory}
                            onBlur={(e) => handleTimeSave(event._idx, charName, e.currentTarget.value)}
                          />
                        </Card>
                      ))}
                  </Stack>

                  {Object.keys(event.characters || {}).length === 0 && (
                    <Text size="xs" c="dimmed">Нет персонажей в этом событии</Text>
                  )}
                </Card>
              ))}

              {filteredEvents.length === 0 && events.length > 0 && (
                <Text c="dimmed" size="sm">Все адаптации завершены или не соответствуют фильтру</Text>
              )}
              {events.length === 0 && (
                <Text c="dimmed" size="sm">Нет событий в этой истории</Text>
              )}
            </Stack>
          )}
        </EntityPageLayout>
      )}
    </Stack>
  );
}

export default observer(AdaptationsPage);

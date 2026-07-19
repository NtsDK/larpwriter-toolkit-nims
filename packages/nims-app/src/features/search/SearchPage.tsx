import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import {
  Title, Stack, TextInput, Button, Card, Text, MultiSelect, Group, Accordion,
  Badge, Anchor, Checkbox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

const TEXT_TYPES = [
  { value: 'writerStory', label: 'Мастерские тексты' },
  { value: 'eventOrigins', label: 'Описания событий' },
  { value: 'eventAdaptations', label: 'Адаптации' },
  { value: 'characterProfiles', label: 'Профили персонажей' },
  { value: 'playerProfiles', label: 'Профили игроков' },
  { value: 'relations', label: 'Отношения' },
  { value: 'groups', label: 'Группы' },
];

const TYPE_LABELS = Object.fromEntries(TEXT_TYPES.map((t) => [t.value, t.label]));

interface SearchHit {
  name: string;
  type: string;
  text: string;
}

interface SearchGroup {
  textType: string;
  result: SearchHit[];
}

function entityLink(textType: string, name: string): { to: string; label: string } | null {
  const head = name.split('/')[0]?.trim();
  if (!head) return null;

  switch (textType) {
    case 'writerStory':
    case 'eventOrigins':
    case 'eventAdaptations':
      return { to: `/stories?select=${encodeURIComponent(head)}`, label: head };
    case 'characterProfiles':
      return { to: `/characters?select=${encodeURIComponent(head)}`, label: head };
    case 'playerProfiles':
      return { to: `/players?select=${encodeURIComponent(head)}`, label: head };
    case 'relations':
      return { to: `/relations?select=${encodeURIComponent(head)}`, label: head };
    case 'groups':
      return { to: `/groups?select=${encodeURIComponent(head)}`, label: head };
    default:
      return null;
  }
}

function highlightSnippet(text: string, query: string, caseSensitive: boolean): string {
  const raw = text || '';
  if (!query.trim()) return raw.slice(0, 500);
  const idx = caseSensitive
    ? raw.indexOf(query)
    : raw.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return raw.slice(0, 500);
  const start = Math.max(0, idx - 80);
  const end = Math.min(raw.length, idx + query.length + 160);
  const snippet = (start > 0 ? '…' : '') + raw.slice(start, end) + (end < raw.length ? '…' : '');
  return snippet;
}

function SearchPage() {
  const { t } = useTranslation();
  const { api } = useRootStore();
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<string[]>(TEXT_TYPES.map((x) => x.value));
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [groups, setGroups] = useState<SearchGroup[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (types.length === 0) {
      notifications.show({ title: 'Поиск', message: 'Выберите хотя бы один тип текста', color: 'yellow' });
      return;
    }
    setLoading(true);
    try {
      const data = await api.get<SearchGroup[]>('getTexts', {
        searchStr: query.trim(),
        textTypes: types,
        caseSensitive,
      });
      setGroups(Array.isArray(data) ? data : []);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message || 'Поиск не удался', color: 'red' });
      setGroups(null);
    } finally {
      setLoading(false);
    }
  };

  const nonEmpty = (groups || []).filter((g) => g.result?.length > 0);
  const totalHits = nonEmpty.reduce((n, g) => n + g.result.length, 0);

  return (
    <Stack gap="lg">
      <Title order={2}>{t('search.title')}</Title>

      <Card shadow="sm" padding="md" withBorder>
        <Stack>
          <TextInput
            label="Поиск"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Введите текст для поиска..."
            autoFocus
          />
          <MultiSelect
            label="Где искать"
            data={TEXT_TYPES}
            value={types}
            onChange={setTypes}
            searchable
            clearable
          />
          <Checkbox
            label="Учитывать регистр"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.currentTarget.checked)}
          />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {groups ? `Найдено: ${totalHits}` : ' '}
            </Text>
            <Button onClick={handleSearch} disabled={!query.trim()} loading={loading}>
              Найти
            </Button>
          </Group>
        </Stack>
      </Card>

      {groups && totalHits === 0 && (
        <Text c="dimmed">Ничего не найдено</Text>
      )}

      {nonEmpty.length > 0 && (
        <Accordion multiple defaultValue={nonEmpty.map((g) => g.textType)}>
          {nonEmpty.map((group) => (
            <Accordion.Item key={group.textType} value={group.textType}>
              <Accordion.Control>
                <Group gap="sm">
                  <Text size="sm" fw={500}>{TYPE_LABELS[group.textType] || group.textType}</Text>
                  <Badge size="sm" variant="light">{group.result.length}</Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  {group.result.map((hit, i) => {
                    const link = entityLink(group.textType, hit.name);
                    return (
                      <Card key={`${hit.name}-${i}`} withBorder padding="xs">
                        <Group justify="space-between" mb={4} wrap="nowrap">
                          {link ? (
                            <Anchor component={Link} to={link.to} size="sm" fw={500}>
                              {hit.name}
                            </Anchor>
                          ) : (
                            <Text size="sm" fw={500}>{hit.name}</Text>
                          )}
                          <Badge size="xs" variant="outline">{hit.type}</Badge>
                        </Group>
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                          {highlightSnippet(hit.text, query.trim(), caseSensitive)}
                        </Text>
                      </Card>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Stack>
  );
}

export default observer(SearchPage);

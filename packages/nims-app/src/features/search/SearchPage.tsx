import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, TextInput, Button, Card, Text, MultiSelect, Group, Accordion } from '@mantine/core';
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

function SearchPage() {
  const { t } = useTranslation();
  const { api } = useRootStore();
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<string[]>(['writerStory', 'eventOrigins', 'eventAdaptations']);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const data = await api.get('getTexts', {
      searchStr: query,
      textTypes: types,
      caseSensitive: false,
    });
    setResults(data);
  };

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
          />
          <MultiSelect
            label="Где искать"
            data={TEXT_TYPES}
            value={types}
            onChange={setTypes}
          />
          <Group justify="flex-end">
            <Button onClick={handleSearch} disabled={!query.trim()}>Найти</Button>
          </Group>
        </Stack>
      </Card>

      {results && Array.isArray(results) && results.length > 0 && (
        <Accordion>
          {results.map((item: any, i: number) => (
            <Accordion.Item key={i} value={String(i)}>
              <Accordion.Control>
                <Text size="sm" fw={500}>{item.entityName || item.storyName || `Результат ${i + 1}`}</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
                  {item.text?.slice(0, 500)}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {results && Array.isArray(results) && results.length === 0 && (
        <Text c="dimmed">Ничего не найдено</Text>
      )}
    </Stack>
  );
}

export default observer(SearchPage);

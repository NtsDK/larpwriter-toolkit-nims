import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Select, Card, Text, Badge, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function AdaptationsPage() {
  const { t } = useTranslation();
  const { stories, api } = useRootStore();
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<any>(null);

  useEffect(() => { stories.loadNames(); }, []);

  useEffect(() => {
    if (selectedStory) {
      api.get('getStory', { storyName: selectedStory }).then(setStoryData);
    }
  }, [selectedStory]);

  return (
    <Stack gap="lg">
      <Title order={2}>{t('adaptations.title')}</Title>

      <Select
        label="Выберите сюжет"
        data={stories.names}
        value={selectedStory}
        onChange={setSelectedStory}
        searchable
      />

      {storyData && storyData.events && storyData.events.map((event: any, i: number) => (
        <Card key={i} shadow="xs" padding="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={600}>{event.name}</Text>
            {event.time && <Badge variant="light">{event.time}</Badge>}
          </Group>
          {Object.entries(event.characters || {}).map(([charName, adaptation]: [string, any]) => (
            <Card key={charName} padding="xs" ml="md" mt="xs" withBorder>
              <Group justify="space-between">
                <Text size="sm">{charName}</Text>
                <Badge color={adaptation.ready ? 'green' : 'gray'} size="sm">
                  {adaptation.ready ? 'Готово' : 'Не готово'}
                </Badge>
              </Group>
              {adaptation.text && <Text size="xs" c="dimmed" mt={4}>{adaptation.text.slice(0, 100)}...</Text>}
            </Card>
          ))}
        </Card>
      ))}

      {!selectedStory && <Text c="dimmed">{t('common.noData')}</Text>}
    </Stack>
  );
}

export default observer(AdaptationsPage);

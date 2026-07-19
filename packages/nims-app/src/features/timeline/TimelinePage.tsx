import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Card, Text, Badge, Group, Timeline as MTimeline } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function TimelinePage() {
  const { t } = useTranslation();
  const { api, stories } = useRootStore();
  const [events, setEvents] = useState<Array<{ storyName: string; name: string; time: string }>>([]);

  useEffect(() => {
    stories.loadNames().then(async () => {
      const allEvents: Array<{ storyName: string; name: string; time: string }> = [];
      for (const storyName of stories.names) {
        try {
          const storyEvents = await api.get<Array<{ name: string; time: string }>>('getStoryEvents', { storyName });
          if (Array.isArray(storyEvents)) {
            for (const ev of storyEvents) {
              allEvents.push({ storyName, name: ev.name, time: ev.time || '' });
            }
          }
        } catch { /* skip */ }
      }
      allEvents.sort((a, b) => a.time.localeCompare(b.time));
      setEvents(allEvents);
    });
  }, []);

  return (
    <Stack gap="lg">
      <Title order={2}>{t('timeline.title')}</Title>

      {events.length > 0 ? (
        <MTimeline active={events.length - 1} bulletSize={24}>
          {events.map((ev, i) => (
            <MTimeline.Item key={i} title={ev.name}>
              <Group gap="xs">
                <Badge size="sm" variant="light">{ev.storyName}</Badge>
                {ev.time && <Text size="xs" c="dimmed">{ev.time}</Text>}
              </Group>
            </MTimeline.Item>
          ))}
        </MTimeline>
      ) : (
        <Text c="dimmed">{t('common.noData')}</Text>
      )}
    </Stack>
  );
}

export default observer(TimelinePage);

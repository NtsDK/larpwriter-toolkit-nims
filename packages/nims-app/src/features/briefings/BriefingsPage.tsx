import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Card, Text, MultiSelect, Button, Accordion } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function BriefingsPage() {
  const { t } = useTranslation();
  const { characters, stories, api } = useRootStore();
  const [selChars, setSelChars] = useState<string[]>([]);
  const [briefingData, setBriefingData] = useState<any>(null);

  useEffect(() => {
    characters.loadNames();
    stories.loadNames();
  }, []);

  const handleLoad = async () => {
    const data = await api.get('getBriefingData', {
      selCharacters: selChars.length ? selChars : null,
      selStories: null,
      exportOnlyFinishedStories: false,
    });
    setBriefingData(data);
  };

  return (
    <Stack gap="lg">
      <Title order={2}>{t('briefings.title')}</Title>

      <Card shadow="sm" padding="md" withBorder>
        <Stack>
          <MultiSelect
            label="Персонажи"
            data={characters.names}
            value={selChars}
            onChange={setSelChars}
            searchable
            clearable
            placeholder="Все персонажи"
          />
          <Button onClick={handleLoad}>Загрузить вводные</Button>
        </Stack>
      </Card>

      {briefingData && briefingData.briefings && (
        <Accordion>
          {briefingData.briefings.map((b: any) => (
            <Accordion.Item key={b.charName} value={b.charName}>
              <Accordion.Control>{b.charName}</Accordion.Control>
              <Accordion.Panel>
                {b.inventory && <Text size="sm"><b>Снаряжение:</b> {b.inventory}</Text>}
                {b.storiesInfo?.map((s: any) => (
                  <Card key={s.storyName} padding="xs" mt="xs" withBorder>
                    <Text fw={500} size="sm">{s.storyName}</Text>
                    {s.eventsInfo?.map((ev: any, i: number) => (
                      <Text key={i} size="xs" c="dimmed" mt={2}>
                        {ev.displayTime || ev.time} — {ev.eventName}: {ev.text?.slice(0, 80)}
                      </Text>
                    ))}
                  </Card>
                ))}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Stack>
  );
}

export default observer(BriefingsPage);

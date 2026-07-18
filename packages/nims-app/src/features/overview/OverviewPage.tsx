import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Title, Text, SimpleGrid, Stack, TextInput, Textarea, Skeleton, Group, Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function OverviewPage() {
  const { t } = useTranslation();
  const { meta, characters, stories, groups } = useRootStore();

  useEffect(() => {
    meta.load();
    characters.loadNames();
    stories.loadNames();
    groups.loadNames();
  }, []);

  if (meta.loading) {
    return <Stack gap="md"><Skeleton height={40} /><Skeleton height={200} /></Stack>;
  }

  const m = meta.meta;

  return (
    <Stack gap="lg">
      <Title order={2}>{t('overview.title')}</Title>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Text fw={500}>{t('overview.characters')}</Text>
            <Badge size="xl" variant="filled">{characters.names.length}</Badge>
          </Group>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Text fw={500}>{t('overview.stories')}</Text>
            <Badge size="xl" variant="filled">{stories.names.length}</Badge>
          </Group>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Text fw={500}>{t('overview.groups')}</Text>
            <Badge size="xl" variant="filled">{groups.names.length}</Badge>
          </Group>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <TextInput
            label={t('overview.gameName')}
            value={m?.name || ''}
            onBlur={(e) => meta.setString('name', e.currentTarget.value)}
          />
          <Textarea
            label={t('overview.description')}
            value={m?.description || ''}
            autosize
            minRows={3}
            onBlur={(e) => meta.setString('description', e.currentTarget.value)}
          />
          <TextInput
            label={t('overview.date')}
            value={m?.date || ''}
            onBlur={(e) => meta.setDate('date', e.currentTarget.value)}
          />
          <TextInput
            label={t('overview.preGameDate')}
            value={m?.preGameDate || ''}
            onBlur={(e) => meta.setDate('preGameDate', e.currentTarget.value)}
          />
        </Stack>
      </Card>
    </Stack>
  );
}

export default observer(OverviewPage);

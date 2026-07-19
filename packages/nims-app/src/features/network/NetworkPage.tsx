import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Text, Card } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function NetworkPage() {
  const { t } = useTranslation();
  const { relations, characters } = useRootStore();

  useEffect(() => {
    relations.load();
    characters.loadNames();
  }, []);

  return (
    <Stack gap="lg">
      <Title order={2}>{t('network.title')}</Title>

      <Card shadow="sm" padding="md" withBorder>
        <Text fw={500} mb="sm">Узлы: {characters.names.length}</Text>
        <Text fw={500}>Связи: {relations.relations.length}</Text>
      </Card>

      {relations.relations.length > 0 ? (
        <Card shadow="sm" padding="md" withBorder>
          <Text size="sm" c="dimmed" mb="sm">Граф связей (визуализация d3 будет добавлена)</Text>
          {relations.relations.map((rel, i) => (
            <Text key={i} size="sm">{rel.starter} ↔ {rel.ender}</Text>
          ))}
        </Card>
      ) : (
        <Text c="dimmed">{t('common.noData')}</Text>
      )}
    </Stack>
  );
}

export default observer(NetworkPage);

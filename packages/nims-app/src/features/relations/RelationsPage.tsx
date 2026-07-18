import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Button, Select, Group, Card, Text, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function RelationsPage() {
  const { t } = useTranslation();
  const { relations, characters } = useRootStore();
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  useEffect(() => {
    relations.load();
    characters.loadNames();
  }, []);

  const handleCreate = async () => {
    if (from && to && from !== to) {
      await relations.create(from, to);
      setFrom(null);
      setTo(null);
    }
  };

  return (
    <Stack gap="lg">
      <Title order={2}>{t('relations.title')}</Title>

      <Card shadow="sm" padding="md" withBorder>
        <Group align="end">
          <Select
            label="От"
            data={characters.names}
            value={from}
            onChange={setFrom}
            searchable
          />
          <Select
            label="К"
            data={characters.names.filter(n => n !== from)}
            value={to}
            onChange={setTo}
            searchable
          />
          <Button onClick={handleCreate} disabled={!from || !to}>
            {t('relations.create')}
          </Button>
        </Group>
      </Card>

      {relations.relations.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Персонаж 1</Table.Th>
              <Table.Th>Персонаж 2</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {relations.relations.map((rel, i) => (
              <Table.Tr key={i}>
                <Table.Td>{rel.starter}</Table.Td>
                <Table.Td>{rel.ender}</Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    color="red"
                    variant="subtle"
                    onClick={() => relations.remove(rel.starter, rel.ender)}
                  >
                    ✕
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text c="dimmed">{t('common.noData')}</Text>
      )}
    </Stack>
  );
}

export default observer(RelationsPage);

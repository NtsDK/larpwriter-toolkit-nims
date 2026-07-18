import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Button, TextInput, Group, List, ActionIcon, Modal, Card, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function CharactersPage() {
  const { t } = useTranslation();
  const { characters } = useRootStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [newName, setNewName] = useState('');

  useEffect(() => { characters.loadNames(); }, []);

  const handleCreate = async () => {
    if (newName.trim()) {
      await characters.create(newName.trim());
      setNewName('');
      close();
    }
  };

  const handleRemove = async (name: string) => {
    if (confirm(`Удалить персонажа "${name}"?`)) {
      await characters.remove(name);
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>{t('characters.title')}</Title>
        <Button onClick={open}>{t('characters.create')}</Button>
      </Group>

      <List spacing="xs" size="sm">
        {characters.names.map((name) => (
          <Card key={name} shadow="xs" padding="sm" radius="sm" withBorder mb="xs">
            <Group justify="space-between">
              <Text fw={500}>{name}</Text>
              <ActionIcon color="red" variant="subtle" onClick={() => handleRemove(name)}>
                ✕
              </ActionIcon>
            </Group>
          </Card>
        ))}
      </List>

      {characters.names.length === 0 && <Text c="dimmed">{t('common.noData')}</Text>}

      <Modal opened={opened} onClose={close} title={t('characters.create')}>
        <Stack>
          <TextInput
            label={t('characters.namePrompt')}
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
    </Stack>
  );
}

export default observer(CharactersPage);

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Button, TextInput, Group, ActionIcon, Modal, Card, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function GroupsPage() {
  const { t } = useTranslation();
  const { groups } = useRootStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [newName, setNewName] = useState('');

  useEffect(() => { groups.loadNames(); }, []);

  const handleCreate = async () => {
    if (newName.trim()) {
      await groups.create(newName.trim());
      setNewName('');
      close();
    }
  };

  const handleRemove = async (name: string) => {
    if (confirm(`Удалить группу "${name}"?`)) {
      await groups.remove(name);
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>{t('groups.title')}</Title>
        <Button onClick={open}>{t('groups.create')}</Button>
      </Group>

      {groups.names.map((name) => (
        <Card key={name} shadow="xs" padding="sm" radius="sm" withBorder>
          <Group justify="space-between">
            <Text fw={500}>{name}</Text>
            <ActionIcon color="red" variant="subtle" onClick={() => handleRemove(name)}>
              ✕
            </ActionIcon>
          </Group>
        </Card>
      ))}

      {groups.names.length === 0 && <Text c="dimmed">{t('common.noData')}</Text>}

      <Modal opened={opened} onClose={close} title={t('groups.create')}>
        <Stack>
          <TextInput
            label={t('groups.namePrompt')}
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

export default observer(GroupsPage);

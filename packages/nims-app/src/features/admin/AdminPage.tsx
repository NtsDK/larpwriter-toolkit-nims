import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Title, Stack, Card, Text, Table, Button, TextInput, Group, Modal, Badge, CopyButton, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';

function AdminPage() {
  const { t } = useTranslation();
  const { api } = useRootStore();
  const [mgmt, setMgmt] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');

  const loadMgmt = async () => {
    const data = await api.get('getManagementInfo');
    setMgmt(data);
  };

  useEffect(() => { loadMgmt(); }, []);

  const handleCreate = async () => {
    if (newName.trim() && newPass.trim()) {
      await api.call('createOrganizer', { name: newName.trim(), password: newPass.trim() });
      setNewName('');
      setNewPass('');
      close();
      await loadMgmt();
    }
  };

  return (
    <Stack gap="lg">
      <Title order={2}>{t('admin.title')}</Title>

      <Card shadow="sm" padding="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={600}>Организаторы</Text>
          <Button size="xs" onClick={open}>Добавить</Button>
        </Group>

        {mgmt?.usersInfo && Object.keys(mgmt.usersInfo).length > 0 ? (
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Имя</Table.Th>
                <Table.Th>Роль</Table.Th>
                <Table.Th>Персонажи</Table.Th>
                <Table.Th>Сюжеты</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(mgmt.usersInfo).map(([name, info]: [string, any]) => (
                <Table.Tr key={name}>
                  <Table.Td>
                    {name}
                    {mgmt.admin === name && <Badge ml="xs" size="xs" color="red">admin</Badge>}
                    {mgmt.editor === name && <Badge ml="xs" size="xs" color="blue">editor</Badge>}
                  </Table.Td>
                  <Table.Td>organizer</Table.Td>
                  <Table.Td>{info.characters?.length || 0}</Table.Td>
                  <Table.Td>{info.stories?.length || 0}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed">{t('common.noData')}</Text>
        )}
      </Card>

      <Card shadow="sm" padding="md" withBorder>
        <Text fw={600} mb="sm">MCP Token</Text>
        <Text size="sm" c="dimmed">
          Для получения токена MCP перейдите на <a href="/mcp/auth" target="_blank">/mcp/auth</a>
        </Text>
      </Card>

      <Modal opened={opened} onClose={close} title="Создать организатора">
        <Stack>
          <TextInput label="Логин" value={newName} onChange={(e) => setNewName(e.currentTarget.value)} autoFocus />
          <TextInput label="Пароль" type="password" value={newPass} onChange={(e) => setNewPass(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default observer(AdminPage);

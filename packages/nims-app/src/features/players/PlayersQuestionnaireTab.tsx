import { useEffect, useState } from 'react';
import {
  Stack, Text, Table, Anchor, Badge, Group, Alert, Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRootStore } from '@/stores';
import { HScroll } from '@/components/HScroll';
import { ProfileFieldsForm } from '@/components/ProfileFieldsForm';
import { PermissionHint } from '@/components/PermissionHint';
import { useEntityOwners } from '@/hooks/useEntityOwners';
import { ProfileStructureEditor } from '../characters/ProfileStructureEditor';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';

function filledCount(profile: Record<string, unknown>, structure: { name: string; type: string }[]): number {
  let n = 0;
  for (const field of structure) {
    const v = profile[field.name];
    if (field.type === 'checkbox') {
      if (v === true) n += 1;
      continue;
    }
    if (v !== undefined && v !== null && String(v).trim() !== '' && v !== 0) n += 1;
  }
  return n;
}

interface PlayersQuestionnaireTabProps {
  playerNames: string[];
  canAdmin: boolean;
  onSelectProfile: (name: string) => void;
}

export function PlayersQuestionnaireTab({
  playerNames,
  canAdmin,
  onSelectProfile,
}: PlayersQuestionnaireTabProps) {
  const { api, permissions } = useRootStore();
  const { owners } = useEntityOwners('player', playerNames.length);
  const [structure, setStructure] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Record<string, Record<string, unknown>>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [innerTab, setInnerTab] = useState<string | null>('answers');
  const canEditSelected = selected ? permissions.canEditEntity(owners[selected]) : false;
  const editBlockedReason = selected ? permissions.contentEditBlockedReason(owners[selected]) : null;

  const load = async () => {
    setLoading(true);
    try {
      const [struct, all] = await Promise.all([
        api.get<any[]>('getProfileStructure', { type: 'questionnaire' }),
        api.get<Record<string, Record<string, unknown>>>('getAllProfiles', { type: 'questionnaire' }),
      ]);
      setStructure(Array.isArray(struct) ? struct : []);
      setQuestionnaires(all || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [playerNames.length]);

  const handleFieldChange = async (fieldName: string, itemType: string, value: unknown) => {
    if (!selected || !permissions.canEditEntity(owners[selected])) return;
    try {
      await api.call('updateProfileField', {
        type: 'questionnaire',
        characterName: selected,
        fieldName,
        itemType,
        value,
      });
      await load();
      notifications.show({ title: 'Сохранено', message: fieldName, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const selectedSheet = selected ? questionnaires[selected] : null;

  return (
    <Tabs value={innerTab} onChange={setInnerTab}>
      <ScrollableTabsList>
        <Tabs.Tab value="answers">Заполнение</Tabs.Tab>
        {canAdmin && <Tabs.Tab value="q-structure">Структура анкеты</Tabs.Tab>}
      </ScrollableTabsList>

      <Tabs.Panel value="answers" pt="md">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Анкета — отдельный набор полей (не профиль игрока). Игрок заполняет её в кабинете.
          </Text>
          {structure.length === 0 ? (
            <Alert color="gray" title="Структура анкеты пуста">
              {canAdmin
                ? 'Добавьте поля во вкладке «Структура анкеты».'
                : 'Администратор ещё не настроил поля анкеты.'}
            </Alert>
          ) : (
            <>
              <HScroll minWidth={480}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Игрок</Table.Th>
                      <Table.Th>Заполнено</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {playerNames.map((name) => {
                      const filled = filledCount(questionnaires[name] || { name }, structure);
                      return (
                        <Table.Tr
                          key={name}
                          style={{ cursor: 'pointer' }}
                          bg={selected === name ? 'var(--mantine-color-default-hover)' : undefined}
                          onClick={() => setSelected(name)}
                        >
                          <Table.Td>{name}</Table.Td>
                          <Table.Td>
                            <Badge
                              variant="light"
                              color={filled === 0 ? 'gray' : filled >= structure.length ? 'green' : 'yellow'}
                            >
                              {filled} / {structure.length}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Anchor
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProfile(name);
                              }}
                            >
                              Профиль
                            </Anchor>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                    {!loading && playerNames.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={3}>
                          <Text c="dimmed" size="sm">Нет профилей игроков.</Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </HScroll>

              {selected && selectedSheet && (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600}>Анкета: {selected}</Text>
                    <Anchor size="sm" onClick={() => setSelected(null)}>Скрыть</Anchor>
                  </Group>
                  <PermissionHint reason={editBlockedReason} />
                  <ProfileFieldsForm
                    structure={structure}
                    profile={selectedSheet}
                    entityKey={`q-${selected}`}
                    canEdit={canEditSelected}
                    onChange={handleFieldChange}
                  />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Tabs.Panel>

      {canAdmin && (
        <Tabs.Panel value="q-structure" pt="md">
          <ProfileStructureEditor profileType="questionnaire" />
        </Tabs.Panel>
      )}
    </Tabs>
  );
}

import { useEffect, useState } from 'react';
import {
  Stack, Button, TextInput, Select, Group, Card, Text, ActionIcon, Table, Modal,
  Checkbox, TagsInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRootStore } from '@/stores';

interface ProfileField {
  name: string;
  type: string;
  value: unknown;
  doExport: boolean;
  showInRoleGrid: boolean;
  playerAccess: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Текст (многострочный)' },
  { value: 'string', label: 'Строка' },
  { value: 'enum', label: 'Перечисление' },
  { value: 'multiEnum', label: 'Множ. перечисление' },
  { value: 'number', label: 'Число' },
  { value: 'checkbox', label: 'Флажок' },
];

const PLAYER_ACCESS = [
  { value: 'hidden', label: 'Скрыто' },
  { value: 'readonly', label: 'Только чтение' },
  { value: 'write', label: 'Редактирование' },
];

export function ProfileStructureEditor({ profileType }: { profileType: 'character' | 'player' | 'questionnaire' }) {
  const { api } = useRootStore();
  const [structure, setStructure] = useState<ProfileField[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<string>('text');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [renameOld, setRenameOld] = useState('');
  const [renameNew, setRenameNew] = useState('');

  const load = async () => {
    const data = await api.get<ProfileField[]>('getProfileStructure', { type: profileType });
    setStructure(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, [profileType]);

  const handleAdd = async () => {
    if (!newFieldName.trim()) return;
    const name = newFieldName.trim();
    try {
      await api.call('createProfileItem', {
        type: profileType,
        name,
        itemType: newFieldType,
        selectedIndex: structure.length,
      });
      if ((newFieldType === 'enum' || newFieldType === 'multiEnum') && newFieldValue.trim()) {
        await api.call('updateDefaultValue', {
          type: profileType,
          profileItemName: name,
          value: newFieldValue.trim(),
        });
      }
      if (profileType === 'questionnaire') {
        await api.call('changeProfileItemPlayerAccess', {
          type: profileType,
          profileItemName: name,
          playerAccessType: 'write',
        });
      }
      setNewFieldName('');
      setNewFieldValue('');
      close();
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRemove = async (index: number, name: string) => {
    if (!confirm(`Удалить поле "${name}"? Данные во всех профилях будут утеряны.`)) return;
    try {
      await api.call('removeProfileItem', { type: profileType, index, profileItemName: name });
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= structure.length) return;
    try {
      await api.call('moveProfileItem', { type: profileType, index, newIndex });
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handlePlayerAccessChange = async (name: string, playerAccessType: string) => {
    try {
      await api.call('changeProfileItemPlayerAccess', { type: profileType, profileItemName: name, playerAccessType });
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRename = async () => {
    if (!renameNew.trim()) return;
    try {
      await api.call('renameProfileItem', { type: profileType, oldName: renameOld, newName: renameNew.trim() });
      closeRename();
      setRenameOld('');
      setRenameNew('');
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleTypeChange = async (name: string, newType: string) => {
    if (!confirm(`Изменить тип поля "${name}"? Данные будут сброшены к значению по умолчанию.`)) return;
    try {
      await api.call('changeProfileItemType', { type: profileType, profileItemName: name, newType });
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleEnumValuesChange = async (name: string, values: string[]) => {
    try {
      await api.call('updateDefaultValue', { type: profileType, profileItemName: name, value: values.join(',') });
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleDoExportChange = async (name: string, checked: boolean) => {
    try {
      await api.call('doExportProfileItemChange', { type: profileType, profileItemName: name, checked });
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleShowInRoleGridChange = async (name: string, checked: boolean) => {
    try {
      await api.call('showInRoleGridProfileItemChange', { type: profileType, profileItemName: name, checked });
      await load();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <div>
          <Text fw={600}>
            {profileType === 'character' && 'Структура профиля (персонажи)'}
            {profileType === 'player' && 'Структура профиля (игроки)'}
            {profileType === 'questionnaire' && 'Структура анкеты'}
          </Text>
          {profileType === 'questionnaire' && (
            <Text size="xs" c="dimmed" mt={2}>
              Отдельные поля анкеты (не путать с профилем игрока). «Редактирование» — игрок заполняет в кабинете.
            </Text>
          )}
        </div>
        <Button size="xs" onClick={open}>Добавить поле</Button>
      </Group>

      {structure.length > 0 ? (
        <Stack gap="xs">
          {structure.map((field, idx) => (
            <Card key={field.name} padding="xs" withBorder>
              <Group justify="space-between" mb={4}>
                <Group gap={4}>
                  <ActionIcon size="xs" variant="subtle" disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}>↑</ActionIcon>
                  <ActionIcon size="xs" variant="subtle" disabled={idx === structure.length - 1}
                    onClick={() => handleMove(idx, 'down')}>↓</ActionIcon>
                  <Text size="sm" fw={500}>{field.name}</Text>
                  <ActionIcon size="xs" variant="subtle"
                    onClick={() => { setRenameOld(field.name); setRenameNew(field.name); openRename(); }}>✎</ActionIcon>
                </Group>
                <ActionIcon size="xs" color="red" variant="subtle"
                  onClick={() => handleRemove(idx, field.name)}>✕</ActionIcon>
              </Group>
              <Group gap="md" wrap="wrap">
                <Select size="xs" data={FIELD_TYPES} value={field.type} label="Тип"
                  onChange={(v) => v && v !== field.type && handleTypeChange(field.name, v)}
                  style={{ width: 160 }} />
                <Select size="xs" data={PLAYER_ACCESS} value={field.playerAccess || 'hidden'}
                  label={profileType === 'questionnaire' ? 'Доступ в кабинете' : 'Доступ игрока'}
                  onChange={(v) => v && handlePlayerAccessChange(field.name, v)}
                  style={{ width: 150 }} />
                <Checkbox size="xs" label="Экспорт" mt={24}
                  checked={field.doExport !== false}
                  onChange={(e) => handleDoExportChange(field.name, e.currentTarget.checked)} />
                <Checkbox size="xs" label="В сетке ролей" mt={24}
                  checked={!!field.showInRoleGrid}
                  onChange={(e) => handleShowInRoleGridChange(field.name, e.currentTarget.checked)} />
              </Group>
              {(field.type === 'enum' || field.type === 'multiEnum') && (
                <TagsInput size="xs" mt={4} label="Варианты"
                  value={typeof field.value === 'string' && field.value ? field.value.split(',') : []}
                  onChange={(vals) => handleEnumValuesChange(field.name, vals)}
                  placeholder="Добавьте вариант..." />
              )}
            </Card>
          ))}
        </Stack>
      ) : (
        <Text c="dimmed" size="sm">Нет полей</Text>
      )}

      <Modal opened={opened} onClose={close} title="Добавить поле">
        <Stack>
          <TextInput label="Название" value={newFieldName}
            onChange={(e) => setNewFieldName(e.currentTarget.value)} autoFocus />
          <Select label="Тип" data={FIELD_TYPES} value={newFieldType}
            onChange={(v) => setNewFieldType(v || 'text')} />
          {(newFieldType === 'enum' || newFieldType === 'multiEnum') && (
            <TextInput label="Варианты (через запятую)" value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.currentTarget.value)}
              placeholder="вариант1,вариант2,вариант3" />
          )}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>Отмена</Button>
            <Button onClick={handleAdd}>Добавить</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={renameOpened} onClose={closeRename} title="Переименовать поле">
        <Stack>
          <TextInput label="Новое название" value={renameNew}
            onChange={(e) => setRenameNew(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()} autoFocus />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeRename}>Отмена</Button>
            <Button onClick={handleRename}>Переименовать</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

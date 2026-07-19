import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import {
  Title, Stack, Button, TextInput, Group, Modal,
  Text, Tabs, Select, MultiSelect, Checkbox as MantineCheckbox, NumberInput } from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { ProfileStructureEditor } from './ProfileStructureEditor';
import { CharacterConnections } from './CharacterConnections';
import { BindingChangeButton, ProfileBindingsTable } from './ProfileBindingControls';
import { EntityPageLayout } from '@/components/EntityPageLayout';
import { DeleteEntityButton } from '@/components/DeleteEntityButton';
import { EmptyState } from '@/components/EmptyState';
import { OwnerBadge } from '@/components/OwnerBadge';
import { useEntityOwners } from '@/hooks/useEntityOwners';
import { PermissionHint } from '@/components/PermissionHint';

function CharactersPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const [searchParams] = useSearchParams();
  const [names, setNames] = useState<string[]>([]);
  const { owners } = useEntityOwners('character', names.length);
  const canAdmin = permissions.canAdminOps;
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(searchParams.get('select'));
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [structure, setStructure] = useState<any[]>([]);
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false);
  const [newName, setNewName] = useState('');
  const [renameTo, setRenameTo] = useState('');
  const [filter, setFilter] = useState('');

  const loadNames = async () => {
    const data = await api.get<string[]>('getProfileNamesArray', { type: 'character' });
    setNames(Array.isArray(data) ? data : []);
  };

  const loadPlayerNames = async () => {
    const data = await api.get<string[]>('getProfileNamesArray', { type: 'player' });
    setPlayerNames(Array.isArray(data) ? data : []);
  };

  const loadStructure = async () => {
    const data = await api.get<any[]>('getProfileStructure', { type: 'character' });
    setStructure(Array.isArray(data) ? data : []);
  };

  const loadProfile = async (name: string) => {
    setProfileLoading(true);
    try {
      const data = await api.get<Record<string, any>>('getProfile', { type: 'character', name });
      setProfile(data);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadBindings = async () => {
    try {
      const data = await api.get<Record<string, string>>('getProfileBindings');
      setBindings(data || {});
    } catch { setBindings({}); }
  };

  useEffect(() => {
    Promise.all([loadNames(), loadPlayerNames(), loadStructure(), loadBindings()])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) loadProfile(selected);
    else setProfile(null);
  }, [selected]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const n = newName.trim();
      await api.call('createProfile', { type: 'character', characterName: n });
      setNewName('');
      close();
      await loadNames();
      setSelected(n);
      notifications.show({ title: 'Готово', message: `Персонаж «${n}» создан`, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleRemove = async (name: string) => {
    try {
      await api.call('removeProfile', { type: 'character', characterName: name });
      if (selected === name) { setSelected(null); setProfile(null); }
      await loadNames();
      notifications.show({ title: 'Удалено', message: `«${name}»`, color: 'gray' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleRename = async () => {
    if (!renameTo.trim() || !selected) return;
    try {
      const newN = renameTo.trim();
      await api.call('renameProfile', { type: 'character', fromName: selected, toName: newN });
      setRenameTo('');
      closeRename();
      await loadNames();
      setSelected(newN);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleFieldChange = async (fieldName: string, itemType: string, value: unknown) => {
    if (!selected) return;
    if (!permissions.canEditEntity(owners[selected])) return;
    try {
      await api.call('updateProfileField', { type: 'character', characterName: selected, fieldName, itemType, value });
      await loadProfile(selected);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const canEditSelected = selected ? permissions.canEditEntity(owners[selected]) : false;
  const editBlockedReason = selected ? permissions.contentEditBlockedReason(owners[selected]) : null;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>{t('characters.title')}</Title>
        <Button onClick={open} disabled={!permissions.canCreateEntities}>{t('characters.create')}</Button>
      </Group>

      <Tabs defaultValue="profiles">
        <ScrollableTabsList>
          <Tabs.Tab value="profiles">Профили</Tabs.Tab>
          <Tabs.Tab value="bindings">Привязки игроков</Tabs.Tab>
          {canAdmin && <Tabs.Tab value="structure">Структура полей</Tabs.Tab>}
        </ScrollableTabsList>

        {canAdmin && (
          <Tabs.Panel value="structure" pt="md">
            <ProfileStructureEditor profileType="character" />
          </Tabs.Panel>
        )}

        <Tabs.Panel value="bindings" pt="md">
          <ProfileBindingsTable
            bindings={bindings}
            characterNames={names}
            playerNames={playerNames}
            onChanged={loadBindings}
            primary="character"
          />
        </Tabs.Panel>

        <Tabs.Panel value="profiles" pt="md">
          {!loading && names.length === 0 ? (
            <EmptyState
              title="Нет персонажей"
              description="Создайте первого персонажа, чтобы начать работу с профилями и историями."
              actionLabel={t('characters.create')}
              onAction={open}
            />
          ) : (
            <EntityPageLayout
              loading={loading || profileLoading}
              selected={selected}
              onMobileBack={() => setSelected(null)}
              emptySelectTitle="Выберите персонажа"
              emptySelectDescription="Слева — список. Кликните имя, чтобы открыть профиль."
              sidebar={{
                items: names,
                selected,
                onSelect: setSelected,
                filter,
                onFilterChange: setFilter,
                emptyText: t('common.noData'),
                owners }}
            >
              {selected && profile && (
                <Stack gap="md" key={selected}>
                  <PermissionHint reason={editBlockedReason} />
                  <Group justify="space-between">
                    <Group gap="sm" align="center">
                      <Title order={4}>{selected}</Title>
                      <OwnerBadge owner={owners[selected]} />
                      <BindingChangeButton
                        side="character"
                        entityName={selected}
                        bindings={bindings}
                        characterNames={names}
                        playerNames={playerNames}
                        onChanged={loadBindings}
                        disabled={!canEditSelected}
                      />
                    </Group>
                    <Button
                      size="xs"
                      variant="subtle"
                      disabled={!canEditSelected}
                      onClick={() => { setRenameTo(selected); openRename(); }}
                    >
                      {t('common.rename')}
                    </Button>
                  </Group>

                  <Tabs defaultValue="profile" keepMounted={false}>
                    <ScrollableTabsList>
                      <Tabs.Tab value="profile">Профиль</Tabs.Tab>
                      <Tabs.Tab value="links">Связи</Tabs.Tab>
                    </ScrollableTabsList>

                    <Tabs.Panel value="profile" pt="md">
                      <Stack gap="md">
                        {structure.map((field) => {
                          const value = profile[field.name];
                          const fieldKey = `${selected}-${field.name}`;
                          if (field.type === 'text') {
                            return (
                              <Textarea key={fieldKey} label={field.name}
                                defaultValue={value || ''} rows={4}
                                readOnly={!canEditSelected}
                                onBlur={(e) => {
                                  if (e.currentTarget.value !== (value || ''))
                                    handleFieldChange(field.name, field.type, e.currentTarget.value);
                                }} />
                            );
                          }
                          if (field.type === 'string') {
                            return (
                              <TextInput key={fieldKey} label={field.name} defaultValue={value || ''}
                                readOnly={!canEditSelected}
                                onBlur={(e) => {
                                  if (e.currentTarget.value !== (value || ''))
                                    handleFieldChange(field.name, field.type, e.currentTarget.value);
                                }} />
                            );
                          }
                          if (field.type === 'checkbox') {
                            return (
                              <MantineCheckbox key={fieldKey} label={field.name}
                                checked={!!value}
                                disabled={!canEditSelected}
                                onChange={(e) => handleFieldChange(field.name, field.type, e.currentTarget.checked)} />
                            );
                          }
                          if (field.type === 'number') {
                            return (
                              <NumberInput key={fieldKey} label={field.name} defaultValue={value ?? 0}
                                readOnly={!canEditSelected}
                                onBlur={(e) => handleFieldChange(field.name, field.type, Number(e.currentTarget.value) || 0)} />
                            );
                          }
                          if (field.type === 'enum') {
                            const options = field.value ? field.value.split(',').map((v: string) => v.trim()) : [];
                            return (
                              <Select key={fieldKey} label={field.name} data={options}
                                value={value || null} clearable
                                disabled={!canEditSelected}
                                onChange={(v) => handleFieldChange(field.name, field.type, v || '')} />
                            );
                          }
                          if (field.type === 'multiEnum') {
                            const options = field.value ? field.value.split(',').map((v: string) => v.trim()) : [];
                            const curSelected = value ? String(value).split(',').map((v: string) => v.trim()).filter(Boolean) : [];
                            return (
                              <MultiSelect key={fieldKey} label={field.name} data={options}
                                value={curSelected}
                                disabled={!canEditSelected}
                                onChange={(vals) => handleFieldChange(field.name, field.type, vals.join(','))} />
                            );
                          }
                          return (
                            <TextInput key={fieldKey} label={field.name} defaultValue={value ?? ''}
                              readOnly={!canEditSelected}
                              onBlur={(e) => handleFieldChange(field.name, field.type, e.currentTarget.value)} />
                          );
                        })}

                        {structure.length === 0 && (
                          <Text c="dimmed" size="sm">Нет полей. Добавьте их во вкладке «Структура полей».</Text>
                        )}
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="links" pt="md">
                      <CharacterConnections characterName={selected} />
                    </Tabs.Panel>
                  </Tabs>

                  <DeleteEntityButton
                    entityLabel="персонажа"
                    entityName={selected}
                    disabled={!canEditSelected}
                    onConfirm={() => handleRemove(selected)}
                  />
                </Stack>
              )}
            </EntityPageLayout>
          )}
        </Tabs.Panel>
      </Tabs>

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

      <Modal opened={renameOpened} onClose={closeRename} title={t('common.rename')}>
        <Stack>
          <TextInput
            label="Новое имя"
            value={renameTo}
            onChange={(e) => setRenameTo(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeRename}>{t('common.cancel')}</Button>
            <Button onClick={handleRename}>{t('common.rename')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default observer(CharactersPage);

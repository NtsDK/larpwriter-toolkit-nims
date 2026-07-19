import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import {
  Title, Stack, Button, TextInput, Group, Modal,
  MultiSelect, Tabs, Loader, Center } from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { EntityPageLayout } from '@/components/EntityPageLayout';
import { DeleteEntityButton } from '@/components/DeleteEntityButton';
import { EmptyState } from '@/components/EmptyState';
import { OwnerBadge } from '@/components/OwnerBadge';
import { useEntityOwners } from '@/hooks/useEntityOwners';
import { PermissionHint } from '@/components/PermissionHint';

const PROFILE_LABELS: Record<string, string> = {
  masterDescription: 'Описание для мастера',
  characterDescription: 'Текст для персонажа' };

function GroupsPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const [searchParams] = useSearchParams();
  const [names, setNames] = useState<string[]>([]);
  const { owners } = useEntityOwners('group', names.length);
  const [charNames, setCharNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(searchParams.get('select'));
  const [members, setMembers] = useState<string[]>([]);
  const [groupProfile, setGroupProfile] = useState<Record<string, string> | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false);
  const [newName, setNewName] = useState('');
  const [renameTo, setRenameTo] = useState('');
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('members');

  const loadNames = async () => {
    const data = await api.get<string[]>('getGroupNamesArray');
    setNames(Array.isArray(data) ? data : []);
  };

  const loadCharNames = async () => {
    const data = await api.get<string[]>('getProfileNamesArray', { type: 'character' });
    setCharNames(Array.isArray(data) ? data : []);
  };

  useEffect(() => { loadNames(); loadCharNames(); }, []);

  useEffect(() => {
    if (!selected) {
      setMembers([]);
      setGroupProfile(null);
      setLoadedFor(null);
      setGroupLoading(false);
      return;
    }

    let cancelled = false;
    setGroupLoading(true);
    setLoadedFor(null);
    setGroupProfile(null);
    setMembers([]);

    (async () => {
      try {
        const [m, p] = await Promise.all([
          api.get<string[]>('getGroupMembers', { groupName: selected }).catch(() => [] as string[]),
          api.get<Record<string, string>>('getGroupProfile', { groupName: selected }),
        ]);
        if (cancelled) return;
        setMembers(Array.isArray(m) ? m : []);
        setGroupProfile({
          masterDescription: p?.masterDescription ?? '',
          characterDescription: p?.characterDescription ?? '' });
        setLoadedFor(selected);
      } catch (e: any) {
        if (cancelled) return;
        notifications.show({ title: 'Ошибка', message: e.message || 'Не удалось загрузить группу', color: 'red' });
        setGroupProfile(null);
        setLoadedFor(null);
      } finally {
        if (!cancelled) setGroupLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selected]);

  const reloadSelected = async () => {
    if (!selected) return;
    setGroupLoading(true);
    try {
      const [m, p] = await Promise.all([
        api.get<string[]>('getGroupMembers', { groupName: selected }).catch(() => [] as string[]),
        api.get<Record<string, string>>('getGroupProfile', { groupName: selected }),
      ]);
      setMembers(Array.isArray(m) ? m : []);
      setGroupProfile({
        masterDescription: p?.masterDescription ?? '',
        characterDescription: p?.characterDescription ?? '' });
      setLoadedFor(selected);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message || 'Не удалось загрузить группу', color: 'red' });
    } finally {
      setGroupLoading(false);
    }
  };
  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const n = newName.trim();
      await api.call('createGroup', { groupName: n });
      close();
      await loadNames();
      setSelected(n);
      setNewName('');
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRemove = async (name: string) => {
    await api.call('removeGroup', { groupName: name });
    if (selected === name) setSelected(null);
    await loadNames();
    notifications.show({ title: 'Удалено', message: `«${name}»`, color: 'gray' });
  };

  const handleRename = async () => {
    if (!renameTo.trim() || !selected) return;
    try {
      const n = renameTo.trim();
      await api.call('renameGroup', { fromName: selected, toName: n });
      closeRename();
      await loadNames();
      setSelected(n);
      setRenameTo('');
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleMembersChange = async (newMembers: string[]) => {
    if (!selected || !permissions.canEditEntity(owners[selected])) return;
    const added = newMembers.filter((m) => !members.includes(m));
    const removed = members.filter((m) => !newMembers.includes(m));
    try {
      for (const m of added) {
        await api.call('addCharacterToGroup', { groupName: selected, characterName: m });
      }
      for (const m of removed) {
        await api.call('removeCharacterFromGroup', { groupName: selected, characterName: m });
      }
      setMembers(newMembers);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
      await reloadSelected();
    }
  };

  const handleProfileField = async (fieldName: string, value: string) => {
    if (!selected || loadedFor !== selected || !permissions.canEditEntity(owners[selected])) return;
    const prev = groupProfile?.[fieldName] ?? '';
    if (value === prev) return;
    try {
      await api.call('updateGroupProfileField', { groupName: selected, fieldName, value });
      setGroupProfile((p) => (p ? { ...p, [fieldName]: value } : p));
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
      await reloadSelected();
    }
  };

  const profileReady = !!selected && loadedFor === selected && !!groupProfile && !groupLoading;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>{t('groups.title')}</Title>
        <Button onClick={open}>{t('groups.create')}</Button>
      </Group>

      {names.length === 0 ? (
        <EmptyState
          title="Нет групп"
          description="Создайте группу и добавьте персонажей."
          actionLabel={t('groups.create')}
          onAction={open}
        />
      ) : (
        <EntityPageLayout
          selected={selected}
          onMobileBack={() => setSelected(null)}
          emptySelectTitle="Выберите группу"
          emptySelectDescription="Слева — список. Справа — участники и профиль."
          sidebar={{
            items: names,
            selected,
            onSelect: (name) => {
              setSelected(name);
              setActiveTab('members');
            },
            filter,
            onFilterChange: setFilter,
            owners }}
        >
          {selected && (
            <Stack gap="md">
              <PermissionHint reason={permissions.contentEditBlockedReason(owners[selected])} />
              <Group justify="space-between">
                <Group gap="sm" align="center">
                  <Title order={4}>{selected}</Title>
                  <OwnerBadge owner={owners[selected]} />
                </Group>
                <Button
                  size="xs"
                  variant="subtle"
                  disabled={!permissions.canEditEntity(owners[selected])}
                  onClick={() => { setRenameTo(selected); openRename(); }}
                >
                  {t('common.rename')}
                </Button>
              </Group>

              <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
                <ScrollableTabsList>
                  <Tabs.Tab value="members">Участники ({members.length})</Tabs.Tab>
                  <Tabs.Tab value="profile">Профиль группы</Tabs.Tab>
                </ScrollableTabsList>

                <Tabs.Panel value="members" pt="md">
                  {groupLoading && loadedFor !== selected ? (
                    <Center py="xl"><Loader size="sm" /></Center>
                  ) : (
                    <MultiSelect
                      label="Персонажи в группе"
                      data={charNames}
                      value={members}
                      onChange={handleMembersChange}
                      searchable
                      clearable
                      disabled={!permissions.canEditEntity(owners[selected])}
                    />
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="profile" pt="md">
                  {!profileReady ? (
                    <Center py="xl"><Loader size="sm" /></Center>
                  ) : (
                    <Stack gap="md" key={`profile-${selected}-${loadedFor}`}>
                      <Textarea label={PROFILE_LABELS.masterDescription}
                        description="Видно только организаторам"
                        defaultValue={groupProfile.masterDescription || ''}
                        rows={4}
                        readOnly={!permissions.canEditEntity(owners[selected])}
                        onBlur={(e) => handleProfileField('masterDescription', e.currentTarget.value)}
                      />
                      <Textarea label={PROFILE_LABELS.characterDescription}
                        description="Попадает во вводные участников группы"
                        defaultValue={groupProfile.characterDescription || ''}
                        rows={6}
                        readOnly={!permissions.canEditEntity(owners[selected])}
                        onBlur={(e) => handleProfileField('characterDescription', e.currentTarget.value)}
                      />
                    </Stack>
                  )}
                </Tabs.Panel>
              </Tabs>

              <DeleteEntityButton
                entityLabel="группу"
                entityName={selected}
                disabled={!permissions.canEditEntity(owners[selected])}
                onConfirm={() => handleRemove(selected)}
              />
            </Stack>
          )}
        </EntityPageLayout>
      )}

      <Modal opened={opened} onClose={close} title={t('groups.create')}>
        <Stack>
          <TextInput label={t('groups.namePrompt')} value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()} autoFocus />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={renameOpened} onClose={closeRename} title={t('common.rename')}>
        <Stack>
          <TextInput label="Новое название" value={renameTo}
            onChange={(e) => setRenameTo(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()} autoFocus />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeRename}>{t('common.cancel')}</Button>
            <Button onClick={handleRename}>{t('common.rename')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default observer(GroupsPage);

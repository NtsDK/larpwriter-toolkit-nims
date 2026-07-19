import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import {
  Title, Stack, Button, TextInput, Group, Modal,
  Text, Tabs, Select, Badge,
} from '@mantine/core';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { ProfileStructureEditor } from '../characters/ProfileStructureEditor';
import { BindingChangeButton, ProfileBindingsTable } from '../characters/ProfileBindingControls';
import { EntityPageLayout } from '@/components/EntityPageLayout';
import { DeleteEntityButton } from '@/components/DeleteEntityButton';
import { EmptyState } from '@/components/EmptyState';
import { OwnerBadge } from '@/components/OwnerBadge';
import { useEntityOwners } from '@/hooks/useEntityOwners';
import { PermissionHint } from '@/components/PermissionHint';
import { ProfileFieldsForm } from '@/components/ProfileFieldsForm';
import { PlayersQuestionnaireTab } from './PlayersQuestionnaireTab';

function PlayersPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [names, setNames] = useState<string[]>([]);
  const { owners } = useEntityOwners('player', names.length);
  const canAdmin = permissions.canAdminOps;
  const [charNames, setCharNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(searchParams.get('select'));
  const canEditSelected = selected ? permissions.canEditEntity(owners[selected]) : false;
  const editBlockedReason = selected ? permissions.contentEditBlockedReason(owners[selected]) : null;
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [structure, setStructure] = useState<any[]>([]);
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [linkOpened, { open: openLink, close: closeLink }] = useDisclosure(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [linkLogin, setLinkLogin] = useState<string | null>(null);
  const [playerLogins, setPlayerLogins] = useState<string[]>([]);
  const [loginToProfile, setLoginToProfile] = useState<Record<string, string | null>>({});
  const [filter, setFilter] = useState('');
  const tabFromUrl = searchParams.get('tab');
  const [tab, setTab] = useState<string | null>(
    tabFromUrl === 'questionnaire' || tabFromUrl === 'bindings' || tabFromUrl === 'structure'
      ? tabFromUrl
      : 'profiles',
  );

  const loadNames = async () => {
    const data = await api.get<string[]>('getProfileNamesArray', { type: 'player' });
    setNames(Array.isArray(data) ? data : []);
  };

  const loadCharNames = async () => {
    const data = await api.get<string[]>('getProfileNamesArray', { type: 'character' });
    setCharNames(Array.isArray(data) ? data : []);
  };

  const loadStructure = async () => {
    const data = await api.get<any[]>('getProfileStructure', { type: 'player' });
    setStructure(Array.isArray(data) ? data : []);
  };

  const loadBindings = async () => {
    try {
      const data = await api.get<Record<string, string>>('getProfileBindings');
      setBindings(data || {});
    } catch { setBindings({}); }
  };

  const loadLogins = async () => {
    if (!canAdmin) {
      setPlayerLogins([]);
      setLoginToProfile({});
      return;
    }
    try {
      const mgmt = await api.get<{
        PlayersInfo?: Record<string, { resolvedProfileName?: string | null; profileName?: string }>;
      }>('getManagementInfo');
      const info = mgmt?.PlayersInfo || {};
      const logins = Object.keys(info).sort((a, b) => a.localeCompare(b, 'ru'));
      setPlayerLogins(logins);
      const map: Record<string, string | null> = {};
      for (const login of logins) {
        map[login] = info[login]?.resolvedProfileName
          ?? info[login]?.profileName
          ?? null;
      }
      setLoginToProfile(map);
    } catch {
      setPlayerLogins([]);
      setLoginToProfile({});
    }
  };

  const loadProfile = async (name: string) => {
    setProfileLoading(true);
    try {
      const data = await api.get<Record<string, any>>('getProfile', { type: 'player', name });
      setProfile(data);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadNames(), loadCharNames(), loadStructure(), loadBindings(), loadLogins()])
      .finally(() => setLoading(false));
  }, [canAdmin]);

  const profileToLogin = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [login, profile] of Object.entries(loginToProfile)) {
      if (profile) map[profile] = login;
    }
    // same-name fallback
    for (const login of playerLogins) {
      if (!loginToProfile[login] && names.includes(login)) map[login] = login;
    }
    return map;
  }, [loginToProfile, playerLogins, names]);

  const selectedLogin = selected ? profileToLogin[selected] : undefined;

  useEffect(() => {
    if (selected) loadProfile(selected);
    else setProfile(null);
  }, [selected]);

  useEffect(() => {
    if (tab === 'questionnaire' || tab === 'structure') {
      void loadStructure();
    }
  }, [tab]);

  const handleCreate = async () => {
    if (!newPlayerName.trim()) return;
    try {
      const n = newPlayerName.trim();
      await api.call('createProfile', { type: 'player', characterName: n });
      setNewPlayerName('');
      close();
      await loadNames();
      setSelected(n);
      notifications.show({ title: 'Готово', message: `Игрок «${n}» создан`, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleRemove = async (name: string) => {
    try {
      await api.call('removeProfile', { type: 'player', characterName: name });
      if (selected === name) { setSelected(null); setProfile(null); }
      await loadNames();
      notifications.show({ title: 'Удалено', message: `«${name}»`, color: 'gray' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleFieldChange = async (fieldName: string, itemType: string, value: unknown) => {
    if (!selected || !permissions.canEditEntity(owners[selected])) return;
    try {
      await api.call('updateProfileField', { type: 'player', characterName: selected, fieldName, itemType, value });
      await loadProfile(selected);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleLinkLogin = async () => {
    if (!selected || !linkLogin) return;
    const profile = selected;
    const login = linkLogin;
    if (!confirm(
      `Связать логин «${login}» с профилем «${profile}»?\n\n`
      + 'Заполненные игроком поля перенесутся; пустые дополнятся из этого профиля.',
    )) return;
    try {
      await api.call('linkPlayerLoginToProfile', { userName: login, profileName: profile });
      setLinkLogin(null);
      closeLink();
      await loadLogins();
      await loadNames();
      notifications.show({ title: 'Готово', message: `«${login}» → «${profile}»`, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>{t('players.title')}</Title>
        <Group>
          <Button onClick={open} disabled={!permissions.canCreateEntities}>{t('players.create')}</Button>
          {canAdmin && selected && !selectedLogin && (
            <Button
              variant="default"
              onClick={() => {
                setLinkLogin(playerLogins[0] || null);
                openLink();
              }}
              disabled={playerLogins.length === 0}
            >
              Связать логин
            </Button>
          )}
        </Group>
      </Group>

      <Tabs
        value={tab}
        onChange={(v) => {
          setTab(v);
          const next = new URLSearchParams(searchParams);
          if (!v || v === 'profiles') next.delete('tab');
          else next.set('tab', v);
          setSearchParams(next, { replace: true });
        }}
      >
        <ScrollableTabsList>
          <Tabs.Tab value="profiles">Профили игроков</Tabs.Tab>
          <Tabs.Tab value="questionnaire">Анкета</Tabs.Tab>
          <Tabs.Tab value="bindings">Привязки персонажей</Tabs.Tab>
          {canAdmin && <Tabs.Tab value="structure">Структура полей</Tabs.Tab>}
        </ScrollableTabsList>

        <Tabs.Panel value="profiles" pt="md">
          {!loading && names.length === 0 ? (
            <EmptyState
              title="Нет игроков"
              description="Создайте профиль игрока и привяжите к персонажу."
              actionLabel={t('players.create')}
              onAction={open}
            />
          ) : (
            <EntityPageLayout
              loading={loading || profileLoading}
              selected={selected}
              onMobileBack={() => setSelected(null)}
              emptySelectTitle="Выберите игрока"
              emptySelectDescription="Слева — список профилей. Справа — поля и привязка к персонажу."
              sidebar={{
                items: names,
                selected,
                onSelect: setSelected,
                filter,
                onFilterChange: setFilter,
                owners }}
            >
              {selected && profile && (
                <Stack gap="md" key={selected}>
                  <PermissionHint reason={editBlockedReason} />
                  <Group gap="sm" align="center">
                    <Title order={4}>{selected}</Title>
                    <OwnerBadge owner={owners[selected]} />
                    {canAdmin && (
                      selectedLogin ? (
                        <Badge size="sm" color="green" variant="light">логин: {selectedLogin}</Badge>
                      ) : (
                        <Badge size="sm" color="orange" variant="light">без логина</Badge>
                      )
                    )}
                    <BindingChangeButton
                      side="player"
                      entityName={selected}
                      bindings={bindings}
                      characterNames={charNames}
                      playerNames={names}
                      onChanged={loadBindings}
                      disabled={!canEditSelected}
                    />
                  </Group>
                  <ProfileFieldsForm
                    structure={structure}
                    profile={profile}
                    entityKey={selected}
                    canEdit={canEditSelected}
                    emptyText="Нет полей. Добавьте во вкладке «Структура полей»."
                    onChange={handleFieldChange}
                  />
                  <DeleteEntityButton
                    entityLabel="игрока"
                    entityName={selected}
                    disabled={!canEditSelected}
                    onConfirm={() => handleRemove(selected)}
                  />
                </Stack>
              )}
            </EntityPageLayout>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="questionnaire" pt="md">
          <PlayersQuestionnaireTab
            playerNames={names}
            canAdmin={canAdmin}
            onSelectProfile={(name) => {
              setSelected(name);
              setTab('profiles');
              const next = new URLSearchParams(searchParams);
              next.delete('tab');
              next.set('select', name);
              setSearchParams(next, { replace: true });
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="bindings" pt="md">
          <ProfileBindingsTable
            bindings={bindings}
            characterNames={charNames}
            playerNames={names}
            onChanged={loadBindings}
            primary="character"
          />
        </Tabs.Panel>

        {canAdmin && (
          <Tabs.Panel value="structure" pt="md">
            <ProfileStructureEditor profileType="player" />
          </Tabs.Panel>
        )}
      </Tabs>

      <Modal opened={opened} onClose={close} title={t('players.create')}>
        <Stack>
          <TextInput label={t('players.namePrompt')} value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()} autoFocus />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={linkOpened} onClose={closeLink} title="Связать логин с профилем">
        <Stack>
          <Text size="sm" c="dimmed">
            Профиль: <Text span fw={500}>{selected}</Text>. Заполненные игроком поля перенесутся;
            пустые дополнятся из этого профиля.
          </Text>
          <Select
            label="Логин"
            data={playerLogins}
            value={linkLogin}
            onChange={setLinkLogin}
            searchable
            placeholder="Выберите логин"
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeLink}>{t('common.cancel')}</Button>
            <Button onClick={handleLinkLogin} disabled={!linkLogin || !selected}>
              Связать
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default observer(PlayersPage);

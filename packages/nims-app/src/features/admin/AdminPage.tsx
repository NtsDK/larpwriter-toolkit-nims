import { useEffect, useState, useRef, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Title, Stack, Card, Text, Table, Button, TextInput, Group, Modal,
  Badge, FileButton, Tabs, MultiSelect, Select, PasswordInput, Tooltip, Radio, Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { HScroll } from '@/components/HScroll';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';

function AdminPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const [mgmt, setMgmt] = useState<any>(null);
  const [charNames, setCharNames] = useState<string[]>([]);
  const [storyNames, setStoryNames] = useState<string[]>([]);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [opened, { open, close }] = useDisclosure(false);
  const [playerOpened, { open: openPlayer, close: closePlayer }] = useDisclosure(false);
  const [linkOpened, { open: openLink, close: closeLink }] = useDisclosure(false);
  const [passOpened, { open: openPass, close: closePass }] = useDisclosure(false);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerPass, setPlayerPass] = useState('');
  const [linkLogin, setLinkLogin] = useState<string | null>(null);
  const [linkProfile, setLinkProfile] = useState<string | null>(null);
  const [passTarget, setPassTarget] = useState<{ kind: 'organizer' | 'player'; name: string } | null>(null);
  const [passValue, setPassValue] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [assignUser, setAssignUser] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);

  const canAdmin = permissions.canAdminOps;

  const defaultTab = useMemo(() => {
    if (canAdmin) return 'organizers';
    return 'players';
  }, [canAdmin]);

  const [tab, setTab] = useState<string | null>(null);
  const activeTab = tab ?? defaultTab;

  const loadMgmt = async () => {
    const data = await api.get('getManagementInfo');
    setMgmt(data);
    await permissions.load();
  };

  const loadEntities = async () => {
    const [chars, stories, groups, players] = await Promise.all([
      api.get<string[]>('getProfileNamesArray', { type: 'character' }),
      api.get<string[]>('getStoryNamesArray'),
      api.get<string[]>('getGroupNamesArray'),
      api.get<string[]>('getProfileNamesArray', { type: 'player' }),
    ]);
    setCharNames(chars);
    setStoryNames(stories);
    setGroupNames(groups);
    setPlayerNames(players);
    try {
      const b = await api.get<Record<string, string>>('getProfileBindings');
      setBindings(b || {});
    } catch {
      setBindings({});
    }
  };

  useEffect(() => { loadMgmt(); loadEntities(); }, []);

  const playerLogins = useMemo(
    () => Object.keys(mgmt?.PlayersInfo || {}).sort((a, b) => a.localeCompare(b, 'ru')),
    [mgmt],
  );

  const characterByPlayer = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [char, player] of Object.entries(bindings)) {
      if (player) map[player] = char;
    }
    return map;
  }, [bindings]);

  const resolvedByLogin = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const login of playerLogins) {
      const info = mgmt?.PlayersInfo?.[login];
      map[login] = info?.resolvedProfileName ?? info?.profileName ?? (playerNames.includes(login) ? login : null);
    }
    return map;
  }, [mgmt, playerLogins, playerNames]);

  const loginByResolvedProfile = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [login, resolved] of Object.entries(resolvedByLogin)) {
      if (resolved) map[resolved] = login;
    }
    return map;
  }, [resolvedByLogin]);

  /** Hand profiles not currently linked to any login (or only same-name self). */
  const linkableProfiles = useMemo(() => {
    return playerNames.filter((profile) => {
      const login = loginByResolvedProfile[profile];
      if (!login) return true;
      // Profile only "owned" by same-name login without explicit cross-link — still linkable from another login
      const info = mgmt?.PlayersInfo?.[login];
      return !info?.profileName && login === profile;
    }).filter((profile) => {
      // Prefer profiles that have no login at all, or allow re-target from other logins
      const holders = playerLogins.filter((l) => resolvedByLogin[l] === profile && l !== profile);
      return holders.length === 0;
    });
  }, [playerNames, loginByResolvedProfile, mgmt, playerLogins, resolvedByLogin]);

  const profilesWithoutLogin = useMemo(
    () => playerNames.filter((n) => !loginByResolvedProfile[n]),
    [playerNames, loginByResolvedProfile],
  );

  useEffect(() => {
    if (!canAdmin && (activeTab === 'organizers' || activeTab === 'assignments' || activeTab === 'database')) {
      setTab('players');
    }
  }, [canAdmin, activeTab]);

  const handleCreate = async () => {
    if (newName.trim() && newPass.trim()) {
      try {
        await api.call('createOrganizer', { name: newName.trim(), password: newPass.trim() });
        setNewName(''); setNewPass('');
        close();
        await loadMgmt();
      } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
    }
  };

  const handleRemoveOrg = async (name: string) => {
    if (!confirm(`Удалить организатора "${name}"?`)) return;
    try {
      await api.call('removeOrganizer', { name });
      await loadMgmt();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const openChangePassword = (kind: 'organizer' | 'player', name: string) => {
    setPassTarget({ kind, name });
    setPassValue('');
    openPass();
  };

  const handleConfirmPasswordChange = async () => {
    if (!passTarget || !passValue.trim()) return;
    setPassSaving(true);
    try {
      if (passTarget.kind === 'organizer') {
        await api.call('changeOrganizerPassword', {
          userName: passTarget.name,
          newPassword: passValue.trim(),
        });
      } else {
        await api.call('changePlayerPassword', {
          userName: passTarget.name,
          newPassword: passValue.trim(),
        });
      }
      notifications.show({ title: 'Готово', message: 'Пароль изменён', color: 'green' });
      setPassTarget(null);
      setPassValue('');
      closePass();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    } finally {
      setPassSaving(false);
    }
  };

  const handleCreatePlayer = async () => {
    if (!playerName.trim() || !playerPass.trim()) return;
    try {
      await api.call('createPlayer', { userName: playerName.trim(), password: playerPass.trim() });
      setPlayerName(''); setPlayerPass('');
      closePlayer();
      await loadMgmt();
      await loadEntities();
      notifications.show({ title: 'Готово', message: 'Игрок создан', color: 'green' });
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleLinkLogin = async () => {
    if (!linkLogin || !linkProfile) return;
    const login = linkLogin;
    const profile = linkProfile;
    if (!confirm(
      `Связать логин «${login}» с профилем «${profile}»?\n\n`
      + 'Заполненные игроком поля перенесутся; пустые дополнятся из выбранного профиля. '
      + 'Лист профиля/анкеты под именем логина будет удалён.',
    )) return;
    try {
      await api.call('linkPlayerLoginToProfile', { userName: login, profileName: profile });
      setLinkLogin(null);
      setLinkProfile(null);
      closeLink();
      await loadMgmt();
      await loadEntities();
      notifications.show({
        title: 'Готово',
        message: `«${login}» → «${profile}»`,
        color: 'green',
      });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleUnlinkLogin = async (login: string) => {
    if (!confirm(
      `Отвязать логин «${login}» от профиля?\n\nБудет создан пустой профиль под именем логина. Ручной профиль останется.`,
    )) return;
    try {
      await api.call('unlinkPlayerLoginFromProfile', { userName: login });
      await loadMgmt();
      await loadEntities();
      notifications.show({ title: 'Готово', message: `Логин «${login}» отвязан`, color: 'gray' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const openLinkModal = (login?: string, profile?: string) => {
    setLinkLogin(login || playerLogins[0] || null);
    setLinkProfile(profile || profilesWithoutLogin[0] || linkableProfiles[0] || null);
    openLink();
  };

  const handleToggleSignup = async (checked: boolean) => {
    try {
      await api.call('setPlayerOption', { name: 'allowPlayerCreation', value: checked });
      await loadMgmt();
      notifications.show({
        title: 'Готово',
        message: checked ? 'Саморегистрация включена' : 'Саморегистрация выключена',
        color: 'green',
      });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleRemovePlayer = async (name: string) => {
    if (!confirm(`Удалить логин игрока «${name}»? Профиль игрока сохранится.`)) return;
    try {
      await api.call('removePlayerLogin', { userName: name });
      await loadMgmt();
      notifications.show({ title: 'Удалено', message: `Логин «${name}»`, color: 'gray' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handlePromotePlayer = async (name: string) => {
    if (!confirm(
      `Сделать «${name}» организатором?\n\nЛогин перейдёт в организаторы с тем же паролем. Профиль игрока сохранится, вход в кабинет игрока станет недоступен.`,
    )) return;
    try {
      await api.call('promotePlayerToOrganizer', { userName: name });
      notifications.show({ title: 'Готово', message: `«${name}» теперь организатор`, color: 'green' });
      await loadMgmt();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleAssignChars = async (chars: string[]) => {
    if (!assignUser || !mgmt) return;
    try {
      await api.call('assignCharactersToOrganizer', { userName: assignUser, characters: chars });
      await loadMgmt();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleAssignStories = async (stories: string[]) => {
    if (!assignUser || !mgmt) return;
    try {
      await api.call('assignStoriesToOrganizer', { userName: assignUser, stories });
      await loadMgmt();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleAssignGroups = async (groups: string[]) => {
    if (!assignUser || !mgmt) return;
    try {
      await api.call('assignGroupsToOrganizer', { userName: assignUser, groups });
      await loadMgmt();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleAssignPlayers = async (players: string[]) => {
    if (!assignUser || !mgmt) return;
    try {
      await api.call('assignPlayersToOrganizer', { userName: assignUser, players });
      await loadMgmt();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleAdaptationRights = async (mode: string) => {
    try {
      await api.call('changeAdaptationRightsMode', { mode });
      await loadMgmt();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleDownload = async () => {
    try {
      const database = await api.get<object>('getDatabase');
      const blob = new Blob([JSON.stringify(database, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nims-database-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notifications.show({ title: 'Готово', message: 'База данных скачана', color: 'green' });
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleUpload = async (file: File | null) => {
    if (!file || !canAdmin) return;
    try {
      const text = await file.text();
      const database = JSON.parse(text);
      await api.call('setDatabase', { database, preserveManagementInfo: true });
      notifications.show({
        title: 'Готово',
        message: 'База загружена. Существующие пользователи сохранены, новые из файла добавлены.',
        color: 'green',
      });
      await loadMgmt();
      await loadEntities();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
    resetRef.current?.();
  };

  const handleAssignEditor = async (name: string) => {
    try {
      await api.call('assignEditor', { name });
      await loadMgmt();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const handleRevokeEditor = async (name: string) => {
    try {
      await api.call('revokeEditor', { name });
      await loadMgmt();
    } catch (e: any) { notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }); }
  };

  const orgNames = mgmt?.usersInfo ? Object.keys(mgmt.usersInfo) : [];

  return (
    <Stack gap="lg">
      <Title order={2}>{t('admin.title')}</Title>

      <Tabs value={activeTab} onChange={setTab}>
        <ScrollableTabsList>
          {canAdmin && <Tabs.Tab value="organizers">Организаторы</Tabs.Tab>}
          {canAdmin && <Tabs.Tab value="assignments">Назначения</Tabs.Tab>}
          <Tabs.Tab value="players">Игроки</Tabs.Tab>
          {canAdmin && <Tabs.Tab value="database">{t('admin.database')}</Tabs.Tab>}
        </ScrollableTabsList>

        {canAdmin && (
          <Tabs.Panel value="organizers" pt="md">
            <Card shadow="sm" padding="md" withBorder>
              <Group justify="space-between" mb="md">
                <Text fw={600}>Организаторы</Text>
                <Button size="xs" onClick={open}>Добавить</Button>
              </Group>

              {mgmt?.usersInfo && Object.keys(mgmt.usersInfo).length > 0 ? (
                <HScroll minWidth={640}>
                  <Table striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Имя</Table.Th>
                        <Table.Th>Персонажи</Table.Th>
                        <Table.Th>Истории</Table.Th>
                        <Table.Th>Действия</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {Object.entries(mgmt.usersInfo).map(([name, info]: [string, any]) => {
                        const isUserAdmin = (mgmt.admins || []).includes(name);
                        const isUserEditor = (mgmt.editors || []).includes(name);
                        return (
                          <Table.Tr key={name}>
                            <Table.Td>
                              {name}
                              {isUserAdmin && <Badge ml="xs" size="xs" color="red">админ</Badge>}
                              {isUserEditor && <Badge ml="xs" size="xs" color="blue">редактор</Badge>}
                              {!isUserAdmin && !isUserEditor && (
                                <Badge ml="xs" size="xs" color="gray" variant="outline">организатор</Badge>
                              )}
                            </Table.Td>
                            <Table.Td>{info.characters?.length || 0}</Table.Td>
                            <Table.Td>{info.stories?.length || 0}</Table.Td>
                            <Table.Td>
                              <Group gap={4} wrap="wrap">
                                {isUserAdmin ? (
                                  <Button size="xs" variant="subtle" color="gray" onClick={async () => {
                                    await api.call('revokeAdmin', { name });
                                    await loadMgmt();
                                  }}>Снять админа</Button>
                                ) : (
                                  <Button size="xs" variant="subtle" color="red" onClick={async () => {
                                    await api.call('assignAdmin', { name });
                                    await loadMgmt();
                                  }}>Админ</Button>
                                )}
                                {isUserEditor ? (
                                  <Button size="xs" variant="subtle" color="gray" onClick={() => handleRevokeEditor(name)}>Снять редактора</Button>
                                ) : (
                                  <Button size="xs" variant="subtle" color="blue" onClick={() => handleAssignEditor(name)}>Редактор</Button>
                                )}
                                <Button size="xs" variant="subtle" onClick={() => openChangePassword('organizer', name)}>Пароль</Button>
                                <Button size="xs" variant="subtle" color="red" onClick={() => handleRemoveOrg(name)}>Удалить</Button>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </HScroll>
              ) : (
                <Text c="dimmed">{t('common.noData')}</Text>
              )}

              <Text size="sm" c="dimmed" mt="md">
                Все в списке — организаторы (роль входа). Дополнительно: админ — полный доступ;
                редактор — ко всем персонажам и историям; без флагов — только к назначенным.
              </Text>
            </Card>
          </Tabs.Panel>
        )}

        {canAdmin && (
          <Tabs.Panel value="assignments" pt="md">
            <Stack gap="md">
              <Card shadow="sm" padding="md" withBorder>
                <Radio.Group
                  label="Назначение прав на адаптации"
                  description="По чему определяется, кто может править субъективные вводные"
                  value={mgmt?.adaptationRights || 'ByStory'}
                  onChange={handleAdaptationRights}
                >
                  <Group mt="xs">
                    <Radio value="ByStory" label="По историям" />
                    <Radio value="ByCharacter" label="По персонажам" />
                  </Group>
                </Radio.Group>
              </Card>

              <Card shadow="sm" padding="md" withBorder>
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Права на редактирование сущностей: персонажи, истории, группы и игроки — как в классическом НИМС.
                  </Text>
                  <Select
                    label="Организатор"
                    data={orgNames}
                    value={assignUser}
                    onChange={setAssignUser}
                    placeholder="Выберите организатора"
                  />

                  {assignUser && mgmt?.usersInfo?.[assignUser] && (
                    <>
                      <MultiSelect
                        label="Персонажи"
                        data={charNames}
                        value={mgmt.usersInfo[assignUser].characters || []}
                        onChange={handleAssignChars}
                        searchable
                        clearable
                      />
                      <MultiSelect
                        label="Истории"
                        data={storyNames}
                        value={mgmt.usersInfo[assignUser].stories || []}
                        onChange={handleAssignStories}
                        searchable
                        clearable
                      />
                      <MultiSelect
                        label="Группы"
                        data={groupNames}
                        value={mgmt.usersInfo[assignUser].groups || []}
                        onChange={handleAssignGroups}
                        searchable
                        clearable
                      />
                      <MultiSelect
                        label="Игроки"
                        data={playerNames}
                        value={mgmt.usersInfo[assignUser].players || []}
                        onChange={handleAssignPlayers}
                        searchable
                        clearable
                      />
                    </>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        )}

        <Tabs.Panel value="players" pt="md">
          <Stack gap="md">
            {canAdmin && (
              <Card shadow="sm" padding="md" withBorder>
                <Switch
                  label="Разрешить саморегистрацию игроков"
                  description="На экране входа появится форма регистрации (логин + профиль + анкета)."
                  checked={mgmt?.PlayersOptions?.allowPlayerCreation !== false}
                  onChange={(e) => handleToggleSignup(e.currentTarget.checked)}
                />
              </Card>
            )}

            <Card shadow="sm" padding="md" withBorder>
              <Group justify="space-between" mb="md">
                <Text fw={600}>Логины игроков</Text>
                {canAdmin && (
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => openLinkModal()}
                      disabled={playerLogins.length === 0 || playerNames.length === 0}
                    >
                      Связать с профилем
                    </Button>
                    <Button size="xs" onClick={openPlayer}>Создать игрока</Button>
                  </Group>
                )}
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                Игрок регистрируется сам или создаётся здесь. Логин можно связать с уже заведённым
                профилем (имена могут отличаться).
              </Text>
              {playerLogins.length === 0 ? (
                <Text size="sm" c="dimmed">Пока нет логинов. Включите регистрацию или создайте игрока.</Text>
              ) : (
                <HScroll minWidth={640}>
                  <Table striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Логин</Table.Th>
                        <Table.Th>Профиль</Table.Th>
                        <Table.Th>Персонаж</Table.Th>
                        <Table.Th>Действия</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {playerLogins.map((name) => {
                        const resolved = resolvedByLogin[name];
                        const linked = !!mgmt?.PlayersInfo?.[name]?.profileName;
                        return (
                          <Table.Tr key={name}>
                            <Table.Td>{name}</Table.Td>
                            <Table.Td>
                              {resolved ? (
                                <Group gap={6}>
                                  <Text size="sm">{resolved}</Text>
                                  {linked && resolved !== name && (
                                    <Badge size="sm" color="blue" variant="light">связь</Badge>
                                  )}
                                </Group>
                              ) : (
                                <Badge size="sm" color="orange" variant="light">нет профиля</Badge>
                              )}
                            </Table.Td>
                            <Table.Td>
                              {(resolved && characterByPlayer[resolved]) || characterByPlayer[name] || (
                                <Text span size="sm" c="dimmed">не привязан</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              {canAdmin ? (
                                <Group gap="xs">
                                  <Button size="compact-xs" variant="subtle" onClick={() => openLinkModal(name)}>
                                    Связать
                                  </Button>
                                  {linked && (
                                    <Button size="compact-xs" variant="subtle" color="gray" onClick={() => handleUnlinkLogin(name)}>
                                      Отвязать
                                    </Button>
                                  )}
                                  <Button size="compact-xs" variant="subtle" onClick={() => openChangePassword('player', name)}>
                                    Пароль
                                  </Button>
                                  <Button size="compact-xs" variant="subtle" color="blue" onClick={() => handlePromotePlayer(name)}>
                                    В организаторы
                                  </Button>
                                  <Button size="compact-xs" variant="subtle" color="red" onClick={() => handleRemovePlayer(name)}>
                                    Удалить логин
                                  </Button>
                                </Group>
                              ) : (
                                <Text size="sm" c="dimmed">только админ</Text>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </HScroll>
              )}
            </Card>

            {canAdmin && profilesWithoutLogin.length > 0 && (
              <Card shadow="sm" padding="md" withBorder>
                <Text fw={600} mb="sm">Профили без логина</Text>
                <Text size="sm" c="dimmed" mb="md">
                  Заведены вручную. После саморегистрации игрока свяжите его логин с этим профилем.
                </Text>
                <Stack gap="xs">
                  {profilesWithoutLogin.map((name) => (
                    <Group key={name} justify="space-between">
                      <Text size="sm">{name}</Text>
                      <Button
                        size="compact-xs"
                        variant="light"
                        disabled={playerLogins.length === 0}
                        onClick={() => openLinkModal(undefined, name)}
                      >
                        Связать логин
                      </Button>
                    </Group>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>

        {canAdmin && (
          <Tabs.Panel value="database" pt="md">
            <Card shadow="sm" padding="md" withBorder>
              <Text fw={600} mb="sm">{t('admin.database')}</Text>
              <Text size="sm" c="dimmed" mb="sm">
                Загрузка заменяет содержимое игры. Существующие пользователи и пароли сохраняются;
                пользователи из файла, которых ещё нет на сервере, добавляются.
              </Text>
              <Group>
                <Button variant="default" onClick={handleDownload}>{t('admin.downloadDb')}</Button>
                <FileButton resetRef={resetRef} onChange={handleUpload} accept="application/json">
                  {(props) => (
                    <Tooltip label={canAdmin ? undefined : 'Только для администратора'} disabled={canAdmin}>
                      <Button variant="default" {...props} disabled={!canAdmin}>
                        {t('admin.uploadDb')}
                      </Button>
                    </Tooltip>
                  )}
                </FileButton>
              </Group>
            </Card>
          </Tabs.Panel>
        )}

      </Tabs>

      <Modal opened={opened} onClose={close} title="Создать организатора">
        <Stack>
          <TextInput label="Логин" value={newName} onChange={(e) => setNewName(e.currentTarget.value)} autoFocus />
          <PasswordInput label="Пароль" value={newPass} onChange={(e) => setNewPass(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={playerOpened} onClose={closePlayer} title="Создать игрока">
        <Stack>
          <Text size="sm" c="dimmed">
            Создаёт логин и профиль с одним именем. Обычно игроки регистрируются сами.
          </Text>
          <TextInput label="Имя (профиль = логин)" value={playerName} onChange={(e) => setPlayerName(e.currentTarget.value)} autoFocus />
          <PasswordInput label="Пароль" value={playerPass} onChange={(e) => setPlayerPass(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closePlayer}>{t('common.cancel')}</Button>
            <Button onClick={handleCreatePlayer}>{t('common.create')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={linkOpened} onClose={closeLink} title="Связать логин с профилем">
        <Stack>
          <Text size="sm" c="dimmed">
            Заполненные игроком поля перенесутся; пустые дополнятся из выбранного профиля.
            Лист под именем логина удалится.
          </Text>
          <Select
            label="Логин"
            data={playerLogins}
            value={linkLogin}
            onChange={setLinkLogin}
            searchable
            placeholder="Выберите логин"
          />
          <Select
            label="Профиль"
            data={Array.from(new Set([...profilesWithoutLogin, ...linkableProfiles, ...(linkProfile ? [linkProfile] : [])]))}
            value={linkProfile}
            onChange={setLinkProfile}
            searchable
            placeholder="Выберите профиль"
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeLink}>{t('common.cancel')}</Button>
            <Button onClick={handleLinkLogin} disabled={!linkLogin || !linkProfile}>
              Связать
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={passOpened}
        onClose={() => { closePass(); setPassTarget(null); setPassValue(''); }}
        title={passTarget ? `Новый пароль: ${passTarget.name}` : 'Смена пароля'}
      >
        <Stack>
          <PasswordInput
            label="Новый пароль"
            value={passValue}
            onChange={(e) => setPassValue(e.currentTarget.value)}
            autoFocus
            autoComplete="new-password"
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => { closePass(); setPassTarget(null); setPassValue(''); }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmPasswordChange}
              loading={passSaving}
              disabled={!passValue.trim()}
            >
              Сохранить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default observer(AdminPage);

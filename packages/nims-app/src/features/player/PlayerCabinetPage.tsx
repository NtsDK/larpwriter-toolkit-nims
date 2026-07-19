import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Title, Stack, Card, Text, Tabs, Skeleton, Alert, Group, Badge, List,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRootStore } from '@/stores';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';
import { PlayerProfileFields, type PlayerFieldStructure } from './PlayerProfileFields';

interface ProfileBlock {
  name: string;
  profile: Record<string, unknown>;
  profileStructure: PlayerFieldStructure[];
}

interface PlayerProfileInfo {
  login?: string;
  player: ProfileBlock;
  questionnaire: ProfileBlock;
  character?: ProfileBlock;
}

function tabFromPath(pathname: string): 'me' | 'questionnaire' | 'character' {
  if (pathname.startsWith('/character')) return 'character';
  if (pathname.startsWith('/questionnaire')) return 'questionnaire';
  return 'me';
}

function PlayerCabinetPage() {
  const { api, auth } = useRootStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<PlayerProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tab = tabFromPath(location.pathname);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await api.get<PlayerProfileInfo>('getPlayerProfileInfo');
      setData(info);
    } catch (e: any) {
      setError(e.message || 'Не удалось загрузить данные');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!loading && data && tab === 'character' && !data.character) {
      navigate('/', { replace: true });
    }
  }, [loading, data, tab, navigate]);

  const handleFieldChange = async (
    type: 'player' | 'character' | 'questionnaire',
    characterName: string,
    fieldName: string,
    itemType: string,
    value: unknown,
  ) => {
    try {
      await api.call('updateProfileField', {
        type,
        characterName,
        fieldName,
        itemType,
        value,
      });
      await reload();
      notifications.show({ title: 'Сохранено', message: fieldName, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  if (loading && !data) {
    return (
      <Stack gap="md">
        <Skeleton height={36} width={220} />
        <Skeleton height={200} />
      </Stack>
    );
  }

  if (error) {
    return <Alert color="red" title="Ошибка">{error}</Alert>;
  }

  if (!data) {
    return <Alert color="gray">Нет данных профиля</Alert>;
  }

  const hasCharacter = !!data.character;
  const qFields = data.questionnaire?.profileStructure?.length ?? 0;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Title order={2}>Личный кабинет</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {data.login && data.player.name !== data.login
              ? `${data.login} → ${data.player.name}`
              : (data.login || auth.user?.name || data.player.name)}
          </Text>
        </div>
        {hasCharacter ? (
          <Badge size="lg" variant="light" color="teal">
            Персонаж: {data.character!.name}
          </Badge>
        ) : (
          <Badge size="lg" variant="outline" color="gray">
            Персонаж не назначен
          </Badge>
        )}
      </Group>

      <Tabs
        value={tab}
        onChange={(v) => {
          if (v === 'character') navigate('/character');
          else if (v === 'questionnaire') navigate('/questionnaire');
          else navigate('/');
        }}
      >
        <ScrollableTabsList>
          <Tabs.Tab value="me">О вас</Tabs.Tab>
          <Tabs.Tab value="questionnaire">Анкета</Tabs.Tab>
          <Tabs.Tab value="character" disabled={!hasCharacter}>
            Персонаж
          </Tabs.Tab>
        </ScrollableTabsList>

        <Tabs.Panel value="me" pt="md">
          <Stack gap="md">
            <Card withBorder padding="lg" radius="md">
              <Text fw={600} mb="sm">О вас</Text>
              <List spacing="xs" size="sm">
                <List.Item>
                  Логин: <Text span fw={500}>{data.login || auth.user?.name}</Text>
                </List.Item>
                {data.login && data.player.name !== data.login && (
                  <List.Item>
                    Профиль: <Text span fw={500}>{data.player.name}</Text>
                  </List.Item>
                )}
                <List.Item>
                  Персонаж:{' '}
                  <Text span fw={500}>
                    {hasCharacter ? data.character!.name : 'не назначен'}
                  </Text>
                </List.Item>
                <List.Item>
                  Полей в анкете: <Text span fw={500}>{qFields}</Text>
                </List.Item>
              </List>
            </Card>
            <Card withBorder padding="lg" radius="md">
              <Text fw={600} mb={4}>Профиль игрока</Text>
              <Text size="sm" c="dimmed" mb="md">
                Контактные и служебные поля профиля (не анкета).
              </Text>
              <PlayerProfileFields
                structure={data.player.profileStructure}
                profile={data.player.profile}
                profileType="player"
                entityName={data.player.name}
                onChange={(fieldName, itemType, value) =>
                  handleFieldChange('player', data.player.name, fieldName, itemType, value)}
              />
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="questionnaire" pt="md">
          <Card withBorder padding="lg" radius="md">
            <Text fw={600} mb={4}>Анкета</Text>
            <Text size="sm" c="dimmed" mb="md">
              Отдельная анкета о себе. Сохраняется при уходе с поля.
            </Text>
            <PlayerProfileFields
              structure={data.questionnaire?.profileStructure || []}
              profile={data.questionnaire?.profile || { name: data.player.name }}
              profileType="questionnaire"
              entityName={data.player.name}
              onChange={(fieldName, itemType, value) =>
                handleFieldChange('questionnaire', data.player.name, fieldName, itemType, value)}
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="character" pt="md">
          {data.character ? (
            <Card withBorder padding="lg" radius="md">
              <Group mb="md" gap="sm">
                <Text fw={600}>Персонаж</Text>
                <Text fw={700}>{data.character.name}</Text>
              </Group>
              <PlayerProfileFields
                structure={data.character.profileStructure}
                profile={data.character.profile}
                profileType="character"
                entityName={data.character.name}
                onChange={(fieldName, itemType, value) =>
                  handleFieldChange('character', data.character!.name, fieldName, itemType, value)}
              />
            </Card>
          ) : (
            <Alert color="gray" title="Нет персонажа">
              Организатор ещё не привязал к вам персонажа.
            </Alert>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default observer(PlayerCabinetPage);

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Card, Title, Text, SimpleGrid, Stack, TextInput, Skeleton, Group, Table, Tabs, Alert,
} from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { DoughnutList, Histogram, ProfileFieldChart, type HistBar } from './chartBits';
import { GearsTab } from './GearsTab';
import { SlidersTab } from './SlidersTab';

type CompletenessTuple = [string, number, number];

interface OverviewStats {
  characterNumber?: number;
  playerNumber?: number;
  storyNumber?: number;
  groupNumber?: number;
  eventsNumber?: number;
  userNumber?: number;
  firstEvent?: string;
  lastEvent?: string;
  textCharacterNumber?: number;
  storyCompleteness?: CompletenessTuple;
  generalCompleteness?: CompletenessTuple;
  relationCompleteness?: CompletenessTuple;
  storyEventsHist?: HistBar[];
  storyCharactersHist?: HistBar[];
  characterStoriesHist?: HistBar[];
  eventCompletenessHist?: HistBar[];
  characterSymbolsHist?: HistBar[];
  symbolChart?: Array<{ label: string; value: number }>;
  characterChart?: Array<{ label: string; value: number }>;
  playerChart?: Array<{ label: string; value: number }>;
  storyChart?: Array<{ label: string; value: number }>;
  groupChart?: Array<{ label: string; value: number }>;
  bindingChart?: Array<{ label: string; value: number }>;
  profileCharts?: {
    characterCharts: Array<{ id: string; name: string; type: string; data: any }>;
    playerCharts: Array<{ id: string; name: string; type: string; data: any }>;
  };
}

function fmtCompleteness(t?: CompletenessTuple) {
  if (!t || !Array.isArray(t)) return '—';
  return `${t[0]}% (${t[1]} из ${t[2]})`;
}

function OverviewPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const canEditMeta = permissions.canAdminOps;
  const [meta, setMeta] = useState<any>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string | null>('about');

  useEffect(() => {
    Promise.all([
      api.get('getMetaInfo').then(setMeta),
      api.get<OverviewStats>('getStatistics').then(setStats).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Stack gap="md"><Skeleton height={40} /><Skeleton height={200} /></Stack>;
  }

  const handleMetaString = async (name: string, value: string) => {
    if (!canEditMeta) return;
    await api.call('setMetaInfoString', { name, value });
    setMeta(await api.get('getMetaInfo'));
  };

  const handleMetaDate = async (name: string, value: string) => {
    if (!canEditMeta) return;
    await api.call('setMetaInfoDate', { name, value });
    setMeta(await api.get('getMetaInfo'));
  };

  const charCharts = stats?.profileCharts?.characterCharts || [];
  const playerCharts = stats?.profileCharts?.playerCharts || [];

  return (
    <Stack gap="lg">
      <Title order={2}>{t('overview.title')}</Title>

      <Tabs value={tab} onChange={setTab}>
        <ScrollableTabsList>
          <Tabs.Tab value="about">Информация об игре</Tabs.Tab>
          <Tabs.Tab value="stat-diagrams">Статистические диаграммы</Tabs.Tab>
          <Tabs.Tab value="profile-diagrams">Диаграммы досье</Tabs.Tab>
          <Tabs.Tab value="gears">Шестерёнка</Tabs.Tab>
          <Tabs.Tab value="sliders">Микшерный пульт</Tabs.Tab>
        </ScrollableTabsList>

        <Tabs.Panel value="about" pt="md">
          <Group align="flex-start" wrap="wrap" gap="md">
            <Card withBorder padding="md" style={{ flex: '2 1 420px', minWidth: 280 }}>
              <Stack gap="sm">
                {!canEditMeta && (
                  <Text size="sm" c="dimmed">Редактирование метаданных доступно только администратору.</Text>
                )}
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    label={t('overview.gameName')}
                    defaultValue={meta?.name || ''}
                    readOnly={!canEditMeta}
                    onBlur={(e) => {
                      if (e.currentTarget.value !== (meta?.name || ''))
                        handleMetaString('name', e.currentTarget.value);
                    }}
                  />
                  <div>
                    <Text size="sm" fw={500}>Время последнего сохранения</Text>
                    <Text size="sm" c="dimmed" mt={6}>{meta?.saveTime || '—'}</Text>
                  </div>
                  <TextInput
                    label="Дата начала доигровых событий"
                    defaultValue={meta?.preGameDate || ''}
                    readOnly={!canEditMeta}
                    onBlur={(e) => {
                      if (e.currentTarget.value !== (meta?.preGameDate || ''))
                        handleMetaDate('preGameDate', e.currentTarget.value);
                    }}
                  />
                  <TextInput
                    label="Дата окончания доигровых событий"
                    defaultValue={meta?.date || ''}
                    readOnly={!canEditMeta}
                    onBlur={(e) => {
                      if (e.currentTarget.value !== (meta?.date || ''))
                        handleMetaDate('date', e.currentTarget.value);
                    }}
                  />
                </SimpleGrid>
                <Textarea
                  label={t('overview.description')}
                  defaultValue={meta?.description || ''}
                  rows={6}
                  readOnly={!canEditMeta}
                  onBlur={(e) => {
                    if (e.currentTarget.value !== (meta?.description || ''))
                      handleMetaString('description', e.currentTarget.value);
                  }}
                />
              </Stack>
            </Card>

            <Card withBorder padding="md" style={{ flex: '1 1 260px', minWidth: 240 }}>
              <Text fw={600} ta="center" mb="sm">Статистика</Text>
              <Table striped withTableBorder>
                <Table.Tbody>
                  {[
                    ['Количество персонажей', stats?.characterNumber],
                    ['Количество игроков', stats?.playerNumber],
                    ['Количество историй', stats?.storyNumber],
                    ['Количество групп', stats?.groupNumber],
                    ['Количество событий', stats?.eventsNumber],
                    ['Количество пользователей', stats?.userNumber],
                    ['Первое событие', stats?.firstEvent || '—'],
                    ['Последнее событие', stats?.lastEvent || '—'],
                    ['Количество знаков в текстах (без пробелов)', stats?.textCharacterNumber],
                    ['Завершённость историй', fmtCompleteness(stats?.storyCompleteness)],
                    ['Общая завершённость', fmtCompleteness(stats?.generalCompleteness)],
                    ['Завершённость отношений', fmtCompleteness(stats?.relationCompleteness)],
                  ].map(([label, value]) => (
                    <Table.Tr key={String(label)}>
                      <Table.Td><Text size="sm">{label}</Text></Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text size="sm" fw={600}>{value ?? '—'}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="stat-diagrams" pt="md">
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card withBorder padding="md">
                <Histogram title="Количество событий в историях" data={stats?.storyEventsHist} />
              </Card>
              <Card withBorder padding="md">
                <Histogram title="Количество персонажей в историях" data={stats?.storyCharactersHist} />
              </Card>
              <Card withBorder padding="md">
                <Histogram title="Количество историй у персонажей" data={stats?.characterStoriesHist} />
              </Card>
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card withBorder padding="md">
                <Histogram title="Детальная завершённость историй" data={stats?.eventCompletenessHist} />
              </Card>
              <Card withBorder padding="md">
                <Histogram title="Количество знаков у персонажей" data={stats?.characterSymbolsHist} />
              </Card>
              <Card withBorder padding="md">
                <DoughnutList title="Количество знаков по видам текстов" data={stats?.symbolChart} />
              </Card>
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder padding="md">
                <Text fw={600} size="sm" mb="sm">Принадлежность объектов</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <DoughnutList title="Персонажи" data={stats?.characterChart} />
                  <DoughnutList title="Игроки" data={stats?.playerChart} />
                  <DoughnutList title="Истории" data={stats?.storyChart} />
                  <DoughnutList title="Группы" data={stats?.groupChart} />
                </SimpleGrid>
              </Card>
              <Card withBorder padding="md">
                <DoughnutList title="Персонажи и игроки" data={stats?.bindingChart} />
              </Card>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="profile-diagrams" pt="md">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="sm">Диаграммы досье персонажей</Title>
              {charCharts.length === 0 ? (
                <Alert color="blue">Нет полей досье персонажа подходящих типов (enum / number / checkbox).</Alert>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {charCharts.map((c) => (
                    <Card key={c.id} withBorder padding="md">
                      <ProfileFieldChart name={c.name} type={c.type} data={c.data} />
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </div>
            <div>
              <Title order={4} mb="sm">Диаграммы досье игроков</Title>
              {playerCharts.length === 0 ? (
                <Alert color="blue">Нет полей досье игрока подходящих типов (enum / number / checkbox).</Alert>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {playerCharts.map((c) => (
                    <Card key={c.id} withBorder padding="md">
                      <ProfileFieldChart name={c.name} type={c.type} data={c.data} />
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </div>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="gears" pt="md">
          <GearsTab />
        </Tabs.Panel>

        <Tabs.Panel value="sliders" pt="md">
          <SlidersTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default observer(OverviewPage);

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stack, Text, Group, Badge, Anchor, Card, Progress, Skeleton, Table, Tooltip,
} from '@mantine/core';
import { useRootStore } from '@/stores';
import { HScroll } from '@/components/HScroll';

interface StoryReport {
  storyName: string;
  inventory: string;
  activity: Partial<Record<'active' | 'follower' | 'defensive' | 'passive', boolean>>;
  meets: string[];
  totalAdaptations: number;
  finishedAdaptations: number;
  eventsCount?: number;
  finished?: number;
}

interface RelationRow {
  other: string;
  origin: string;
  ready: boolean;
  essence: string[];
  /** Relative to selected character: outgoing / allies / incoming */
  toOther: boolean;
  allies: boolean;
  fromOther: boolean;
  sharedStories: string[];
  textPreview: string;
}

interface CharacterConnectionsProps {
  characterName: string;
}

const ACTIVITY: Array<{ key: 'active' | 'follower' | 'defensive' | 'passive'; short: string; label: string }> = [
  { key: 'active', short: 'А', label: 'Актив' },
  { key: 'follower', short: 'С', label: 'Спутник' },
  { key: 'defensive', short: 'З', label: 'Защита' },
  { key: 'passive', short: 'П', label: 'Пассив' },
];

function completenessLabel(finished: number, total: number): string {
  if (total === 0) return '—';
  const pct = Math.round((finished / total) * 100);
  return `${pct}% (${finished}/${total})`;
}

function completenessColor(finished: number, total: number): string {
  if (total === 0) return 'gray';
  const p = finished / total;
  if (p >= 1) return 'green';
  if (p >= 0.5) return 'yellow';
  if (p > 0) return 'orange';
  return 'red';
}

export function CharacterConnections({ characterName }: CharacterConnectionsProps) {
  const { api } = useRootStore();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<StoryReport[]>([]);
  const [completeness, setCompleteness] = useState(0);
  const [totalAdaptations, setTotalAdaptations] = useState(0);
  const [finishedAdaptations, setFinishedAdaptations] = useState(0);
  const [relations, setRelations] = useState<RelationRow[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [report, relSummary, groupTexts] = await Promise.all([
          api.get<{
            stories: StoryReport[];
            completeness: number;
            totalAdaptations: number;
            finishedAdaptations: number;
          }>('getCharacterReport', { characterName }),
          api.get<{
            relations: Array<Record<string, unknown>>;
            knownCharacters: Record<string, Record<string, boolean>>;
          }>('getRelationsSummary', { characterName }).catch(async () => {
            const all = await api.get<Array<Record<string, unknown>>>('getRelations');
            return { relations: all || [], knownCharacters: {} as Record<string, Record<string, boolean>> };
          }),
          api.get<Record<string, Record<string, string>>>('getAllCharacterGroupTexts').catch(() => ({})),
        ]);

        if (cancelled) return;

        setStories(Array.isArray(report?.stories) ? report.stories : []);
        setCompleteness(report?.completeness ?? 0);
        setTotalAdaptations(report?.totalAdaptations ?? 0);
        setFinishedAdaptations(report?.finishedAdaptations ?? 0);

        const known = relSummary?.knownCharacters || {};
        const rels: RelationRow[] = [];
        for (const rel of relSummary?.relations || []) {
          const starter = String(rel.starter || '');
          const ender = String(rel.ender || '');
          if (starter !== characterName && ender !== characterName) continue;
          const other = starter === characterName ? ender : starter;
          const isStarter = starter === characterName;
          const essence = Array.isArray(rel.essence) ? (rel.essence as string[]) : [];
          const text = String(rel[characterName] ?? '');
          rels.push({
            other,
            origin: String(rel.origin || ''),
            ready: isStarter ? !!rel.starterTextReady : !!rel.enderTextReady,
            essence,
            toOther: essence.includes(isStarter ? 'starterToEnder' : 'enderToStarter'),
            allies: essence.includes('allies'),
            fromOther: essence.includes(isStarter ? 'enderToStarter' : 'starterToEnder'),
            sharedStories: Object.keys(known[other] || {}).sort((a, b) => a.localeCompare(b)),
            textPreview: text.trim().slice(0, 160),
          });
        }
        rels.sort((a, b) => a.other.localeCompare(b.other));
        setRelations(rels);

        const charGroups = groupTexts?.[characterName] || {};
        setGroups(Object.keys(charGroups).sort((a, b) => a.localeCompare(b)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [characterName]);

  if (loading) {
    return (
      <Stack gap="sm">
        <Skeleton height={60} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  const pct = Math.round((completeness || 0) * 100);

  return (
    <Stack gap="md">
      <Card withBorder padding="sm">
        <Group justify="space-between" mb={6}>
          <Text size="sm" fw={600}>Готовность вводных</Text>
          <Text size="sm" c="dimmed">{finishedAdaptations} / {totalAdaptations}</Text>
        </Group>
        <Progress value={pct} size="sm" radius="xl" color={completenessColor(finishedAdaptations, totalAdaptations)} />
        <Text size="xs" c="dimmed" mt={4}>{pct}% адаптаций отмечено готовыми</Text>
      </Card>

      <Card withBorder padding="sm">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={600}>Истории ({stories.length})</Text>
        </Group>
        {stories.length === 0 ? (
          <Text size="sm" c="dimmed">Не участвует ни в одной истории</Text>
        ) : (
          <HScroll minWidth={720}>
            <Table striped withTableBorder stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>История</Table.Th>
                  {ACTIVITY.map((a) => (
                    <Table.Th key={a.key} style={{ textAlign: 'center', width: 40 }}>
                      <Tooltip label={a.label} withArrow>
                        <Text size="xs" fw={600}>{a.short}</Text>
                      </Tooltip>
                    </Table.Th>
                  ))}
                  <Table.Th>Готовность</Table.Th>
                  <Table.Th>Пересечения</Table.Th>
                  <Table.Th>Инвентарь</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stories.map((s) => {
                  const finished = s.finishedAdaptations ?? s.finished ?? 0;
                  const total = s.totalAdaptations ?? s.eventsCount ?? 0;
                  return (
                    <Table.Tr key={s.storyName}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Anchor
                            component={Link}
                            to={`/stories?select=${encodeURIComponent(s.storyName)}`}
                            size="sm"
                            fw={500}
                          >
                            {s.storyName}
                          </Anchor>
                          <Anchor
                            component={Link}
                            to={`/adaptations?story=${encodeURIComponent(s.storyName)}&character=${encodeURIComponent(characterName)}`}
                            size="xs"
                            c="dimmed"
                          >
                            адаптации
                          </Anchor>
                        </Stack>
                      </Table.Td>
                      {ACTIVITY.map((a) => (
                        <Table.Td key={a.key} style={{ textAlign: 'center' }}>
                          <Badge
                            size="sm"
                            circle
                            variant={s.activity?.[a.key] ? 'filled' : 'outline'}
                            color={s.activity?.[a.key] ? 'blue' : 'gray'}
                            style={{ opacity: s.activity?.[a.key] ? 1 : 0.35 }}
                          >
                            {a.short}
                          </Badge>
                        </Table.Td>
                      ))}
                      <Table.Td>
                        <Badge size="sm" color={completenessColor(finished, total)} variant="light">
                          {completenessLabel(finished, total)}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ maxWidth: 220 }}>
                        {s.meets?.length ? (
                          <Text size="xs" style={{ whiteSpace: 'normal' }}>
                            {s.meets.map((name, i) => (
                              <span key={name}>
                                {i > 0 ? ', ' : ''}
                                <Anchor
                                  component={Link}
                                  to={`/characters?select=${encodeURIComponent(name)}`}
                                  size="xs"
                                >
                                  {name}
                                </Anchor>
                              </span>
                            ))}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ maxWidth: 200 }}>
                        <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
                          {(s.inventory || '').trim() || '—'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </HScroll>
        )}
      </Card>

      <Card withBorder padding="sm">
        <Text size="sm" fw={600} mb="xs">Отношения ({relations.length})</Text>
        {relations.length === 0 ? (
          <Text size="sm" c="dimmed">Нет отношений</Text>
        ) : (
          <HScroll minWidth={680}>
            <Table striped withTableBorder stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Персонаж</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>
                    <Tooltip label={`Активное отношение «${characterName}» к партнёру`} withArrow>
                      <Text size="xs">→</Text>
                    </Tooltip>
                  </Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>
                    <Tooltip label="Союзники" withArrow><Text size="xs">↔</Text></Tooltip>
                  </Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>
                    <Tooltip label={`Активное отношение партнёра к «${characterName}»`} withArrow>
                      <Text size="xs">←</Text>
                    </Tooltip>
                  </Table.Th>
                  <Table.Th>Статус</Table.Th>
                  <Table.Th>Суть</Table.Th>
                  <Table.Th>Где пересекаются</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {relations.map((r) => (
                  <Table.Tr key={r.other}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Anchor
                          component={Link}
                          to={`/characters?select=${encodeURIComponent(r.other)}`}
                          size="sm"
                          fw={500}
                        >
                          {r.other}
                        </Anchor>
                        <Anchor
                          component={Link}
                          to={`/relations?select=${encodeURIComponent(characterName)}`}
                          size="xs"
                          c="dimmed"
                        >
                          открыть отношения
                        </Anchor>
                        {r.textPreview && (
                          <Text size="xs" c="dimmed" lineClamp={2}>{r.textPreview}</Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Tooltip label={`Активное отношение «${characterName}» к «${r.other}»`} withArrow>
                        <Badge size="sm" variant={r.toOther ? 'filled' : 'outline'} color={r.toOther ? 'blue' : 'gray'}>→</Badge>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Tooltip label="Союзники" withArrow>
                        <Badge size="sm" variant={r.allies ? 'filled' : 'outline'} color={r.allies ? 'green' : 'gray'}>↔</Badge>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Tooltip label={`Активное отношение «${r.other}» к «${characterName}»`} withArrow>
                        <Badge size="sm" variant={r.fromOther ? 'filled' : 'outline'} color={r.fromOther ? 'orange' : 'gray'}>←</Badge>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" color={r.ready ? 'green' : 'gray'} variant="light">
                        {r.ready ? 'готово' : 'черновик'}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ maxWidth: 220 }}>
                      <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
                        {(r.origin || '').trim() || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ maxWidth: 200 }}>
                      {r.sharedStories.length ? (
                        <Text size="xs" style={{ whiteSpace: 'normal' }}>
                          {r.sharedStories.map((name, i) => (
                            <span key={name}>
                              {i > 0 ? ', ' : ''}
                              <Anchor
                                component={Link}
                                to={`/stories?select=${encodeURIComponent(name)}`}
                                size="xs"
                              >
                                {name}
                              </Anchor>
                            </span>
                          ))}
                        </Text>
                      ) : (
                        <Text size="xs" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </HScroll>
        )}
      </Card>

      <Card withBorder padding="sm">
        <Text size="sm" fw={600} mb="xs">Группы ({groups.length})</Text>
        {groups.length === 0 ? (
          <Text size="sm" c="dimmed">Не состоит в группах</Text>
        ) : (
          <Group gap="xs">
            {groups.map((g) => (
              <Anchor
                key={g}
                component={Link}
                to={`/groups?select=${encodeURIComponent(g)}`}
                size="sm"
              >
                {g}
              </Anchor>
            ))}
          </Group>
        )}
      </Card>
    </Stack>
  );
}

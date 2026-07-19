import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import {
  Title, Stack, Group, Button, Card, Text, Badge, Accordion, Anchor, Loader, Center,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { EmptyState } from '@/components/EmptyState';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ProfileItem {
  name: string;
  type: string;
  value?: string;
  showInRoleGrid?: boolean;
}

interface ProfileRow {
  characterName: string;
  playerName?: string;
  character: Record<string, unknown>;
  player?: Record<string, unknown>;
}

interface RoleGridInfo {
  profileData: ProfileRow[];
  characterProfileStructure: ProfileItem[];
  playerProfileStructure: ProfileItem[];
}

interface TreeNode {
  key: string;
  label: string;
  characters: number;
  players: number;
  rows: ProfileRow[];
  children?: TreeNode[];
}

function checkboxToYesNo(v: unknown): string {
  return v === true || v === 'true' || v === 'Да' ? 'Да' : 'Нет';
}

function normalizeRow(row: ProfileRow, checkboxFields: string[]): ProfileRow {
  if (checkboxFields.length === 0) return row;
  const character = { ...row.character };
  for (const name of checkboxFields) {
    character[name] = checkboxToYesNo(character[name]);
  }
  return { ...row, character };
}

function buildTree(rows: ProfileRow[], groupingOrder: string[]): TreeNode[] {
  if (groupingOrder.length === 0) {
    return [{
      key: 'all',
      label: 'Все персонажи',
      characters: rows.length,
      players: rows.filter((r) => r.playerName).length,
      rows: [...rows].sort((a, b) => a.characterName.localeCompare(b.characterName)),
    }];
  }

  const groupRecursive = (list: ProfileRow[], depth: number, path: string[]): TreeNode[] => {
    if (depth >= groupingOrder.length) {
      return [];
    }
    const field = groupingOrder[depth];
    const buckets = new Map<string, ProfileRow[]>();
    for (const row of list) {
      const raw = row.character[field];
      const value = raw == null || raw === '' ? '—' : String(raw);
      if (!buckets.has(value)) buckets.set(value, []);
      buckets.get(value)!.push(row);
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, bucket]) => {
        const keyPath = [...path, `${field}:${value}`];
        const children = depth < groupingOrder.length - 1
          ? groupRecursive(bucket, depth + 1, keyPath)
          : undefined;
        return {
          key: keyPath.join('/'),
          label: `${field}: ${value}`,
          characters: bucket.length,
          players: bucket.filter((r) => r.playerName).length,
          rows: children ? [] : bucket.sort((a, b) => a.characterName.localeCompare(b.characterName)),
          children,
        };
      });
  };

  return [{
    key: 'root',
    label: 'Все персонажи',
    characters: rows.length,
    players: rows.filter((r) => r.playerName).length,
    rows: [],
    children: groupRecursive(rows, 0, []),
  }];
}

function ProfileMini({ title, data, fields }: {
  title: string;
  data?: Record<string, unknown>;
  fields: ProfileItem[];
}) {
  if (!data) return null;
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} c="dimmed">{title}</Text>
      {fields.map((f) => (
        <Group key={f.name} gap="xs" wrap="nowrap" align="flex-start">
          <Text size="xs" c="dimmed" style={{ minWidth: 100 }}>{f.name}</Text>
          <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
            {data[f.name] == null || data[f.name] === '' ? '—' : String(data[f.name])}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

function collectGroupKeys(nodes: TreeNode[]): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    keys.push(node.key);
    if (node.children?.length) keys.push(...collectGroupKeys(node.children));
  }
  return keys;
}

function CharacterList({
  rows, charFields, playerFields,
}: {
  rows: ProfileRow[];
  charFields: ProfileItem[];
  playerFields: ProfileItem[];
}) {
  // Characters start collapsed — only names visible until opened
  return (
    <Accordion multiple defaultValue={[]}>
      {rows.map((row) => (
        <Accordion.Item key={row.characterName} value={row.characterName}>
          <Accordion.Control>
            <Group gap="sm" wrap="nowrap">
              <Text fw={600} size="sm">{row.characterName}</Text>
              {row.playerName && (
                <Text size="xs" c="dimmed">{row.playerName}</Text>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Group gap="md">
                <Anchor
                  component={Link}
                  to={`/characters?select=${encodeURIComponent(row.characterName)}`}
                  size="sm"
                >
                  Открыть персонажа
                </Anchor>
                {row.playerName && (
                  <Anchor
                    component={Link}
                    to={`/players?select=${encodeURIComponent(row.playerName)}`}
                    size="sm"
                  >
                    Открыть игрока
                  </Anchor>
                )}
              </Group>
              <ProfileMini title="Персонаж" data={row.character} fields={charFields} />
              {row.player && (
                <ProfileMini title="Игрок" data={row.player} fields={playerFields} />
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

function TreeView({
  nodes, charFields, playerFields,
}: {
  nodes: TreeNode[];
  charFields: ProfileItem[];
  playerFields: ProfileItem[];
}) {
  // Grouping levels start expanded
  const openGroups = collectGroupKeys(nodes);

  return (
    <Accordion multiple defaultValue={openGroups}>
      {nodes.map((node) => (
        <Accordion.Item key={node.key} value={node.key}>
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={500}>{node.label}</Text>
              <Badge size="sm" variant="light">
                перс. {node.characters} / игр. {node.players}
              </Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {node.children && node.children.length > 0 ? (
              <TreeView nodes={node.children} charFields={charFields} playerFields={playerFields} />
            ) : (
              <CharacterList rows={node.rows} charFields={charFields} playerFields={playerFields} />
            )}
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

function RoleGridPage() {
  const { t } = useTranslation();
  const { api } = useRootStore();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<RoleGridInfo | null>(null);
  const [activeFields, setActiveFields] = useState<string[]>([]);
  const [fieldOrder, setFieldOrder] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    api.get<RoleGridInfo>('getRoleGridInfo')
      .then((data) => {
        setInfo(data);
        const enums = (data.characterProfileStructure || [])
          .filter((f) => f.type === 'enum' || f.type === 'checkbox')
          .map((f) => f.name)
          .sort((a, b) => a.localeCompare(b));
        setFieldOrder(enums);
      })
      .finally(() => setLoading(false));
  }, []);

  const checkboxFields = useMemo(
    () => (info?.characterProfileStructure || []).filter((f) => f.type === 'checkbox').map((f) => f.name),
    [info],
  );

  const rows = useMemo(() => {
    if (!info) return [];
    return info.profileData.map((r) => normalizeRow(r, checkboxFields));
  }, [info, checkboxFields]);

  const tree = useMemo(() => buildTree(rows, activeFields), [rows, activeFields]);

  const moveField = (name: string, dir: -1 | 1) => {
    setFieldOrder((order) => {
      const idx = order.indexOf(name);
      if (idx < 0) return order;
      const next = idx + dir;
      if (next < 0 || next >= order.length) return order;
      const copy = [...order];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      setActiveFields((active) => active
        .slice()
        .sort((a, b) => copy.indexOf(a) - copy.indexOf(b)));
      return copy;
    });
  };

  const toggleField = (name: string) => {
    setActiveFields((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      const next = [...prev, name];
      return next.sort((a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b));
    });
  };

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  if (!info || info.profileData.length === 0) {
    return (
      <Stack gap="lg">
        <Title order={2}>{t('roleGrid.title')}</Title>
        <EmptyState
          title="Нет персонажей"
          description="Создайте персонажей и поля профиля (enum/checkbox) — ими строится сетка."
        />
      </Stack>
    );
  }

  if (fieldOrder.length === 0) {
    return (
      <Stack gap="lg">
        <Title order={2}>{t('roleGrid.title')}</Title>
        <EmptyState
          title="Нет полей для группировки"
          description="Добавьте enum или checkbox в структуре профиля персонажа (и отметьте «В сетке ролей»)."
        />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{t('roleGrid.title')}</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Нажмите поле, чтобы добавить/убрать уровень. Стрелки меняют порядок иерархии.
        </Text>
      </div>

      <Group align="start" wrap={isMobile ? 'wrap' : 'nowrap'} gap="md">
        <Card withBorder padding="sm" style={{ width: isMobile ? '100%' : 260, flexShrink: 0 }}>
          <Stack gap="xs">
            <Text size="sm" fw={600}>Уровни группировки</Text>
            {fieldOrder.map((name, i) => {
              const on = activeFields.includes(name);
              return (
                <Group key={name} gap={4} wrap="nowrap">
                  <Button
                    size={isMobile ? 'sm' : 'xs'}
                    variant={on ? 'filled' : 'default'}
                    onClick={() => toggleField(name)}
                    style={{ flex: 1, minHeight: isMobile ? 44 : undefined }}
                  >
                    {name}
                  </Button>
                  <Button size={isMobile ? 'sm' : 'compact-xs'} variant="subtle" disabled={i === 0} onClick={() => moveField(name, -1)}>↑</Button>
                  <Button size={isMobile ? 'sm' : 'compact-xs'} variant="subtle" disabled={i === fieldOrder.length - 1} onClick={() => moveField(name, 1)}>↓</Button>
                </Group>
              );
            })}
            {activeFields.length > 0 && (
              <Button size="xs" variant="subtle" color="gray" onClick={() => setActiveFields([])}>
                Сбросить уровни
              </Button>
            )}
          </Stack>
        </Card>

        <Card withBorder padding="md" style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined }}>
          <TreeView
            key={activeFields.join('|') || 'all'}
            nodes={tree}
            charFields={info.characterProfileStructure}
            playerFields={info.playerProfileStructure}
          />
        </Card>
      </Group>
    </Stack>
  );
}

export default observer(RoleGridPage);

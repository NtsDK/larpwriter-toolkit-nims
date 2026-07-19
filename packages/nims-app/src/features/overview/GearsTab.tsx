import { useEffect, useMemo, useState } from 'react';
import {
  Stack, Group, Button, TextInput, Card, Text, Table, ActionIcon,
  Switch, SimpleGrid, Modal, Select,
} from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRootStore } from '@/stores';
import { useIsMobile } from '@/hooks/useIsMobile';

interface GearNode {
  id: string | number;
  name: string;
  group?: string;
  notes?: string;
  x?: number;
  y?: number;
}

interface GearEdge {
  id: string | number;
  from: string | number;
  to: string | number;
  label?: string;
}

interface GearsData {
  nodes: GearNode[];
  edges: GearEdge[];
  settings: { physicsEnabled: boolean; showNotes: boolean };
}

function nextId(items: Array<{ id: string | number }>): number {
  const nums = items.map((i) => Number(i.id)).filter((n) => Number.isFinite(n));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

export function GearsTab() {
  const { api } = useRootStore();
  const isMobile = useIsMobile();
  const [data, setData] = useState<GearsData | null>(null);
  const [nodeOpen, { open: openNode, close: closeNode }] = useDisclosure(false);
  const [edgeOpen, { open: openEdge, close: closeEdge }] = useDisclosure(false);
  const [editNodeId, setEditNodeId] = useState<string | number | null>(null);
  const [nodeForm, setNodeForm] = useState({ name: '', group: '', notes: '' });
  const [edgeForm, setEdgeForm] = useState<{ from: string | null; to: string | null; label: string }>({
    from: null, to: null, label: '',
  });

  const load = async () => {
    const d = await api.get<GearsData>('getAllGearsData');
    setData(d || { nodes: [], edges: [], settings: { physicsEnabled: false, showNotes: false } });
  };

  useEffect(() => { void load(); }, []);

  const save = async (next: GearsData) => {
    setData(next);
    try {
      await api.call('setGearsData', { data: { nodes: next.nodes, edges: next.edges } });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const nodeNameById = useMemo(() => {
    const m = new Map<string | number, string>();
    for (const n of data?.nodes || []) m.set(n.id, n.name);
    return m;
  }, [data]);

  const nodeOptions = (data?.nodes || []).map((n) => ({ value: String(n.id), label: n.name }));

  if (!data) return <Text c="dimmed">Загрузка…</Text>;

  const openCreateNode = () => {
    setEditNodeId(null);
    setNodeForm({ name: '', group: '', notes: '' });
    openNode();
  };

  const openEditNode = (node: GearNode) => {
    setEditNodeId(node.id);
    setNodeForm({ name: node.name || '', group: node.group || '', notes: node.notes || '' });
    openNode();
  };

  const saveNode = async () => {
    const name = nodeForm.name.trim();
    if (!name) return;
    const nodes = [...data.nodes];
    if (editNodeId == null) {
      const id = nextId(nodes);
      const angle = (nodes.length / Math.max(nodes.length + 1, 1)) * Math.PI * 2;
      nodes.push({
        id,
        name,
        group: nodeForm.group.trim(),
        notes: nodeForm.notes.trim(),
        x: Math.cos(angle) * 180,
        y: Math.sin(angle) * 180,
      });
    } else {
      const idx = nodes.findIndex((n) => n.id === editNodeId);
      if (idx >= 0) {
        nodes[idx] = {
          ...nodes[idx],
          name,
          group: nodeForm.group.trim(),
          notes: nodeForm.notes.trim(),
        };
      }
    }
    await save({ ...data, nodes });
    closeNode();
  };

  const removeNode = async (id: string | number) => {
    await save({
      ...data,
      nodes: data.nodes.filter((n) => n.id !== id),
      edges: data.edges.filter((e) => e.from !== id && e.to !== id),
    });
  };

  const saveEdge = async () => {
    if (!edgeForm.from || !edgeForm.to) return;
    const edges = [...data.edges, {
      id: nextId(data.edges),
      from: Number(edgeForm.from),
      to: Number(edgeForm.to),
      label: edgeForm.label.trim(),
    }];
    await save({ ...data, edges });
    setEdgeForm({ from: null, to: null, label: '' });
    closeEdge();
  };

  const removeEdge = async (id: string | number) => {
    await save({ ...data, edges: data.edges.filter((e) => e.id !== id) });
  };

  const clearAll = async () => {
    if (!window.confirm('Очистка шестерёнки необратима. Вы уверены?')) return;
    await save({ ...data, nodes: [], edges: [] });
  };

  const width = 640;
  const height = 360;
  const xs = data.nodes.map((n) => n.x ?? 0);
  const ys = data.nodes.map((n) => n.y ?? 0);
  const minX = Math.min(...xs, -1);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, -1);
  const maxY = Math.max(...ys, 1);
  const pad = 40;
  const scaleX = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (width - pad * 2);
  const scaleY = (y: number) => pad + ((y - minY) / (maxY - minY || 1)) * (height - pad * 2);

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Шестерёнка ролей (LARP Design Cards) — узлы и связи для проектирования ролей.
      </Text>

      <Group>
        <Button size="xs" onClick={openCreateNode}>Добавить узел</Button>
        <Button size="xs" variant="light" onClick={() => { setEdgeForm({ from: null, to: null, label: '' }); openEdge(); }} disabled={data.nodes.length < 1}>
          Добавить связь
        </Button>
        <Button size="xs" variant="subtle" color="red" onClick={clearAll}>Очистить</Button>
        <Switch
          size="xs"
          label="Показать заметки"
          checked={!!data.settings.showNotes}
          onChange={async (e) => {
            const enabled = e.currentTarget.checked;
            await api.call('setGearsShowNotesEnabled', { enabled });
            setData({ ...data, settings: { ...data.settings, showNotes: enabled } });
          }}
        />
      </Group>

      <Card withBorder padding="sm">
        {data.nodes.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">Нет узлов — добавьте первый</Text>
        ) : (
          <Stack gap={4}>
            {isMobile && (
              <Text size="xs" c="dimmed">Схема: листайте и масштабируйте; правка — через список ниже</Text>
            )}
            <div
              style={{
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                maxHeight: isMobile ? 280 : undefined,
                touchAction: 'pan-x pan-y',
              }}
            >
              <svg
                width={isMobile ? Math.max(width, 480) : '100%'}
                height={isMobile ? height : undefined}
                viewBox={`0 0 ${width} ${height}`}
                style={{
                  background: 'var(--mantine-color-default)',
                  borderRadius: 6,
                  display: 'block',
                  minWidth: isMobile ? 480 : undefined,
                }}
              >
                {data.edges.map((e) => {
                  const from = data.nodes.find((n) => n.id === e.from || String(n.id) === String(e.from));
                  const to = data.nodes.find((n) => n.id === e.to || String(n.id) === String(e.to));
                  if (!from || !to) return null;
                  const x1 = scaleX(from.x ?? 0);
                  const y1 = scaleY(from.y ?? 0);
                  const x2 = scaleX(to.x ?? 0);
                  const y2 = scaleY(to.y ?? 0);
                  return (
                    <g key={String(e.id)}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--mantine-color-gray-5)" strokeWidth={1.5} />
                      {e.label && (
                        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} fontSize={10} fill="var(--mantine-color-dimmed)" textAnchor="middle">
                          {e.label}
                        </text>
                      )}
                    </g>
                  );
                })}
                {data.nodes.map((n) => {
                  const x = scaleX(n.x ?? 0);
                  const y = scaleY(n.y ?? 0);
                  return (
                    <g key={String(n.id)} style={{ cursor: 'pointer' }} onClick={() => openEditNode(n)}>
                      <circle cx={x} cy={y} r={22} fill="var(--mantine-color-indigo-5)" />
                      <text x={x} y={y + 4} fontSize={10} fill="white" textAnchor="middle">
                        {(n.name || '').slice(0, 8)}
                      </text>
                      {data.settings.showNotes && n.notes && (
                        <text x={x} y={y + 36} fontSize={9} fill="var(--mantine-color-dimmed)" textAnchor="middle">
                          {n.notes.slice(0, 24)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </Stack>
        )}
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder padding="sm">
          <Text fw={600} size="sm" mb="xs">Узлы ({data.nodes.length})</Text>
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th>Тип</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.nodes.map((n) => (
                <Table.Tr key={String(n.id)}>
                  <Table.Td>
                    <Text size="sm" style={{ cursor: 'pointer' }} onClick={() => openEditNode(n)}>{n.name}</Text>
                    {data.settings.showNotes && n.notes && <Text size="xs" c="dimmed">{n.notes}</Text>}
                  </Table.Td>
                  <Table.Td><Text size="sm">{n.group || '—'}</Text></Table.Td>
                  <Table.Td>
                    <ActionIcon size="sm" color="red" variant="subtle" onClick={() => removeNode(n.id)}>✕</ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        <Card withBorder padding="sm">
          <Text fw={600} size="sm" mb="xs">Связи ({data.edges.length})</Text>
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>От</Table.Th>
                <Table.Th>Подпись</Table.Th>
                <Table.Th>К</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.edges.map((e) => (
                <Table.Tr key={String(e.id)}>
                  <Table.Td><Text size="sm">{nodeNameById.get(e.from) || String(e.from)}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.label || '—'}</Text></Table.Td>
                  <Table.Td><Text size="sm">{nodeNameById.get(e.to) || String(e.to)}</Text></Table.Td>
                  <Table.Td>
                    <ActionIcon size="sm" color="red" variant="subtle" onClick={() => removeEdge(e.id)}>✕</ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </SimpleGrid>

      <Modal opened={nodeOpen} onClose={closeNode} title={editNodeId == null ? 'Добавить узел' : 'Редактировать узел'}>
        <Stack>
          <TextInput label="Название" value={nodeForm.name} onChange={(e) => setNodeForm({ ...nodeForm, name: e.currentTarget.value })} />
          <TextInput label="Тип (группа)" value={nodeForm.group} onChange={(e) => setNodeForm({ ...nodeForm, group: e.currentTarget.value })} />
          <Textarea label="Заметки" value={nodeForm.notes} onChange={(e) => setNodeForm({ ...nodeForm, notes: e.currentTarget.value })} rows={3} />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeNode}>Отмена</Button>
            <Button onClick={saveNode}>Сохранить</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={edgeOpen} onClose={closeEdge} title="Добавить связь">
        <Stack>
          <Select label="От" data={nodeOptions} value={edgeForm.from} onChange={(v) => setEdgeForm({ ...edgeForm, from: v })} searchable />
          <Select label="К" data={nodeOptions} value={edgeForm.to} onChange={(v) => setEdgeForm({ ...edgeForm, to: v })} searchable />
          <TextInput label="Подпись" value={edgeForm.label} onChange={(e) => setEdgeForm({ ...edgeForm, label: e.currentTarget.value })} />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeEdge}>Отмена</Button>
            <Button onClick={saveEdge} disabled={!edgeForm.from || !edgeForm.to}>Сохранить</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

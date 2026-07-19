import { Box, Group, Stack, Text, Tooltip, Progress } from '@mantine/core';

export type HistBar = { value: number; tip: string } | null;

export function Histogram({ title, data }: { title: string; data?: HistBar[] }) {
  const bars = Array.isArray(data) ? data : [];
  const max = bars.reduce((m, b) => (b && b.value > m ? b.value : m), 0) || 1;

  return (
    <Stack gap={6}>
      <Text fw={600} size="sm">{title}</Text>
      {bars.every((b) => !b) ? (
        <Text size="sm" c="dimmed">Нет данных</Text>
      ) : (
        <Group align="flex-end" gap={3} h={140} wrap="nowrap" style={{ overflowX: 'auto' }}>
          {bars.map((bar, i) => {
            if (!bar) {
              return <Box key={i} w={14} h={4} style={{ background: 'var(--mantine-color-default-border)' }} />;
            }
            const h = Math.max(8, Math.round((((bar.value / max) * 0.9) + 0.1) * 130));
            return (
              <Tooltip key={i} label={bar.tip} withArrow multiline maw={320}>
                <Box
                  w={18}
                  h={h}
                  style={{
                    background: 'var(--mantine-color-indigo-5)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: 'white',
                    paddingTop: 2,
                    flexShrink: 0,
                  }}
                >
                  {bar.value}
                </Box>
              </Tooltip>
            );
          })}
        </Group>
      )}
    </Stack>
  );
}

export function DoughnutList({
  title,
  data,
}: {
  title: string;
  data?: Array<{ label: string; value: number }>;
}) {
  const items = Array.isArray(data) ? data : [];
  const total = items.reduce((s, i) => s + (i.value || 0), 0) || 1;

  return (
    <Stack gap={6}>
      <Text fw={600} size="sm">{title}</Text>
      {items.length === 0 ? (
        <Text size="sm" c="dimmed">Нет данных</Text>
      ) : (
        <Stack gap={6}>
          {items.map((item) => (
            <div key={item.label}>
              <Group justify="space-between" gap="xs" mb={2}>
                <Text size="xs" style={{ flex: 1 }}>{item.label}</Text>
                <Text size="xs" c="dimmed">{item.value}</Text>
              </Group>
              <Progress value={(item.value / total) * 100} size="sm" />
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export function ProfileFieldChart({
  name,
  type,
  data,
}: {
  name: string;
  type: string;
  data: Record<string, number> | { groups: Record<string, number>; step: number };
}) {
  const groups = (data && typeof data === 'object' && 'groups' in data)
    ? (data as { groups: Record<string, number>; step: number }).groups
    : (data as Record<string, number>);
  const step = (data && typeof data === 'object' && 'step' in data)
    ? (data as { step: number }).step
    : undefined;
  const entries = Object.entries(groups || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <Stack gap={6}>
      <Text fw={600} size="sm">
        {name}
        <Text span size="xs" c="dimmed"> ({type}{step != null ? `, шаг ${step}` : ''})</Text>
      </Text>
      {entries.length === 0 ? (
        <Text size="sm" c="dimmed">Нет значений</Text>
      ) : (
        <Stack gap={4}>
          {entries.map(([key, value]) => (
            <div key={key}>
              <Group justify="space-between" mb={2}>
                <Text size="xs">{key === '' ? '—' : key}</Text>
                <Text size="xs" c="dimmed">{value}</Text>
              </Group>
              <Progress value={(value / total) * 100} size="sm" color="teal" />
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

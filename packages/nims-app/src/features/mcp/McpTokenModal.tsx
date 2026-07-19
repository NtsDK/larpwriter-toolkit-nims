import { useEffect, useMemo, useState } from 'react';
import {
  Modal, Stack, Text, Button, Code, Group, CopyButton, Checkbox, Divider, Alert, Paper,
} from '@mantine/core';

interface TokenResponse {
  token: string;
  user: { name: string; role: string };
  expiresAt?: number;
  ttlMs: number;
  longLived?: boolean;
}

function formatTtl(ms: number): string {
  const years = ms / (365 * 24 * 60 * 60 * 1000);
  if (years >= 1) return `~${Math.round(years)} лет`;
  const hours = Math.round(ms / 3600000);
  return `${hours} ч.`;
}

function buildEnvConfig(origin: string): string {
  return `export NIMS_MCP_TOKEN="ваш-токен"

{
  "mcpServers": {
    "nims": {
      "url": "${origin}/mcp",
      "headers": { "Authorization": "Bearer \${env:NIMS_MCP_TOKEN}" }
    },
    "nims-readonly": {
      "url": "${origin}/mcp/readonly",
      "headers": { "Authorization": "Bearer \${env:NIMS_MCP_TOKEN}" }
    }
  }
}`;
}

function buildInlineConfig(origin: string, token: string): string {
  return `{
  "mcpServers": {
    "nims": {
      "url": "${origin}/mcp",
      "headers": { "Authorization": "Bearer ${token}" }
    },
    "nims-readonly": {
      "url": "${origin}/mcp/readonly",
      "headers": { "Authorization": "Bearer ${token}" }
    }
  }
}`;
}

export function McpTokenModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [longLived, setLongLived] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TokenResponse | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (!opened) {
      setResult(null);
      setError(null);
      setBusy(false);
      setLongLived(true);
    }
  }, [opened]);

  const obtainToken = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/mcp/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ longLived }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? 'Сессия истекла — обновите страницу и войдите снова'
            : (data.error || `Ошибка ${res.status}`),
        );
      }
      setResult(data as TokenResponse);
    } catch (e: any) {
      setError(e.message || 'Не удалось создать токен');
    } finally {
      setBusy(false);
    }
  };

  const envConfig = useMemo(() => buildEnvConfig(origin), [origin]);
  const readyConfig = useMemo(
    () => (result ? buildInlineConfig(origin, result.token) : ''),
    [origin, result],
  );

  return (
    <Modal opened={opened} onClose={onClose} title="NIMS MCP" size="lg" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Токен для Cursor или другого MCP-клиента. Создаётся для текущей сессии — повторный вход не нужен.
        </Text>

        {error && (
          <Alert color="red" title="Ошибка" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        {!result ? (
          <Stack gap="sm">
            <Checkbox
              checked={longLived}
              onChange={(e) => setLongLived(e.currentTarget.checked)}
              label="Долгоживущий токен (~10 лет, сохраняется на сервере)"
            />
            <Button onClick={obtainToken} loading={busy}>
              Получить токен
            </Button>
          </Stack>
        ) : (
          <Stack gap="sm">
            <Text size="sm">
              Пользователь: <Text span fw={600}>{result.user.name}</Text>
              {' '}
              <Text span c="dimmed">({result.user.role})</Text>
              {' · '}
              <Text span c="dimmed">срок {formatTtl(result.ttlMs)}</Text>
            </Text>

            <Paper withBorder p="sm" radius="sm">
              <Group justify="space-between" mb={6}>
                <Text size="sm" fw={500}>Bearer-токен</Text>
                <CopyButton value={result.token}>
                  {({ copied, copy }) => (
                    <Button size="compact-xs" variant="light" onClick={copy}>
                      {copied ? 'Скопировано' : 'Скопировать токен'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
              <Code block style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: 12 }}>
                {result.token}
              </Code>
            </Paper>

            <Paper withBorder p="sm" radius="sm">
              <Group justify="space-between" mb={6}>
                <Text size="sm" fw={500}>Готовый .cursor/mcp.json (с токеном)</Text>
                <CopyButton value={readyConfig}>
                  {({ copied, copy }) => (
                    <Button size="compact-xs" variant="light" onClick={copy}>
                      {copied ? 'Скопировано' : 'Копировать JSON'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
              <Code block style={{ fontSize: 11, maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {readyConfig}
              </Code>
            </Paper>

            <Button variant="default" size="xs" w="fit-content" onClick={() => setResult(null)}>
              Получить другой токен
            </Button>
          </Stack>
        )}

        <Divider />

        <div>
          <Text size="sm" mb={6}>
            <Text span fw={600}>Cursor</Text>
            {' — пример: переменная окружения и '}
            <Code>.cursor/mcp.json</Code>
          </Text>
          <Paper withBorder p="sm" radius="sm">
            <Group justify="flex-end" mb={6}>
              <CopyButton value={envConfig}>
                {({ copied, copy }) => (
                  <Button size="compact-xs" variant="subtle" onClick={copy}>
                    {copied ? 'Скопировано' : 'Копировать пример'}
                  </Button>
                )}
              </CopyButton>
            </Group>
            <Code block style={{ fontSize: 11, maxHeight: 220, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {envConfig}
            </Code>
          </Paper>
          <Text size="xs" c="dimmed" mt="xs">
            Endpoints: <Code>{origin}/mcp</Code> · <Code>{origin}/mcp/readonly</Code>
          </Text>
        </div>
      </Stack>
    </Modal>
  );
}

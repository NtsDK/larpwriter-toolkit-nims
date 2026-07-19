import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Modal, Stack, Group, Button, Select, Text, Anchor, Table, ActionIcon, Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRootStore } from '@/stores';
import { EmptyState } from '@/components/EmptyState';

export type BindingSide = 'character' | 'player';

interface BindingChangeButtonProps {
  /** Whose card we're on */
  side: BindingSide;
  /** Selected character or player name */
  entityName: string;
  /** characterName → playerName */
  bindings: Record<string, string>;
  characterNames: string[];
  playerNames: string[];
  onChanged: () => void | Promise<void>;
}

/** Button + modal near the name to change character↔player binding. */
export function BindingChangeButton({
  side,
  entityName,
  bindings,
  characterNames,
  playerNames,
  onChanged,
}: BindingChangeButtonProps) {
  const { api } = useRootStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [value, setValue] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reverse = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [char, player] of Object.entries(bindings)) map[player] = char;
    return map;
  }, [bindings]);

  const currentPartner = side === 'character'
    ? (bindings[entityName] || null)
    : (reverse[entityName] || null);

  useEffect(() => {
    if (opened) setValue(currentPartner);
  }, [opened, currentPartner]);

  const options = useMemo(() => {
    if (side === 'character') {
      // Players available: unbound, or currently bound to this character
      return playerNames.filter((p) => !reverse[p] || reverse[p] === entityName);
    }
    // Characters available: unbound, or currently bound to this player
    return characterNames.filter((c) => !bindings[c] || bindings[c] === entityName);
  }, [side, entityName, characterNames, playerNames, bindings, reverse]);

  const partnerLabel = side === 'character' ? 'Игрок' : 'Персонаж';
  const partnerPath = side === 'character' ? '/players' : '/characters';

  const save = async () => {
    setSaving(true);
    try {
      if (side === 'character') {
        const charName = entityName;
        if (!value) {
          if (bindings[charName]) {
            await api.call('unbindCharacterFromPlayer', { characterName: charName });
          }
        } else {
          await api.call('bindCharacterToPlayer', { characterName: charName, playerName: value });
        }
      } else {
        const playerName = entityName;
        const prevChar = reverse[playerName];
        if (!value) {
          if (prevChar) {
            await api.call('unbindCharacterFromPlayer', { characterName: prevChar });
          }
        } else {
          // If player was bound to another character, unbind first (bind API may overwrite)
          if (prevChar && prevChar !== value) {
            await api.call('unbindCharacterFromPlayer', { characterName: prevChar });
          }
          await api.call('bindCharacterToPlayer', { characterName: value, playerName });
        }
      }
      await onChanged();
      close();
      notifications.show({ title: 'Готово', message: 'Привязка обновлена', color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Group gap={6} wrap="nowrap">
        {currentPartner ? (
          <Anchor
            component={Link}
            to={`${partnerPath}?select=${encodeURIComponent(currentPartner)}`}
            size="sm"
          >
            {partnerLabel}: {currentPartner}
          </Anchor>
        ) : (
          <Text size="sm" c="dimmed">{partnerLabel}: не привязан</Text>
        )}
        <Tooltip label="Изменить привязку" withArrow>
          <ActionIcon size="sm" variant="subtle" onClick={open} aria-label="Изменить привязку">
            🔗
          </ActionIcon>
        </Tooltip>
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={side === 'character'
          ? `Игрок для «${entityName}»`
          : `Персонаж для «${entityName}»`}
      >
        <Stack>
          <Select
            label={partnerLabel}
            data={[{ value: '', label: '— Не привязан —' }, ...options.map((n) => ({ value: n, label: n }))]}
            value={value || ''}
            onChange={(v) => setValue(v || null)}
            searchable
            clearable
            nothingFoundMessage="Нет свободных"
          />
          <Text size="xs" c="dimmed">
            В списке только свободные {side === 'character' ? 'игроки' : 'персонажи'}
            {currentPartner ? ' и текущая привязка' : ''}.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>Отмена</Button>
            <Button onClick={save} loading={saving}>Сохранить</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

interface BindingsTableProps {
  bindings: Record<string, string>;
  characterNames: string[];
  playerNames: string[];
  onChanged: () => void | Promise<void>;
  /** Default sort/focus: show characters as primary column */
  primary?: BindingSide;
}

/** Full bindings table — used on both Characters and Players pages. */
export function ProfileBindingsTable({
  bindings,
  characterNames,
  playerNames,
  onChanged,
  primary = 'character',
}: BindingsTableProps) {
  const { api } = useRootStore();

  const handleBind = async (charName: string, playerName: string | null) => {
    try {
      if (playerName) {
        await api.call('bindCharacterToPlayer', { characterName: charName, playerName });
      } else {
        await api.call('unbindCharacterFromPlayer', { characterName: charName });
      }
      await onChanged();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  if (characterNames.length === 0) {
    return <EmptyState title="Нет персонажей" description="Сначала создайте персонажей." />;
  }

  const rows = primary === 'character'
    ? characterNames
    : [...characterNames].sort((a, b) => {
      const pa = bindings[a] || '';
      const pb = bindings[b] || '';
      return pa.localeCompare(pb) || a.localeCompare(b);
    });

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">Кто играет какого персонажа</Text>
      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Персонаж</Table.Th>
            <Table.Th>Игрок</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((charName) => (
            <Table.Tr key={charName}>
              <Table.Td>
                <Anchor component={Link} to={`/characters?select=${encodeURIComponent(charName)}`} size="sm">
                  {charName}
                </Anchor>
              </Table.Td>
              <Table.Td>
                <Select
                  size="xs"
                  data={[
                    { value: '', label: '— Не привязан —' },
                    ...playerNames.map((n) => ({ value: n, label: n })),
                  ]}
                  value={bindings[charName] || ''}
                  onChange={(v) => handleBind(charName, v || null)}
                  searchable
                  clearable
                  style={{ minWidth: 180 }}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {playerNames.length === 0 && (
        <Text size="sm" c="dimmed">Нет игроков — создайте профили во вкладке «Игроки».</Text>
      )}
    </Stack>
  );
}

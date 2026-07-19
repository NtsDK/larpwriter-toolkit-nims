import { useState } from 'react';
import { Button, Modal, Stack, Text, Group } from '@mantine/core';

interface DeleteEntityButtonProps {
  entityLabel: string;
  entityName: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
}

/** Destructive action at the bottom of an editor — not in the list. */
export function DeleteEntityButton({ entityLabel, entityName, onConfirm, disabled }: DeleteEntityButtonProps) {
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpened(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        color="red"
        variant="subtle"
        size="xs"
        mt="xl"
        disabled={disabled}
        onClick={() => setOpened(true)}
      >
        Удалить {entityLabel}
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={`Удалить ${entityLabel}?`}
        centered
      >
        <Stack>
          <Text size="sm">
            «{entityName}» будет удалён безвозвратно.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setOpened(false)} disabled={busy}>
              Отмена
            </Button>
            <Button color="red" onClick={handleConfirm} loading={busy}>
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

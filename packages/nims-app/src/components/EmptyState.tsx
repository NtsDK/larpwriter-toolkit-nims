import { Stack, Text, Button } from '@mantine/core';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="sm" py={48} px="md">
      <Text fw={500} size="lg">{title}</Text>
      {description && (
        <Text size="sm" c="dimmed" ta="center" maw={360}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button mt="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </Stack>
  );
}

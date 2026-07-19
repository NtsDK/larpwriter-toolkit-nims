import { Alert } from '@mantine/core';

/** Shown above an editor when the current user cannot mutate the entity. */
export function PermissionHint({ reason }: { reason: string | null }) {
  if (!reason) return null;
  return (
    <Alert color="gray" variant="light" py="xs">
      {reason}
    </Alert>
  );
}

import { Badge, Tooltip } from '@mantine/core';

const OWNER_COLORS = ['blue', 'teal', 'grape', 'orange', 'cyan', 'pink', 'violet', 'lime', 'indigo', 'yellow'] as const;

export function ownerColor(owner: string): string {
  if (!owner) return 'gray';
  let h = 0;
  for (let i = 0; i < owner.length; i++) h = (h * 31 + owner.charCodeAt(i)) >>> 0;
  return OWNER_COLORS[h % OWNER_COLORS.length];
}

export function OwnerBadge({
  owner,
  size = 'xs',
  showUnassigned = true,
}: {
  owner?: string | null;
  size?: 'xs' | 'sm' | 'md';
  showUnassigned?: boolean;
}) {
  const name = (owner || '').trim();
  if (!name) {
    if (!showUnassigned) return null;
    return (
      <Tooltip label="Сущность не назначена организатору" withArrow>
        <Badge size={size} color="gray" variant="outline">не привязан</Badge>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={`Владелец: ${name}`} withArrow>
      <Badge size={size} color={ownerColor(name)} variant="light">
        {name}
      </Badge>
    </Tooltip>
  );
}

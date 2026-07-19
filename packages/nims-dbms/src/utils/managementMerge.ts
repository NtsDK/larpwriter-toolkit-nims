import type { ManagementInfo } from '../domain/types';

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.length > 0);
  if (typeof value === 'string' && value) return [value];
  return [];
}

function hasPasswordMaterial(info: unknown): boolean {
  if (!info || typeof info !== 'object') return false;
  const u = info as Record<string, unknown>;
  return Boolean(u.salt && u.hashedPassword);
}

function mergeUserMaps(
  existing: Record<string, unknown> | undefined,
  incoming: Record<string, unknown> | undefined,
): Record<string, unknown> {
  // Start from upload, then overlay server users. Prefer whichever side still has hashes
  // so a stripped autosave/export cannot wipe credentials.
  const result: Record<string, unknown> = { ...(incoming || {}) };
  for (const [name, info] of Object.entries(existing || {})) {
    const curr = result[name];
    if (!curr) {
      result[name] = info;
    } else if (hasPasswordMaterial(info) || !hasPasswordMaterial(curr)) {
      result[name] = info;
    }
    // else keep incoming (it has password material, existing does not)
  }
  return result;
}

/**
 * Merge ManagementInfo when importing a database:
 * - existing organizers/players (and their passwords) are kept;
 * - users present only in the uploaded file are added;
 * - admin/editor role lists are united.
 */
export function mergeManagementInfo(
  existing: ManagementInfo | undefined,
  incoming: ManagementInfo | undefined,
): ManagementInfo {
  const curr = existing || {};
  const inc = incoming || {};

  const UsersInfo = mergeUserMaps(
    curr.UsersInfo as Record<string, unknown> | undefined,
    inc.UsersInfo as Record<string, unknown> | undefined,
  );
  const PlayersInfo = mergeUserMaps(
    curr.PlayersInfo as Record<string, unknown> | undefined,
    inc.PlayersInfo as Record<string, unknown> | undefined,
  );

  const admins = [...new Set([
    ...asStringList(curr.admins),
    ...asStringList(curr.admin),
    ...asStringList(inc.admins),
    ...asStringList(inc.admin),
  ])].filter((name) => name in UsersInfo);

  const editors = [...new Set([
    ...asStringList(curr.editors),
    ...asStringList(curr.editor),
    ...asStringList(inc.editors),
    ...asStringList(inc.editor),
  ])].filter((name) => name in UsersInfo);

  return {
    ...inc,
    ...curr,
    UsersInfo,
    PlayersInfo,
    admins,
    admin: admins[0] || '',
    editors,
    editor: editors[0] || '',
    adaptationRights: (curr.adaptationRights as string)
      || (inc.adaptationRights as string)
      || '',
  };
}

import { useCallback, useEffect, useState } from 'react';
import { useRootStore } from '@/stores';

export type EntityOwnerType = 'character' | 'player' | 'story' | 'group';

/** entityName → organizer name ('' if unassigned) */
export function useEntityOwners(type: EntityOwnerType, reloadKey?: unknown) {
  const { api } = useRootStore();
  const [owners, setOwners] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    try {
      const data = await api.get<Record<string, string>>('getEntityOwners', { type });
      setOwners(data && typeof data === 'object' ? data : {});
    } catch {
      setOwners({});
    }
  }, [api, type]);

  useEffect(() => {
    void reload();
  }, [reload, reloadKey]);

  return { owners, reloadOwners: reload };
}

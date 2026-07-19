import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export interface MgmtUserInfo {
  characters?: string[];
  groups?: string[];
  stories?: string[];
  players?: string[];
}

/**
 * Project-level RBAC flags from getManagementInfo.
 * Login role is organizer|player; admin/editor are flags on organizers.
 */
export class PermissionsStore {
  loaded = false;
  loading = false;
  loadError: string | null = null;
  admins: string[] = [];
  editors: string[] = [];
  usersInfo: Record<string, MgmtUserInfo> = {};

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isOrganizer() {
    return this.root.auth.user?.role === 'organizer';
  }

  get isPlayer() {
    return this.root.auth.user?.role === 'player';
  }

  get isProjectAdmin() {
    const name = this.root.auth.user?.name;
    return !!name && this.admins.includes(name);
  }

  get isEditor() {
    const name = this.root.auth.user?.name;
    return !!name && this.editors.includes(name);
  }

  get editorModeActive() {
    return this.editors.length > 0;
  }

  /** Meta, DB import, profile structure, org management */
  get canAdminOps() {
    return this.isOrganizer && this.isProjectAdmin;
  }

  /** Create characters/stories/groups — respect editor lock when active */
  get canCreateEntities() {
    if (!this.isOrganizer) return false;
    if (this.editorModeActive) return this.isEditor;
    return true;
  }

  /**
   * Mutate an owned entity (profile/story/group).
   * Editor mode ON → only editors; OFF → admin or owner.
   */
  canEditEntity(owner: string | undefined | null): boolean {
    if (!this.isOrganizer) return false;
    if (this.editorModeActive) return this.isEditor;
    if (this.isProjectAdmin) return true;
    const name = this.root.auth.user?.name;
    return !!name && !!owner && owner === name;
  }

  contentEditBlockedReason(owner?: string | null): string | null {
    if (this.canEditEntity(owner)) return null;
    if (!this.isOrganizer) return 'Недостаточно прав';
    if (this.editorModeActive) {
      return 'Назначен редактор — правки контента доступны только ему';
    }
    return 'Сущность не назначена вам';
  }

  async load() {
    if (!this.root.auth.isLoggedIn || !this.isOrganizer) {
      runInAction(() => {
        this.admins = [];
        this.editors = [];
        this.usersInfo = {};
        this.loaded = true;
        this.loading = false;
      });
      return;
    }
    this.loading = true;
    this.loadError = null;
    try {
      const data = await this.root.api.get<{
        admins?: string[];
        editors?: string[];
        admin?: string;
        editor?: string;
        usersInfo?: Record<string, MgmtUserInfo>;
      }>('getManagementInfo');
      runInAction(() => {
        const admins = Array.isArray(data?.admins)
          ? data.admins.filter(Boolean)
          : (data?.admin ? [data.admin] : []);
        const editors = Array.isArray(data?.editors)
          ? data.editors.filter(Boolean)
          : (data?.editor ? [data.editor] : []);
        this.admins = admins;
        this.editors = editors;
        this.usersInfo = data?.usersInfo || {};
        this.loadError = null;
        this.loaded = true;
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось загрузить права доступа';
      runInAction(() => {
        // Keep previous admins/editors — do not silently wipe RBAC state.
        this.loadError = msg;
        this.loaded = true;
      });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  clear() {
    this.admins = [];
    this.editors = [];
    this.usersInfo = {};
    this.loadError = null;
    this.loaded = false;
  }
}

import type { DatabaseEngine } from './DatabaseEngine';
import type { Database, GameMeta } from '../domain/types';
import { ensureString, ensureEnum } from '../utils/precondition';
import { META_INFO_STRINGS, META_INFO_DATES } from '../utils/constants';
import { ensureDatabaseDefaults } from '../utils/defaults';
import { mergeManagementInfo } from '../utils/managementMerge';

export class MetaEngine {
  constructor(private engine: DatabaseEngine) {}

  async getDatabase(): Promise<Database> {
    if (this.engine.database.Meta) {
      this.engine.database.Meta.saveTime = new Date().toString();
    }
    // Full dump including ManagementInfo password hashes — needed for backup/restore.
    return structuredClone(this.engine.database);
  }

  /**
   * Replace game content.
   * By default merges ManagementInfo: keeps existing users/passwords, adds missing from the file.
   * Pass preserveManagementInfo: false to take ManagementInfo from the file as-is (server boot).
   */
  async setDatabase({
    database,
    preserveManagementInfo = true,
  }: {
    database: Database;
    preserveManagementInfo?: boolean;
  }): Promise<void> {
    const currentMgmt = this.engine.database?.ManagementInfo;
    const next = ensureDatabaseDefaults(database);
    if (preserveManagementInfo) {
      next.ManagementInfo = mergeManagementInfo(currentMgmt, next.ManagementInfo);
    }
    this.engine.database = next;
    this.engine.ee.emit('setDatabase', [{ database: next }]);
  }

  async getMetaInfo(): Promise<GameMeta> {
    return structuredClone(this.engine.database.Meta);
  }

  async setMetaInfoString({ name, value }: { name: string; value: string }): Promise<void> {
    ensureString(name, 'name');
    ensureEnum(name, META_INFO_STRINGS, 'name');
    ensureString(value, 'value');
    (this.engine.database.Meta as unknown as Record<string, string>)[name] = value;
  }

  async setMetaInfoDate({ name, value }: { name: string; value: string }): Promise<void> {
    ensureString(name, 'name');
    ensureEnum(name, META_INFO_DATES, 'name');
    ensureString(value, 'value');
    (this.engine.database.Meta as unknown as Record<string, string>)[name] = value;
  }
}

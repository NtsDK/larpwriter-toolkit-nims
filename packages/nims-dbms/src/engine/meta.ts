import type { DatabaseEngine } from './DatabaseEngine';
import type { Database, GameMeta } from '../domain/types';
import { ensureString, ensureEnum } from '../utils/precondition';
import { META_INFO_STRINGS, META_INFO_DATES } from '../utils/constants';
import { ensureDatabaseDefaults } from '../utils/defaults';

export class MetaEngine {
  constructor(private engine: DatabaseEngine) {}

  async getDatabase(): Promise<Database> {
    if (this.engine.database.Meta) {
      this.engine.database.Meta.saveTime = new Date().toString();
    }
    return structuredClone(this.engine.database);
  }

  async setDatabase({ database }: { database: Database }): Promise<void> {
    this.engine.database = ensureDatabaseDefaults(database);
    this.engine.ee.emit('setDatabase', [{ database }]);
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

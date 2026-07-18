import type { DatabaseEngine } from './DatabaseEngine';
import type { Group } from '../domain/types';
import { ensureString, ensureEntityExists, ensureEntityCanBeCreated, ensureEntityCanBeRenamed } from '../utils/precondition';

function charOrdA(a: string, b: string): number {
  return a.localeCompare(b);
}

export class GroupsEngine {
  constructor(private engine: DatabaseEngine) {}

  async getGroupNamesArray(): Promise<string[]> {
    return Object.keys(this.engine.database.Groups).sort(charOrdA);
  }

  async getGroup({ groupName }: { groupName: string }): Promise<Group> {
    ensureString(groupName, 'groupName');
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    return structuredClone(this.engine.database.Groups[groupName]);
  }

  async createGroup({ groupName }: { groupName: string }): Promise<void> {
    ensureEntityCanBeCreated(groupName, Object.keys(this.engine.database.Groups));
    this.engine.database.Groups[groupName] = {
      name: groupName,
      masterDescription: '',
      characterDescription: '',
      doExport: true,
      filterModel: [],
    };
  }

  async renameGroup({ fromName, toName }: { fromName: string; toName: string }): Promise<void> {
    ensureEntityCanBeRenamed(fromName, toName, Object.keys(this.engine.database.Groups));
    if (fromName === toName) return;

    const data = this.engine.database.Groups[fromName];
    data.name = toName;
    this.engine.database.Groups[toName] = data;
    delete this.engine.database.Groups[fromName];
  }

  async removeGroup({ groupName }: { groupName: string }): Promise<void> {
    ensureString(groupName, 'groupName');
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    delete this.engine.database.Groups[groupName];
  }

  async getAllCharacterGroupTexts(): Promise<Record<string, Record<string, string>>> {
    const result: Record<string, Record<string, string>> = {};
    for (const [groupName, group] of Object.entries(this.engine.database.Groups)) {
      if (group.filterModel && group.filterModel.length > 0) {
        for (const charName of Object.keys(this.engine.database.Characters)) {
          if (!result[charName]) result[charName] = {};
          result[charName][groupName] = group.characterDescription;
        }
      }
    }
    return result;
  }
}

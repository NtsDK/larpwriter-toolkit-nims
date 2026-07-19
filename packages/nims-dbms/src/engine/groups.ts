import type { DatabaseEngine } from './DatabaseEngine';
import type { Group } from '../domain/types';
import { ensureString, ensureEntityExists, ensureEntityCanBeCreated, ensureEntityCanBeRenamed } from '../utils/precondition';

function charOrdA(a: string, b: string): number {
  return a.localeCompare(b);
}

type FilterCondition = {
  type?: string;
  name?: string;
  condition?: string;
  selectedOptions?: Record<string, boolean>;
};

function profileFieldName(filterName: string): string {
  return filterName.startsWith('profile-') ? filterName.slice('profile-'.length) : filterName;
}

function characterMatchesFilter(character: Record<string, unknown>, cond: FilterCondition): boolean {
  const field = profileFieldName(cond.name || '');
  const opts = Object.entries(cond.selectedOptions || {}).filter(([, v]) => v).map(([k]) => k);
  if (opts.length === 0) return true;

  const val = character[field];
  if (cond.type === 'enum') {
    return typeof val === 'string' && opts.includes(val);
  }
  if (cond.type === 'checkbox') {
    const truthy = Boolean(val);
    const wantTrue = opts.includes('true');
    const wantFalse = opts.includes('false');
    if (wantTrue && wantFalse) return true;
    if (wantTrue) return truthy;
    if (wantFalse) return !truthy;
    return false;
  }
  if (cond.type === 'multiEnum') {
    const parts = new Set<string>();
    if (typeof val === 'string') {
      val.split(',').map((p) => p.trim()).filter(Boolean).forEach((p) => parts.add(p));
    } else if (Array.isArray(val)) {
      val.forEach((p) => { if (typeof p === 'string' && p) parts.add(p); });
    }
    const selected = new Set(opts);
    if ((cond.condition || 'some') === 'every') {
      for (const o of selected) if (!parts.has(o)) return false;
      return true;
    }
    for (const o of selected) if (parts.has(o)) return true;
    return false;
  }
  return true;
}

function resolveGroupMembers(group: Group & { members?: string[] }, characters: Record<string, Record<string, unknown>>): string[] {
  const filters = (group.filterModel || []) as FilterCondition[];
  if (filters.length > 0) {
    return Object.keys(characters)
      .filter((name) => filters.every((f) => characterMatchesFilter(characters[name] || {}, f)))
      .sort(charOrdA);
  }
  return [...(group.members || [])].sort(charOrdA);
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
    this.engine.users.rewriteOwnershipName('groups', fromName, toName);
    this.engine.ee.emit('renameGroup', [{ fromName, toName }]);
  }

  async removeGroup({ groupName }: { groupName: string }): Promise<void> {
    ensureString(groupName, 'groupName');
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    delete this.engine.database.Groups[groupName];
    this.engine.users.removeOwnershipName('groups', groupName);
    this.engine.ee.emit('removeGroup', [{ groupName }]);
  }

  async getGroupMembers({ groupName }: { groupName: string }): Promise<string[]> {
    ensureString(groupName, 'groupName');
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    const group = this.engine.database.Groups[groupName];
    return resolveGroupMembers(group as Group & { members?: string[] }, this.engine.database.Characters as Record<string, Record<string, unknown>>);
  }

  async addCharacterToGroup({ groupName, characterName }: { groupName: string; characterName: string }): Promise<void> {
    ensureString(groupName, 'groupName');
    ensureString(characterName, 'characterName');
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    ensureEntityExists(characterName, Object.keys(this.engine.database.Characters));
    const group = this.engine.database.Groups[groupName] as any;
    if (!group.members) group.members = [];
    if (!group.members.includes(characterName)) {
      group.members.push(characterName);
    }
  }

  async removeCharacterFromGroup({ groupName, characterName }: { groupName: string; characterName: string }): Promise<void> {
    ensureString(groupName, 'groupName');
    ensureString(characterName, 'characterName');
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    const group = this.engine.database.Groups[groupName] as any;
    if (group.members) {
      group.members = group.members.filter((m: string) => m !== characterName);
    }
  }

  async getGroupProfile({ groupName }: { groupName: string }): Promise<Record<string, string>> {
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    const group = this.engine.database.Groups[groupName];
    return { masterDescription: group.masterDescription || '', characterDescription: group.characterDescription || '' };
  }

  async updateGroupProfileField({ groupName, fieldName, value }: { groupName: string; fieldName: string; value: string }): Promise<void> {
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    const group = this.engine.database.Groups[groupName] as any;
    group[fieldName] = value;
  }

  async getGroupProfileStructure(): Promise<Array<{ name: string; type: string }>> {
    return [
      { name: 'masterDescription', type: 'text' },
      { name: 'characterDescription', type: 'text' },
    ];
  }

  async getAllCharacterGroupTexts(): Promise<Record<string, Record<string, string>>> {
    const result: Record<string, Record<string, string>> = {};
    const characters = this.engine.database.Characters as Record<string, Record<string, unknown>>;
    for (const [groupName, group] of Object.entries(this.engine.database.Groups)) {
      const members = resolveGroupMembers(group as Group & { members?: string[] }, characters);
      for (const charName of members) {
        if (!result[charName]) result[charName] = {};
        result[charName][groupName] = group.characterDescription;
      }
    }
    return result;
  }
}

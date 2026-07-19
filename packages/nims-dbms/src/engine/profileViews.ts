import type { DatabaseEngine } from './DatabaseEngine';
import type { ProfileStructureItem } from '../domain/types';
import { ensureEntityExists, ensureString } from '../utils/precondition';
import {
  applyFilterModel,
  makeGroupedProfileFilterInfo,
  type FilterCondition,
  type ProfileFilterInfo,
} from '../utils/profileFilter';

export interface RoleGridProfileRow {
  character: Record<string, unknown>;
  player?: Record<string, unknown>;
  characterName: string;
  playerName?: string;
}

export interface RoleGridInfo {
  profileData: RoleGridProfileRow[];
  characterProfileStructure: ProfileStructureItem[];
  playerProfileStructure: ProfileStructureItem[];
}

function pickProfile(profile: Record<string, unknown>, structure: ProfileStructureItem[]): Record<string, unknown> {
  const names = new Set(structure.map((s) => s.name));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(profile)) {
    if (names.has(k)) out[k] = v;
  }
  return out;
}

export class ProfileViewsEngine {
  constructor(private engine: DatabaseEngine) {}

  async getRoleGridInfo(): Promise<RoleGridInfo> {
    const db = this.engine.database;
    const charStructure = structuredClone(db.CharacterProfileStructure);
    const playerStructure = structuredClone(db.PlayerProfileStructure);

    // Prefer fields marked for role grid; fall back to all if none marked
    const gridCharStructure = charStructure.some((f) => f.showInRoleGrid)
      ? charStructure.filter((f) => f.showInRoleGrid)
      : charStructure;
    const gridPlayerStructure = playerStructure.some((f) => f.showInRoleGrid)
      ? playerStructure.filter((f) => f.showInRoleGrid)
      : playerStructure;

    const bindings = db.ProfileBindings;
    const profileData: RoleGridProfileRow[] = Object.keys(db.Characters)
      .sort((a, b) => a.localeCompare(b))
      .map((characterName) => {
        const playerName = bindings[characterName];
        return {
          characterName,
          character: pickProfile(db.Characters[characterName] as Record<string, unknown>, gridCharStructure),
          playerName,
          player: playerName
            ? pickProfile(db.Players[playerName] as Record<string, unknown>, gridPlayerStructure)
            : undefined,
        };
      });

    return {
      profileData,
      characterProfileStructure: gridCharStructure,
      playerProfileStructure: gridPlayerStructure,
    };
  }

  async getCharactersSummary(): Promise<Record<string, Record<string, number>>> {
    const db = this.engine.database;
    const charactersInfo: Record<string, Record<string, number>> = {};

    for (const character of Object.keys(db.Characters)) {
      charactersInfo[character] = {
        active: 0,
        follower: 0,
        defensive: 0,
        passive: 0,
        totalAdaptations: 0,
        finishedAdaptations: 0,
        totalStories: 0,
        completeness: 0,
      };
    }

    for (const story of Object.values(db.Stories)) {
      for (const storyCharacter of Object.values(story.characters)) {
        const info = charactersInfo[storyCharacter.name];
        if (!info) continue;
        info.totalStories++;
        for (const [activity, on] of Object.entries(storyCharacter.activity || {})) {
          if (on && activity in info) info[activity]++;
        }
      }
      for (const event of story.events) {
        for (const [charName, adaptation] of Object.entries(event.characters)) {
          const info = charactersInfo[charName];
          if (!info) continue;
          info.totalAdaptations++;
          if (adaptation.ready) info.finishedAdaptations++;
        }
      }
    }

    for (const info of Object.values(charactersInfo)) {
      info.completeness = Math.round(
        (info.finishedAdaptations * 100) / (info.totalAdaptations !== 0 ? info.totalAdaptations : 1),
      );
    }

    return charactersInfo;
  }

  async getExtendedProfileBindings(): Promise<Array<[string, string]>> {
    const db = this.engine.database;
    const bindings = { ...db.ProfileBindings };
    const boundChars = new Set(Object.keys(bindings));
    const boundPlayers = new Set(Object.values(bindings));

    const unboundChars = Object.keys(db.Characters).filter((c) => !boundChars.has(c));
    const unboundPlayers = Object.keys(db.Players).filter((p) => !boundPlayers.has(p));

    return [
      ...Object.entries(bindings).map(([c, p]) => [c, p] as [string, string]),
      ...unboundChars.map((c) => [c, ''] as [string, string]),
      ...unboundPlayers.map((p) => ['', p] as [string, string]),
    ];
  }

  async getProfileFilterInfo(): Promise<ProfileFilterInfo> {
    const db = this.engine.database;
    const [characterOwners, playerOwners] = await Promise.all([
      this.engine.getEntityOwners({ type: 'character' }),
      this.engine.getEntityOwners({ type: 'player' }),
    ]);

    const mapStructure = (structure: ProfileStructureItem[]) =>
      structure.map((el) => ({
        name: el.name,
        type: el.type,
        value: el.value == null ? undefined : String(el.value),
      }));

    const characters = {
      profileStructure: mapStructure(db.CharacterProfileStructure),
      owners: characterOwners,
      profiles: structuredClone(db.Characters) as Record<string, Record<string, unknown>>,
    };
    const players = {
      profileStructure: mapStructure(db.PlayerProfileStructure),
      owners: playerOwners,
      profiles: structuredClone(db.Players) as Record<string, Record<string, unknown>>,
    };

    const charactersSummary = await this.getCharactersSummary();
    const bindingData = await this.getExtendedProfileBindings();

    return makeGroupedProfileFilterInfo({
      characters,
      players,
      charactersSummary,
      bindingData,
    });
  }

  async applyProfileFilter({ filterModel }: { filterModel: FilterCondition[] }): Promise<Array<{
    profileId: [string, string];
    cells: Record<string, unknown>;
  }>> {
    const info = await this.getProfileFilterInfo();
    return applyFilterModel(info, Array.isArray(filterModel) ? filterModel : []);
  }

  async saveFilterToGroup({ groupName, filterModel }: {
    groupName: string; filterModel: FilterCondition[];
  }): Promise<void> {
    ensureString(groupName, 'groupName');
    ensureEntityExists(groupName, Object.keys(this.engine.database.Groups));
    this.engine.database.Groups[groupName].filterModel = Array.isArray(filterModel) ? filterModel : [];
  }
}

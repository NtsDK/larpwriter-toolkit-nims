import type { DatabaseEngine } from './DatabaseEngine';
import type { ProfileType, ProfileItem, Profiles, ProfileStructure, ProfileStructureItem, ProfileFieldType, PlayerAccessType, ProfileBindings } from '../domain/types';
import { ensureString, ensureNotEmpty, ensureNumber, ensureBoolean, ensureEnum, ensureInRange, ensureEntityExists, ensureEntityNotExists, ensureEntityCanBeCreated, ensureEntityCanBeRenamed } from '../utils/precondition';
import { PROFILE_TYPES, PROFILE_FIELD_TYPES, PLAYER_ACCESS_TYPES, PROFILE_FIELD_DEFAULTS } from '../utils/constants';

function charOrdA(a: string, b: string): number {
  return a.localeCompare(b);
}

export class ProfilesEngine {
  constructor(private engine: DatabaseEngine) {}

  private getProfiles(type: ProfileType): Profiles {
    return type === 'character' ? this.engine.database.Characters : this.engine.database.Players;
  }

  private getStructure(type: ProfileType): ProfileStructure {
    return type === 'character'
      ? this.engine.database.CharacterProfileStructure
      : this.engine.database.PlayerProfileStructure;
  }

  async getProfileNamesArray({ type }: { type: string }): Promise<string[]> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    return Object.keys(this.getProfiles(type as ProfileType)).sort(charOrdA);
  }

  async getProfile({ type, name }: { type: string; name: string }): Promise<ProfileItem> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(name, 'name');
    const profiles = this.getProfiles(type as ProfileType);
    ensureEntityExists(name, Object.keys(profiles));
    return structuredClone(profiles[name]);
  }

  async getAllProfiles({ type }: { type: string }): Promise<Profiles> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    return structuredClone(this.getProfiles(type as ProfileType));
  }

  async getProfileStructure({ type }: { type: string }): Promise<ProfileStructure> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    return structuredClone(this.getStructure(type as ProfileType));
  }

  async getProfileBindings(): Promise<ProfileBindings> {
    return structuredClone(this.engine.database.ProfileBindings);
  }

  async createProfile({ type, characterName }: { type: string; characterName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    const profiles = this.getProfiles(type as ProfileType);
    ensureEntityCanBeCreated(characterName, Object.keys(profiles));

    const structure = this.getStructure(type as ProfileType);
    const newProfile: ProfileItem = { name: characterName };
    for (const item of structure) {
      newProfile[item.name] = item.value;
    }
    profiles[characterName] = newProfile;
  }

  async renameProfile({ type, fromName, toName }: { type: string; fromName: string; toName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    const profiles = this.getProfiles(type as ProfileType);
    ensureEntityCanBeRenamed(fromName, toName, Object.keys(profiles));

    if (fromName === toName) return;

    profiles[toName] = profiles[fromName];
    profiles[toName].name = toName;
    delete profiles[fromName];

    if (type === 'character') {
      const bindings = this.engine.database.ProfileBindings;
      for (const [player, char] of Object.entries(bindings)) {
        if (char === fromName) {
          bindings[player] = toName;
        }
      }
    }

    this.engine.ee.emit('renameProfile', [{ type, fromName, toName }]);
  }

  async removeProfile({ type, characterName }: { type: string; characterName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    const profiles = this.getProfiles(type as ProfileType);
    ensureEntityExists(characterName, Object.keys(profiles));

    delete profiles[characterName];

    if (type === 'character') {
      const bindings = this.engine.database.ProfileBindings;
      for (const [player, char] of Object.entries(bindings)) {
        if (char === characterName) {
          delete bindings[player];
        }
      }
    }

    this.engine.ee.emit('removeProfile', [{ type, characterName }]);
  }

  async updateProfileField({ type, characterName, fieldName, itemType, value }: {
    type: string; characterName: string; fieldName: string; itemType: string; value: unknown;
  }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(characterName, 'characterName');
    ensureString(fieldName, 'fieldName');
    const profiles = this.getProfiles(type as ProfileType);
    ensureEntityExists(characterName, Object.keys(profiles));

    const structure = this.getStructure(type as ProfileType);
    const structItem = structure.find(s => s.name === fieldName);
    if (!structItem) {
      throw new Error(`Profile field "${fieldName}" not found in structure`);
    }

    profiles[characterName][fieldName] = value as string | number | boolean;
  }

  async createProfileItem({ type, name, itemType, selectedIndex }: {
    type: string; name: string; itemType: string; selectedIndex: number;
  }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(name, 'name');
    ensureNotEmpty(name, 'name');
    ensureEnum(itemType, PROFILE_FIELD_TYPES, 'itemType');
    ensureNumber(selectedIndex, 'selectedIndex');

    const structure = this.getStructure(type as ProfileType);
    const existingNames = structure.map(s => s.name);
    ensureEntityNotExists(name, existingNames);
    ensureInRange(selectedIndex, 0, structure.length);

    const newItem: ProfileStructureItem = {
      name,
      type: itemType as ProfileFieldType,
      value: PROFILE_FIELD_DEFAULTS[itemType as ProfileFieldType],
      playerAccess: 'hidden',
      doExport: true,
      showInRoleGrid: false,
    };

    structure.splice(selectedIndex, 0, newItem);

    const profiles = this.getProfiles(type as ProfileType);
    for (const profile of Object.values(profiles)) {
      profile[name] = newItem.value;
    }
  }

  async moveProfileItem({ type, index, newIndex }: { type: string; index: number; newIndex: number }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureNumber(index, 'index');
    ensureNumber(newIndex, 'newIndex');

    const structure = this.getStructure(type as ProfileType);
    ensureInRange(index, 0, structure.length - 1);
    ensureInRange(newIndex, 0, structure.length - 1);

    const [item] = structure.splice(index, 1);
    structure.splice(newIndex, 0, item);
  }

  async removeProfileItem({ type, index, profileItemName }: { type: string; index: number; profileItemName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureNumber(index, 'index');
    ensureString(profileItemName, 'profileItemName');

    const structure = this.getStructure(type as ProfileType);
    ensureInRange(index, 0, structure.length - 1);

    structure.splice(index, 1);

    const profiles = this.getProfiles(type as ProfileType);
    for (const profile of Object.values(profiles)) {
      delete profile[profileItemName];
    }
  }

  async changeProfileItemType({ type, profileItemName, newType }: { type: string; profileItemName: string; newType: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(profileItemName, 'profileItemName');
    ensureEnum(newType, PROFILE_FIELD_TYPES, 'newType');

    const structure = this.getStructure(type as ProfileType);
    const item = structure.find(s => s.name === profileItemName);
    if (!item) throw new Error(`Profile item "${profileItemName}" not found`);

    item.type = newType as ProfileFieldType;
    item.value = PROFILE_FIELD_DEFAULTS[newType as ProfileFieldType];

    const profiles = this.getProfiles(type as ProfileType);
    for (const profile of Object.values(profiles)) {
      profile[profileItemName] = item.value;
    }
  }

  async changeProfileItemPlayerAccess({ type, profileItemName, playerAccessType }: { type: string; profileItemName: string; playerAccessType: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(profileItemName, 'profileItemName');
    ensureEnum(playerAccessType, PLAYER_ACCESS_TYPES, 'playerAccessType');

    const structure = this.getStructure(type as ProfileType);
    const item = structure.find(s => s.name === profileItemName);
    if (!item) throw new Error(`Profile item "${profileItemName}" not found`);
    item.playerAccess = playerAccessType as PlayerAccessType;
  }

  async renameProfileItem({ type, newName, oldName }: { type: string; newName: string; oldName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(newName, 'newName');
    ensureNotEmpty(newName, 'newName');
    ensureString(oldName, 'oldName');

    const structure = this.getStructure(type as ProfileType);
    const existingNames = structure.map(s => s.name);
    ensureEntityExists(oldName, existingNames);
    if (oldName !== newName) {
      ensureEntityNotExists(newName, existingNames);
    }

    const item = structure.find(s => s.name === oldName)!;
    item.name = newName;

    const profiles = this.getProfiles(type as ProfileType);
    for (const profile of Object.values(profiles)) {
      profile[newName] = profile[oldName];
      if (oldName !== newName) delete profile[oldName];
    }
  }

  async doExportProfileItemChange({ type, profileItemName, checked }: { type: string; profileItemName: string; checked: boolean }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(profileItemName, 'profileItemName');
    ensureBoolean(checked, 'checked');

    const structure = this.getStructure(type as ProfileType);
    const item = structure.find(s => s.name === profileItemName);
    if (!item) throw new Error(`Profile item "${profileItemName}" not found`);
    item.doExport = checked;
  }

  async showInRoleGridProfileItemChange({ type, profileItemName, checked }: { type: string; profileItemName: string; checked: boolean }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(profileItemName, 'profileItemName');
    ensureBoolean(checked, 'checked');

    const structure = this.getStructure(type as ProfileType);
    const item = structure.find(s => s.name === profileItemName);
    if (!item) throw new Error(`Profile item "${profileItemName}" not found`);
    item.showInRoleGrid = checked;
  }

  async updateDefaultValue({ type, profileItemName, value }: { type: string; profileItemName: string; value: unknown }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    ensureString(profileItemName, 'profileItemName');

    const structure = this.getStructure(type as ProfileType);
    const item = structure.find(s => s.name === profileItemName);
    if (!item) throw new Error(`Profile item "${profileItemName}" not found`);
    item.value = value as string | number | boolean;
  }
}

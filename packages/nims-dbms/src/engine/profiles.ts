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
    if (type === 'character') return this.engine.database.Characters;
    if (type === 'questionnaire') return this.engine.database.Questionnaires;
    return this.engine.database.Players;
  }

  private getStructure(type: ProfileType): ProfileStructure {
    if (type === 'character') return this.engine.database.CharacterProfileStructure;
    if (type === 'questionnaire') return this.engine.database.QuestionnaireStructure;
    return this.engine.database.PlayerProfileStructure;
  }

  /** Answer sheet for a player — separate from player profile properties. */
  private ensureQuestionnaire(playerName: string): void {
    const sheets = this.engine.database.Questionnaires;
    if (sheets[playerName]) return;
    const structure = this.engine.database.QuestionnaireStructure;
    const sheet: ProfileItem = { name: playerName };
    for (const item of structure) {
      sheet[item.name] = item.value;
    }
    sheets[playerName] = sheet;
  }

  private renameQuestionnaire(fromName: string, toName: string): void {
    const sheets = this.engine.database.Questionnaires;
    if (!sheets[fromName]) return;
    sheets[toName] = sheets[fromName];
    sheets[toName].name = toName;
    delete sheets[fromName];
  }

  private removeQuestionnaire(playerName: string): void {
    delete this.engine.database.Questionnaires[playerName];
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

  async bindCharacterToPlayer(args: { characterName: string; playerName: string }): Promise<void> {
    const { characterName, playerName } = args;
    const chars = this.engine.database.Characters;
    ensureEntityExists(characterName, Object.keys(chars));
    const players = this.engine.database.Players;
    ensureEntityExists(playerName, Object.keys(players));
    this.engine.database.ProfileBindings[characterName] = playerName;
  }

  async unbindCharacterFromPlayer(args: { characterName: string }): Promise<void> {
    delete this.engine.database.ProfileBindings[args.characterName];
  }

  async createProfile({ type, characterName }: { type: string; characterName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    if (type === 'questionnaire') throw new Error('errors-questionnaire-created-with-player');
    const profiles = this.getProfiles(type as ProfileType);
    ensureEntityCanBeCreated(characterName, Object.keys(profiles));

    const structure = this.getStructure(type as ProfileType);
    const newProfile: ProfileItem = { name: characterName };
    for (const item of structure) {
      newProfile[item.name] = item.value;
    }
    profiles[characterName] = newProfile;
    if (type === 'player') {
      this.ensureQuestionnaire(characterName);
    }
  }

  async renameProfile({ type, fromName, toName }: { type: string; fromName: string; toName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    if (type === 'questionnaire') throw new Error('errors-questionnaire-renamed-with-player');
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
    if (type === 'player') {
      this.renameQuestionnaire(fromName, toName);
      const playersInfo = this.engine.database.ManagementInfo?.PlayersInfo as
        | Record<string, { name?: string; salt?: string; hashedPassword?: string; profileName?: string }>
        | undefined;
      if (playersInfo) {
        // Same-name login: rename the login key with the profile.
        if (playersInfo[fromName] && !playersInfo[fromName].profileName) {
          playersInfo[toName] = { ...playersInfo[fromName], name: toName };
          delete playersInfo[fromName];
        }
        // Update explicit links pointing at this profile.
        for (const info of Object.values(playersInfo)) {
          if (info.profileName === fromName) info.profileName = toName;
        }
      }
      const bindings = this.engine.database.ProfileBindings;
      for (const [charName, playerName] of Object.entries(bindings)) {
        if (playerName === fromName) bindings[charName] = toName;
      }
      const usersInfo = this.engine.database.ManagementInfo?.UsersInfo as
        | Record<string, { players?: string[] }>
        | undefined;
      if (usersInfo) {
        for (const user of Object.values(usersInfo)) {
          if (!Array.isArray(user.players)) continue;
          user.players = user.players.map((p) => (p === fromName ? toName : p));
        }
      }
    }

    this.engine.ee.emit('renameProfile', [{ type, fromName, toName }]);
  }

  async removeProfile({ type, characterName }: { type: string; characterName: string }): Promise<void> {
    ensureEnum(type, PROFILE_TYPES, 'type');
    if (type === 'questionnaire') {
      throw new Error('errors-questionnaire-removed-with-player');
    }
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
    if (type === 'player') {
      this.removeQuestionnaire(characterName);
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
      // Questionnaire: player fills by default. Player profile / character: readonly unless masters open write.
      playerAccess: type === 'questionnaire' ? 'write' : 'readonly',
      doExport: true,
      showInRoleGrid: false,
    };

    structure.splice(selectedIndex, 0, newItem);

    if (type === 'questionnaire') {
      for (const playerName of Object.keys(this.engine.database.Players)) {
        this.ensureQuestionnaire(playerName);
      }
    }

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

  /**
   * Player cabinet: visible (non-hidden) fields for the logged-in player
   * and their bound character, if any.
   * Called as getPlayerProfileInfo(user) from /api (user is the sole arg).
   */
  async getPlayerProfileInfo(user: { name: string; role?: string }): Promise<{
    login: string;
    player: { name: string; profile: ProfileItem; profileStructure: ProfileStructure };
    questionnaire: { name: string; profile: ProfileItem; profileStructure: ProfileStructure };
    character?: { name: string; profile: ProfileItem; profileStructure: ProfileStructure };
  }> {
    const login = user?.name;
    if (!login) throw new Error('errors-user-is-not-logged');

    const playersInfo = this.engine.database.ManagementInfo?.PlayersInfo || {};
    if (!playersInfo[login]) throw new Error('errors-user-is-not-found');

    const profileName = this.engine.users.resolvePlayerProfileName(login);
    if (!profileName) throw new Error('errors-entity-is-not-exist');

    const playerStructure = this.getStructure('player');
    const playerProfile = this.getProfiles('player')[profileName];
    if (!playerProfile) throw new Error('errors-entity-is-not-exist');

    this.ensureQuestionnaire(profileName);
    const questionnaireStructure = this.getStructure('questionnaire');
    const questionnaireProfile = this.getProfiles('questionnaire')[profileName];

    const player = this.preparePlayerView(profileName, playerProfile, playerStructure, 'playerSelf');
    const questionnaire = this.preparePlayerView(
      profileName,
      questionnaireProfile,
      questionnaireStructure,
      'playerSelf',
    );

    const bindings = this.engine.database.ProfileBindings || {};
    let characterName = '';
    for (const [char, boundPlayer] of Object.entries(bindings)) {
      if (boundPlayer === profileName) {
        characterName = char;
        break;
      }
    }

    if (!characterName) {
      return { login, player, questionnaire };
    }

    const charStructure = this.getStructure('character');
    const charProfile = this.getProfiles('character')[characterName];
    if (!charProfile) {
      return { login, player, questionnaire };
    }

    return {
      login,
      player,
      questionnaire,
      character: this.preparePlayerView(characterName, charProfile, charStructure, 'boundCharacter'),
    };
  }

  /**
   * Player cabinet (own card + bound character): show the full structure.
   * playerAccess only controls editability — write stays writable, everything
   * else is readonly. Masters must not put secrets in the player-facing sheet;
   * use organizer-only areas for that. Field ACL still blocks updates unless write.
   */
  private preparePlayerView(
    name: string,
    profile: ProfileItem,
    structure: ProfileStructure,
    _mode: 'playerSelf' | 'boundCharacter',
  ): { name: string; profile: ProfileItem; profileStructure: ProfileStructure } {
    const visibleStructure: ProfileStructure = structure.map((item) => ({
      ...item,
      playerAccess: item.playerAccess === 'write' ? 'write' : 'readonly',
    }));

    const visibleNames = new Set(visibleStructure.map((item) => item.name));
    const filtered: ProfileItem = { name };
    for (const item of visibleStructure) {
      filtered[item.name] = profile[item.name] !== undefined ? profile[item.name] : item.value;
    }
    for (const key of Object.keys(profile)) {
      if (key !== 'name' && visibleNames.has(key) && filtered[key] === undefined) {
        filtered[key] = profile[key];
      }
    }

    return {
      name,
      profile: structuredClone(filtered),
      profileStructure: structuredClone(visibleStructure),
    };
  }
}

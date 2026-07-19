import * as crypto from 'crypto';
import type { DatabaseEngine } from './DatabaseEngine';
import type { PlayersOptions, ProfileItem, ProfileStructure } from '../domain/types';

export interface UserInfo {
  name: string;
  salt?: string;
  hashedPassword?: string;
  stories: string[];
  characters: string[];
  players: string[];
  groups: string[];
}

export interface PlayerInfo {
  name: string;
  salt?: string;
  hashedPassword?: string;
  /** Linked player profile name when different from login. */
  profileName?: string;
}

const PLAYER_OPTION_TYPES = ['allowPlayerCreation', 'allowCharacterCreation'] as const;

export function isProfileFieldEmpty(value: unknown, itemType: string): boolean {
  if (value === null || value === undefined) return true;
  if (itemType === 'checkbox') return value === false;
  if (itemType === 'number') {
    if (value === '') return true;
    if (typeof value === 'number' && Number.isNaN(value)) return true;
    return false;
  }
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

export function mergeProfileSheets(
  playerSheet: ProfileItem | undefined,
  handSheet: ProfileItem,
  structure: ProfileStructure,
): ProfileItem {
  const result: ProfileItem = { ...handSheet, name: handSheet.name };
  for (const item of structure) {
    const pVal = playerSheet?.[item.name];
    const hVal = handSheet[item.name];
    if (!isProfileFieldEmpty(pVal, item.type)) {
      result[item.name] = pVal as string | number | boolean;
    } else if (hVal !== undefined) {
      result[item.name] = hVal;
    } else {
      result[item.name] = item.value;
    }
  }
  return result;
}

export interface SessionUser {
  name: string;
  role: string;
}

function encryptPassword(salt: string, password: string): string {
  return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

export class UsersEngine {
  private engine: DatabaseEngine;

  constructor(engine: DatabaseEngine) {
    this.engine = engine;
  }

  private get mgmt() {
    if (!this.engine.database.ManagementInfo) {
      this.engine.database.ManagementInfo = {
        UsersInfo: {},
        PlayersInfo: {},
      };
    }
    return this.engine.database.ManagementInfo!;
  }

  private get usersInfo(): Record<string, UserInfo> {
    if (!this.mgmt.UsersInfo) {
      this.mgmt.UsersInfo = {};
    }
    return this.mgmt.UsersInfo as Record<string, UserInfo>;
  }

  private get playersInfo(): Record<string, PlayerInfo> {
    if (!this.mgmt.PlayersInfo) {
      this.mgmt.PlayersInfo = {};
    }
    return this.mgmt.PlayersInfo as Record<string, PlayerInfo>;
  }

  async getUser(args: { username: string; type: string }): Promise<UserInfo | PlayerInfo | undefined> {
    const { username, type } = args;
    if (type === 'organizer') {
      return this.usersInfo[username];
    } else if (type === 'player') {
      return this.playersInfo[username];
    }
    throw new Error(`Unexpected user type: ${type}`);
  }

  async checkPassword(args: { username: string; type: string; password: string }): Promise<boolean> {
    const { username, type, password } = args;
    const user = type === 'organizer' ? this.usersInfo[username] : this.playersInfo[username];
    if (!user || !user.salt || !user.hashedPassword) return false;
    return encryptPassword(user.salt, password) === user.hashedPassword;
  }

  async setPassword(args: { username: string; type: string; password: string }): Promise<void> {
    const { username, type, password } = args;
    const user = type === 'organizer' ? this.usersInfo[username] : this.playersInfo[username];
    if (!user) throw new Error('errors-user-is-not-found');
    user.salt = `${Math.random()}`;
    user.hashedPassword = encryptPassword(user.salt, password);
  }

  async login(args: { username: string; password: string }): Promise<SessionUser> {
    const { username, password } = args;

    const orgUser = this.usersInfo[username];
    if (orgUser && orgUser.salt && orgUser.hashedPassword) {
      if (encryptPassword(orgUser.salt, password) === orgUser.hashedPassword) {
        return { name: orgUser.name, role: 'organizer' };
      }
    }

    const playerUser = this.playersInfo[username];
    if (playerUser && playerUser.salt && playerUser.hashedPassword) {
      if (encryptPassword(playerUser.salt, password) === playerUser.hashedPassword) {
        return { name: playerUser.name, role: 'player' };
      }
    }

    throw new Error('errors-user-is-not-found');
  }

  async signUp(args: { userName: string; password: string; confirmPassword: string }): Promise<void> {
    const { userName, password, confirmPassword } = args;
    if (!userName || !userName.trim()) throw new Error('errors-user-is-not-found');
    const name = userName.trim();
    if (password === '') throw new Error('errors-password-is-not-specified');
    if (password !== confirmPassword) throw new Error('errors-passwords-not-match');
    if (this.playersInfo[name]) throw new Error('errors-user-already-exists');
    if (this.usersInfo[name]) throw new Error('errors-organizer-already-exists');
    if (this.engine.database.Players[name]) throw new Error('errors-entity-already-exists');

    this.ensurePlayerSheets(name);
    this.playersInfo[name] = { name };
    await this.setPassword({ username: name, type: 'player', password });
  }

  /** Resolve login → player profile name (linked or same-name fallback). */
  resolvePlayerProfileName(userName: string): string | null {
    const info = this.playersInfo[userName];
    if (!info) return null;
    const db = this.engine.database;
    const linked = info.profileName;
    if (linked && db.Players[linked]) return linked;
    if (db.Players[userName]) return userName;
    return linked || null;
  }

  async getResolvedPlayerProfileName(args: { userName: string }): Promise<string | null> {
    return this.resolvePlayerProfileName(args.userName);
  }

  private ensurePlayerSheets(userName: string): void {
    const db = this.engine.database;
    if (!db.PlayerProfileStructure) db.PlayerProfileStructure = [];
    if (!db.Players[userName]) {
      db.Players[userName] = { name: userName };
      for (const item of db.PlayerProfileStructure) {
        db.Players[userName][item.name] = item.value;
      }
    }
    if (!db.Questionnaires) db.Questionnaires = {};
    if (!db.QuestionnaireStructure) db.QuestionnaireStructure = [];
    if (!db.Questionnaires[userName]) {
      db.Questionnaires[userName] = { name: userName };
      for (const item of db.QuestionnaireStructure) {
        db.Questionnaires[userName][item.name] = item.value;
      }
    }
  }

  private findLoginLinkedToProfile(profileName: string): string | null {
    for (const [login, info] of Object.entries(this.playersInfo)) {
      if (info.profileName === profileName) return login;
      // Same-name login owns the profile until an explicit cross-link exists elsewhere.
      if (!info.profileName && login === profileName) return login;
    }
    return null;
  }

  /**
   * Link login to an existing hand-created profile.
   * Merge: player-filled fields win; empty player fields keep hand values.
   * Then drop signup sheets under the login name when names differ.
   */
  async linkPlayerLoginToProfile(args: { userName: string; profileName: string }): Promise<void> {
    const login = args.userName?.trim();
    const hand = args.profileName?.trim();
    if (!login || !hand) throw new Error('errors-user-is-not-found');
    const info = this.playersInfo[login];
    if (!info) throw new Error('errors-user-is-not-found');
    const db = this.engine.database;
    if (!db.Players[hand]) throw new Error('errors-entity-is-not-exist');

    const other = this.findLoginLinkedToProfile(hand);
    if (other && other !== login) throw new Error('errors-player-login-already-exists');

    if (login === hand) {
      delete info.profileName;
      return;
    }

    const playerSheet = db.Players[login];
    const handSheet = db.Players[hand];
    db.Players[hand] = mergeProfileSheets(
      playerSheet,
      handSheet,
      db.PlayerProfileStructure || [],
    );
    db.Players[hand].name = hand;

    if (!db.Questionnaires) db.Questionnaires = {};
    if (!db.QuestionnaireStructure) db.QuestionnaireStructure = [];
    const playerQ = db.Questionnaires[login];
    const handQ = db.Questionnaires[hand] || { name: hand };
    for (const item of db.QuestionnaireStructure) {
      if (handQ[item.name] === undefined) handQ[item.name] = item.value;
    }
    db.Questionnaires[hand] = mergeProfileSheets(playerQ, handQ as ProfileItem, db.QuestionnaireStructure);
    db.Questionnaires[hand].name = hand;

    if (playerSheet) delete db.Players[login];
    if (db.Questionnaires[login]) delete db.Questionnaires[login];

    // Move character bindings from signup profile name to hand name
    for (const [char, bound] of Object.entries(db.ProfileBindings || {})) {
      if (bound === login) db.ProfileBindings[char] = hand;
    }

    info.profileName = hand;
  }

  async unlinkPlayerLoginFromProfile(args: { userName: string }): Promise<void> {
    const login = args.userName?.trim();
    if (!login) throw new Error('errors-user-is-not-found');
    const info = this.playersInfo[login];
    if (!info) throw new Error('errors-user-is-not-found');
    delete info.profileName;
    this.ensurePlayerSheets(login);
  }

  async getPlayersOptions(): Promise<PlayersOptions> {
    const opts = this.mgmt.PlayersOptions as PlayersOptions | undefined;
    return {
      allowPlayerCreation: opts?.allowPlayerCreation !== false,
      allowCharacterCreation: opts?.allowCharacterCreation === true,
    };
  }

  async setPlayerOption(args: { name: string; value: boolean }): Promise<void> {
    const { name, value } = args;
    if (!(PLAYER_OPTION_TYPES as readonly string[]).includes(name)) {
      throw new Error(`Unknown player option: ${name}`);
    }
    if (typeof value !== 'boolean') throw new Error('errors-argument-is-not-a-boolean');
    if (!this.mgmt.PlayersOptions) {
      this.mgmt.PlayersOptions = {
        allowPlayerCreation: true,
        allowCharacterCreation: false,
      };
    }
    (this.mgmt.PlayersOptions as PlayersOptions)[name as keyof PlayersOptions] = value;
  }

  async getWelcomeText(): Promise<string> {
    return (this.mgmt.WelcomeText as string) || '';
  }

  async setWelcomeText(args: { text: string }): Promise<void> {
    this.mgmt.WelcomeText = typeof args.text === 'string' ? args.text : '';
  }

  async createOrganizer(args: { name: string; password: string }): Promise<void> {
    const { name, password } = args;
    if (this.usersInfo[name]) throw new Error('errors-organizer-already-exists');
    if (!password || password === '') throw new Error('errors-password-is-not-specified');
    this.usersInfo[name] = {
      name,
      stories: [],
      characters: [],
      players: [],
      groups: [],
    };
    await this.setPassword({ username: name, type: 'organizer', password });
  }

  async removeOrganizer(args: { name: string }): Promise<void> {
    const { name } = args;
    if (!this.usersInfo[name]) throw new Error('errors-user-is-not-found');
    const admins = this.getAdmins();
    const adIdx = admins.indexOf(name);
    if (adIdx !== -1) {
      admins.splice(adIdx, 1);
      this.setAdmins(admins);
    }
    const editors = this.getEditors();
    const edIdx = editors.indexOf(name);
    if (edIdx !== -1) {
      editors.splice(edIdx, 1);
      this.setEditors(editors);
    }
    delete this.usersInfo[name];
  }

  async getManagementInfo(): Promise<{
    usersInfo: Record<string, Pick<UserInfo, 'characters' | 'groups' | 'stories' | 'players'>>;
    PlayersInfo: Record<string, { name: string; profileName?: string; resolvedProfileName: string | null }>;
    PlayersOptions: PlayersOptions;
    WelcomeText: string;
    admins: string[];
    editors: string[];
    admin: string;
    editor: string;
    adaptationRights: string;
  }> {
    const usersInfo: Record<string, Pick<UserInfo, 'characters' | 'groups' | 'stories' | 'players'>> = {};
    for (const [key, user] of Object.entries(this.usersInfo)) {
      usersInfo[key] = {
        characters: user.characters || [],
        groups: user.groups || [],
        stories: user.stories || [],
        players: user.players || [],
      };
    }
    const PlayersInfo: Record<string, { name: string; profileName?: string; resolvedProfileName: string | null }> = {};
    for (const [key, player] of Object.entries(this.playersInfo)) {
      PlayersInfo[key] = {
        name: player.name || key,
        profileName: player.profileName,
        resolvedProfileName: this.resolvePlayerProfileName(key),
      };
    }
    const admins = this.getAdmins();
    const editors = this.getEditors();
    const playersOptions = await this.getPlayersOptions();
    return {
      usersInfo,
      PlayersInfo,
      PlayersOptions: playersOptions,
      WelcomeText: (this.mgmt.WelcomeText as string) || '',
      admins,
      editors,
      admin: admins[0] || '',
      editor: editors[0] || '',
      adaptationRights: (this.mgmt.adaptationRights as string) || '',
    };
  }

  async assignAdmin(args: { name: string }): Promise<void> {
    if (!this.usersInfo[args.name]) throw new Error('errors-user-is-not-found');
    const admins = this.getAdmins();
    if (!admins.includes(args.name)) {
      admins.push(args.name);
      this.setAdmins(admins);
    }
  }

  async revokeAdmin(args: { name: string }): Promise<void> {
    const admins = this.getAdmins();
    const idx = admins.indexOf(args.name);
    if (idx !== -1) {
      admins.splice(idx, 1);
      this.setAdmins(admins);
    }
  }

  async assignEditor(args: { name: string }): Promise<void> {
    if (!this.usersInfo[args.name]) throw new Error('errors-user-is-not-found');
    const editors = this.getEditors();
    if (!editors.includes(args.name)) {
      editors.push(args.name);
      this.setEditors(editors);
    }
  }

  async revokeEditor(args: { name: string }): Promise<void> {
    const editors = this.getEditors();
    const idx = editors.indexOf(args.name);
    if (idx !== -1) {
      editors.splice(idx, 1);
      this.setEditors(editors);
    }
  }

  /** Classic API: clear all editors (exit editor mode). */
  async removeEditor(): Promise<void> {
    this.setEditors([]);
  }

  async changeAdaptationRightsMode(args: { mode: string }): Promise<void> {
    this.mgmt.adaptationRights = args.mode;
  }

  async assignCharactersToOrganizer(args: { userName: string; characters: string[] }): Promise<void> {
    const user = this.usersInfo[args.userName];
    if (!user) throw new Error('errors-user-is-not-found');
    user.characters = args.characters;
  }

  async assignStoriesToOrganizer(args: { userName: string; stories: string[] }): Promise<void> {
    const user = this.usersInfo[args.userName];
    if (!user) throw new Error('errors-user-is-not-found');
    user.stories = args.stories;
  }

  async assignGroupsToOrganizer(args: { userName: string; groups: string[] }): Promise<void> {
    const user = this.usersInfo[args.userName];
    if (!user) throw new Error('errors-user-is-not-found');
    user.groups = args.groups;
  }

  async assignPlayersToOrganizer(args: { userName: string; players: string[] }): Promise<void> {
    const user = this.usersInfo[args.userName];
    if (!user) throw new Error('errors-user-is-not-found');
    user.players = args.players;
  }

  /**
   * Classic ownership: entity → organizer name (empty string if unassigned).
   * Built by inverting ManagementInfo.UsersInfo.[characters|players|stories|groups].
   */
  async getEntityOwners({ type }: { type: string }): Promise<Record<string, string>> {
    const db = this.engine.database;
    let names: string[];
    let listKey: 'characters' | 'players' | 'stories' | 'groups';

    switch (type) {
      case 'character':
        names = Object.keys(db.Characters);
        listKey = 'characters';
        break;
      case 'player':
        names = Object.keys(db.Players);
        listKey = 'players';
        break;
      case 'story':
        names = Object.keys(db.Stories);
        listKey = 'stories';
        break;
      case 'group':
        names = Object.keys(db.Groups);
        listKey = 'groups';
        break;
      default:
        throw new Error(`Unknown entity type for owners: ${type}`);
    }

    const owners: Record<string, string> = {};
    for (const name of names) owners[name] = '';

    for (const [userName, info] of Object.entries(this.usersInfo)) {
      const list = info[listKey];
      if (!Array.isArray(list)) continue;
      for (const entityName of list) {
        if (entityName in owners && !owners[entityName]) {
          owners[entityName] = userName;
        }
      }
    }
    return owners;
  }

  async changeOrganizerPassword(args: { userName: string; newPassword: string }): Promise<void> {
    const { userName, newPassword } = args;
    if (!this.usersInfo[userName]) throw new Error('errors-user-is-not-found');
    if (!newPassword || newPassword === '') throw new Error('errors-password-is-not-specified');
    await this.setPassword({ username: userName, type: 'organizer', password: newPassword });
  }

  async changePlayerPassword(args: { userName: string; newPassword: string }): Promise<void> {
    const { userName, newPassword } = args;
    if (!this.playersInfo[userName]) throw new Error('errors-user-is-not-found');
    if (!newPassword || newPassword === '') throw new Error('errors-password-is-not-specified');
    await this.setPassword({ username: userName, type: 'player', password: newPassword });
  }

  async createPlayer(args: { userName: string; password: string }): Promise<void> {
    const { userName, password } = args;
    if (!password || password === '') throw new Error('errors-password-is-not-specified');
    if (this.playersInfo[userName]) throw new Error('errors-player-already-exists');
    this.ensurePlayerSheets(userName);
    this.playersInfo[userName] = { name: userName };
    await this.setPassword({ username: userName, type: 'player', password });
  }

  async removePlayerLogin(args: { userName: string }): Promise<void> {
    const { userName } = args;
    if (!this.playersInfo[userName]) throw new Error('errors-user-is-not-found');
    delete this.playersInfo[userName];
  }

  async createPlayerLogin(args: { userName: string; password: string }): Promise<void> {
    const { userName, password } = args;
    if (!password || password === '') throw new Error('errors-password-is-not-specified');
    const db = this.engine.database;
    if (!db.Players[userName]) throw new Error('errors-entity-is-not-exist');
    if (this.playersInfo[userName]) throw new Error('errors-player-login-already-exists');
    this.playersInfo[userName] = { name: userName };
    await this.setPassword({ username: userName, type: 'player', password });
  }

  /**
   * Move a player login into UsersInfo as organizer, keeping the same password hash.
   * Player profile (Players sheet) stays; only the login role changes.
   */
  async promotePlayerToOrganizer(args: { userName: string }): Promise<void> {
    const { userName } = args;
    const player = this.playersInfo[userName];
    if (!player) throw new Error('errors-user-is-not-found');
    if (this.usersInfo[userName]) throw new Error('errors-organizer-already-exists');
    if (!player.salt || !player.hashedPassword) throw new Error('errors-password-is-not-specified');

    this.usersInfo[userName] = {
      name: userName,
      salt: player.salt,
      hashedPassword: player.hashedPassword,
      stories: [],
      characters: [],
      players: [],
      groups: [],
    };
    delete this.playersInfo[userName];
  }

  private getAdmins(): string[] {
    if (Array.isArray(this.mgmt.admins)) {
      return this.mgmt.admins;
    }
    const legacy = this.mgmt.admin as string | undefined;
    const admins = legacy ? [legacy] : [];
    this.mgmt.admins = admins;
    return admins;
  }

  private setAdmins(admins: string[]): void {
    this.mgmt.admins = admins;
    this.mgmt.admin = admins[0] || '';
  }

  private getEditors(): string[] {
    if (Array.isArray(this.mgmt.editors)) {
      return this.mgmt.editors;
    }
    const legacy = this.mgmt.editor as string | undefined;
    const editors = legacy ? [legacy] : [];
    this.mgmt.editors = editors;
    return editors;
  }

  private setEditors(editors: string[]): void {
    this.mgmt.editors = editors;
    this.mgmt.editor = editors[0] || '';
  }

  ensureAdminExists(adminLogin: string, adminPass: string): void {
    if (!this.usersInfo[adminLogin]) {
      this.usersInfo[adminLogin] = {
        name: adminLogin,
        stories: [],
        characters: [],
        players: [],
        groups: [],
      };
    }
    // Restore credentials if missing (e.g. autosave written without hashes).
    const admin = this.usersInfo[adminLogin];
    if (!admin.salt || !admin.hashedPassword) {
      const salt = `${Math.random()}`;
      admin.salt = salt;
      admin.hashedPassword = encryptPassword(salt, adminPass);
    }
    const admins = this.getAdmins();
    if (!admins.includes(adminLogin)) {
      admins.push(adminLogin);
      this.setAdmins(admins);
    }
  }
}

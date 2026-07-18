import * as crypto from 'crypto';
import type { DatabaseEngine } from './DatabaseEngine';

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
    if (password === '') throw new Error('errors-password-is-not-specified');
    if (password !== confirmPassword) throw new Error('errors-passwords-not-match');
    if (this.playersInfo[userName]) throw new Error('errors-user-already-exists');
    this.playersInfo[userName] = { name: userName };
    await this.setPassword({ username: userName, type: 'player', password });
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
    if (this.mgmt.admin === name) {
      this.mgmt.admin = '';
    }
    if (this.mgmt.editor === name) {
      this.mgmt.editor = '';
    }
    delete this.usersInfo[name];
  }

  async getManagementInfo(): Promise<{
    usersInfo: Record<string, Pick<UserInfo, 'characters' | 'groups' | 'stories' | 'players'>>;
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
    return {
      usersInfo,
      admin: (this.mgmt.admin as string) || '',
      editor: (this.mgmt.editor as string) || '',
      adaptationRights: (this.mgmt.adaptationRights as string) || '',
    };
  }

  async assignAdmin(args: { name: string }): Promise<void> {
    if (!this.usersInfo[args.name]) throw new Error('errors-user-is-not-found');
    this.mgmt.admin = args.name;
  }

  async assignEditor(args: { name: string }): Promise<void> {
    if (!this.usersInfo[args.name]) throw new Error('errors-user-is-not-found');
    this.mgmt.editor = args.name;
  }

  async changeOrganizerPassword(args: { userName: string; newPassword: string }): Promise<void> {
    const { userName, newPassword } = args;
    if (!this.usersInfo[userName]) throw new Error('errors-user-is-not-found');
    if (!newPassword || newPassword === '') throw new Error('errors-password-is-not-specified');
    await this.setPassword({ username: userName, type: 'organizer', password: newPassword });
  }

  async createPlayer(args: { userName: string; password: string }): Promise<void> {
    const { userName, password } = args;
    if (!password || password === '') throw new Error('errors-password-is-not-specified');
    if (this.playersInfo[userName]) throw new Error('errors-player-already-exists');

    const db = this.engine.database;
    if (!db.Players[userName]) {
      db.Players[userName] = {};
      const structure = db.PlayerProfileStructure;
      for (const item of structure) {
        db.Players[userName][item.name] = item.value;
      }
    }

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

  ensureAdminExists(adminLogin: string, adminPass: string): void {
    if (!this.usersInfo[adminLogin]) {
      this.usersInfo[adminLogin] = {
        name: adminLogin,
        stories: [],
        characters: [],
        players: [],
        groups: [],
      };
      const salt = `${Math.random()}`;
      const hashedPassword = encryptPassword(salt, adminPass);
      this.usersInfo[adminLogin].salt = salt;
      this.usersInfo[adminLogin].hashedPassword = hashedPassword;
    }
    if (!this.mgmt.admin) {
      this.mgmt.admin = adminLogin;
    }
  }
}

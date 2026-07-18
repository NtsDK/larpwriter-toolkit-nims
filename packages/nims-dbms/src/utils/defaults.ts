import type { Database } from '../domain/types';

export function ensureDatabaseDefaults(database: Database): Database {
  if (!database) database = {} as Database;
  if (!database.Meta) database.Meta = { name: '', description: '', date: '', preGameDate: '', saveTime: '' };
  if (!database.Characters) database.Characters = {};
  if (!database.Players) database.Players = {};
  if (!database.Stories) database.Stories = {};
  if (!database.Relations) database.Relations = [];
  if (!database.Groups) database.Groups = {};
  if (!database.CharacterProfileStructure) database.CharacterProfileStructure = [];
  if (!database.PlayerProfileStructure) database.PlayerProfileStructure = [];
  if (!database.ProfileBindings) database.ProfileBindings = {};
  return database;
}

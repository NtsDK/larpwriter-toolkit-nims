import type { EventEmitter } from "events";
import { PlayerAccessTypes, ProfileFieldTypesNames } from "../nimsConstants";

export interface ILocalDBMS {
  ee: EventEmitter;
  database: Database;

  getDatabase(this: ILocalDBMS): Promise<Database>;
  getMetaInfo(this: ILocalDBMS): Promise<GameMeta>;
  setDatabase(this: ILocalDBMS, { database }: {
    database: Database;
  }): Promise<void>;
  setMetaInfoDate(this: ILocalDBMS, { name, value }: {
    name: "date" | "preGameDate";
    value: string;
  }): Promise<void>;
  setMetaInfoString(this: ILocalDBMS, { name, value }: {
    name: "name" | "description";
    value: string;
  }): Promise<void>;

  getProfileBindings(this: ILocalDBMS): Promise<ProfileBindings>;
}

export type Database = {
  Meta: GameMeta,
  Stories: Record<string, Story>,
  Characters: Profiles,
  Players: Profiles,
  Relations: Relation[],
  ProfileBindings: ProfileBindings,
  Groups: Record<string, Group>,
  PlayerProfileStructure: ProfileStructure,
  CharacterProfileStructure: ProfileStructure,
  ManagementInfo: any,
}

export type ProfileBindings = Record<string, string>;

export type ProfileStructure = ProfileStructureItem[];

interface BaseProfileStructureItem {
  name: string;
  playerAccess: PlayerAccessTypes;
  doExport: boolean;
  showInRoleGrid: boolean;
}

export interface EnumProfileStructureItem extends BaseProfileStructureItem {
  type: "enum";
  value: string;
}

export interface MultiEnumProfileStructureItem extends BaseProfileStructureItem {
  type: "multiEnum";
  value: string;
}

export interface StringProfileStructureItem extends BaseProfileStructureItem {
  type: "string";
  value: string;
}
export interface TextProfileStructureItem extends BaseProfileStructureItem {
  type: "text";
  value: string;
}
export interface NumberProfileStructureItem extends BaseProfileStructureItem {
  type: "number";
  value: number;
}
export interface CheckboxProfileStructureItem extends BaseProfileStructureItem {
  type: "checkbox";
  value: boolean;
}

export type ProfileStructureItem = EnumProfileStructureItem |
  MultiEnumProfileStructureItem |
  StringProfileStructureItem |
  TextProfileStructureItem |
  NumberProfileStructureItem |
  CheckboxProfileStructureItem;

export type Relation = {
  "origin": string,
  "starterTextReady": boolean,
  "enderTextReady": boolean,
  "essence": any[],
  // "Арагорн": "Зайка моя.",
  // "Арвен": "Мой лапушок.",
  "starter": string,
  "ender": string
}

export type Group = {
  name: string;
  masterDescription: string;
  characterDescription: string;
  doExport: boolean;
  filterModel: any[];
}

export type Profiles = Record<string, ProfileItem>;
export type ProfileItem = Record<string, string | number | boolean>;

export type Story = {
  name: string;
  story: string;
  events: StoryEvent[];
  characters: Record<string, StoryCharacter>;
}

export type StoryEvent = {
  name: string;
  text: string;
  time: string;
  characters: Record<string, Adaptation>;
}

export type Adaptation = {
  text: string;
  time: string;
  ready?: boolean;
}

export type StoryCharacter = {
  name: string;
  inventory: string;
  activity: {
    active?: boolean;
    passive?: boolean;
    follower?: boolean;
    defensive?: boolean;
  }
}

export type GameMeta = {
  saveTime: string;
  name: string;
  description: string;
  date: string;
  preGameDate: string;
}



export type CharacterStatInfo = {
  active: number,
  follower: number,
  defensive: number,
  passive: number,
  totalAdaptations: number,
  finishedAdaptations: number,
  totalStories: number,
  completeness: number,
}

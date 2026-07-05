import type { EventEmitter } from "events";

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
}

export type Database = {
  Meta: GameMeta,
  Stories: Record<string, Story>,
  Characters: Record<string, Character>,
  Players: Record<string, Player>,
  Relations: Relation[],
  ProfileBindings: Record<string, string>,
  Groups: Record<string, Group>,
  PlayerProfileStructure: ProfileStructureItem[],
  CharacterProfileStructure: ProfileStructureItem[],
  ManagementInfo: any,
}

export type ProfileStructureItem = {

}

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

export type Character = Record<string, string | number | boolean>;
export type Player = Character;

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

import type { EventEmitter } from "events";

export interface ILocalDBMS {
  ee: EventEmitter;
  database: {
    Meta: GameMeta,
    Stories: any,
    Characters: any,
    Relations: any,
    ProfileBindings: any,
    Groups: any,
    PlayerProfileStructure: any,
    CharacterProfileStructure: any,
    ManagementInfo: any,
  };
}

export type GameMeta = {
  saveTime: string;
  name: string;
  description: string;
  date: string;
  preGameDate: string;
}

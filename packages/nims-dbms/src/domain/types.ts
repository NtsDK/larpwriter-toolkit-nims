export type ProfileType = 'character' | 'player' | 'questionnaire';

export type ProfileFieldType = 'text' | 'string' | 'enum' | 'number' | 'checkbox' | 'multiEnum';

export type PlayerAccessType = 'write' | 'readonly' | 'hidden';

export type OriginProperty = 'name' | 'text' | 'time';

export type AdaptationProperty = 'text' | 'time' | 'ready';

export type CharacterActivityType = 'active' | 'follower' | 'defensive' | 'passive';

export type RelationEssence = 'starterToEnder' | 'allies' | 'enderToStarter';

export type OwnedEntityType = 'character' | 'player' | 'story' | 'group';

export interface GameMeta {
  name: string;
  description: string;
  date: string;
  preGameDate: string;
  saveTime: string;
}

export interface ProfileStructureItem {
  name: string;
  type: ProfileFieldType;
  value: string | number | boolean;
  playerAccess: PlayerAccessType;
  doExport: boolean;
  showInRoleGrid: boolean;
}

export type ProfileStructure = ProfileStructureItem[];

export type ProfileItem = Record<string, string | number | boolean>;

export type Profiles = Record<string, ProfileItem>;

export type ProfileBindings = Record<string, string>;

export interface Adaptation {
  text: string;
  time: string;
  ready?: boolean;
}

export interface StoryEvent {
  name: string;
  text: string;
  time: string;
  characters: Record<string, Adaptation>;
}

export interface StoryCharacter {
  name: string;
  inventory: string;
  activity: Partial<Record<CharacterActivityType, boolean>>;
}

export interface Story {
  name: string;
  story: string;
  events: StoryEvent[];
  characters: Record<string, StoryCharacter>;
}

export interface Relation {
  origin: string;
  starterTextReady: boolean;
  enderTextReady: boolean;
  essence: RelationEssence[];
  starter: string;
  ender: string;
  [characterName: string]: string | boolean | RelationEssence[];
}

export interface Group {
  name: string;
  masterDescription: string;
  characterDescription: string;
  doExport: boolean;
  filterModel: unknown[];
}

export interface PlayersOptions {
  allowPlayerCreation: boolean;
  allowCharacterCreation: boolean;
}

export interface ManagementInfo {
  UsersInfo?: Record<string, unknown>;
  PlayersInfo?: Record<string, unknown>;
  PlayersOptions?: PlayersOptions;
  WelcomeText?: string;
  admin?: string;
  editor?: string;
  adaptationRights?: string;
  [key: string]: unknown;
}

export interface GearNode {
  id: string | number;
  name: string;
  group?: string;
  notes?: string;
  label?: string;
  x?: number;
  y?: number;
  [key: string]: unknown;
}

export interface GearEdge {
  id: string | number;
  from: string | number;
  to: string | number;
  label?: string;
  [key: string]: unknown;
}

export interface GearsData {
  nodes: GearNode[];
  edges: GearEdge[];
  settings: {
    physicsEnabled: boolean;
    showNotes: boolean;
  };
}

export interface SliderItem {
  name: string;
  top: string;
  bottom: string;
  value: number;
}

export interface Database {
  Meta: GameMeta;
  Characters: Profiles;
  Players: Profiles;
  Stories: Record<string, Story>;
  Relations: Relation[];
  Groups: Record<string, Group>;
  CharacterProfileStructure: ProfileStructure;
  PlayerProfileStructure: ProfileStructure;
  /** Separate from player profile — player-facing questionnaire answers. */
  QuestionnaireStructure: ProfileStructure;
  Questionnaires: Profiles;
  ProfileBindings: ProfileBindings;
  Gears: GearsData;
  Sliders: SliderItem[];
  ManagementInfo?: ManagementInfo;
  Version?: string;
  Log?: unknown[];
  Settings?: unknown;
  InvestigationBoard?: unknown;
}

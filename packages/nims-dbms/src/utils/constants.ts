import type { ProfileFieldType, PlayerAccessType, CharacterActivityType, RelationEssence, OriginProperty, AdaptationProperty, OwnedEntityType } from '../domain/types';

export const PROFILE_FIELD_TYPES: readonly ProfileFieldType[] = ['text', 'string', 'enum', 'number', 'checkbox', 'multiEnum'];

export const PLAYER_ACCESS_TYPES: readonly PlayerAccessType[] = ['write', 'readonly', 'hidden'];

export const ORIGIN_PROPERTIES: readonly OriginProperty[] = ['name', 'text', 'time'];

export const ADAPTATION_PROPERTIES: readonly AdaptationProperty[] = ['text', 'time', 'ready'];

export const CHARACTER_ACTIVITY_TYPES: readonly CharacterActivityType[] = ['active', 'follower', 'defensive', 'passive'];

export const RELATION_ESSENCES: readonly RelationEssence[] = ['starterToEnder', 'allies', 'enderToStarter'];

export const RELATION_FIELDS = ['origin', 'starterTextReady', 'enderTextReady', 'essence', 'starter', 'ender'] as const;

export const PROFILE_TYPES = ['character', 'player'] as const;

export const OWNED_ENTITY_TYPES: readonly OwnedEntityType[] = ['character', 'player', 'story', 'group'];

export const META_INFO_STRINGS = ['name', 'description'] as const;

export const META_INFO_DATES = ['date', 'preGameDate'] as const;

export const PROFILE_FIELD_DEFAULTS: Record<ProfileFieldType, string | number | boolean> = {
  text: '',
  string: '',
  enum: '_',
  number: 0,
  checkbox: false,
  multiEnum: '',
};

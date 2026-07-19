/** Classic NIMS profile-filter engine (ported from projectUtils). */

export const CHAR_NAME = 'char-name';
export const CHAR_OWNER = 'char-owner';
export const CHAR_PREFIX = 'profile-';
export const PLAYER_NAME = 'player-name';
export const PLAYER_OWNER = 'player-owner';
export const PLAYER_PREFIX = 'player-profile-';
export const SUMMARY_PREFIX = 'summary-';

export const SUMMARY_STATS: Array<[string, string]> = [
  ['active', 'Актив'],
  ['follower', 'Спутник'],
  ['defensive', 'Защита'],
  ['passive', 'Пассив'],
  ['completeness', 'Завершённость адаптаций, %'],
  ['totalStories', 'Количество историй'],
];

export interface ProfileFilterItemMeta {
  name: string;
  type: string;
  displayName: string;
  value?: string;
}

export interface GroupedProfileFilterItems {
  name: string;
  profileFilterItems: ProfileFilterItemMeta[];
}

export interface FilterCondition {
  name: string;
  type: string;
  selectedOptions?: Record<string, boolean>;
  condition?: string;
  num?: number;
  regexString?: string;
}

export interface DataCell {
  value: unknown;
  type: string;
  itemName: string;
}

export interface ProfileFilterInfo {
  characters: {
    profileStructure: Array<{ name: string; type: string; value?: string }>;
    owners: Record<string, string>;
    profiles: Record<string, Record<string, unknown>>;
  };
  players: {
    profileStructure: Array<{ name: string; type: string; value?: string }>;
    owners: Record<string, string>;
    profiles: Record<string, Record<string, unknown>>;
  };
  charactersSummary: Record<string, Record<string, number>>;
  bindingData: Array<[string, string]>;
  groupedProfileFilterItems: GroupedProfileFilterItems[];
}

export function makeGroupedProfileFilterInfo(opts: Omit<ProfileFilterInfo, 'groupedProfileFilterItems'>): ProfileFilterInfo {
  const characterItems: ProfileFilterItemMeta[] = [
    { name: CHAR_NAME, type: 'string', displayName: 'Персонаж' },
    { name: CHAR_OWNER, type: 'string', displayName: 'Владелец персонажа' },
    ...opts.characters.profileStructure.map((el) => ({
      name: CHAR_PREFIX + el.name,
      type: el.type,
      displayName: el.name,
      value: el.value,
    })),
  ];

  const playerItems: ProfileFilterItemMeta[] = [
    { name: PLAYER_NAME, type: 'string', displayName: 'Игрок' },
    { name: PLAYER_OWNER, type: 'string', displayName: 'Владелец игрока' },
    ...opts.players.profileStructure.map((el) => ({
      name: PLAYER_PREFIX + el.name,
      type: el.type,
      displayName: el.name,
      value: el.value,
    })),
  ];

  const summaryItems: ProfileFilterItemMeta[] = SUMMARY_STATS.map(([key, label]) => ({
    name: SUMMARY_PREFIX + key,
    type: 'number',
    displayName: label,
  }));

  return {
    ...opts,
    groupedProfileFilterItems: [
      { name: 'characterFilterItems', profileFilterItems: characterItems },
      { name: 'playerFilterItems', profileFilterItems: playerItems },
      { name: 'summaryFilterItems', profileFilterItems: summaryItems },
    ],
  };
}

function getValue(info: ProfileFilterInfo, profileId: [string, string], profileItemName: string): unknown {
  const [characterName, playerName] = profileId;

  if (
    profileItemName === CHAR_NAME
    || profileItemName === CHAR_OWNER
    || profileItemName.startsWith(SUMMARY_PREFIX)
    || profileItemName.startsWith(CHAR_PREFIX)
  ) {
    if (!characterName) return undefined;
    if (profileItemName === CHAR_NAME) return characterName;
    if (profileItemName === CHAR_OWNER) return info.characters.owners[characterName] || '';
    if (profileItemName.startsWith(SUMMARY_PREFIX)) {
      return info.charactersSummary[characterName]?.[profileItemName.slice(SUMMARY_PREFIX.length)];
    }
    return info.characters.profiles[characterName]?.[profileItemName.slice(CHAR_PREFIX.length)];
  }

  if (
    profileItemName === PLAYER_NAME
    || profileItemName === PLAYER_OWNER
    || profileItemName.startsWith(PLAYER_PREFIX)
  ) {
    if (!playerName) return undefined;
    if (profileItemName === PLAYER_NAME) return playerName;
    if (profileItemName === PLAYER_OWNER) return info.players.owners[playerName] || '';
    return info.players.profiles[playerName]?.[profileItemName.slice(PLAYER_PREFIX.length)];
  }

  throw new Error(`Unexpected profileItemName: ${profileItemName}`);
}

export function getDataArray(info: ProfileFilterInfo, profileId: [string, string]): DataCell[] {
  const items = info.groupedProfileFilterItems.flatMap((g) => g.profileFilterItems);
  return items.map((meta) => ({
    value: getValue(info, profileId, meta.name),
    type: meta.type,
    itemName: meta.name,
  }));
}

export function acceptDataRow(model: FilterCondition[], dataString: DataCell[]): boolean {
  const dataMap = new Map(dataString.map((cell) => [cell.itemName, cell]));
  return model.every((filterItem) => {
    const cell = dataMap.get(filterItem.name);
    if (!cell || cell.value === undefined) return false;
    const value = cell.value;

    switch (filterItem.type) {
      case 'enum': {
        const key = String(value);
        return !!(filterItem.selectedOptions && filterItem.selectedOptions[key]);
      }
      case 'checkbox': {
        const key = (value === true || value === 'true' || value === 'Да' || value === 'yes')
          ? 'true'
          : 'false';
        return !!(filterItem.selectedOptions && filterItem.selectedOptions[key]);
      }
      case 'multiEnum': {
        const values = value === '' || value == null ? [] : String(value).split(',');
        const selected = Object.keys(filterItem.selectedOptions || {});
        switch (filterItem.condition) {
          case 'every':
            return selected.length > 0 && selected.every((s) => values.includes(s));
          case 'some':
            return values.some((v) => selected.includes(v));
          case 'equal':
            return selected.length === values.length && selected.every((s) => values.includes(s));
          default:
            return true;
        }
      }
      case 'number': {
        const num = Number(value);
        switch (filterItem.condition) {
          case 'greater': return num > Number(filterItem.num);
          case 'equal': return num === Number(filterItem.num);
          case 'lesser': return num < Number(filterItem.num);
          default: return true;
        }
      }
      case 'text':
      case 'string':
        return String(value).toLowerCase().includes(String(filterItem.regexString || '').toLowerCase());
      default:
        return true;
    }
  });
}

export function getDataArrays(info: ProfileFilterInfo, filterModel: FilterCondition[]): DataCell[][] {
  return info.bindingData
    .map((pair) => getDataArray(info, pair as [string, string]))
    .filter((row) => acceptDataRow(filterModel, row));
}

export function applyFilterModel(info: ProfileFilterInfo, filterModel: FilterCondition[]): Array<{
  profileId: [string, string];
  cells: Record<string, unknown>;
}> {
  return info.bindingData
    .map((pair) => {
      const profileId = pair as [string, string];
      const data = getDataArray(info, profileId);
      return { profileId, data };
    })
    .filter(({ data }) => acceptDataRow(filterModel, data))
    .map(({ profileId, data }) => ({
      profileId,
      cells: Object.fromEntries(data.map((c) => [c.itemName, c.value])),
    }));
}

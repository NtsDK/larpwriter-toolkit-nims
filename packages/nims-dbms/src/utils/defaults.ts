import type { Database, SliderItem } from '../domain/types';

/** Classic emptyBase default mixing desk. */
export const DEFAULT_SLIDERS: SliderItem[] = [
  { name: 'Тип коммуникации', top: 'Вербальный', bottom: 'Невербальный', value: 0 },
  { name: 'Открытость', top: 'Прозрачность', bottom: 'Тайна', value: 0 },
  { name: 'Сценография', top: 'Полная реалистичность (360 градусов)', bottom: 'Символизм', value: 0 },
  { name: 'Ответственность за создание персонажа', top: 'Игрок', bottom: 'Мастер', value: 0 },
  { name: 'Ответственность за создание культуры', top: 'Игрок', bottom: 'Мастер', value: 0 },
  { name: 'Мотивация игроков', top: 'Соревнование', bottom: 'Сотрудничество', value: 0 },
  { name: 'Персонаж как маска (bleed-in)', top: 'Дистанцирование', bottom: 'Игра в себя', value: 0 },
  { name: 'Давление на игрока', top: 'Реальное', bottom: 'Изображаемое', value: 0 },
  { name: 'Соответствие сеттингу', top: 'Играбельность', bottom: 'Точность', value: 0 },
  { name: 'Игровая механика', top: 'Явная', bottom: 'Скрытая', value: 0 },
  { name: 'Представление темы', top: 'Симуляция', bottom: 'Абстракция', value: 0 },
  { name: 'Стиль управления игрой', top: 'Активный', bottom: 'Пассивный', value: 0 },
  { name: 'Ваш бегунок?', top: 'Максимум', bottom: 'Минимум', value: 0 },
];

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
  if (!database.QuestionnaireStructure) database.QuestionnaireStructure = [];
  if (!database.Questionnaires) database.Questionnaires = {};
  if (!database.ProfileBindings) database.ProfileBindings = {};
  if (!database.Gears) {
    database.Gears = {
      nodes: [],
      edges: [],
      settings: { physicsEnabled: false, showNotes: false },
    };
  } else {
    if (!Array.isArray(database.Gears.nodes)) database.Gears.nodes = [];
    if (!Array.isArray(database.Gears.edges)) database.Gears.edges = [];
    if (!database.Gears.settings) {
      database.Gears.settings = { physicsEnabled: false, showNotes: false };
    }
  }
  if (!Array.isArray(database.Sliders)) {
    database.Sliders = structuredClone(DEFAULT_SLIDERS);
  }
  if (!database.ManagementInfo) {
    database.ManagementInfo = { UsersInfo: {}, PlayersInfo: {} };
  }
  const mgmt = database.ManagementInfo;
  if (!mgmt.PlayersOptions) {
    mgmt.PlayersOptions = {
      allowPlayerCreation: true,
      allowCharacterCreation: false,
    };
  } else {
    if (typeof mgmt.PlayersOptions.allowPlayerCreation !== 'boolean') {
      mgmt.PlayersOptions.allowPlayerCreation = true;
    }
    if (typeof mgmt.PlayersOptions.allowCharacterCreation !== 'boolean') {
      mgmt.PlayersOptions.allowCharacterCreation = false;
    }
  }
  if (typeof mgmt.WelcomeText !== 'string') {
    mgmt.WelcomeText = '';
  }
  return database;
}

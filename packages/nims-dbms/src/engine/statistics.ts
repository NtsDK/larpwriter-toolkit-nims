import type { DatabaseEngine } from './DatabaseEngine';
import type { Database, ProfileStructureItem, Story } from '../domain/types';

export type HistBar = { value: number; tip: string } | null;

export class StatisticsEngine {
  constructor(private engine: DatabaseEngine) {}

  async getStatistics(): Promise<Record<string, unknown>> {
    const db = this.engine.database;
    const statistics: Record<string, unknown> = {};

    statistics.storyNumber = Object.keys(db.Stories).length;
    statistics.characterNumber = Object.keys(db.Characters).length;
    statistics.groupNumber = Object.keys(db.Groups).length;
    statistics.playerNumber = Object.keys(db.Players).length;
    statistics.eventsNumber = Object.values(db.Stories)
      .reduce((sum, story) => sum + story.events.length, 0);

    statistics.userNumber = 1;
    if (db.ManagementInfo?.UsersInfo) {
      statistics.userNumber = Object.keys(db.ManagementInfo.UsersInfo).length;
    }

    const textCharactersCount = this.countTextCharacters(db);
    statistics.textCharactersCount = textCharactersCount;
    statistics.textCharacterNumber = Object.values(textCharactersCount).reduce((a, b) => a + b, 0);
    statistics.bindingStats = this.countBindingStats(db);

    const [firstEvent, lastEvent] = this.getFirstLastEventTime(db);
    statistics.firstEvent = firstEvent;
    statistics.lastEvent = lastEvent;

    const general = this.getGeneralCompletenessTuple(db);
    statistics.generalCompleteness = general;
    statistics.totalAdaptations = general[2];
    statistics.readyAdaptations = general[1];
    statistics.storyCompleteness = this.getStoryCompletenessTuple(db);
    statistics.relationCompleteness = this.getRelationCompletenessTuple(db);

    statistics.storyEventsHist = this.getHistogram(db, (s) => s.events.length);
    statistics.storyCharactersHist = this.getHistogram(db, (s) => Object.keys(s.characters).length);
    statistics.eventCompletenessHist = this.getEventCompletenessHist(db);
    statistics.characterStoriesHist = this.getCharacterHist(db, this.countCharactersInStories);
    statistics.characterSymbolsHist = this.getCharacterHist(db, this.countCharacterSymbols);

    statistics.characterChart = this.getChartData(db, 'characters', 'Characters');
    statistics.storyChart = this.getChartData(db, 'stories', 'Stories');
    statistics.groupChart = this.getChartData(db, 'groups', 'Groups');
    statistics.playerChart = this.getChartData(db, 'players', 'Players');
    statistics.bindingChart = this.getBindingChart(db);
    statistics.symbolChart = this.getSymbolChart(textCharactersCount);

    statistics.profileCharts = this.getProfileChartData(db);
    statistics.characterStoryCounts = this.getCharacterStoryCounts(db);

    return statistics;
  }

  private noWs(str: string): number {
    return String(str || '').replace(/\s/g, '').length;
  }

  private countTextCharacters(db: Database): Record<string, number> {
    const counts = {
      writerStories: 0,
      eventOrigins: 0,
      eventAdaptations: 0,
      groups: 0,
      relations: 0,
    };
    for (const story of Object.values(db.Stories)) {
      counts.writerStories += this.noWs(story.story);
      for (const event of story.events) {
        counts.eventOrigins += this.noWs(event.text);
        for (const adaptation of Object.values(event.characters)) {
          counts.eventAdaptations += this.noWs(adaptation.text);
        }
      }
    }
    counts.groups = Object.values(db.Groups)
      .reduce((s, g) => s + this.noWs(g.characterDescription), 0);
    for (const rel of db.Relations) {
      counts.relations += this.noWs(String(rel.origin || ''));
      counts.relations += this.noWs(String(rel[rel.starter] || ''));
      counts.relations += this.noWs(String(rel[rel.ender] || ''));
    }
    return counts;
  }

  private countBindingStats(db: Database) {
    const charNum = Object.keys(db.Characters).length;
    const playerNum = Object.keys(db.Players).length;
    const bindingNum = Object.keys(db.ProfileBindings).length;
    return {
      freeCharacters: Math.max(0, charNum - bindingNum),
      freePlayers: Math.max(0, playerNum - bindingNum),
      bindingNum,
      bound: bindingNum,
      total: charNum,
    };
  }

  private getFirstLastEventTime(db: Database): [string, string] {
    const times: string[] = [];
    for (const story of Object.values(db.Stories)) {
      for (const event of story.events) {
        if (event.time) times.push(event.time);
      }
    }
    if (!times.length) return ['', ''];
    times.sort();
    return [times[0], times[times.length - 1]];
  }

  private calcPercent(part: number, all: number): string {
    return ((part / (all === 0 ? 1 : all)) * 100).toFixed(1);
  }

  private storyAdaptationStats(story: Story) {
    let finishedAdaptations = 0;
    let allAdaptations = 0;
    for (const event of story.events) {
      allAdaptations += Object.keys(event.characters).length;
      finishedAdaptations += Object.values(event.characters).filter((a) => a.ready).length;
    }
    return { finishedAdaptations, allAdaptations };
  }

  private getStoryCompletenessTuple(db: Database): [string, number, number] {
    const allStories = Object.keys(db.Stories).length;
    const finishedStories = Object.values(db.Stories)
      .map((s) => this.storyAdaptationStats(s))
      .filter((s) => s.allAdaptations !== 0 && s.allAdaptations === s.finishedAdaptations)
      .length;
    return [this.calcPercent(finishedStories, allStories), finishedStories, allStories];
  }

  private getGeneralCompletenessTuple(db: Database): [string, number, number] {
    let finished = 0;
    let all = 0;
    for (const story of Object.values(db.Stories)) {
      const s = this.storyAdaptationStats(story);
      finished += s.finishedAdaptations;
      all += s.allAdaptations;
    }
    return [this.calcPercent(finished, all), finished, all];
  }

  private getRelationCompletenessTuple(db: Database): [string, number, number] {
    const all = db.Relations.length * 2;
    let finished = 0;
    for (const rel of db.Relations) {
      if (rel.starterTextReady) finished++;
      if (rel.enderTextReady) finished++;
    }
    return [this.calcPercent(finished, all), finished, all];
  }

  private makeNumberStep(array: number[]): number {
    if (!array.length) return 1;
    const max = Math.max(...array);
    const min = Math.min(...array);
    let step = Math.ceil((max - min) / 20);
    step = step === 0 ? 1 : step;
    let base = 1;
    while (step > base * 10) base *= 10;
    const arr = [1, 2, 5, 10, 12];
    for (let i = 0; i < arr.length - 1; i++) {
      if (base * arr[i] < step && step < base * arr[i + 1]) {
        step = base * arr[i];
        break;
      }
    }
    return step;
  }

  private addToHist(
    hist: Array<{ value: number; tip: string[] } | undefined>,
    delta: number,
    key: number,
    tipItem: string,
  ) {
    if (!hist[key]) hist[key] = { value: 0, tip: [] };
    hist[key]!.value += delta;
    hist[key]!.tip.push(tipItem);
  }

  private getHistogram(db: Database, keyFn: (story: Story) => number): HistBar[] {
    const raw: Array<{ value: number; tip: string[] } | undefined> = [];
    for (const story of Object.values(db.Stories)) {
      this.addToHist(raw, 1, keyFn(story), story.name);
    }
    const hist: HistBar[] = [];
    for (let i = 0; i < raw.length; i++) {
      hist[i] = raw[i]
        ? { value: raw[i]!.value, tip: `${i}: ${raw[i]!.tip.join(', ')}` }
        : null;
    }
    return hist;
  }

  private getEventCompletenessHist(db: Database): HistBar[] {
    const raw: Array<{ value: number; tip: string[] } | undefined> = [];
    for (const story of Object.values(db.Stories)) {
      const stats = this.storyAdaptationStats(story);
      const completeness = stats.allAdaptations !== 0
        ? stats.finishedAdaptations / stats.allAdaptations
        : 0;
      const key = Math.floor(10 * completeness);
      const label = `${story.name} (${(100 * completeness).toFixed(0)}%)`;
      this.addToHist(raw, 1, key, label);
    }
    const hist: HistBar[] = [];
    for (let i = 0; i < 11; i++) {
      hist[i] = raw[i]
        ? { value: raw[i]!.value, tip: raw[i]!.tip.join(', ') }
        : null;
    }
    return hist;
  }

  private countCharactersInStories = (db: Database, stats: Record<string, number>) => {
    for (const story of Object.values(db.Stories)) {
      for (const name of Object.keys(story.characters)) {
        if (stats[name] !== undefined) stats[name] += 1;
      }
    }
  };

  private countCharacterSymbols = (db: Database, stats: Record<string, number>) => {
    for (const story of Object.values(db.Stories)) {
      for (const event of story.events) {
        for (const [name, adaptation] of Object.entries(event.characters)) {
          if (stats[name] !== undefined) stats[name] += this.noWs(adaptation.text);
        }
      }
    }
    for (const rel of db.Relations) {
      for (const name of [rel.starter, rel.ender]) {
        if (stats[name] !== undefined) stats[name] += this.noWs(String(rel[name] || ''));
      }
    }
  };

  private getCharacterHist(
    db: Database,
    collector: (db: Database, stats: Record<string, number>) => void,
  ): HistBar[] {
    const names = Object.keys(db.Characters);
    const stats = Object.fromEntries(names.map((n) => [n, 0]));
    collector(db, stats);
    const values = Object.values(stats);
    const step = this.makeNumberStep(values);
    const raw: Array<{ value: number; tip: string[] } | undefined> = [];
    for (const [name, value] of Object.entries(stats)) {
      const key = Math.floor(value / step);
      this.addToHist(raw, 1, key, `${name} (${value})`);
    }
    const len = Math.max(raw.length, 10);
    const hist: HistBar[] = [];
    for (let i = 0; i < len; i++) {
      hist[i] = raw[i]
        ? {
          value: raw[i]!.value,
          tip: `${i * step}-${((i + 1) * step) - 1}: ${raw[i]!.tip.join(', ')}`,
        }
        : null;
    }
    return hist;
  }

  private getChartData(
    db: Database,
    objectKey: 'characters' | 'stories' | 'groups' | 'players',
    totalKey: 'Characters' | 'Stories' | 'Groups' | 'Players',
  ): Array<{ label: string; value: number }> {
    const total = Object.keys(db[totalKey]).length;
    const result: Array<{ label: string; value: number }> = [];
    let sum = 0;
    const users = db.ManagementInfo?.UsersInfo;
    if (users) {
      for (const [key, userInfo] of Object.entries(users)) {
        const list = (userInfo as { characters?: string[]; stories?: string[]; groups?: string[]; players?: string[] })[objectKey];
        const value = Array.isArray(list) ? list.length : 0;
        if (value > 0) {
          result.push({
            label: `${key}: ${((value / (total || 1)) * 100).toFixed(0)}% (${value}/${total})`,
            value,
          });
          sum += value;
        }
      }
    }
    const rest = Math.max(0, total - sum);
    if (rest > 0 || result.length === 0) {
      result.push({
        label: `—: ${((rest / (total || 1)) * 100).toFixed(0)}% (${rest}/${total})`,
        value: rest,
      });
    }
    return result;
  }

  private getBindingChart(db: Database): Array<{ label: string; value: number }> {
    const b = this.countBindingStats(db);
    return [
      { label: `Связки: ${b.bindingNum}`, value: b.bindingNum },
      { label: `Свободные персонажи: ${b.freeCharacters}`, value: b.freeCharacters },
      { label: `Свободные игроки: ${b.freePlayers}`, value: b.freePlayers },
    ];
  }

  private getSymbolChart(counts: Record<string, number>): Array<{ label: string; value: number }> {
    return [
      { label: `Мастерские тексты: ${counts.writerStories}`, value: counts.writerStories },
      { label: `События: ${counts.eventOrigins}`, value: counts.eventOrigins },
      { label: `Адаптации: ${counts.eventAdaptations}`, value: counts.eventAdaptations },
      { label: `Группы: ${counts.groups || 0}`, value: counts.groups || 0 },
      { label: `Отношения: ${counts.relations || 0}`, value: counts.relations || 0 },
    ];
  }

  private getProfileChartData(db: Database) {
    const post = (prefix: string, el: { name: string; type: string; data: unknown }) => ({
      ...el,
      id: prefix + el.name,
    });
    return {
      characterCharts: this.getProfileChartArray(db, 'Characters', 'CharacterProfileStructure')
        .map((el) => post('character-', el)),
      playerCharts: this.getProfileChartArray(db, 'Players', 'PlayerProfileStructure')
        .map((el) => post('player-', el)),
    };
  }

  private getProfileChartArray(
    db: Database,
    profileType: 'Characters' | 'Players',
    structureType: 'CharacterProfileStructure' | 'PlayerProfileStructure',
  ) {
    const structure = db[structureType] as ProfileStructureItem[];
    const profiles = Object.values(db[profileType]);
    const items = structure
      .filter((s) => s.type === 'enum' || s.type === 'number' || s.type === 'checkbox')
      .map((s) => ({ name: s.name, type: s.type }));

    return items.map((profileItem) => {
      if (profileItem.type === 'enum' || profileItem.type === 'checkbox') {
        const groups: Record<string, number> = {};
        for (const p of profiles) {
          const key = String(p[profileItem.name] ?? '');
          groups[key] = (groups[key] || 0) + 1;
        }
        return { ...profileItem, data: groups };
      }
      const array = profiles.map((p) => Number(p[profileItem.name]) || 0);
      const step = this.makeNumberStep(array.length ? array : [0]);
      const groups: Record<string, number> = {};
      for (const n of array) {
        const key = String(Math.floor(n / step));
        groups[key] = (groups[key] || 0) + 1;
      }
      return { ...profileItem, data: { groups, step } };
    });
  }

  private getCharacterStoryCounts(db: Database) {
    const map = new Map<string, { stories: Set<string>; events: number }>();
    for (const [storyName, story] of Object.entries(db.Stories)) {
      for (const event of story.events) {
        for (const charName of Object.keys(event.characters)) {
          if (!map.has(charName)) map.set(charName, { stories: new Set(), events: 0 });
          const entry = map.get(charName)!;
          entry.stories.add(storyName);
          entry.events++;
        }
      }
    }
    return Array.from(map.entries())
      .map(([name, { stories, events }]) => ({ name, storyCount: stories.size, eventCount: events }))
      .sort((a, b) => b.eventCount - a.eventCount);
  }
}

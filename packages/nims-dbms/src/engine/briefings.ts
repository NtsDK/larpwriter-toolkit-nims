import type { DatabaseEngine } from './DatabaseEngine';
import { ensureEntityExists } from '../utils/precondition';

export interface BriefingCharData {
  charName: string;
  playerName: string;
  inventory: string;
  profileInfoArray: Array<{ itemName: string; value: string | number | boolean; notEmpty: boolean }>;
  groupTexts: Array<{ groupName: string; text: string }>;
  relations: Array<{ toCharacter: string; text: string; stories: string }>;
  storiesInfo: Array<{ storyName: string; eventsInfo: Array<{ eventName: string; time: string; displayTime: string; text: string }> }>;
}

export interface CharacterStoryReport {
  storyName: string;
  inventory: string;
  activity: Partial<Record<'active' | 'follower' | 'defensive' | 'passive', boolean>>;
  meets: string[];
  totalAdaptations: number;
  finishedAdaptations: number;
  /** Alias for UI that used eventsCount/finished */
  eventsCount: number;
  finished: number;
}

export interface CharacterReport {
  name: string;
  storiesCount: number;
  eventsCount: number;
  totalAdaptations: number;
  finishedAdaptations: number;
  completeness: number;
  stories: CharacterStoryReport[];
}

export class BriefingsEngine {
  constructor(private engine: DatabaseEngine) {}

  async getBriefingData({ selCharacters, selStories, exportOnlyFinishedStories }: {
    selCharacters?: string[] | null; selStories?: string[] | null; exportOnlyFinishedStories: boolean;
  }): Promise<{ briefings: BriefingCharData[]; gameName: string }> {
    const db = this.engine.database;
    const characters = selCharacters || Object.keys(db.Characters);
    const stories = selStories || Object.keys(db.Stories);

    const result: BriefingCharData[] = [];

    for (const charName of characters.sort((a, b) => a.localeCompare(b))) {
      const profile = db.Characters[charName];
      if (!profile) continue;

      const playerName = db.ProfileBindings[charName] || '';
      const structure = db.CharacterProfileStructure;

      const profileInfoArray = structure
        .filter(item => item.doExport)
        .map(item => ({
          itemName: item.name,
          value: profile[item.name] ?? item.value,
          notEmpty: profile[item.name] !== '' && profile[item.name] !== item.value,
        }));

      const inventory = this.getCharacterInventory(charName, stories);
      const groupTexts = this.getGroupTexts(charName);
      const relations = this.getRelations(charName);
      const storiesInfo = this.getStoriesInfo(charName, stories, exportOnlyFinishedStories);

      result.push({
        charName,
        playerName,
        inventory,
        profileInfoArray,
        groupTexts,
        relations,
        storiesInfo,
      });
    }

    return { briefings: result, gameName: db.Meta.name || '' };
  }

  async getCharacterReport({ characterName }: { characterName: string }): Promise<CharacterReport> {
    const db = this.engine.database;
    ensureEntityExists(characterName, Object.keys(db.Characters));

    const storiesList: CharacterStoryReport[] = [];
    let totalAdaptations = 0;
    let finishedAdaptations = 0;

    for (const storyName of Object.keys(db.Stories).sort((a, b) => a.localeCompare(b))) {
      const story = db.Stories[storyName];
      const storyChar = story.characters[characterName];
      if (!storyChar) continue;

      const charEvents = story.events.filter((event) => event.characters[characterName] !== undefined);
      const storyFinished = charEvents.filter((event) => event.characters[characterName].ready === true).length;
      const storyTotal = charEvents.length;

      const meetsSet = new Set<string>();
      for (const event of charEvents) {
        for (const other of Object.keys(event.characters)) {
          if (other !== characterName) meetsSet.add(other);
        }
      }

      totalAdaptations += storyTotal;
      finishedAdaptations += storyFinished;

      storiesList.push({
        storyName,
        inventory: storyChar.inventory || '',
        activity: { ...(storyChar.activity || {}) },
        meets: Array.from(meetsSet).sort((a, b) => a.localeCompare(b)),
        totalAdaptations: storyTotal,
        finishedAdaptations: storyFinished,
        eventsCount: storyTotal,
        finished: storyFinished,
      });
    }

    return {
      name: characterName,
      storiesCount: storiesList.length,
      eventsCount: totalAdaptations,
      totalAdaptations,
      finishedAdaptations,
      completeness: totalAdaptations > 0 ? finishedAdaptations / totalAdaptations : 0,
      stories: storiesList,
    };
  }

  private getCharacterInventory(charName: string, storyNames: string[]): string {
    const db = this.engine.database;
    const items: string[] = [];
    for (const storyName of storyNames) {
      const story = db.Stories[storyName];
      if (story?.characters[charName]?.inventory) {
        items.push(story.characters[charName].inventory);
      }
    }
    return items.join(', ');
  }

  /** Only groups where the character is a member, export is on, and there is text for the character. */
  private getGroupTexts(charName: string): Array<{ groupName: string; text: string }> {
    const db = this.engine.database;
    const result: Array<{ groupName: string; text: string }> = [];
    for (const [groupName, group] of Object.entries(db.Groups)) {
      if (group.doExport === false) continue;
      const members: string[] = (group as { members?: string[] }).members || [];
      if (!members.includes(charName)) continue;
      const text = (group.characterDescription || '').trim();
      if (!text) continue;
      result.push({ groupName, text });
    }
    return result.sort((a, b) => a.groupName.localeCompare(b.groupName));
  }

  private getRelations(charName: string): Array<{ toCharacter: string; text: string; stories: string }> {
    const db = this.engine.database;
    const result: Array<{ toCharacter: string; text: string; stories: string }> = [];

    for (const rel of db.Relations) {
      if (rel[charName] === undefined) continue;
      const otherChar = rel.starter === charName ? rel.ender : rel.starter;
      const text = String(rel[charName] || '').trim();
      if (!text) continue;

      const commonStories: string[] = [];
      for (const [storyName, story] of Object.entries(db.Stories)) {
        if (story.characters[charName] && story.characters[otherChar]) {
          commonStories.push(storyName);
        }
      }

      result.push({ toCharacter: otherChar, text, stories: commonStories.join(', ') });
    }
    return result.sort((a, b) => a.toCharacter.localeCompare(b.toCharacter));
  }

  private getStoriesInfo(charName: string, storyNames: string[], exportOnlyFinished: boolean): Array<{ storyName: string; eventsInfo: Array<{ eventName: string; time: string; displayTime: string; text: string }> }> {
    const db = this.engine.database;
    const result: Array<{ storyName: string; eventsInfo: Array<{ eventName: string; time: string; displayTime: string; text: string }> }> = [];
    const defaultTime = db.Meta?.date || '';

    for (const storyName of storyNames.sort((a, b) => a.localeCompare(b))) {
      const story = db.Stories[storyName];
      if (!story || !story.characters[charName]) continue;

      if (exportOnlyFinished) {
        const isFinished = story.events.length > 0 && story.events.every(e =>
          Object.keys(e.characters).length > 0 && Object.values(e.characters).every(a => a.ready)
        );
        if (!isFinished) continue;
      }

      const eventsInfo: Array<{ eventName: string; time: string; displayTime: string; text: string }> = [];
      for (const event of story.events) {
        const adapt = event.characters[charName];
        if (!adapt) continue;
        const time = event.time || defaultTime;
        const displayTime = adapt.time || time;
        // Like classic NIMS: adaptation text, else master event text
        const text = (adapt.text && adapt.text.trim()) ? adapt.text : (event.text || '');
        eventsInfo.push({
          eventName: event.name,
          time,
          displayTime,
          text,
        });
      }

      if (eventsInfo.length > 0) {
        result.push({ storyName, eventsInfo });
      }
    }
    return result;
  }
}

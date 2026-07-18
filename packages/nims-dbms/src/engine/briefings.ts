import type { DatabaseEngine } from './DatabaseEngine';

export interface BriefingCharData {
  charName: string;
  playerName: string;
  inventory: string;
  profileInfoArray: Array<{ itemName: string; value: string | number | boolean; notEmpty: boolean }>;
  groupTexts: Array<{ groupName: string; text: string }>;
  relations: Array<{ toCharacter: string; text: string; stories: string }>;
  storiesInfo: Array<{ storyName: string; eventsInfo: Array<{ eventName: string; time: string; displayTime: string; text: string }> }>;
}

export interface CharacterReport {
  name: string;
  storiesCount: number;
  eventsCount: number;
  totalAdaptations: number;
  finishedAdaptations: number;
  completeness: number;
  stories: Array<{ storyName: string; eventsCount: number; finished: number }>;
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
    const storiesList: Array<{ storyName: string; eventsCount: number; finished: number }> = [];
    let totalAdaptations = 0;
    let finishedAdaptations = 0;

    for (const [storyName, story] of Object.entries(db.Stories)) {
      if (!story.characters[characterName]) continue;

      let storyEvents = 0;
      let storyFinished = 0;

      for (const event of story.events) {
        if (event.characters[characterName]) {
          storyEvents++;
          totalAdaptations++;
          if (event.characters[characterName].ready) {
            storyFinished++;
            finishedAdaptations++;
          }
        }
      }

      storiesList.push({ storyName, eventsCount: storyEvents, finished: storyFinished });
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

  private getGroupTexts(charName: string): Array<{ groupName: string; text: string }> {
    const db = this.engine.database;
    const result: Array<{ groupName: string; text: string }> = [];
    for (const [groupName, group] of Object.entries(db.Groups)) {
      if (group.characterDescription) {
        result.push({ groupName, text: group.characterDescription });
      }
    }
    return result;
  }

  private getRelations(charName: string): Array<{ toCharacter: string; text: string; stories: string }> {
    const db = this.engine.database;
    const result: Array<{ toCharacter: string; text: string; stories: string }> = [];

    for (const rel of db.Relations) {
      if (rel[charName] === undefined) continue;
      const otherChar = rel.starter === charName ? rel.ender : rel.starter;
      const text = (rel[charName] as string) || '';

      const commonStories: string[] = [];
      for (const [storyName, story] of Object.entries(db.Stories)) {
        if (story.characters[charName] && story.characters[otherChar]) {
          commonStories.push(storyName);
        }
      }

      result.push({ toCharacter: otherChar, text, stories: commonStories.join(', ') });
    }
    return result;
  }

  private getStoriesInfo(charName: string, storyNames: string[], exportOnlyFinished: boolean): Array<{ storyName: string; eventsInfo: Array<{ eventName: string; time: string; displayTime: string; text: string }> }> {
    const db = this.engine.database;
    const result: Array<{ storyName: string; eventsInfo: Array<{ eventName: string; time: string; displayTime: string; text: string }> }> = [];

    for (const storyName of storyNames) {
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
        if (event.characters[charName]) {
          eventsInfo.push({
            eventName: event.name,
            time: event.time,
            displayTime: event.characters[charName].time || event.time,
            text: event.characters[charName].text,
          });
        }
      }

      if (eventsInfo.length > 0) {
        result.push({ storyName, eventsInfo });
      }
    }
    return result;
  }
}

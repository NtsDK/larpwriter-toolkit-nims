import type { DatabaseEngine } from './DatabaseEngine';
import type { StoryCharacter, CharacterActivityType } from '../domain/types';
import { ensureString, ensureNumber, ensureBoolean, ensureEnum, ensureInRange, ensureEntityExists, ensureEntityNotExists } from '../utils/precondition';
import { CHARACTER_ACTIVITY_TYPES } from '../utils/constants';

function charOrdA(a: string, b: string): number {
  return a.localeCompare(b);
}

export class CharactersEngine {
  constructor(private engine: DatabaseEngine) {
    this.engine.ee.on('renameProfile', (...args: any[]) => this.onRenameProfile(args[0]));
    this.engine.ee.on('removeProfile', (...args: any[]) => this.onRemoveProfile(args[0]));
  }

  private getStoryOrThrow(storyName: string) {
    ensureString(storyName, 'storyName');
    ensureEntityExists(storyName, Object.keys(this.engine.database.Stories));
    return this.engine.database.Stories[storyName];
  }

  async getStoryCharacterNamesArray({ storyName }: { storyName: string }): Promise<string[]> {
    const story = this.getStoryOrThrow(storyName);
    return Object.keys(story.characters).sort(charOrdA);
  }

  async getStoryCharacters({ storyName }: { storyName: string }): Promise<Record<string, StoryCharacter>> {
    const story = this.getStoryOrThrow(storyName);
    return structuredClone(story.characters);
  }

  async addStoryCharacter({ storyName, characterName }: { storyName: string; characterName: string }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureString(characterName, 'characterName');
    ensureEntityExists(characterName, Object.keys(this.engine.database.Characters));
    ensureEntityNotExists(characterName, Object.keys(story.characters));

    story.characters[characterName] = {
      name: characterName,
      inventory: '',
      activity: {},
    };
  }

  async switchStoryCharacters({ storyName, fromName, toName }: { storyName: string; fromName: string; toName: string }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureString(fromName, 'fromName');
    ensureString(toName, 'toName');
    ensureEntityExists(fromName, Object.keys(story.characters));
    ensureEntityExists(toName, Object.keys(this.engine.database.Characters));
    ensureEntityNotExists(toName, Object.keys(story.characters));

    story.characters[toName] = story.characters[fromName];
    story.characters[toName].name = toName;
    delete story.characters[fromName];

    for (const event of story.events) {
      if (event.characters[fromName]) {
        event.characters[toName] = event.characters[fromName];
        delete event.characters[fromName];
      }
    }
  }

  async removeStoryCharacter({ storyName, characterName }: { storyName: string; characterName: string }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureString(characterName, 'characterName');
    ensureEntityExists(characterName, Object.keys(story.characters));

    delete story.characters[characterName];
    for (const event of story.events) {
      delete event.characters[characterName];
    }
  }

  async updateCharacterInventory({ storyName, characterName, inventory }: { storyName: string; characterName: string; inventory: string }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureString(characterName, 'characterName');
    ensureString(inventory, 'inventory');
    ensureEntityExists(characterName, Object.keys(story.characters));
    story.characters[characterName].inventory = inventory;
  }

  async onChangeCharacterActivity({ storyName, characterName, activityType, checked }: { storyName: string; characterName: string; activityType: string; checked: boolean }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureString(characterName, 'characterName');
    ensureString(activityType, 'activityType');
    ensureEnum(activityType, CHARACTER_ACTIVITY_TYPES, 'activityType');
    ensureBoolean(checked, 'checked');
    ensureEntityExists(characterName, Object.keys(story.characters));

    if (checked) {
      story.characters[characterName].activity[activityType as CharacterActivityType] = true;
    } else {
      delete story.characters[characterName].activity[activityType as CharacterActivityType];
    }
  }

  async addCharacterToEvent({ storyName, eventIndex, characterName }: { storyName: string; eventIndex: number; characterName: string }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureNumber(eventIndex, 'eventIndex');
    ensureString(characterName, 'characterName');
    ensureEntityExists(characterName, Object.keys(story.characters));
    ensureInRange(eventIndex, 0, story.events.length - 1);

    const event = story.events[eventIndex];
    ensureEntityNotExists(characterName, Object.keys(event.characters));

    event.characters[characterName] = { text: '', time: '' };
  }

  async removeCharacterFromEvent({ storyName, eventIndex, characterName }: { storyName: string; eventIndex: number; characterName: string }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureNumber(eventIndex, 'eventIndex');
    ensureString(characterName, 'characterName');
    ensureEntityExists(characterName, Object.keys(story.characters));
    ensureInRange(eventIndex, 0, story.events.length - 1);

    const event = story.events[eventIndex];
    ensureEntityExists(characterName, Object.keys(event.characters));
    delete event.characters[characterName];
  }

  private onRenameProfile(args: any[]): void {
    const { type, fromName, toName } = args[0] as { type: string; fromName: string; toName: string };
    if (type === 'player') return;

    for (const story of Object.values(this.engine.database.Stories)) {
      if (story.characters[fromName]) {
        story.characters[toName] = story.characters[fromName];
        story.characters[toName].name = toName;
        delete story.characters[fromName];

        for (const event of story.events) {
          if (event.characters[fromName]) {
            event.characters[toName] = event.characters[fromName];
            delete event.characters[fromName];
          }
        }
      }
    }
  }

  private onRemoveProfile(args: any[]): void {
    const { type, characterName } = args[0] as { type: string; characterName: string };
    if (type === 'player') return;

    for (const story of Object.values(this.engine.database.Stories)) {
      if (story.characters[characterName]) {
        delete story.characters[characterName];
        for (const event of story.events) {
          delete event.characters[characterName];
        }
      }
    }
  }
}

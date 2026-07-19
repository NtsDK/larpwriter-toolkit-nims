import type { DatabaseEngine } from './DatabaseEngine';
import type { Story } from '../domain/types';
import { ensureString, ensureNumber, ensureBoolean, ensureEnum, ensureInRange, ensureEntityExists } from '../utils/precondition';
import { ADAPTATION_PROPERTIES } from '../utils/constants';

export class AdaptationsEngine {
  constructor(private engine: DatabaseEngine) {}

  async getStory({ storyName }: { storyName: string }): Promise<Story> {
    ensureString(storyName, 'storyName');
    ensureEntityExists(storyName, Object.keys(this.engine.database.Stories));
    return structuredClone(this.engine.database.Stories[storyName]);
  }

  async getFilteredStoryNames({ showOnlyUnfinishedStories }: { showOnlyUnfinishedStories: boolean }): Promise<Array<{ storyName: string; isFinished: boolean; isEmpty: boolean }>> {
    ensureBoolean(showOnlyUnfinishedStories, 'showOnlyUnfinishedStories');

    let result = Object.keys(this.engine.database.Stories).sort((a, b) => a.localeCompare(b)).map(storyName => {
      const story = this.engine.database.Stories[storyName];
      const isEmpty = story.events.length === 0;
      const isFinished = !isEmpty && story.events.every(event =>
        Object.keys(event.characters).length > 0 &&
        Object.values(event.characters).every(a => a.ready)
      );
      return { storyName, isFinished, isEmpty };
    });

    if (showOnlyUnfinishedStories) {
      result = result.filter(item => !item.isFinished || item.isEmpty);
    }
    return result;
  }

  async setEventAdaptationProperty({ storyName, eventIndex, characterName, type, value }: {
    storyName: string; eventIndex: number; characterName: string; type: string; value: unknown;
  }): Promise<void> {
    ensureString(storyName, 'storyName');
    ensureEntityExists(storyName, Object.keys(this.engine.database.Stories));
    ensureNumber(eventIndex, 'eventIndex');
    ensureString(type, 'type');
    ensureEnum(type, ADAPTATION_PROPERTIES, 'type');
    ensureString(characterName, 'characterName');

    const story = this.engine.database.Stories[storyName];
    ensureEntityExists(characterName, Object.keys(story.characters));
    ensureInRange(eventIndex, 0, story.events.length - 1);

    if (type === 'ready') {
      ensureBoolean(value, 'value');
    } else {
      ensureString(value as string, 'value');
    }

    const event = story.events[eventIndex];
    ensureEntityExists(characterName, Object.keys(event.characters));
    (event.characters[characterName] as unknown as Record<string, unknown>)[type] = value;
  }
}

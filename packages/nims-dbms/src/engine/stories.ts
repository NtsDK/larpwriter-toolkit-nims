import type { DatabaseEngine } from './DatabaseEngine';
import type { Story } from '../domain/types';
import { ensureString, ensureEntityExists, ensureEntityCanBeCreated, ensureEntityCanBeRenamed } from '../utils/precondition';

function charOrdA(a: string, b: string): number {
  return a.localeCompare(b);
}

export class StoriesEngine {
  constructor(private engine: DatabaseEngine) {}

  async getStoryNamesArray(): Promise<string[]> {
    return Object.keys(this.engine.database.Stories).sort(charOrdA);
  }

  async getAllStories(): Promise<Record<string, Story>> {
    return structuredClone(this.engine.database.Stories);
  }

  async getWriterStory({ storyName }: { storyName: string }): Promise<string> {
    ensureString(storyName, 'storyName');
    ensureEntityExists(storyName, Object.keys(this.engine.database.Stories));
    return this.engine.database.Stories[storyName].story;
  }

  async setWriterStory({ storyName, value }: { storyName: string; value: string }): Promise<void> {
    ensureString(storyName, 'storyName');
    ensureString(value, 'value');
    ensureEntityExists(storyName, Object.keys(this.engine.database.Stories));
    this.engine.database.Stories[storyName].story = value;
  }

  async createStory({ storyName }: { storyName: string }): Promise<void> {
    ensureEntityCanBeCreated(storyName, Object.keys(this.engine.database.Stories));
    this.engine.database.Stories[storyName] = {
      name: storyName,
      story: '',
      characters: {},
      events: [],
    };
    this.engine.ee.emit('createStory', [{ storyName }]);
  }

  async renameStory({ fromName, toName }: { fromName: string; toName: string }): Promise<void> {
    ensureEntityCanBeRenamed(fromName, toName, Object.keys(this.engine.database.Stories));
    if (fromName === toName) return;

    const data = this.engine.database.Stories[fromName];
    data.name = toName;
    this.engine.database.Stories[toName] = data;
    delete this.engine.database.Stories[fromName];
    this.engine.ee.emit('renameStory', [{ fromName, toName }]);
  }

  async removeStory({ storyName }: { storyName: string }): Promise<void> {
    ensureString(storyName, 'storyName');
    ensureEntityExists(storyName, Object.keys(this.engine.database.Stories));
    delete this.engine.database.Stories[storyName];
    this.engine.ee.emit('removeStory', [{ storyName }]);
  }
}

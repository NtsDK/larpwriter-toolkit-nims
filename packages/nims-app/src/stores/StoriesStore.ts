import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export class StoriesStore {
  names: string[] = [];
  loading = false;

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadNames() {
    this.loading = true;
    try {
      const data = await this.root.api.get<string[]>('getStoryNamesArray');
      runInAction(() => { this.names = data; });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async create(storyName: string) {
    await this.root.api.call('createStory', { storyName });
    await this.loadNames();
  }

  async rename(fromName: string, toName: string) {
    await this.root.api.call('renameStory', { fromName, toName });
    await this.loadNames();
  }

  async remove(storyName: string) {
    await this.root.api.call('removeStory', { storyName });
    await this.loadNames();
  }

  async getWriterStory(storyName: string): Promise<string> {
    return this.root.api.get<string>('getWriterStory', { storyName });
  }

  async setWriterStory(storyName: string, value: string) {
    await this.root.api.call('setWriterStory', { storyName, value });
  }
}

import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export interface GameMeta {
  name: string;
  description: string;
  date: string;
  preGameDate: string;
  saveTime: string;
}

export class MetaStore {
  meta: GameMeta | null = null;
  loading = false;

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async load() {
    this.loading = true;
    try {
      const data = await this.root.api.get<GameMeta>('getMetaInfo');
      runInAction(() => { this.meta = data; });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async setString(name: string, value: string) {
    await this.root.api.call('setMetaInfoString', { name, value });
    await this.load();
  }

  async setDate(name: string, value: string) {
    await this.root.api.call('setMetaInfoDate', { name, value });
    await this.load();
  }
}

import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export class GroupsStore {
  names: string[] = [];
  loading = false;

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadNames() {
    this.loading = true;
    try {
      const data = await this.root.api.get<string[]>('getGroupNamesArray');
      runInAction(() => { this.names = data; });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async create(groupName: string) {
    await this.root.api.call('createGroup', { groupName });
    await this.loadNames();
  }

  async rename(fromName: string, toName: string) {
    await this.root.api.call('renameGroup', { fromName, toName });
    await this.loadNames();
  }

  async remove(groupName: string) {
    await this.root.api.call('removeGroup', { groupName });
    await this.loadNames();
  }
}

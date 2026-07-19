import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export class CharactersStore {
  names: string[] = [];
  profiles: Record<string, Record<string, unknown>> = {};
  structure: Array<{ name: string; type: string; value: unknown; doExport: boolean; playerAccess: string }> = [];
  loading = false;

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadNames() {
    this.loading = true;
    try {
      const data = await this.root.api.get<string[]>('getProfileNamesArray', { type: 'character' });
      runInAction(() => { this.names = data; });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async loadProfile(name: string) {
    const data = await this.root.api.get<Record<string, unknown>>('getProfile', { type: 'character', name });
    runInAction(() => { this.profiles[name] = data; });
  }

  async loadStructure() {
    const data = await this.root.api.get<typeof this.structure>('getProfileStructure', { type: 'character' });
    runInAction(() => { this.structure = data; });
  }

  async create(characterName: string) {
    await this.root.api.call('createProfile', { type: 'character', characterName });
    await this.loadNames();
  }

  async rename(fromName: string, toName: string) {
    await this.root.api.call('renameProfile', { type: 'character', fromName, toName });
    await this.loadNames();
  }

  async remove(characterName: string) {
    await this.root.api.call('removeProfile', { type: 'character', characterName });
    runInAction(() => {
      delete this.profiles[characterName];
    });
    await this.loadNames();
  }

  async updateField(characterName: string, fieldName: string, itemType: string, value: unknown) {
    await this.root.api.call('updateProfileField', { type: 'character', characterName, fieldName, itemType, value });
    await this.loadProfile(characterName);
  }
}

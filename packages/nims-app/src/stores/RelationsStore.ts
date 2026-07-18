import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export interface Relation {
  starter: string;
  ender: string;
  [key: string]: unknown;
}

export class RelationsStore {
  relations: Relation[] = [];
  loading = false;

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async load() {
    this.loading = true;
    try {
      const data = await this.root.api.get<Relation[]>('getRelations');
      runInAction(() => { this.relations = data; });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async create(fromCharacter: string, toCharacter: string) {
    await this.root.api.call('createCharacterRelation', { fromCharacter, toCharacter });
    await this.load();
  }

  async remove(fromCharacter: string, toCharacter: string) {
    await this.root.api.call('removeCharacterRelation', { fromCharacter, toCharacter });
    await this.load();
  }

  async setText(fromCharacter: string, toCharacter: string, character: string, text: string) {
    await this.root.api.call('setCharacterRelationText', { fromCharacter, toCharacter, character, text });
    await this.load();
  }
}

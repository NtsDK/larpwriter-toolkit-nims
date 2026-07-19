import { makeAutoObservable } from 'mobx';
import { ApiStore } from './ApiStore';
import { AuthStore } from './AuthStore';
import { PermissionsStore } from './PermissionsStore';
import { MetaStore } from './MetaStore';
import { CharactersStore } from './CharactersStore';
import { StoriesStore } from './StoriesStore';
import { GroupsStore } from './GroupsStore';
import { RelationsStore } from './RelationsStore';

export class RootStore {
  api: ApiStore;
  auth: AuthStore;
  permissions: PermissionsStore;
  meta: MetaStore;
  characters: CharactersStore;
  stories: StoriesStore;
  groups: GroupsStore;
  relations: RelationsStore;

  constructor() {
    this.auth = new AuthStore(this);
    this.api = new ApiStore(this);
    this.permissions = new PermissionsStore(this);
    this.meta = new MetaStore(this);
    this.characters = new CharactersStore(this);
    this.stories = new StoriesStore(this);
    this.groups = new GroupsStore(this);
    this.relations = new RelationsStore(this);
    makeAutoObservable(this, {}, { autoBind: true });
  }
}

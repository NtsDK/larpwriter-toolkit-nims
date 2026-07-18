import { EventEmitter } from 'events';
import type { Database } from '../domain/types';
import { MetaEngine } from './meta';
import { ProfilesEngine } from './profiles';
import { StoriesEngine } from './stories';
import { EventsEngine } from './events';
import { CharactersEngine } from './characters';
import { GroupsEngine } from './groups';
import { RelationsEngine } from './relations';
import { AdaptationsEngine } from './adaptations';
import { BriefingsEngine } from './briefings';
import { SearchEngine } from './search';
import { StatisticsEngine } from './statistics';
import { ConsistencyEngine } from './consistency';
import { UsersEngine } from './users';
import { ensureDatabaseDefaults } from '../utils/defaults';

export type { BriefingCharData, CharacterReport } from './briefings';
export type { TextSearchResult, SearchResult } from './search';
export type { ConsistencyResult } from './consistency';
export type { UserInfo, PlayerInfo, SessionUser } from './users';

export class DatabaseEngine {
  database: Database;
  ee: EventEmitter;

  private meta: MetaEngine;
  private profiles: ProfilesEngine;
  private stories: StoriesEngine;
  private events: EventsEngine;
  private characters: CharactersEngine;
  private groups: GroupsEngine;
  private relations: RelationsEngine;
  private adaptations: AdaptationsEngine;
  private briefings: BriefingsEngine;
  private search: SearchEngine;
  private statistics: StatisticsEngine;
  private consistency: ConsistencyEngine;
  private users: UsersEngine;

  constructor(database: Database) {
    this.database = ensureDatabaseDefaults(database);
    this.ee = new EventEmitter();

    this.meta = new MetaEngine(this);
    this.profiles = new ProfilesEngine(this);
    this.stories = new StoriesEngine(this);
    this.events = new EventsEngine(this);
    this.characters = new CharactersEngine(this);
    this.groups = new GroupsEngine(this);
    this.relations = new RelationsEngine(this);
    this.adaptations = new AdaptationsEngine(this);
    this.briefings = new BriefingsEngine(this);
    this.search = new SearchEngine(this);
    this.statistics = new StatisticsEngine(this);
    this.consistency = new ConsistencyEngine(this);
    this.users = new UsersEngine(this);
  }

  // === Meta ===
  getDatabase() { return this.meta.getDatabase(); }
  setDatabase(args: { database: Database }) { return this.meta.setDatabase(args); }
  getMetaInfo() { return this.meta.getMetaInfo(); }
  setMetaInfoString(args: { name: string; value: string }) { return this.meta.setMetaInfoString(args); }
  setMetaInfoDate(args: { name: string; value: string }) { return this.meta.setMetaInfoDate(args); }

  // === Profiles ===
  getProfileNamesArray(args: { type: string }) { return this.profiles.getProfileNamesArray(args); }
  getProfile(args: { type: string; name: string }) { return this.profiles.getProfile(args); }
  getAllProfiles(args: { type: string }) { return this.profiles.getAllProfiles(args); }
  createProfile(args: { type: string; characterName: string }) { return this.profiles.createProfile(args); }
  renameProfile(args: { type: string; fromName: string; toName: string }) { return this.profiles.renameProfile(args); }
  removeProfile(args: { type: string; characterName: string }) { return this.profiles.removeProfile(args); }
  updateProfileField(args: { type: string; characterName: string; fieldName: string; itemType: string; value: unknown }) { return this.profiles.updateProfileField(args); }
  getProfileStructure(args: { type: string }) { return this.profiles.getProfileStructure(args); }
  getProfileBindings() { return this.profiles.getProfileBindings(); }

  createProfileItem(args: { type: string; name: string; itemType: string; selectedIndex: number }) { return this.profiles.createProfileItem(args); }
  moveProfileItem(args: { type: string; index: number; newIndex: number }) { return this.profiles.moveProfileItem(args); }
  removeProfileItem(args: { type: string; index: number; profileItemName: string }) { return this.profiles.removeProfileItem(args); }
  changeProfileItemType(args: { type: string; profileItemName: string; newType: string }) { return this.profiles.changeProfileItemType(args); }
  changeProfileItemPlayerAccess(args: { type: string; profileItemName: string; playerAccessType: string }) { return this.profiles.changeProfileItemPlayerAccess(args); }
  renameProfileItem(args: { type: string; newName: string; oldName: string }) { return this.profiles.renameProfileItem(args); }
  doExportProfileItemChange(args: { type: string; profileItemName: string; checked: boolean }) { return this.profiles.doExportProfileItemChange(args); }
  showInRoleGridProfileItemChange(args: { type: string; profileItemName: string; checked: boolean }) { return this.profiles.showInRoleGridProfileItemChange(args); }
  updateDefaultValue(args: { type: string; profileItemName: string; value: unknown }) { return this.profiles.updateDefaultValue(args); }

  // === Stories ===
  getStoryNamesArray() { return this.stories.getStoryNamesArray(); }
  getAllStories() { return this.stories.getAllStories(); }
  getWriterStory(args: { storyName: string }) { return this.stories.getWriterStory(args); }
  setWriterStory(args: { storyName: string; value: string }) { return this.stories.setWriterStory(args); }
  createStory(args: { storyName: string }) { return this.stories.createStory(args); }
  renameStory(args: { fromName: string; toName: string }) { return this.stories.renameStory(args); }
  removeStory(args: { storyName: string }) { return this.stories.removeStory(args); }

  // === Events ===
  getStoryEvents(args: { storyName: string }) { return this.events.getStoryEvents(args); }
  createEvent(args: { storyName: string; eventName: string; selectedIndex: number }) { return this.events.createEvent(args); }
  moveEvent(args: { storyName: string; index: number; newIndex: number }) { return this.events.moveEvent(args); }
  cloneEvent(args: { storyName: string; index: number }) { return this.events.cloneEvent(args); }
  mergeEvents(args: { storyName: string; index: number }) { return this.events.mergeEvents(args); }
  removeEvent(args: { storyName: string; index: number }) { return this.events.removeEvent(args); }
  setEventOriginProperty(args: { storyName: string; index: number; property: string; value: string }) { return this.events.setEventOriginProperty(args); }

  // === Story Characters ===
  getStoryCharacterNamesArray(args: { storyName: string }) { return this.characters.getStoryCharacterNamesArray(args); }
  getStoryCharacters(args: { storyName: string }) { return this.characters.getStoryCharacters(args); }
  addStoryCharacter(args: { storyName: string; characterName: string }) { return this.characters.addStoryCharacter(args); }
  switchStoryCharacters(args: { storyName: string; fromName: string; toName: string }) { return this.characters.switchStoryCharacters(args); }
  removeStoryCharacter(args: { storyName: string; characterName: string }) { return this.characters.removeStoryCharacter(args); }
  updateCharacterInventory(args: { storyName: string; characterName: string; inventory: string }) { return this.characters.updateCharacterInventory(args); }
  onChangeCharacterActivity(args: { storyName: string; characterName: string; activityType: string; checked: boolean }) { return this.characters.onChangeCharacterActivity(args); }
  addCharacterToEvent(args: { storyName: string; eventIndex: number; characterName: string }) { return this.characters.addCharacterToEvent(args); }
  removeCharacterFromEvent(args: { storyName: string; eventIndex: number; characterName: string }) { return this.characters.removeCharacterFromEvent(args); }

  // === Groups ===
  getGroupNamesArray() { return this.groups.getGroupNamesArray(); }
  getGroup(args: { groupName: string }) { return this.groups.getGroup(args); }
  createGroup(args: { groupName: string }) { return this.groups.createGroup(args); }
  renameGroup(args: { fromName: string; toName: string }) { return this.groups.renameGroup(args); }
  removeGroup(args: { groupName: string }) { return this.groups.removeGroup(args); }
  getAllCharacterGroupTexts() { return this.groups.getAllCharacterGroupTexts(); }

  // === Relations ===
  getRelations() { return this.relations.getRelations(); }
  getCharacterRelation(args: { fromCharacter: string; toCharacter: string }) { return this.relations.getCharacterRelation(args); }
  createCharacterRelation(args: { fromCharacter: string; toCharacter: string }) { return this.relations.createCharacterRelation(args); }
  removeCharacterRelation(args: { fromCharacter: string; toCharacter: string }) { return this.relations.removeCharacterRelation(args); }
  setCharacterRelationText(args: { fromCharacter: string; toCharacter: string; character: string; text: string }) { return this.relations.setCharacterRelationText(args); }

  // === Adaptations ===
  getStory(args: { storyName: string }) { return this.adaptations.getStory(args); }
  getFilteredStoryNames(args: { showOnlyUnfinishedStories: boolean }) { return this.adaptations.getFilteredStoryNames(args); }
  setEventAdaptationProperty(args: { storyName: string; eventIndex: number; characterName: string; type: string; value: unknown }) { return this.adaptations.setEventAdaptationProperty(args); }

  // === Briefings ===
  getBriefingData(args: { selCharacters?: string[] | null; selStories?: string[] | null; exportOnlyFinishedStories: boolean }) { return this.briefings.getBriefingData(args); }
  getCharacterReport(args: { characterName: string }) { return this.briefings.getCharacterReport(args); }

  // === Search ===
  getTexts(args: { searchStr: string; textTypes: string[]; caseSensitive: boolean }) { return this.search.getTexts(args); }

  // === Statistics ===
  getStatistics() { return this.statistics.getStatistics(); }

  // === Consistency ===
  getConsistencyCheckResult() { return this.consistency.getConsistencyCheckResult(); }

  // === Users ===
  login(args: { username: string; password: string }) { return this.users.login(args); }
  signUp(args: { userName: string; password: string; confirmPassword: string }) { return this.users.signUp(args); }
  getUser(args: { username: string; type: string }) { return this.users.getUser(args); }
  checkPassword(args: { username: string; type: string; password: string }) { return this.users.checkPassword(args); }
  setPassword(args: { username: string; type: string; password: string }) { return this.users.setPassword(args); }
  createOrganizer(args: { name: string; password: string }) { return this.users.createOrganizer(args); }
  removeOrganizer(args: { name: string }) { return this.users.removeOrganizer(args); }
  getManagementInfo() { return this.users.getManagementInfo(); }
  assignAdmin(args: { name: string }) { return this.users.assignAdmin(args); }
  assignEditor(args: { name: string }) { return this.users.assignEditor(args); }
  changeOrganizerPassword(args: { userName: string; newPassword: string }) { return this.users.changeOrganizerPassword(args); }
  createPlayer(args: { userName: string; password: string }) { return this.users.createPlayer(args); }
  removePlayerLogin(args: { userName: string }) { return this.users.removePlayerLogin(args); }
  createPlayerLogin(args: { userName: string; password: string }) { return this.users.createPlayerLogin(args); }
  ensureAdminExists(adminLogin: string, adminPass: string) { return this.users.ensureAdminExists(adminLogin, adminPass); }

  // === Entity (polymorphic) ===
  getEntityNamesArray(args: { type: string }): Promise<string[]> {
    switch (args.type) {
      case 'character':
      case 'player':
        return this.getProfileNamesArray(args);
      case 'group':
        return this.getGroupNamesArray();
      case 'story':
        return this.getStoryNamesArray();
      default:
        return Promise.reject(new Error(`Unknown entity type: ${args.type}`));
    }
  }

}

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
import { ProfileViewsEngine } from './profileViews';
import { GearsEngine } from './gears';
import { SlidersEngine } from './sliders';
import { ensureDatabaseDefaults } from '../utils/defaults';

export type { BriefingCharData, CharacterReport } from './briefings';
export type { TextSearchResult, SearchResult } from './search';
export type { ConsistencyResult } from './consistency';
export type { UserInfo, PlayerInfo, SessionUser } from './users';
export type { RoleGridInfo } from './profileViews';

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
  /** Exposed for cross-engine helpers (e.g. profile ↔ login resolve). */
  users: UsersEngine;
  private profileViews: ProfileViewsEngine;
  private gears: GearsEngine;
  private sliders: SlidersEngine;

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
    this.profileViews = new ProfileViewsEngine(this);
    this.gears = new GearsEngine(this);
    this.sliders = new SlidersEngine(this);
  }

  // === Meta ===
  getDatabase() { return this.meta.getDatabase(); }
  setDatabase(args: { database: Database; preserveManagementInfo?: boolean }) {
    return this.meta.setDatabase(args);
  }
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
  bindCharacterToPlayer(args: { characterName: string; playerName: string }) { return this.profiles.bindCharacterToPlayer(args); }
  unbindCharacterFromPlayer(args: { characterName: string }) { return this.profiles.unbindCharacterFromPlayer(args); }
  getPlayerProfileInfo(user: { name: string; role?: string }) { return this.profiles.getPlayerProfileInfo(user); }

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
  createEvent(args: { storyName: string; eventName: string; selectedIndex?: number }) {
    const idx = args.selectedIndex ?? this.database.Stories[args.storyName]?.events.length ?? 0;
    return this.events.createEvent({ ...args, selectedIndex: idx });
  }
  moveEvent(args: { storyName: string; index?: number; newIndex?: number; eventName?: string; direction?: string }) {
    if (args.eventName && args.direction) {
      const story = this.database.Stories[args.storyName];
      if (!story) throw new Error('Story not found');
      const idx = story.events.findIndex(e => e.name === args.eventName);
      if (idx === -1) throw new Error('Event not found');
      const newIdx = args.direction === 'up' ? idx - 1 : idx + 1;
      return this.events.moveEvent({ storyName: args.storyName, index: idx, newIndex: newIdx });
    }
    return this.events.moveEvent({ storyName: args.storyName, index: args.index!, newIndex: args.newIndex! });
  }
  cloneEvent(args: { storyName: string; index: number }) { return this.events.cloneEvent(args); }
  mergeEvents(args: { storyName: string; index: number }) { return this.events.mergeEvents(args); }
  removeEvent(args: { storyName: string; index?: number; eventName?: string }) {
    if (args.eventName !== undefined) {
      const story = this.database.Stories[args.storyName];
      const idx = story?.events.findIndex(e => e.name === args.eventName) ?? -1;
      if (idx === -1) throw new Error('Event not found');
      return this.events.removeEvent({ storyName: args.storyName, index: idx });
    }
    return this.events.removeEvent({ storyName: args.storyName, index: args.index! });
  }
  setEventOriginProperty(args: { storyName: string; index?: number; eventName?: string; property: string; value: string }) {
    if (args.eventName !== undefined) {
      const story = this.database.Stories[args.storyName];
      const idx = story?.events.findIndex(e => e.name === args.eventName) ?? -1;
      if (idx === -1) throw new Error('Event not found');
      return this.events.setEventOriginProperty({ storyName: args.storyName, index: idx, property: args.property, value: args.value });
    }
    return this.events.setEventOriginProperty({ storyName: args.storyName, index: args.index!, property: args.property, value: args.value });
  }

  // === Story Characters ===
  getStoryCharacterNamesArray(args: { storyName: string }) { return this.characters.getStoryCharacterNamesArray(args); }
  getStoryCharacters(args: { storyName: string }) { return this.characters.getStoryCharacters(args); }
  addStoryCharacter(args: { storyName: string; characterName: string }) { return this.characters.addStoryCharacter(args); }
  switchStoryCharacters(args: { storyName: string; fromName: string; toName: string }) { return this.characters.switchStoryCharacters(args); }
  removeStoryCharacter(args: { storyName: string; characterName: string }) { return this.characters.removeStoryCharacter(args); }
  updateCharacterInventory(args: { storyName: string; characterName: string; inventory: string }) { return this.characters.updateCharacterInventory(args); }
  onChangeCharacterActivity(args: { storyName: string; characterName: string; activityType: string; checked: boolean }) { return this.characters.onChangeCharacterActivity(args); }
  addCharacterToEvent(args: { storyName: string; eventIndex?: number; eventName?: string; characterName: string }) {
    if (args.eventName !== undefined) {
      const story = this.database.Stories[args.storyName];
      const idx = story?.events.findIndex(e => e.name === args.eventName) ?? -1;
      if (idx === -1) throw new Error('Event not found');
      return this.characters.addCharacterToEvent({ storyName: args.storyName, eventIndex: idx, characterName: args.characterName });
    }
    return this.characters.addCharacterToEvent({ storyName: args.storyName, eventIndex: args.eventIndex!, characterName: args.characterName });
  }
  removeCharacterFromEvent(args: { storyName: string; eventIndex?: number; eventName?: string; characterName: string }) {
    if (args.eventName !== undefined) {
      const story = this.database.Stories[args.storyName];
      const idx = story?.events.findIndex(e => e.name === args.eventName) ?? -1;
      if (idx === -1) throw new Error('Event not found');
      return this.characters.removeCharacterFromEvent({ storyName: args.storyName, eventIndex: idx, characterName: args.characterName });
    }
    return this.characters.removeCharacterFromEvent({ storyName: args.storyName, eventIndex: args.eventIndex!, characterName: args.characterName });
  }

  // === Groups ===
  getGroupNamesArray() { return this.groups.getGroupNamesArray(); }
  getGroup(args: { groupName: string }) { return this.groups.getGroup(args); }
  createGroup(args: { groupName: string }) { return this.groups.createGroup(args); }
  renameGroup(args: { fromName: string; toName: string }) { return this.groups.renameGroup(args); }
  removeGroup(args: { groupName: string }) { return this.groups.removeGroup(args); }
  getGroupMembers(args: { groupName: string }) { return this.groups.getGroupMembers(args); }
  addCharacterToGroup(args: { groupName: string; characterName: string }) { return this.groups.addCharacterToGroup(args); }
  removeCharacterFromGroup(args: { groupName: string; characterName: string }) { return this.groups.removeCharacterFromGroup(args); }
  getGroupProfile(args: { groupName: string }) { return this.groups.getGroupProfile(args); }
  updateGroupProfileField(args: { groupName: string; fieldName: string; value: string }) { return this.groups.updateGroupProfileField(args); }
  getGroupProfileStructure() { return this.groups.getGroupProfileStructure(); }
  getAllCharacterGroupTexts() { return this.groups.getAllCharacterGroupTexts(); }

  // === Relations ===
  getRelations() { return this.relations.getRelations(); }
  getRelationsSummary(args: { characterName: string }) { return this.relations.getRelationsSummary(args); }
  getCharacterRelation(args: { fromCharacter: string; toCharacter: string }) { return this.relations.getCharacterRelation(args); }
  createCharacterRelation(args: { fromCharacter: string; toCharacter: string }) { return this.relations.createCharacterRelation(args); }
  removeCharacterRelation(args: { fromCharacter: string; toCharacter: string }) { return this.relations.removeCharacterRelation(args); }
  getCharacterRelationText(args: { fromCharacter: string; toCharacter: string; character: string }) { return this.relations.getCharacterRelationText(args); }
  setCharacterRelationText(args: { fromCharacter: string; toCharacter: string; character: string; text: string }) { return this.relations.setCharacterRelationText(args); }
  setRelationOrigin(args: { fromCharacter: string; toCharacter: string; text: string }) { return this.relations.setRelationOrigin(args); }
  setRelationEssence(args: { fromCharacter: string; toCharacter: string; essence: string[] }) { return this.relations.setRelationEssence(args); }
  setRelationReadyStatus(args: { fromCharacter: string; toCharacter: string; character: string; ready: boolean }) { return this.relations.setRelationReadyStatus(args); }

  // === Adaptations ===
  getStory(args: { storyName: string }) { return this.adaptations.getStory(args); }
  getFilteredStoryNames(args: { showOnlyUnfinishedStories: boolean }) { return this.adaptations.getFilteredStoryNames(args); }
  setEventAdaptationProperty(args: { storyName: string; eventIndex?: number; eventName?: string; characterName: string; type?: string; property?: string; value: unknown }) {
    const prop = args.property || args.type;
    let eventIndex = args.eventIndex;
    if (args.eventName !== undefined && eventIndex === undefined) {
      const story = this.database.Stories[args.storyName];
      eventIndex = story?.events.findIndex(e => e.name === args.eventName) ?? -1;
      if (eventIndex === -1) throw new Error('Event not found');
    }
    return this.adaptations.setEventAdaptationProperty({ storyName: args.storyName, eventIndex: eventIndex!, characterName: args.characterName, type: prop!, value: args.value });
  }

  // === Briefings ===
  getBriefingData(args: { selCharacters?: string[] | null; selStories?: string[] | null; exportOnlyFinishedStories: boolean }) { return this.briefings.getBriefingData(args); }
  getCharacterReport(args: { characterName: string }) { return this.briefings.getCharacterReport(args); }

  // === Role grid / profile filter ===
  getRoleGridInfo() { return this.profileViews.getRoleGridInfo(); }
  getCharactersSummary() { return this.profileViews.getCharactersSummary(); }
  getExtendedProfileBindings() { return this.profileViews.getExtendedProfileBindings(); }
  getProfileFilterInfo() { return this.profileViews.getProfileFilterInfo(); }
  applyProfileFilter(args: { filterModel: unknown[] }) {
    return this.profileViews.applyProfileFilter({ filterModel: args.filterModel as any });
  }
  saveFilterToGroup(args: { groupName: string; filterModel: unknown[] }) {
    return this.profileViews.saveFilterToGroup({ groupName: args.groupName, filterModel: args.filterModel as any });
  }

  // === Search ===
  getTexts(args: { searchStr: string; textTypes: string[]; caseSensitive: boolean }) { return this.search.getTexts(args); }

  // === Statistics ===
  getStatistics() { return this.statistics.getStatistics(); }

  // === Gears (role design cards) ===
  getAllGearsData() { return this.gears.getAllGearsData(); }
  setGearsData(args: { data: { nodes: any[]; edges: any[] } }) { return this.gears.setGearsData(args); }
  setGearsPhysicsEnabled(args: { enabled: boolean }) { return this.gears.setGearsPhysicsEnabled(args); }
  setGearsShowNotesEnabled(args: { enabled: boolean }) { return this.gears.setGearsShowNotesEnabled(args); }

  // === Sliders (mixing desk) ===
  getSliderData() { return this.sliders.getSliderData(); }
  createSlider(args: { name: string; top: string; bottom: string }) { return this.sliders.createSlider(args); }
  updateSliderNaming(args: { index: number; name: string; top: string; bottom: string }) { return this.sliders.updateSliderNaming(args); }
  updateSliderValue(args: { index: number; value: number }) { return this.sliders.updateSliderValue(args); }
  moveSlider(args: { index: number; pos: number }) { return this.sliders.moveSlider(args); }
  removeSlider(args: { index: number }) { return this.sliders.removeSlider(args); }

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
  revokeAdmin(args: { name: string }) { return this.users.revokeAdmin(args); }
  assignEditor(args: { name: string }) { return this.users.assignEditor(args); }
  revokeEditor(args: { name: string }) { return this.users.revokeEditor(args); }
  removeEditor() { return this.users.removeEditor(); }
  changeAdaptationRightsMode(args: { mode: string }) { return this.users.changeAdaptationRightsMode(args); }
  assignCharactersToOrganizer(args: { userName: string; characters: string[] }) { return this.users.assignCharactersToOrganizer(args); }
  assignStoriesToOrganizer(args: { userName: string; stories: string[] }) { return this.users.assignStoriesToOrganizer(args); }
  assignGroupsToOrganizer(args: { userName: string; groups: string[] }) { return this.users.assignGroupsToOrganizer(args); }
  assignPlayersToOrganizer(args: { userName: string; players: string[] }) { return this.users.assignPlayersToOrganizer(args); }
  getEntityOwners(args: { type: string }) { return this.users.getEntityOwners(args); }
  changeOrganizerPassword(args: { userName: string; newPassword: string }) { return this.users.changeOrganizerPassword(args); }
  changePlayerPassword(args: { userName: string; newPassword: string }) { return this.users.changePlayerPassword(args); }
  createPlayer(args: { userName: string; password: string }) { return this.users.createPlayer(args); }
  removePlayerLogin(args: { userName: string }) { return this.users.removePlayerLogin(args); }
  createPlayerLogin(args: { userName: string; password: string }) { return this.users.createPlayerLogin(args); }
  promotePlayerToOrganizer(args: { userName: string }) { return this.users.promotePlayerToOrganizer(args); }
  linkPlayerLoginToProfile(args: { userName: string; profileName: string }) {
    return this.users.linkPlayerLoginToProfile(args);
  }
  unlinkPlayerLoginFromProfile(args: { userName: string }) {
    return this.users.unlinkPlayerLoginFromProfile(args);
  }
  getResolvedPlayerProfileName(args: { userName: string }) {
    return this.users.getResolvedPlayerProfileName(args);
  }
  getPlayersOptions() { return this.users.getPlayersOptions(); }
  setPlayerOption(args: { name: string; value: boolean }) { return this.users.setPlayerOption(args); }
  getWelcomeText() { return this.users.getWelcomeText(); }
  setWelcomeText(args: { text: string }) { return this.users.setWelcomeText(args); }
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

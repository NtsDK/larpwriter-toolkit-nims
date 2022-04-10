import { EventEmitter } from 'events';
import * as R from 'ramda';

import * as baseAPI2 from './baseAPI2';
import * as consistencyCheckAPI2 from './consistencyCheckAPI2';
import * as statisticsAPI2 from './statisticsAPI2';
import * as profilesAPI2 from './profilesAPI2';
import * as profileBindingAPI2 from './profileBindingAPI2';

// import * as profileViewAPI2 from './profileViewAPI2';
import * as groupsAPI2 from './groupsAPI2';
// import * as groupSchemaAPI from './groupSchemaAPI';
import * as relationsAPI2 from './relationsAPI2';
import * as briefingExportAPI2 from './briefingExportAPI2';

import * as profileConfigurerAPI2 from './profileConfigurerAPI2';
import * as entityAPI2 from './entityAPI2';
import * as storyBaseAPI2 from './storyBaseAPI2';
import * as storyEventsAPI2 from './storyEventsAPI2';
import * as storyCharactersAPI2 from './storyCharactersAPI2';

import * as storyViewAPI2 from './storyViewAPI2';
import * as storyAdaptationsAPI2 from './storyAdaptationsAPI2';
// import * as gearsAPI from './core-apis/gearsAPI';
// import * as slidersAPI from './core-apis/slidersAPI';
import * as textSearchAPI2 from './textSearchAPI2';
import { ILocalDBMS } from './ILocalDBMS';

// import * as logAPI from './core-apis/logAPI';

const allListeners: Record<string, (() => {})[]> = {};

function addListener([eventName, callback]) {
  allListeners[eventName] = allListeners[eventName] || [];
  allListeners[eventName].push(callback);
}

Object.entries(groupsAPI2.listeners).forEach(addListener);
Object.entries(profileBindingAPI2.listeners).forEach(addListener);
Object.entries(profilesAPI2.listeners).forEach(addListener);
Object.entries(relationsAPI2.listeners).forEach(addListener);
Object.entries(storyCharactersAPI2.listeners).forEach(addListener);

export class LocalDBMS2 implements ILocalDBMS {
  ee: EventEmitter;

  constructor(public database: any) {
    this.ee = new EventEmitter();
  }

  _init() {
    const that = this;
    Object.keys(allListeners).forEach((triggerName) => {
      allListeners[triggerName].forEach((listener) => {
        that.ee.on(triggerName, listener.bind(that));
      });
    });
  };
  
  // _init = baseAPI2._init;
  getDatabase = baseAPI2.getDatabase;
  getMetaInfo = baseAPI2.getMetaInfo;
  setDatabase = baseAPI2.setDatabase;
  setMetaInfoDate = baseAPI2.setMetaInfoDate;
  setMetaInfoString = baseAPI2.setMetaInfoString;
  
  getConsistencyCheckResult = consistencyCheckAPI2.getConsistencyCheckResult;
  
  getProfileStatisticsLevel2 = statisticsAPI2.getProfileStatisticsLevel2;
  getStatistics = statisticsAPI2.getStatistics;
  getStatisticsLevel1 = statisticsAPI2.getStatisticsLevel1;
  getStatisticsLevel2 = statisticsAPI2.getStatisticsLevel2;

  createProfile = profilesAPI2.createProfile;
  getAllProfiles = profilesAPI2.getAllProfiles;
  getProfile = profilesAPI2.getProfile;
  getProfileNamesArray = profilesAPI2.getProfileNamesArray;
  removeProfile = profilesAPI2.removeProfile;
  renameProfile = profilesAPI2.renameProfile;
  updateProfileField = profilesAPI2.updateProfileField;

  createBinding = profileBindingAPI2.createBinding;
  getExtendedProfileBindings = profileBindingAPI2.getExtendedProfileBindings;
  getProfileBinding = profileBindingAPI2.getProfileBinding;
  getProfileBindings = profileBindingAPI2.getProfileBindings;
  removeBinding = profileBindingAPI2.removeBinding;

  createGroup = groupsAPI2.createGroup;
  doExportGroup = groupsAPI2.doExportGroup;
  getAllCharacterGroupTexts = groupsAPI2.getAllCharacterGroupTexts;
  getCharacterGroupTexts = groupsAPI2.getCharacterGroupTexts;
  getGroup = groupsAPI2.getGroup;
  getGroupCharacterSets = groupsAPI2.getGroupCharacterSets;
  getGroupNamesArray = groupsAPI2.getGroupNamesArray;
  getProfileFilterInfo = groupsAPI2.getProfileFilterInfo;
  removeGroup = groupsAPI2.removeGroup;
  renameGroup = groupsAPI2.renameGroup;
  saveFilterToGroup = groupsAPI2.saveFilterToGroup;
  updateGroupField = groupsAPI2.updateGroupField;
  
  createCharacterRelation = relationsAPI2.createCharacterRelation;
  getCharacterRelation = relationsAPI2.getCharacterRelation;
  getRelations = relationsAPI2.getRelations;
  getRelationsSummary = relationsAPI2.getRelationsSummary;
  removeCharacterRelation = relationsAPI2.removeCharacterRelation;
  setCharacterRelationText = relationsAPI2.setCharacterRelationText;
  setOriginRelationText = relationsAPI2.setOriginRelationText;
  setRelationEssenceStatus = relationsAPI2.setRelationEssenceStatus;
  setRelationReadyStatus = relationsAPI2.setRelationReadyStatus;

  getBriefingData = briefingExportAPI2.getBriefingData;

  changeProfileItemPlayerAccess = profileConfigurerAPI2.changeProfileItemPlayerAccess;
  changeProfileItemType = profileConfigurerAPI2.changeProfileItemType;
  createProfileItem = profileConfigurerAPI2.createProfileItem;
  doExportProfileItemChange = profileConfigurerAPI2.doExportProfileItemChange;
  getProfileStructure = profileConfigurerAPI2.getProfileStructure;
  moveProfileItem = profileConfigurerAPI2.moveProfileItem;
  removeProfileItem = profileConfigurerAPI2.removeProfileItem;
  renameEnumValue = profileConfigurerAPI2.renameEnumValue;
  renameProfileItem = profileConfigurerAPI2.renameProfileItem;
  showInRoleGridProfileItemChange = profileConfigurerAPI2.showInRoleGridProfileItemChange;
  updateDefaultValue = profileConfigurerAPI2.updateDefaultValue;

  getEntityNamesArray = entityAPI2.getEntityNamesArray;

  createStory = storyBaseAPI2.createStory;
  getAllStories = storyBaseAPI2.getAllStories;
  getStoryNamesArray = storyBaseAPI2.getStoryNamesArray;
  getWriterStory = storyBaseAPI2.getWriterStory;
  removeStory = storyBaseAPI2.removeStory;
  renameStory = storyBaseAPI2.renameStory;
  setWriterStory = storyBaseAPI2.setWriterStory;

  cloneEvent = storyEventsAPI2.cloneEvent;
  createEvent = storyEventsAPI2.createEvent;
  getStoryEvents = storyEventsAPI2.getStoryEvents;
  mergeEvents = storyEventsAPI2.mergeEvents;
  moveEvent = storyEventsAPI2.moveEvent;
  removeEvent = storyEventsAPI2.removeEvent;
  setEventOriginProperty = storyEventsAPI2.setEventOriginProperty;

  addCharacterToEvent = storyCharactersAPI2.addCharacterToEvent;
  addStoryCharacter = storyCharactersAPI2.addStoryCharacter;
  getStoryCharacterNamesArray = storyCharactersAPI2.getStoryCharacterNamesArray;
  getStoryCharacters = storyCharactersAPI2.getStoryCharacters;
  onChangeCharacterActivity = storyCharactersAPI2.onChangeCharacterActivity;
  removeCharacterFromEvent = storyCharactersAPI2.removeCharacterFromEvent;
  removeStoryCharacter = storyCharactersAPI2.removeStoryCharacter;
  switchStoryCharacters = storyCharactersAPI2.switchStoryCharacters;
  updateCharacterInventory = storyCharactersAPI2.updateCharacterInventory;

  getAllInventoryLists = storyViewAPI2.getAllInventoryLists;
  getCharacterEventGroupsByStory = storyViewAPI2.getCharacterEventGroupsByStory;
  getCharacterEventsByTime = storyViewAPI2.getCharacterEventsByTime;
  getCharacterReport = storyViewAPI2.getCharacterReport;
  getCharactersSummary = storyViewAPI2.getCharactersSummary;
  getEventsTimeInfo = storyViewAPI2.getEventsTimeInfo;

  getFilteredStoryNames = storyAdaptationsAPI2.getFilteredStoryNames;
  getStory = storyAdaptationsAPI2.getStory;
  setEventAdaptationProperty = storyAdaptationsAPI2.setEventAdaptationProperty;

  getTexts = textSearchAPI2.getTexts;
}
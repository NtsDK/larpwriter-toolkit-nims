import * as R from "ramda";

import * as Logger from "./db-utils/logger";
import * as Migrator from "./db-utils/migrator";
import * as ProjectUtils from "./db-utils/projectUtils";
import * as Schema from "./db-utils/schema";
import * as Constants from "./nimsConstants";

import * as baseAPI from './core-apis/baseAPI';
import * as consistencyCheckAPI from './core-apis/consistencyCheckAPI';
import * as statisticsAPI from './core-apis/statisticsAPI';
import * as profilesAPI from './core-apis/profilesAPI';
import * as profileBindingAPI from './core-apis/profileBindingAPI';

import * as profileViewAPI from './core-apis/profileViewAPI';
import * as groupsAPI from './core-apis/groupsAPI';
import * as groupSchemaAPI from './core-apis/groupSchemaAPI';
import * as relationsAPI from './core-apis/relationsAPI';
import * as briefingExportAPI from './core-apis/briefingExportAPI';

import * as profileConfigurerAPI from './core-apis/profileConfigurerAPI';
import * as entityAPI from './core-apis/entityAPI';
import * as storyBaseAPI from './core-apis/storyBaseAPI';
import * as storyEventsAPI from './core-apis/storyEventsAPI';
import * as storyCharactersAPI from './core-apis/storyCharactersAPI';

import * as storyViewAPI from './core-apis/storyViewAPI';
import * as storyAdaptationsAPI from './core-apis/storyAdaptationsAPI';
import * as gearsAPI from './core-apis/gearsAPI';
import * as slidersAPI from './core-apis/slidersAPI';
import * as textSearchAPI from './core-apis/textSearchAPI';

import * as logAPI from './core-apis/logAPI';

// const Logger = require('./db-utils/logger');
// const Migrator = require('./db-utils/migrator');
// const ProjectUtils = require('./db-utils/projectUtils');
// const Schema = require('./db-utils/schema');
// const Constants = require('./nimsConstants');

export const deps = {
    Migrator,
    ProjectUtils,
    Schema,
    Constants
};

export { Logger };
// hack to not dive into permission fix between offline and server
export const Permissions = {
    getPermissionAPIList: () => R.keys(R.mergeAll(R.values(Logger.apiInfo)))
};

// let loggerAPIList = R.keys(R.mergeAll(R.values(Logger.apiInfo)));
// let permissionAPIList = Permissions.getPermissionAPIList();

export const apiModules = {
    baseAPI,
    consistencyCheckAPI,
    statisticsAPI,
    profilesAPI,
    profileBindingAPI,

    profileViewAPI,
    groupsAPI,
    groupSchemaAPI,
    relationsAPI,
    briefingExportAPI,

    profileConfigurerAPI,
    entityAPI,
    storyBaseAPI,
    storyEventsAPI,
    storyCharactersAPI,

    storyViewAPI,
    storyAdaptationsAPI,
    gearsAPI,
    slidersAPI,
    textSearchAPI,

    // 'userAPI': require('./server-apis/userAPI'),
    // 'organizerManagementAPI': require('./server-apis/organizerManagementAPI'),
    // 'playerManagementAPI': require('./server-apis/playerManagementAPI'),
    // 'entityManagementAPI': require('./server-apis/entityManagementAPI'),
    // 'permissionSummaryAPI': require('./server-apis/permissionSummaryAPI'),

    logAPI,
};

// function initAPIs(commonFunc, serverFunc) {
export const apiApplyOrder = [
    'baseAPI',
    'consistencyCheckAPI',
    'statisticsAPI',
    'profilesAPI',
    'profileBindingAPI',

    'profileViewAPI',

    'groupsAPI',
    'groupSchemaAPI',
    'relationsAPI',
    'briefingExportAPI',

    'profileConfigurerAPI',
    'entityAPI',
    'storyBaseAPI',
    'storyEventsAPI',
    'storyCharactersAPI',

    'storyViewAPI',
    'storyAdaptationsAPI',
    'gearsAPI',
    'slidersAPI',
    'textSearchAPI',

    // 'userAPI',
    // 'organizerManagementAPI',
    // 'playerManagementAPI',
    // 'entityManagementAPI',
    // 'permissionSummaryAPI',
    'logAPI'];

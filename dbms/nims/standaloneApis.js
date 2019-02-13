// module.exports = [

// ];

const Logger = require('./db-utils/logger');
const Migrator = require('./db-utils/migrator');
const ProjectUtils = require('./db-utils/projectUtils');
const Schema = require('./db-utils/schema');
const Constants = require('./constants');

exports.deps = {
    Migrator,
    ProjectUtils,
    Schema,
    Constants
};

exports.Logger = Logger;
// hack to not dive into permission fix between offline and server
exports.Permissions = {
    getPermissionAPIList: () => {
        return R.keys(R.mergeAll(R.values(Logger.apiInfo)));
    }
};

// let loggerAPIList = R.keys(R.mergeAll(R.values(Logger.apiInfo)));
// let permissionAPIList = Permissions.getPermissionAPIList();

exports.apiModules = {
    'baseAPI': require('./core-apis/baseAPI'),
    'consistencyCheckAPI': require('./core-apis/consistencyCheckAPI'),
    'statisticsAPI': require('./core-apis/statisticsAPI'),
    'profilesAPI': require('./core-apis/profilesAPI'),
    'profileBindingAPI': require('./core-apis/profileBindingAPI'),

    'profileViewAPI': require('./core-apis/profileViewAPI'),
    'groupsAPI': require('./core-apis/groupsAPI'),
    'groupSchemaAPI': require('./core-apis/groupSchemaAPI'),
    'relationsAPI': require('./core-apis/relationsAPI'),
    'briefingExportAPI': require('./core-apis/briefingExportAPI'),

    'profileConfigurerAPI': require('./core-apis/profileConfigurerAPI'),
    'entityAPI': require('./core-apis/entityAPI'),
    'storyBaseAPI': require('./core-apis/storyBaseAPI'),
    'storyEventsAPI': require('./core-apis/storyEventsAPI'),
    'storyCharactersAPI': require('./core-apis/storyCharactersAPI'),

    'storyViewAPI': require('./core-apis/storyViewAPI'),
    'storyAdaptationsAPI': require('./core-apis/storyAdaptationsAPI'),
    'gearsAPI': require('./core-apis/gearsAPI'),
    'slidersAPI': require('./core-apis/slidersAPI'),
    'textSearchAPI': require('./core-apis/textSearchAPI'),

    // 'userAPI': require('./server-apis/userAPI'),
    // 'organizerManagementAPI': require('./server-apis/organizerManagementAPI'),
    // 'playerManagementAPI': require('./server-apis/playerManagementAPI'),
    // 'entityManagementAPI': require('./server-apis/entityManagementAPI'),
    // 'permissionSummaryAPI': require('./server-apis/permissionSummaryAPI'),

    'logAPI': require('./core-apis/logAPI'),

    // 'consistencyCheckAPI',
    // 'statisticsAPI',
    // 'profilesAPI',
    // 'profileBindingAPI',
    // 'profileViewAPI',

    // 'groupsAPI',
    // 'groupSchemaAPI',
    // 'relationsAPI',
    // 'briefingExportAPI',
    // 'profileConfigurerAPI',

    // 'entityAPI',
    // 'storyBaseAPI',
    // 'storyEventsAPI',
    // 'storyCharactersAPI',

    // 'storyViewAPI',
    // 'storyAdaptationsAPI',
    // 'gearsAPI',
    // 'slidersAPI',
    // 'textSearchAPI',

    // 'userAPI',
    // 'organizerManagementAPI',
    // 'playerManagementAPI',
    // 'entityManagementAPI',
    // 'permissionSummaryAPI',
    // 'logAPI'
};

// function initAPIs(commonFunc, serverFunc) {
exports.apiApplyOrder = [
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

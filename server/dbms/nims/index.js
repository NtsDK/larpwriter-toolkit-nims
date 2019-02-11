// const applyPermissionProxy = require('./permissionProxy').applyPermissionProxy;

exports.initAPIs = function (commonFunc, serverFunc) {
    ['baseAPI',
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
        'textSearchAPI'].map(commonFunc);

    ['userAPI',
        'organizerManagementAPI',
        'playerManagementAPI',
        'entityManagementAPI',
        // 'permissionAPI',
        'permissionSummaryAPI'].map(serverFunc);

    commonFunc('logAPI');
};

exports.populateDatabase = function (database) {
};

exports.getPermissionAPIList = function () {
    return require('./permissionProxy').permissionAPIList;
};

exports.applyPermissionProxy = function (database, PC, Errors) {
    // const permissionProxy = require()
    const proxy = require('./permissionProxy').applyPermissionProxy(database, PC, Errors);
    require('./permissionProxy.spec').test(proxy, database);
    return proxy;
    //return database;
};

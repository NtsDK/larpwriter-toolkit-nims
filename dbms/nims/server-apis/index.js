// const applyPermissionProxy = require('./permissionProxy').applyPermissionProxy;
const permissionProxy = require('./permissionProxy');
const permissionProxySpec = require('./permissionProxy.spec');

// exports.initAPIs = function (commonFunc, serverFunc) {
//     ['baseAPI',
//         'consistencyCheckAPI',
//         'statisticsAPI',
//         'profilesAPI',
//         'profileBindingAPI',

//         'profileViewAPI',

//         'groupsAPI',
//         'groupSchemaAPI',
//         'relationsAPI',
//         'briefingExportAPI',

//         'profileConfigurerAPI',
//         'entityAPI',
//         'storyBaseAPI',
//         'storyEventsAPI',
//         'storyCharactersAPI',

//         'storyViewAPI',
//         'storyAdaptationsAPI',
//         'gearsAPI',
//         'slidersAPI',
//         'textSearchAPI'].map(commonFunc);

//     ['userAPI',
//         'organizerManagementAPI',
//         'playerManagementAPI',
//         'entityManagementAPI',
//         // 'permissionAPI',
//         'permissionSummaryAPI'].map(serverFunc);

//     commonFunc('logAPI');
// };

exports.populateDatabase = function (database) {
};

exports.getPermissionAPIList = function () {
    return permissionProxy.permissionAPIList;
};


exports.applyPermissionProxy = function (database, PC, Errors) {
    const proxy = permissionProxy.applyPermissionProxy(database, PC, Errors);
    permissionProxySpec.test(proxy, database);
    return proxy;
    //return database;
};

// const applyPermissionProxy = require('./permissionProxy').applyPermissionProxy;
const permissionProxy = require('./permissionProxy');
const permissionProxySpec = require('./permissionProxy.spec');

// exports.populateDatabase = function (database) {
// };

exports.getPermissionAPIList = function () {
    return permissionProxy.permissionAPIList;
};

exports.applyPermissionProxy = function (database, PC, Errors) {
    const proxy = permissionProxy.applyPermissionProxy(database, PC, Errors);
    permissionProxySpec.test(proxy, database);
    return proxy;
    //return database;
};

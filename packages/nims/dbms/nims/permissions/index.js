const R = require('ramda');
// const applyPermissionProxy = require('./permissionProxy').applyPermissionProxy;
const permissionProxy = require('./permissionProxy');
const permissionProxySpec = require('./permissionProxy.spec');

// exports.populateDatabase = function (database) {
// };

exports.getPermissionAPIList = function () {
    return permissionProxy.permissionAPIList;
};

exports.applyPermissionProxy = R.curry(function (makeValidationError, database) {
    const proxy = permissionProxy.applyPermissionProxy(makeValidationError, database);
    // disabled because of broken init sequence
    // permissionProxySpec.test(proxy, database);
    return proxy;
    //return database;
});

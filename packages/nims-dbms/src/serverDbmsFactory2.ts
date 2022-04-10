import * as R from "ramda";
import { LocalDBMS2 } from "./core-apis/LocalDBMS2";

// import dateFormat from 'dateformat';

// const dateFormat = require('dateformat');
// const { EventEmitter } = require('events');
// const Ajv = require('ajv');

// const path = 'common/';
// const path = 'js/common/';
// const path = pathTool.join(config.get('frontendPath'), 'js/common/');

// const Errors = require('./errors');
// const CommonUtils = require('./commonUtils');
// const Precondition = require('./precondition');
// const Logger = require(`${path}logger`);
// const Migrator = require(`${path}migrator`);
// const Constants = require(`${path}constants`);
// const Errors = require(`${path}errors`);
// const CommonUtils = require(`${path}commonUtils`);
// const ProjectUtils = require(`${path}projectUtils`);
// const Precondition = require(`${path}precondition`);
// const Schema = require(`${path}schema`);

//var baseExample = require(path + 'baseExample');
// eslint-disable-next-line import/no-unresolved
// const emptyBase = require('resources/emptyBase');
// const log = require('../libs/log')(module);

// projectName, enabledLogOverrides, logOverridesObject
export function makeDbms(
    // projectName, 
    // serverSpecific = {}, 
    // logModule, 
    database,
    // proxies, 
    // apis, 
    // isServer
    // lastDb
) {
    // serverSpecific = serverSpecific || {};
    // const { Logger, Permissions } = apis;

    // let { enabledLogOverrides } = serverSpecific;
    // const { logOverridesObject } = serverSpecific;

    // const log = logModule(module);
    // const config = require('../config');
    // enabledLogOverrides = enabledLogOverrides || false;

    // const projectName = config.get('inits:projectName');
    // const projectAPIs = require(`../${projectName}/server-apis`);

    // const listeners = {};

    // function addListener(eventName, callback) {
    //     listeners[eventName] = listeners[eventName] || [];
    //     listeners[eventName].push(callback);
    // }

    // const opts = R.mergeLeft({
    //     // PU: ProjectUtils,
    //     CommonUtils,
    //     CU: CommonUtils,
    //     Precondition,
    //     PC: Precondition,
    //     // EventEmitter,
    //     R,
    //     // Ajv,
    //     Errors,
    //     addListener,
    //     // Constants,
    //     dbmsUtils: {},
    //     // dateFormat,
    //     serverSpecific,
    //     logModule
    // }, apis.deps);

    // function LocalDBMS() {
    //     this._init(listeners);
    // }

    // const funcList = {};
    // const func = (apiName) => {
    //     const before = R.keys(LocalDBMS.prototype);
    //     // console.log('apiName', apis.apiModules[apiName]);
    //     // apis.apiModules[apiName](LocalDBMS, opts);
    //     apis.apiModules[apiName].default(LocalDBMS, opts);
    //     // require(path2 + name)(LocalDBMS, opts);
    //     const after = R.keys(LocalDBMS.prototype);
    //     const diff = R.difference(after, before);
    //     log.info(`${apiName} ${diff}`);
    //     funcList[apiName] = R.zipObj(diff, R.repeat(true, diff.length));
    // };

    // apis.apiApplyOrder.forEach(func);

    // if (enabledLogOverrides) {
    //     Logger.apiInfo = R.merge(Logger.apiInfo, logOverridesObject);
    // }
    // // if (config.get('logOverrides:enabled')) {
    // //     Logger.apiInfo = R.merge(Logger.apiInfo, config.get('logOverrides:overrides'));
    // // }

    // const baseAPIList = R.keys(R.mergeAll(R.values(funcList)));
    // let loggerAPIList = R.keys(R.mergeAll(R.values(Logger.apiInfo)));
    // let permissionAPIList = Permissions.getPermissionAPIList();

    // if (!isServer) {
    //     // baseAPIList = R.difference(baseAPIList, Logger.offlineIgnoreList);
    //     loggerAPIList = R.difference(loggerAPIList, Logger.offlineIgnoreList);
    //     permissionAPIList = R.difference(permissionAPIList, Logger.offlineIgnoreList);
    // }

    // const loggerDiff = R.symmetricDifference(loggerAPIList, baseAPIList);
    // const permissionDiff = R.symmetricDifference(permissionAPIList, baseAPIList);
    // if (loggerDiff.length > 0 || permissionDiff.length > 0) {
    //     console.error(`Logger diff: ${loggerDiff}`);
    //     console.error(`Logged but not in base: ${R.difference(loggerAPIList, baseAPIList)}`);
    //     console.error(`In base but not logged: ${R.difference(baseAPIList, loggerAPIList)}`);
    //     console.error(`Permission diff: ${permissionDiff}`);
    //     throw new Error('API processors are inconsistent');
    // }


    // const db = new LocalDBMS();
    const db = new LocalDBMS2(database);

    //const permissionProxy = require(`./${projectName}/permissionProxy`);

    // const rawDb = Logger.applyLoggerProxy(db, isServer);



    // let preparedDb = rawDb;
    // if (proxies) {
    //     preparedDb = proxies.reduce((db2, proxy) => proxy(db2), preparedDb);
    // }

    return {
        db,
        rawDb: db,
        preparedDb: db
        // rawDb,
        // preparedDb
        // apiDb: projectAPIs.applyPermissionProxy(Precondition.makeValidationError, db)
    };
};

/* eslint-disable global-require */
/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/* eslint-disable import/no-dynamic-require */


const pathTool = require('path');


const R = require('ramda');

const dateFormat = require('dateformat');
const { EventEmitter } = require('events');
const Ajv = require('ajv');

const path = 'common/';
// const path = 'js/common/';
// const path = pathTool.join(config.get('frontendPath'), 'js/common/');
const Logger = require('nims/db-utils/logger');
const Migrator = require('nims/db-utils/migrator');
const ProjectUtils = require('nims/db-utils/projectUtils');
const Schema = require('nims/db-utils/schema');

const Constants = require('nims/constants');

const Errors = require('core/errors');
const CommonUtils = require('core/commonUtils');
const Precondition = require('core/precondition');
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
const emptyBase = require('resources/emptyBase');
// const log = require('../libs/log')(module);

// projectName, enabledLogOverrides, logOverridesObject
module.exports = function ({
    projectName, serverSpecific, logModule, lastDb
} = {}) {
    const { enabledLogOverrides, logOverridesObject } = serverSpecific;
    const log = logModule(module);
    // const config = require('../config');


    // const projectName = config.get('inits:projectName');
    const projectAPIs = require(`../${projectName}/server-apis`);

    const listeners = {};

    function addListener(eventName, callback) {
        listeners[eventName] = listeners[eventName] || [];
        listeners[eventName].push(callback);
    }

    const opts = {
        Migrator,
        CommonUtils,
        CU: CommonUtils,
        ProjectUtils,
        PU: ProjectUtils,
        Precondition,
        PC: Precondition,
        EventEmitter,
        R,
        Ajv,
        Schema,
        Errors,
        addListener,
        Constants,
        dbmsUtils: {},
        dateFormat,
        serverSpecific,
        logModule
    };

    function LocalDBMS() {
        this._init(listeners);
    }

    const funcList = {};
    const func = R.curry((path2, name) => {
        const before = R.keys(LocalDBMS.prototype);
        require(path2 + name)(LocalDBMS, opts);
        const after = R.keys(LocalDBMS.prototype);
        const diff = R.difference(after, before);
        log.info(`${name} ${diff}`);
        funcList[name] = R.zipObj(diff, R.repeat(true, diff.length));
    });

    const commonFunc = func('nims/core-apis/');
    const serverFunc = func('../nims/server-apis/');

    projectAPIs.initAPIs(commonFunc, serverFunc);

    if (enabledLogOverrides) {
        Logger.apiInfo = R.merge(Logger.apiInfo, logOverridesObject);
    }
    // if (config.get('logOverrides:enabled')) {
    //     Logger.apiInfo = R.merge(Logger.apiInfo, config.get('logOverrides:overrides'));
    // }

    const baseAPIList = R.keys(R.mergeAll(R.values(funcList)));
    const loggerAPIList = R.keys(R.mergeAll(R.values(Logger.apiInfo)));
    const permissionAPIList = projectAPIs.getPermissionAPIList();

    const loggerDiff = R.symmetricDifference(loggerAPIList, baseAPIList);
    const permissionDiff = R.symmetricDifference(permissionAPIList, baseAPIList);
    if (loggerDiff.length > 0 || permissionDiff.length > 0) {
        console.error(`Logger diff: ${loggerDiff}`);
        console.error(`Logged but not in base: ${R.difference(loggerAPIList, baseAPIList)}`);
        console.error(`In base but not logged: ${R.difference(baseAPIList, loggerAPIList)}`);
        console.error(`Permission diff: ${permissionDiff}`);
        throw new Error('API processors are inconsistent');
    }


    let db = new LocalDBMS();

    //const permissionProxy = require(`./${projectName}/permissionProxy`);

    if (lastDb !== null) {
        // projectAPIs.populateDatabase(lastDb);
        db.setDatabase({ database: lastDb }).then(onSetDatabaseFinished);
    } else {
        log.info('init from default base');
        console.log(emptyBase.data);
        // projectAPIs.populateDatabase(emptyBase.data);
        db.setDatabase({ database: emptyBase.data }).then(onSetDatabaseFinished);
    }

    db = Logger.applyLoggerProxy(db, true);

    function onSetDatabaseFinished() {
        db.getConsistencyCheckResult().then((checkResult) => {
            const consoleLog = str => console.error(str);
            checkResult.errors.forEach(consoleLog);
            if (checkResult.errors.length > 0) {
                log.info('overview-consistency-problem-detected');
            } else {
                log.info('Consistency check didn\'t find errors');
            }
        }, log.error);
    }

    return {
        db,
        apiDb: projectAPIs.applyPermissionProxy(db, Precondition, Errors)
    };

    // exports.db = db;

    // exports.apiDb = projectAPIs.applyPermissionProxy(db, Precondition, Errors);
};

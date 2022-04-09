// const { EventEmitter } = require('events');
// const Ajv = require('ajv');
// const dateFormat = require('dateformat');
// //const R = require('ramda');

// //const Constants = require('dbms/constants');
// const Migrator = require('db-utils/migrator');
// const Logger = require('db-utils/logger');
// const Schema = require('db-utils/schema');
// const ProjectUtils = require('db-utils/projectUtils');
// // const Precondition = require('core/precondition');
// const Precondition = require('./precondition');

// // const CallNotificator = require('./callNotificator');

// /*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
//     limitations under the License. */

// /*global
//  Utils, Database, Migrator
//  */

// exports.makeDBMS = function () {
//     const listeners = {};

//     function addListener(eventName, callback) {
//         listeners[eventName] = listeners[eventName] || [];
//         listeners[eventName].push(callback);
//     }

//     const opts = {
//         Migrator,
//         CU,
//         ProjectUtils,
//         PU: ProjectUtils,
//         Precondition,
//         PC: Precondition,
//         EventEmitter,
//         R,
//         Ajv,
//         Schema,
//         Errors,
//         addListener,
//         Constants,
//         dbmsUtils: {},
//         dateFormat,
//     };

//     function LocalDBMS() {
//         this._init(listeners);
//     }

//     const funcList = {};
//     const func = R.curry((name) => {
//         const before = R.keys(LocalDBMS.prototype);
//         // eslint-disable-next-line global-require,import/no-dynamic-require
//         require(`core-apis/${name}`)(LocalDBMS, opts);
//         // window[name](LocalDBMS, opts);
//         const after = R.keys(LocalDBMS.prototype);
//         const diff = R.difference(after, before);
//         //        console.log(`${name} ${diff}`);
//         funcList[name] = R.zipObj(diff, R.repeat(true, diff.length));
//     });

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
//         'textSearchAPI',
//         'gearsAPI',
//         'slidersAPI',
//         'logAPI'

//     ].map(func);

//     // Logger.attachLogCalls(LocalDBMS, R, false);

//     const baseAPIList = R.keys(R.mergeAll(R.values(funcList)));
//     const loggerAPIList = R.difference(R.keys(R.mergeAll(R.values(Logger.apiInfo))), Logger.offlineIgnoreList);

//     const loggerDiff = R.symmetricDifference(loggerAPIList, baseAPIList);
//     // if (loggerDiff.length > 0) {
//     //     console.error(`Logger diff: ${loggerDiff}`);
//     //     console.error(`Logged but not in base: ${R.difference(loggerAPIList, baseAPIList)}`);
//     //     console.error(`In base but not logged: ${R.difference(baseAPIList, loggerAPIList)}`);
//     //     throw new Error('API processors are inconsistent');
//     // }

//     const dbms = new LocalDBMS();
//     // const proxy1 = CallNotificator.applyCallNotificatorProxy(dbms);
//     // const proxy2 = Logger.applyLoggerProxy(proxy1, false);
//     const proxy2 = Logger.applyLoggerProxy(dbms, false);

//     return proxy2;
// };

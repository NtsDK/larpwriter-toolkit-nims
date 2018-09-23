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

'use strict';

/* eslint-disable func-names */

((callback2) => {
    function baseAPI(LocalDBMS, opts) {
        const {
            Migrator, EventEmitter, Constants, CU, PC
        } = opts;

        LocalDBMS.prototype._init = function (listeners) {
            this.ee = new EventEmitter();
            const that = this;
            Object.keys(listeners).forEach((triggerName) => {
                listeners[triggerName].forEach((listener) => {
                    that.ee.on(triggerName, listener.bind(that));
                });
            });
        };

        LocalDBMS.prototype.getDatabase = function () {
          this.database.Meta.saveTime = new Date().toString();
          return Promise.resolve(CU.clone(this.database));
        };

        LocalDBMS.prototype.setDatabaseNew = function ({database}={}) {
            try {
                this.database = Migrator.migrate(database);
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            }
        };
        LocalDBMS.prototype.setDatabase = function (database, callback) {
            this.setDatabaseNew({database}).then(res => callback(res)).catch(callback);
        };

        LocalDBMS.prototype.getMetaInfoNew = function () {
            return Promise.resolve(CU.clone(this.database.Meta));
        };
        LocalDBMS.prototype.getMetaInfo = function (callback) {
            this.getMetaInfoNew().then(res => callback(null, res)).catch(callback);
        };
//  [
//      {
//          name: 'name',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'elementFromEnum',
//              arr: Constants.metaInfoStrings
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isString'
//          }]
//      },
//  ]
        // overview
        LocalDBMS.prototype.setMetaInfoStringNew = function ({name, value}={}) {
            return new Promise((resolve, reject) => {
                const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoStrings),
                    PC.isString(value)]);
                PC.precondition(chain, reject, () => {
                    this.database.Meta[name] = value;
                    resolve();
                });
            });
        };
        LocalDBMS.prototype.setMetaInfoString = function (name, value, callback) {
            this.setMetaInfoStringNew({name, value}).then(res => callback(undefined, res)).catch(callback);
        };
        
//  [
//      {
//          name: 'name',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'elementFromEnum',
//              arr: Constants.metaInfoDates
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'isDate',
//          }]
//      },
//  ]
        LocalDBMS.prototype.setMetaInfoDateNew = function ({name, value}={}) {
            return new Promise((resolve, reject) => {
                const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoDates),
                    PC.isString(value)]);
                PC.precondition(chain, reject, () => {
                    this.database.Meta[name] = value;
                    resolve();
                });
            });
        };
        LocalDBMS.prototype.setMetaInfoDate = function (name, value, callback) {
            this.setMetaInfoDateNew({name, value}).then(res => callback(undefined, res)).catch(callback);
        };
    }

    callback2(baseAPI);
})(api => (typeof exports === 'undefined' ? (this.baseAPI = api) : (module.exports = api)));

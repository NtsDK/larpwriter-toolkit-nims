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

        LocalDBMS.prototype.getDatabase = function (callback) {
            this.database.Meta.saveTime = new Date().toString();
            callback(null, CU.clone(this.database));
        };

        LocalDBMS.prototype.setDatabase = function (database, callback) {
            try {
                this.database = Migrator.migrate(database);
            } catch (err) {
                callback(err);
                return;
            }
            if (callback) callback();
        };

        LocalDBMS.prototype.getMetaInfo = function (callback) {
            callback(null, CU.clone(this.database.Meta));
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
        LocalDBMS.prototype.setMetaInfoString = function (name, value, callback) {
            const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoStrings),
                PC.isString(value)]);
            PC.precondition(chain, callback, () => {
                this.database.Meta[name] = value;
                if (callback) callback();
            });
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
        LocalDBMS.prototype.setMetaInfoDate = function (name, value, callback) {
            const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoDates),
                PC.isString(value)]);
            PC.precondition(chain, callback, () => {
                this.database.Meta[name] = value;
                if (callback) callback();
            });
        };
    }

    callback2(baseAPI);
})(api => (typeof exports === 'undefined' ? (this.baseAPI = api) : (module.exports = api)));

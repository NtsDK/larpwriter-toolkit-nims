/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

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

(function (callback) {
    function baseAPI(LocalDBMS, opts) {
        const Migrator = opts.Migrator;
        const CU = opts.CommonUtils;
        const PC = opts.Precondition;
        const EventEmitter = opts.EventEmitter;
        const Constants = opts.Constants;

        LocalDBMS.prototype._init = function (listeners) {
            this.ee = new EventEmitter();
            const that = this;
            for (var triggerName in listeners) {
                listeners[triggerName].forEach((listener) => {
                    that.ee.on(triggerName, listener.bind(that));
                });
            }
        };

        LocalDBMS.prototype.getDatabase = function (callback) {
            this.database.Meta.saveTime = new Date().toString();
            callback(null, CU.clone(this.database));
        };

        LocalDBMS.prototype.setDatabase = function (database, callback) {
            try {
                this.database = Migrator.migrate(database);
            } catch (err) {
                return callback(err);
            }
            if (callback) callback();
        };

        LocalDBMS.prototype.getMetaInfo = function (callback) {
            callback(null, CU.clone(this.database.Meta));
        };

        // overview
        LocalDBMS.prototype.setMetaInfo = function (name, value, callback) {
            const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoList), PC.isString(value)]);
            PC.precondition(chain, callback, () => {
                this.database.Meta[name] = value;
                if (callback) callback();
            });
        };
    }

    callback(baseAPI);
}((api) => {
    typeof exports === 'undefined' ? this.baseAPI = api : module.exports = api;
}));

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

/* eslint-disable func-names */

'use strict';

((callback2) => {
    function baseAPI(LocalDBMS, opts) {
        const { Migrator } = opts;
        const CU = opts.CommonUtils;
        const PC = opts.Precondition;
        const { EventEmitter } = opts;
        const { Constants } = opts;

        LocalDBMS.prototype.getDatabase = function (callback) {
            callback(null, this.bases[0]);
        };

        LocalDBMS.prototype.getBases = function (callback) {
            callback(null, this.bases);
        };

        const populateIndirectParams = (base) => {
            const indirectParams = base.measuredParams.filter(param => param.type === 'indirect');
            R.values(base.measures).forEach((measure) => {
                indirectParams.forEach((indirectParam) => {
                    measure[indirectParam.name] = R.sum(R.values(R.pick(indirectParam.sumOf, measure)));
                });
            });
        };

        LocalDBMS.prototype.setDatabase = function (database, callback) {
            database = Migrator.migrate(database);
            populateIndirectParams(database);
            this.bases = [database];
            if (callback) callback();
        };


        LocalDBMS.prototype._init = function (listeners) {
            this.ee = new EventEmitter();
            const that = this;
            const addListener = R.curry((triggerName, listener) => {
                that.ee.on(triggerName, listener.bind(that));
            });
            R.toPairs(listeners).forEach(([triggerName, listenerArr]) =>
                listenerArr.forEach(addListener(triggerName)));
        };
    }

    callback2(baseAPI);
})(api => (typeof exports === 'undefined' ? (this.baseAPI = api) : (module.exports = api)));

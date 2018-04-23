/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
    function gearsAPI(LocalDBMS, opts) {
        const {
            Migrator, EventEmitter, Constants, CU, PC
        } = opts;
        
        LocalDBMS.prototype.getAllGearsData = function (callback) {
            callback(null, CU.clone(this.database.Gears));
        };
        
        LocalDBMS.prototype.setGearsData = function (data, callback) {
            this.database.Gears.nodes = data.nodes;
            this.database.Gears.edges = data.edges;
            if (callback) callback();
        };
        
        LocalDBMS.prototype.setGearsPhysicsEnabled = function (enabled, callback) {
            this.database.Gears.settings.physicsEnabled = enabled;
            if (callback) callback();
        };
        
        LocalDBMS.prototype.setGearsShowNotesEnabled = function (enabled, callback) {
            this.database.Gears.settings.showNotes = enabled;
            if (callback) callback();
        };
    }

    callback2(gearsAPI);
})(api => (typeof exports === 'undefined' ? (this.gearsAPI = api) : (module.exports = api)));

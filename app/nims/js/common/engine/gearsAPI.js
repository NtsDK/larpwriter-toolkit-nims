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

        // DBMS.gears.get()
        LocalDBMS.prototype.getAllGearsData = function () {
            return Promise.resolve(CU.clone(this.database.Gears));
        };
        // DBMS.gears.set()
        LocalDBMS.prototype.setGearsData = function ({data}={}) {
            return new Promise((resolve, reject) => {
                this.database.Gears.nodes = data.nodes;
                this.database.Gears.edges = data.edges;
                resolve();
            });
        };

        // DBMS.gears.physics.set({enabled})
        LocalDBMS.prototype.setGearsPhysicsEnabled = function ({enabled}={}) {
            this.database.Gears.settings.physicsEnabled = enabled;
            return Promise.resolve();
        };

        // DBMS.gears.showNotes.set({enabled})
        LocalDBMS.prototype.setGearsShowNotesEnabled = function ({enabled}={}) {
            this.database.Gears.settings.showNotes = enabled;
            return Promise.resolve();
        };
    }

    callback2(gearsAPI);
})(api => (typeof exports === 'undefined' ? (this.gearsAPI = api) : (module.exports = api)));

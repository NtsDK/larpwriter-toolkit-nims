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

function makeLocalDBMS(fullVersion) {
    const opts = {
        Migrator,
        CommonUtils,
        EventEmitter,
        Precondition,
        R,
        Ajv,
        Schema,
        Errors,
        listeners: {},
        Constants,
        dbmsUtils: {},
        dateFormat,
    };

    function LocalDBMS() {
        this._init(opts.listeners);
    }

    LocalDBMS.prototype.getSettings = () => this.database.Settings;

    const func = name => window[name](LocalDBMS, opts);

    [
        'baseAPI',
        'consistencyCheckAPI',
        //        'logAPI',
        //        'charsheetAPI',
        //        'settingsAPI',
    ].map(func);

    //    Logger.attachLogCalls(LocalDBMS, R, false);
    return LocalDBMS;
}

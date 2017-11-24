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
    function api(LocalDBMS, opts) {
        const { Migrator } = opts;
        const CU = opts.CommonUtils;
        const PC = opts.Precondition;
        const { EventEmitter } = opts;
        const { Constants } = opts;

        LocalDBMS.prototype.getSettings = function (callback) {
            callback(null, CU.clone(this.database.Settings));
        };

        LocalDBMS.prototype.setBackgroundColor = function (color, callback) {
            const chain = PC.chainCheck([PC.isString(color), PC.patternCheck(color, CU.colorPattern)]);
            PC.precondition(chain, callback, () => {
                this.database.Settings.backgroundColor = color;
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.setCharsheetBackMode = function (charsheetBackMode, callback) {
            const chain = PC.chainCheck([PC.isString(charsheetBackMode),
                PC.elementFromEnum(charsheetBackMode, Constants.charsheetBackModes)]);
            PC.precondition(chain, callback, () => {
                this.database.Settings.charsheetBackMode = charsheetBackMode;
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.setCharsheetBackgroundColor = function (color, callback) {
            const chain = PC.chainCheck([PC.isString(color), PC.patternCheck(color, CU.colorPattern)]);
            PC.precondition(chain, callback, () => {
                this.database.Settings.charsheetBackColor = color;
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.setCharsheetBackImage = function (charsheetBackImage, callback) {
            const chain = PC.chainCheck([PC.isString(charsheetBackImage)]);
            PC.precondition(chain, callback, () => {
                this.database.Settings.charsheetBackImage = charsheetBackImage;
                if (callback) callback();
            });
        };
    }

    callback2(api);
})(api => (typeof exports === 'undefined' ? (this.settingsAPI = api) : (module.exports = api)));

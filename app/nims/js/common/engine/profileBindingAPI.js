/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
    function profileBindingAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, addListener, dbmsUtils, CU, PC
        } = opts;

        const path = ['ProfileBindings'];
        const charPath = ['Characters'];
        const playerPath = ['Players'];

        LocalDBMS.prototype.getProfileBindings = function (callback) {
            this.getProfileBindingsNew().then(res => callback(null, res)).catch(callback);
        };
        LocalDBMS.prototype.getProfileBindingsNew = function () {
            return Promise.resolve(CU.clone(R.path(path, this.database)));
        };

        LocalDBMS.prototype.getExtendedProfileBindings = function (callback) {
            this.getExtendedProfileBindingsNew().then(res => callback(null, res)).catch(callback);
        };
        LocalDBMS.prototype.getExtendedProfileBindingsNew = function () {
            let characters = R.keys(R.path(charPath, this.database));
            let players = R.keys(R.path(playerPath, this.database));
            const bindings = CU.clone(R.path(path, this.database));
            characters = R.difference(characters, R.keys(bindings));
            players = R.difference(players, R.values(bindings));

            const bindingData = R.reduce(R.concat, [], [R.toPairs(bindings),
                R.zip(characters, R.repeat('', characters.length)),
                R.zip(R.repeat('', players.length), players)]);
            return Promise.resolve(bindingData);
        };

        const _getProfileBinding = (type, name, db) => {
            let arr;
            if (type === 'character') {
                const bindings = R.path(path, db);
                arr = [name, bindings[name] || ''];
            } else {
                const bindings = R.invertObj(R.path(path, db));
                arr = [bindings[name] || '', name];
            }
            return arr;
        };

        dbmsUtils._getProfileBinding = _getProfileBinding;

        // DBMS.profileBindings.characters[name].get()
        LocalDBMS.prototype.getProfileBinding = function (type, name, callback) {
            this.getProfileBindingNew({type, name}).then(res => callback(null, res)).catch(callback);
        };

        LocalDBMS.prototype.getProfileBindingNew = function ({type, name}={}) {
            return new Promise((resolve, reject) => {
                const conditions = [PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes), PC.isString(name),
                    PC.entityExists(name, R.keys(this.database[type === 'character' ? 'Characters' : 'Players']))];
                PC.precondition(PC.chainCheck(conditions), reject, () => {
                    resolve(_getProfileBinding(type, name, this.database));
                });
            });
        };

        LocalDBMS.prototype.createBinding = function (characterName, playerName, callback) {
            this.createBindingNew({characterName, playerName}).then(res => callback()).catch(callback);
        };
        LocalDBMS.prototype.createBindingNew = function ({characterName, playerName}={}) {
            return new Promise((resolve, reject) => {
                const bindings = R.path(path, this.database);
                const conditions = [PC.isString(characterName),
                    PC.entityExists(characterName, R.keys(this.database.Characters)), PC.isString(playerName),
                    PC.entityExists(playerName, R.keys(this.database.Players)),
                    PC.entityIsNotUsed(characterName, R.keys(bindings)),
                    PC.entityIsNotUsed(playerName, R.keys(R.invertObj(bindings)))];
                PC.precondition(PC.chainCheck(conditions), reject, () => {
                    bindings[characterName] = playerName;
                    resolve();
                });
            })
        };

        LocalDBMS.prototype.removeBinding = function (characterName, playerName, callback) {
            this.removeBindingNew({characterName, playerName}).then(res => callback()).catch(callback);
        };
        LocalDBMS.prototype.removeBindingNew = function ({characterName, playerName}={}) {
            return new Promise((resolve, reject) => {
                const bindingArr = R.toPairs(R.path(path, this.database)).map(pair => `${pair[0]}/${pair[1]}`);
                const conditions = [PC.isString(characterName),
                    PC.entityExists(characterName, R.keys(this.database.Characters)),
                    PC.isString(playerName), PC.entityExists(playerName, R.keys(this.database.Players)),
                    PC.entityExists(`${characterName}/${playerName}`, bindingArr)];
                PC.precondition(PC.chainCheck(conditions), reject, () => {
                    delete R.path(path, this.database)[characterName];
                    resolve();
                });
            });
        };

        function _renameProfile({type, fromName, toName}={}) {
            const bindings = R.path(path, this.database);
            if (type === 'character') {
                const playerName = bindings[fromName];
                if (playerName !== undefined) {
                    bindings[toName] = playerName;
                    delete bindings[fromName];
                }
            } else if (type === 'player') {
                const invertedBindings = R.invertObj(bindings);
                const characterName = invertedBindings[fromName];
                if (characterName !== undefined) {
                    bindings[characterName] = toName;
                }
            } else {
                console.log(`binding._renameProfile: Unexpected type ${type}`);
            }
        }

        addListener('renameProfile', _renameProfile);

        function _removeProfile({type, characterName}={}) {
            const bindings = R.path(path, this.database);
            if (type === 'character') {
                delete bindings[characterName];
            } else if (type === 'player') {
                const invertedBindings = R.invertObj(bindings);
                const characterName2 = invertedBindings[characterName];
                if (characterName2 !== undefined) {
                    delete bindings[characterName2];
                }
            } else {
                console.log(`binding._removeProfile: Unexpected type ${type}`);
            }
        }

        addListener('removeProfile', _removeProfile);
    }

    callback2(profileBindingAPI);
})(api => (typeof exports === 'undefined' ? (this.profileBindingAPI = api) : (module.exports = api)));

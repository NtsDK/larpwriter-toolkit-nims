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
    function accessManagerAPI(LocalDBMS, opts) {
        const {
            R, addListener, Errors, Constants, CU, PC
        } = opts;

        LocalDBMS.prototype.getManagementInfo = function (callback) {
            this.getManagementInfoNew().then(res => callback(null, res)).catch(callback);
        }

        LocalDBMS.prototype.getManagementInfoNew = function () {
            return new Promise((resolve, reject) => {
                const { ManagementInfo } = this.database;
                const usersInfo = CU.clone(R.keys(ManagementInfo.UsersInfo).reduce((result, user) => {
                    result[user] = R.pick(['characters', 'groups', 'stories', 'players'], ManagementInfo.UsersInfo[user]);
                    return result;
                }, {}));
                resolve({
                    usersInfo,
                    admin: ManagementInfo.admin,
                    editor: ManagementInfo.editor,
                    adaptationRights: ManagementInfo.adaptationRights
                });
            });
        };

        LocalDBMS.prototype.assignAdmin = function (name, callback) {
            this.assignAdminNew({name}).then(res => callback()).catch(callback);
        }

        LocalDBMS.prototype.assignAdminNew = function ({name}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(
                    PC.entityExistsCheck(name, R.keys(this.database.ManagementInfo.UsersInfo)), reject,
                    () => {
                        this.database.ManagementInfo.admin = name;
                        this.publishPermissionsUpdate();
                        resolve();
                    }
                );
            });
        };

        LocalDBMS.prototype.assignEditor = function (name, callback) {
            this.assignEditorNew({name}).then(res => callback()).catch(callback);
        }

        LocalDBMS.prototype.assignEditorNew = function ({name}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(
                    PC.entityExistsCheck(name, R.keys(this.database.ManagementInfo.UsersInfo)), reject,
                    () => {
                        this.database.ManagementInfo.editor = name;
                        this.publishPermissionsUpdate();
                        resolve();
                    }
                );
            });
        };
        LocalDBMS.prototype.removeEditor = function (callback) {
            this.removeEditorNew({}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.removeEditorNew = function () {
            return new Promise((resolve, reject) => {
                this.database.ManagementInfo.editor = null;
                this.publishPermissionsUpdate();
                resolve();
            });
        };
        LocalDBMS.prototype.changeAdaptationRightsMode = function (mode, callback) {
            this.changeAdaptationRightsModeNew({mode}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.changeAdaptationRightsModeNew = function ({mode}={}) {
            return new Promise((resolve, reject) => {
                const chain = [PC.isString(mode), PC.elementFromEnum(mode, Constants.adaptationRightsModes)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    this.database.ManagementInfo.adaptationRights = mode;
                    this.publishPermissionsUpdate();
                    resolve();
                });
            });
        };

        LocalDBMS.prototype.removeOrganizer = function (name, callback) {
            this.removeOrganizerNew({name}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.removeOrganizerNew = function ({name}={}) {
            return new Promise((resolve, reject) => {
                const chain = [PC.isString(name),
                    PC.entityExistsCheck(name, R.keys(this.database.ManagementInfo.UsersInfo)),
                    PC.notEquals(name, this.database.ManagementInfo.admin)];
                PC.precondition(
                        PC.chainCheck(chain), reject,
                    () => {
                        delete this.database.ManagementInfo.UsersInfo[name];
                        if(this.database.ManagementInfo.editor === name){
                            this.database.ManagementInfo.editor = null;
                        }
                        this.publishPermissionsUpdate();
                        resolve();
                    }
                );
            });
        };

        LocalDBMS.prototype.getPlayerLoginsArray = function (callback) {
            this.getPlayerLoginsArrayNew().then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getPlayerLoginsArray = function () {
            return Promise.resolve(R.keys(this.database.ManagementInfo.PlayersInfo));
        };

        LocalDBMS.prototype.removePlayerLogin = function (userName, callback) {
            this.removePlayerLoginNew({userName}).then(res => callback()).catch(callback);
        }

        LocalDBMS.prototype.removePlayerLogin = function ({userName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(
                    PC.entityExistsCheck(userName, R.keys(this.database.ManagementInfo.PlayersInfo)), reject,
                    () => {
                        delete this.database.ManagementInfo.PlayersInfo[userName];
                        resolve();
                    }
                );
            });
        };

        LocalDBMS.prototype.getWelcomeText = function (callback) {
            this.getWelcomeTextNew().then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getWelcomeTextNew = function () {
            return Promise.resolve(this.database.ManagementInfo.WelcomeText);
        };

        LocalDBMS.prototype.setWelcomeText = function (text, callback) {
            this.setWelcomeTextNew({text}).then(res => callback()).catch(callback);
        }

        LocalDBMS.prototype.setWelcomeText = function ({text}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.isString(text), reject, () => {
                    this.database.ManagementInfo.WelcomeText = text;
                    resolve();
                });
            });
        };

        LocalDBMS.prototype.getPlayersOptions = function (callback) {
            this.getPlayersOptionsNew().then(res => callback(null, res)).catch(callback);
        };
        LocalDBMS.prototype.getPlayersOptionsNew = function () {
            return Promise.resolve(CU.clone(this.database.ManagementInfo.PlayersOptions));
        };

        LocalDBMS.prototype.setPlayerOption = function (name, value, callback) {
            this.setPlayerOptionNew({name, value}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.setPlayerOption = function ({name, value}={}) {
            return new Promise((resolve, reject) => {
                const chain = [PC.isString(name), PC.elementFromEnum(name, Constants.playersOptionTypes),
                    PC.isBoolean(value)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    this.database.ManagementInfo.PlayersOptions[name] = value;
                    resolve();
                });
            });
        };

        // LocalDBMS.prototype.createOrganizer = function (name, password, callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['createOrganizer']));
        // };

        // LocalDBMS.prototype.changeOrganizerPassword = function (userName, newPassword, callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['changeOrganizerPassword']));
        // };

        // LocalDBMS.prototype.publishPermissionsUpdate = function (callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['publishPermissionsUpdate']));
        // };

        // LocalDBMS.prototype.createPlayer = function (userName, password, callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['createPlayer']));
        // };

        // LocalDBMS.prototype.createPlayerLogin = function (userName, password, callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['createPlayerLogin']));
        // };

        // LocalDBMS.prototype.changePlayerPassword = function (userName, password, callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['changePlayerPassword']));
        // };

        // LocalDBMS.prototype.getPlayerProfileInfo = function (callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['getPlayerProfileInfo']));
        // };

        // LocalDBMS.prototype.createCharacterByPlayer = function (characterName, callback) {
        //     callback(new Errors.ValidationError('admins-function-must-be-overridden-on-server', ['createCharacterByPlayer']));
        // };

        function _renameProfile(type, fromName, toName) {
            if (type === 'character') return;
            if (this.database.ManagementInfo !== undefined) {
                const playersInfo = this.database.ManagementInfo.PlayersInfo;
                if (playersInfo[fromName] !== undefined) {
                    playersInfo[toName] = playersInfo[fromName];
                    playersInfo[toName].name = toName;
                    delete playersInfo[fromName];
                }
            }
        }

        addListener('renameProfile', _renameProfile);

        function _removeProfile(type, characterName) {
            if (type === 'character') return;
            if (this.database.ManagementInfo !== undefined) {
                const playersInfo = this.database.ManagementInfo.PlayersInfo;
                if (playersInfo[characterName] !== undefined) {
                    delete playersInfo[characterName];
                }
            }
        }

        addListener('removeProfile', _removeProfile);
    }

    callback2(accessManagerAPI);
})(api => (typeof exports === 'undefined' ? (this.accessManagerAPI = api) : (module.exports = api)));

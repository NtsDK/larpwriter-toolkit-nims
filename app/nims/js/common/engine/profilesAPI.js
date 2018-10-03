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

/* eslint-disable func-names,prefer-rest-params,prefer-destructuring */

((callback2) => {
    function profilesAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, addListener, CU, PC
        } = opts;

        function getPath(type) {
            if (type === 'character') return ['Characters'];
            if (type === 'player') return ['Players'];
            return null;
        }
        function getStructurePath(type) {
            if (type === 'character') return ['CharacterProfileStructure'];
            if (type === 'player') return ['PlayerProfileStructure'];
            return null;
        }

        const typeCheck = type => PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes)]);

        LocalDBMS.prototype.getProfileNamesArray = function (type, callback) {
            this.getProfileNamesArrayNew({type}).then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getProfileNamesArrayNew = function ({type}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    resolve(Object.keys(R.path(getPath(type), this.database)).sort(CU.charOrdA));
                });
            });
        };

        // profile, preview
        LocalDBMS.prototype.getProfile = function (type, name, callback) {
            this.getProfileNew({type, name}).then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getProfileNew = function ({type, name}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.entityExistsCheck(name, R.keys(container)), reject, () => {
                        resolve(CU.clone(container[name]));
                    });
                });
            });
        };
        // social network, character filter
        LocalDBMS.prototype.getAllProfiles = function (type, callback) {
            this.getAllProfilesNew({type}).then(res => callback(null, res)).catch(callback);
        }

        LocalDBMS.prototype.getAllProfilesNew = function ({type}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    resolve(CU.clone(R.path(getPath(type), this.database)));
                });
            });
        };

        // profiles
        LocalDBMS.prototype.createProfile = function (type, characterName, callback) {
            this.createProfileNew({type, characterName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.createProfileNew = function ({type, characterName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.createEntityCheck2(characterName, R.keys(container), 'entity-living-name', `entity-of-${type}`), reject, () => {
                        const newCharacter = {
                            name: characterName
                        };

                        R.path(getStructurePath(type), this.database).forEach((profileSettings) => {
                            if (profileSettings.type === 'enum') {
                                newCharacter[profileSettings.name] = profileSettings.value.split(',')[0];
                            } else if (profileSettings.type === 'multiEnum') {
                                newCharacter[profileSettings.name] = '';
                            } else {
                                newCharacter[profileSettings.name] = profileSettings.value;
                            }
                        });

                        R.path(getPath(type), this.database)[characterName] = newCharacter;
                        this.ee.trigger('createProfile', arguments);
                        resolve();
                    });
                });
            });
        };
        // profiles
        LocalDBMS.prototype.renameProfile = function (type, fromName, toName, callback) {
            this.renameProfileNew({type, fromName, toName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.renameProfileNew = function ({type, fromName, toName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container)), reject, () => {
                        const data = container[fromName];
                        data.name = toName;
                        container[toName] = data;
                        delete container[fromName];
                        this.ee.trigger('renameProfile', arguments);
                        resolve();
                    });
                });
            });
        };

        // profiles
        LocalDBMS.prototype.removeProfile = function (type, characterName, callback) {
            this.removeProfileNew({type, characterName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.removeProfileNew = function ({type, characterName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.removeEntityCheck(characterName, R.keys(container)), reject, () => {
                        delete container[characterName];
                        this.ee.trigger('removeProfile', arguments);
                        resolve();
                    });
                });
            });
        };

        const typeSpecificPreconditions = (itemType, itemDesc, value) => {
            switch (itemType) {
            case 'text':
            case 'string':
            case 'checkbox':
            case 'number':
                return PC.nil();
            case 'enum':
                return PC.elementFromEnum(value, itemDesc.value.split(','));
            case 'multiEnum':
                return PC.eitherCheck(
                    PC.elementsFromEnum(value.split(','), itemDesc.value.split(',')),
                    PC.isEmptyString(value)
                );
            default:
                throw new Error(`Unexpected itemType ${itemType}`);
            }
        };

        // profile editor
        LocalDBMS.prototype.updateProfileField = function (type, characterName, fieldName, itemType, value, callback) {
            this.updateProfileFieldNew({type, characterName, fieldName, itemType, value}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.updateProfileFieldNew = function ({type, characterName, fieldName, itemType, value}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    const containerStructure = R.path(getStructurePath(type), this.database);
                    const arr = [PC.entityExistsCheck(characterName, R.keys(container)),
                        PC.entityExistsCheck(
                            `${fieldName}/${itemType}`,
                            containerStructure.map(item => `${item.name}/${item.type}`)
                        ),
                        PC.getValueCheck(itemType)(value)];
                    PC.precondition(PC.chainCheck(arr), reject, () => {
                        const itemDesc = R.find(R.propEq('name', fieldName), containerStructure);
                        PC.precondition(typeSpecificPreconditions(itemType, itemDesc, value), reject, () => {
                            const profileInfo = container[characterName];
                            switch (itemType) {
                            case 'text':
                            case 'string':
                            case 'enum':
                            case 'multiEnum':
                            case 'checkbox':
                                profileInfo[fieldName] = value;
                                break;
                            case 'number':
                                profileInfo[fieldName] = Number(value);
                                break;
                            default:
                                reject(new Errors.InternalError('errors-unexpected-switch-argument', [itemType]));
                            }
                            resolve();
                        });
                    });
                });
            });
        };

        function _createProfileItem(type, name, itemType, value) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                profileSet[characterName][name] = value;
            });
        }

        addListener('createProfileItem', _createProfileItem);

        function _removeProfileItem(type, index, profileItemName) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                delete profileSet[characterName][profileItemName];
            });
        }

        addListener('removeProfileItem', _removeProfileItem);

        function _changeProfileItemType(type, profileItemName, newType) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                profileSet[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
            });
        }

        addListener('changeProfileItemType', _changeProfileItemType);

        function _renameProfileItem(type, newName, oldName) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                const tmp = profileSet[characterName][oldName];
                delete profileSet[characterName][oldName];
                profileSet[characterName][newName] = tmp;
            });
        }

        addListener('renameProfileItem', _renameProfileItem);

        function _replaceEnumValue(type, profileItemName, defaultValue, newOptionsMap) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                const enumValue = profileSet[characterName][profileItemName];
                if (!newOptionsMap[enumValue]) {
                    profileSet[characterName][profileItemName] = defaultValue;
                }
            });
        }

        addListener('replaceEnumValue', _replaceEnumValue);

        function _replaceMultiEnumValue(type, profileItemName, defaultValue, newOptionsMap) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                let value = profileSet[characterName][profileItemName];
                if (value !== '') {
                    value = R.intersection(value.split(','), R.keys(newOptionsMap));
                    profileSet[characterName][profileItemName] = value.join(',');
                }
            });
        }

        addListener('replaceMultiEnumValue', _replaceMultiEnumValue);

        function _renameEnumValue(type, profileItemName, fromValue, toValue) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                const enumValue = profileSet[characterName][profileItemName];
                if(enumValue === fromValue){
                    profileSet[characterName][profileItemName] = toValue;
                }
            });
        }
        addListener('renameEnumValue', _renameEnumValue);

        function _renameMultiEnumValue(type, profileItemName, fromValue, toValue) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                let value = profileSet[characterName][profileItemName];
                if (value !== '') {
                    const list = value.split(',');
                    if(R.contains(fromValue, list)){
                        list[R.indexOf(fromValue, list)] = toValue;
                        profileSet[characterName][profileItemName] = list.join(',');
                    }
                }
            });
        }
        addListener('renameMultiEnumValue', _renameMultiEnumValue);
    }

    callback2(profilesAPI);
})(api => (typeof exports === 'undefined' ? (this.profilesAPI = api) : (module.exports = api)));

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

(function (callback) {
    function profilesAPI(LocalDBMS, opts) {
        const R = opts.R;
        const CU = opts.CommonUtils;
        const PC = opts.Precondition;
        const Constants = opts.Constants;
        const Errors = opts.Errors;
        const listeners = opts.listeners;

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

        const typeCheck = function (type) {
            return PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes)]);
        };

        LocalDBMS.prototype.getProfileNamesArray = function (type, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                callback(null, Object.keys(R.path(getPath(type), this.database)).sort(CU.charOrdA));
            });
        };

        // profile, preview
        LocalDBMS.prototype.getProfile = function (type, name, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                const container = R.path(getPath(type), this.database);
                PC.precondition(PC.entityExistsCheck(name, R.keys(container)), callback, () => {
                    callback(null, CU.clone(container[name]));
                });
            });
        };
        // social network, character filter
        LocalDBMS.prototype.getAllProfiles = function (type, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                callback(null, CU.clone(R.path(getPath(type), this.database)));
            });
        };

        // profiles
        LocalDBMS.prototype.createProfile = function (type, characterName, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                const container = R.path(getPath(type), this.database);
                PC.precondition(PC.createEntityCheck(characterName, R.keys(container)), callback, () => {
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
                    if (callback) callback();
                });
            });
        };
        // profiles
        LocalDBMS.prototype.renameProfile = function (type, fromName, toName, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                const container = R.path(getPath(type), this.database);
                PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container)), callback, () => {
                    const data = container[fromName];
                    data.name = toName;
                    container[toName] = data;
                    delete container[fromName];

                    this.ee.trigger('renameProfile', arguments);

                    if (callback) callback();
                });
            });
        };

        // profiles
        LocalDBMS.prototype.removeProfile = function (type, characterName, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                const container = R.path(getPath(type), this.database);
                PC.precondition(PC.removeEntityCheck(characterName, R.keys(container)), callback, () => {
                    delete container[characterName];
                    this.ee.trigger('removeProfile', arguments);
                    if (callback) callback();
                });
            });
        };

        const typeSpecificPreconditions = function (itemType, itemDesc, value) {
            switch (itemType) {
            case 'text':
            case 'string':
            case 'checkbox':
            case 'number':
                return PC.nil();
            case 'enum':
                return PC.elementFromEnum(value, itemDesc.value.split(','));
            case 'multiEnum':
                return PC.eitherCheck(PC.elementsFromEnum(value.split(','), itemDesc.value.split(',')), PC.isEmptyString(value));
            }
        };

        // profile editor
        LocalDBMS.prototype.updateProfileField = function (type, characterName, fieldName, itemType, value, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                const container = R.path(getPath(type), this.database);
                const containerStructure = R.path(getStructurePath(type), this.database);
                const arr = [PC.entityExistsCheck(characterName, R.keys(container)),
                    PC.entityExistsCheck(`${fieldName}/${itemType}`, containerStructure.map(item => `${item.name}/${item.type}`)),
                    PC.getValueCheck(itemType)(value)];
                PC.precondition(PC.chainCheck(arr), callback, () => {
                    const itemDesc = R.find(R.propEq('name', fieldName), containerStructure);
                    PC.precondition(typeSpecificPreconditions(itemType, itemDesc, value), callback, () => {
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
                            callback(new Errors.InternalError('errors-unexpected-switch-argument', [itemType]));
                        }
                        if (callback) callback();
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

        listeners.createProfileItem = listeners.createProfileItem || [];
        listeners.createProfileItem.push(_createProfileItem);

        function _removeProfileItem(type, index, profileItemName) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                delete profileSet[characterName][profileItemName];
            });
        }

        listeners.removeProfileItem = listeners.removeProfileItem || [];
        listeners.removeProfileItem.push(_removeProfileItem);

        function _changeProfileItemType(type, profileItemName, newType) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                profileSet[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
            });
        }

        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(type, newName, oldName) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                const tmp = profileSet[characterName][oldName];
                delete profileSet[characterName][oldName];
                profileSet[characterName][newName] = tmp;
            });
        }

        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);

        function _replaceEnumValue(type, profileItemName, defaultValue, newOptionsMap) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                const enumValue = profileSet[characterName][profileItemName];
                if (!newOptionsMap[enumValue]) {
                    profileSet[characterName][profileItemName] = defaultValue;
                }
            });
        }

        listeners.replaceEnumValue = listeners.replaceEnumValue || [];
        listeners.replaceEnumValue.push(_replaceEnumValue);

        function _replaceMultiEnumValue(type, profileItemName, defaultValue, newOptionsMap) {
            const profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach((characterName) => {
                if (value !== '') {
                    var value = profileSet[characterName][profileItemName];
                    value = R.intersection(value.split(','), R.keys(newOptionsMap));
                    profileSet[characterName][profileItemName] = value.join(',');
                }
            });
        }

        listeners.replaceMultiEnumValue = listeners.replaceMultiEnumValue || [];
        listeners.replaceMultiEnumValue.push(_replaceMultiEnumValue);
    }

    callback(profilesAPI);
}((api) => {
    typeof exports === 'undefined' ? this.profilesAPI = api : module.exports = api;
}));

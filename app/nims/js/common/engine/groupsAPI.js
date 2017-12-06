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

/* eslint-disable func-names,prefer-rest-params */

((callback2) => {
    function groupsAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, listeners
        } = opts;
        const CU = opts.CommonUtils;
        const PU = opts.ProjectUtils;
        const PC = opts.Precondition;

        LocalDBMS.prototype.getGroupNamesArray = function (callback) {
            callback(null, Object.keys(this.database.Groups).sort(CU.charOrdA));
        };

        const groupCheck = (groupName, database) => PC.chainCheck([PC.isString(groupName),
            PC.entityExists(groupName, R.keys(database.Groups))]);

        LocalDBMS.prototype.getGroup = function (groupName, callback) {
            PC.precondition(groupCheck(groupName, this.database), callback, () => {
                callback(null, CU.clone(this.database.Groups[groupName]));
            });
        };

        const _getCharacterGroupTexts = (groups, info, profileId) => {
            const dataArray = PU.getDataArray(info, profileId);
            const array = R.values(groups)
                .filter(group => group.doExport && PU.acceptDataRow(group.filterModel, dataArray)).map(group => ({
                    groupName: group.name,
                    text: group.characterDescription
                }));
            array.sort(CU.charOrdAFactory(R.prop('groupName')));
            return array;
        };

        // preview
        LocalDBMS.prototype.getCharacterGroupTexts = function (characterName, callback) {
            const that = this;
            this.getProfileBinding('character', characterName, (err, profileId) => {
                if (err) { callback(err); return; }
                that.getProfileFilterInfo((err2, info) => {
                    if (err2) { callback(err2); return; }
                    callback(null, _getCharacterGroupTexts(that.database.Groups, info, profileId));
                });
            });
        };

        // export
        LocalDBMS.prototype.getAllCharacterGroupTexts = function (callback) {
            const that = this;
            this.getProfileFilterInfo((err, info) => {
                if (err) { callback(err); return; }
                that.getProfileBindings((err2, bindings) => {
                    if (err2) { callback(err2); return; }
                    const texts = Object.keys(that.database.Characters).reduce((result, characterName) => {
                        const profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                        result[characterName] = _getCharacterGroupTexts(that.database.Groups, info, profileId);
                        return result;
                    }, {});
                    callback(null, texts);
                });
            });
        };

        LocalDBMS.prototype.createGroup = function (groupName, callback) {
            PC.precondition(PC.createEntityCheck(groupName, R.keys(this.database.Groups)), callback, () => {
                const newGroup = {
                    name: groupName,
                    masterDescription: '',
                    characterDescription: '',
                    filterModel: [],
                    doExport: true
                };

                this.database.Groups[groupName] = newGroup;
                this.ee.trigger('createGroup', arguments);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.renameGroup = function (fromName, toName, callback) {
            PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(this.database.Groups)), callback, () => {
                const data = this.database.Groups[fromName];
                data.name = toName;
                this.database.Groups[toName] = data;
                delete this.database.Groups[fromName];
                this.ee.trigger('renameGroup', arguments);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.removeGroup = function (groupName, callback) {
            PC.precondition(PC.removeEntityCheck(groupName, R.keys(this.database.Groups)), callback, () => {
                delete this.database.Groups[groupName];
                this.ee.trigger('removeGroup', arguments);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.saveFilterToGroup = function (groupName, filterModel, callback) {
            PC.precondition(groupCheck(groupName, this.database), callback, () => {
                const conflictTypes = PU.isFilterModelCompatibleWithProfiles({
                    characters: this.database.CharacterProfileStructure,
                    players: this.database.PlayerProfileStructure
                }, filterModel);
                if (conflictTypes.length !== 0) {
                    callback(new Errors.ValidationError('groups-page-filter-is-incompatible-with-base-profiles', [conflictTypes.join(',')]));
                    return;
                }
                this.database.Groups[groupName].filterModel = filterModel;
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.updateGroupField = function (groupName, fieldName, value, callback) {
            const chain = PC.chainCheck([groupCheck(groupName, this.database),
                PC.isString(fieldName), PC.elementFromEnum(fieldName, Constants.groupEditableItems),
                fieldName === 'doExport' ? PC.isBoolean(value) : PC.isString(value)]);
            PC.precondition(chain, callback, () => {
                const profileInfo = this.database.Groups[groupName];
                profileInfo[fieldName] = value;
                if (callback) callback();
            });
        };

        const initProfileInfo = (that, type, ownerMapType, callback) => {
            that.getAllProfiles(type, (err, profiles) => {
                if (err) { callback(err); return; }
                let owners = R.keys(profiles);
                if (that._getOwnerMap) {
                    owners = that._getOwnerMap(ownerMapType);
                } else {
                    owners = R.zipObj(owners, R.repeat('user', owners.length));
                }
                that.getProfileStructure(type, (err2, profileStructure) => {
                    if (err2) { callback(err2); return; }
                    callback(null, {
                        profileStructure,
                        owners,
                        profiles
                    });
                });
            });
        };

        LocalDBMS.prototype.getProfileFilterInfo = function (callback) {
            const that = this;
            initProfileInfo(that, 'character', 'Characters', (err, charactersInfo) => {
                if (err) { callback(err); return; }
                initProfileInfo(that, 'player', 'Players', (err2, playersInfo) => {
                    if (err2) { callback(err2); return; }
                    that.getCharactersSummary((err3, charactersSummary) => {
                        if (err3) { callback(err3); return; }
                        that.getExtendedProfileBindings((err4, bindingData) => {
                            if (err4) { callback(err4); return; }
                            const info = PU.makeGroupedProfileFilterInfo({
                                characters: charactersInfo,
                                players: playersInfo,
                                charactersSummary,
                                bindingData
                            });
                            callback(null, info);
                        });
                    });
                });
            });
        };

        const _getGroupCharacterSets = (groups, characterNames, bindings, info) => {
            const groupNames = R.keys(groups);
            const groupCharacterSets = R.zipObj(groupNames, R.ap([R.clone], R.repeat({}, groupNames.length)));
            characterNames.forEach((characterName) => {
                const profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                const dataArray = PU.getDataArray(info, profileId);
                groupNames.forEach((groupName) => {
                    if (PU.acceptDataRow(groups[groupName].filterModel, dataArray)) {
                        groupCharacterSets[groupName][characterName] = true;
                    }
                });
            });
            return groupCharacterSets;
        };

        LocalDBMS.prototype.getGroupCharacterSets = function (callback) {
            const that = this;
            this.getProfileFilterInfo((err, info) => {
                if (err) { callback(err); return; }
                callback(null, _getGroupCharacterSets(
                    that.database.Groups, R.keys(that.database.Characters),
                    R.clone(that.database.ProfileBindings), info
                ));
            });
        };

        function _removeProfileItem(type, index, profileItemName) {
            const prefix = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX);
            const subFilterName = prefix + profileItemName;
            const that = this;
            Object.keys(this.database.Groups).forEach((groupName) => {
                const group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.filter(filterItem => filterItem.name !== subFilterName);
            });
        }

        listeners.removeProfileItem = listeners.removeProfileItem || [];
        listeners.removeProfileItem.push(_removeProfileItem);

        function _changeProfileItemType(type, profileItemName, newType) {
            _removeProfileItem.apply(this, [type, -1, profileItemName]);
        }

        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(type, newName, oldName) {
            const prefix = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX);
            const subFilterName = prefix + oldName;
            const that = this;
            Object.keys(this.database.Groups).forEach((groupName) => {
                const group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.map((filterItem) => {
                    if (filterItem.name === subFilterName) {
                        filterItem.name = prefix + newName;
                    }
                    return filterItem;
                });
            });
        }

        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);

        function _replaceEnumValue(type, profileItemName, defaultValue, newOptionsMap) {
            const subFilterName = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX) +
                profileItemName;
            const that = this;
            Object.keys(this.database.Groups).forEach((groupName) => {
                const group = that.database.Groups[groupName];
                group.filterModel.forEach((filterItem) => {
                    if (filterItem.name === subFilterName) {
                        R.keys(filterItem.selectedOptions).forEach((selectedOption) => {
                            if (!newOptionsMap[selectedOption]) {
                                delete filterItem.selectedOptions[selectedOption];
                            }
                        });
                    }
                });
            });
            Object.keys(this.database.Groups).forEach((groupName) => {
                const group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.filter((filterItem) => {
                    if (filterItem.name !== subFilterName) {
                        return true;
                    }
                    return Object.keys(filterItem.selectedOptions).length !== 0;
                });
            });
        }

        listeners.replaceEnumValue = listeners.replaceEnumValue || [];
        listeners.replaceEnumValue.push(_replaceEnumValue);

        listeners.replaceMultiEnumValue = listeners.replaceMultiEnumValue || [];
        listeners.replaceMultiEnumValue.push(_replaceEnumValue);
    }

    callback2(groupsAPI);
})(api => (typeof exports === 'undefined' ? (this.groupsAPI = api) : (module.exports = api)));

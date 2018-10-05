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
            R, Constants, Errors, addListener, CU, PC, PU
        } = opts;

        LocalDBMS.prototype.getGroupNamesArrayNew = function () {
            return Promise.resolve(Object.keys(this.database.Groups).sort(CU.charOrdA));
        };
        // DBMS.groups.names.get()
        const groupCheck = (groupName, database) => PC.chainCheck([PC.isString(groupName),
            PC.entityExists(groupName, R.keys(database.Groups))]);

//        [
//            {
//                name: 'groupName',
//                check: [{
//                    type: 'isString'
//                }, {
//                    type: 'entityExists',
//                    arr: (db) => R.keys(db.Groups)
//                }]
//            }
//        ]
        // DBMS.groups[].get()
        LocalDBMS.prototype.getGroupNew = function ({groupName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(groupCheck(groupName, this.database), reject, () => {
                    resolve(CU.clone(this.database.Groups[groupName]));
                });
            })
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
        // DBMS.groups.find({characterName}).get({characterText})
        LocalDBMS.prototype.getCharacterGroupTextsNew = function ({characterName}={}) {
            return new Promise((resolve, reject) => {
                Promise.all([
                    this.getProfileBindingNew({type: 'character', name: characterName}),
                    this.getProfileFilterInfoNew()
                ]).then(results => {
                    const [profileId, info] = results;
                    resolve(_getCharacterGroupTexts(this.database.Groups, info, profileId));
                }).catch(reject);
            });
        };

        // export
        // DBMS.group.groupBy({characterName}).map({characterText})
        LocalDBMS.prototype.getAllCharacterGroupTextsNew = function () {
            return new Promise((resolve, reject) => {
                const that = this;
                Promise.all([
                    this.getProfileFilterInfoNew(),
                    this.getProfileBindingsNew()
                ]).then(results => {
                    const [info, bindings] = results;
                    const texts = Object.keys(that.database.Characters).reduce((result, characterName) => {
                        const profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                        result[characterName] = _getCharacterGroupTexts(that.database.Groups, info, profileId);
                        return result;
                    }, {});
                    resolve(texts);
                }).catch(reject);
            });
        };

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'stringIsNotEmpty'
//          }, {
//              type: 'entityIsNotUsed',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      }
//  ]
        // DBMS.groups.create({name})
        LocalDBMS.prototype.createGroupNew = function ({groupName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.createEntityCheck2(groupName, R.keys(this.database.Groups), 'entity-lifeless-name', 'entity-of-group'), reject, () => {
                    const newGroup = {
                        name: groupName,
                        masterDescription: '',
                        characterDescription: '',
                        filterModel: [],
                        doExport: true
                    };

                    this.database.Groups[groupName] = newGroup;
                    this.ee.trigger('createGroup', arguments);
                    resolve();
                });
            });
        };

//  [
//      {
//          name: 'fromName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//      {
//          name: 'toName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'stringIsNotEmpty'
//          }, {
//              type: 'entityIsNotUsed',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      }
//  ]
        // DBMS.groups[name].rename({newName})
        LocalDBMS.prototype.renameGroupNew = function ({fromName, toName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(this.database.Groups)), reject, () => {
                    const data = this.database.Groups[fromName];
                    data.name = toName;
                    this.database.Groups[toName] = data;
                    delete this.database.Groups[fromName];
                    this.ee.trigger('renameGroup', arguments);
                    resolve();
                });
            });
        };

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//  ]
        // DBMS.groups.remove({name})
        LocalDBMS.prototype.removeGroupNew = function ({groupName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.removeEntityCheck(groupName, R.keys(this.database.Groups)), reject, () => {
                    delete this.database.Groups[groupName];
                    this.ee.trigger('removeGroup', arguments);
                    resolve();
                });
            });
        };

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//  ]
        // DBMS.groups[name].filter.set({filter})
        LocalDBMS.prototype.saveFilterToGroupNew = function ({groupName, filterModel}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(groupCheck(groupName, this.database), reject, () => {
                    const conflictTypes = PU.isFilterModelCompatibleWithProfiles({
                        characters: this.database.CharacterProfileStructure,
                        players: this.database.PlayerProfileStructure
                    }, filterModel);
                    if (conflictTypes.length !== 0) {
                        reject(new Errors.ValidationError('groups-page-filter-is-incompatible-with-base-profiles', [conflictTypes.join(',')]));
                        return;
                    }
                    this.database.Groups[groupName].filterModel = filterModel;
                    resolve();
                });
            });
        };

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//      {
//          name: 'fieldName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'elementFromEnum',
//              arr: Constants.groupEditableItems
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isString'
//          }]
//      },
//  ]
        // DBMS.groups[name][fieldName].set({value})
        LocalDBMS.prototype.updateGroupFieldNew = function ({groupName, fieldName, value}={}) {
            return new Promise((resolve, reject) => {
                const chain = PC.chainCheck([groupCheck(groupName, this.database),
                    PC.isString(fieldName), PC.elementFromEnum(fieldName, Constants.groupEditableItems),
                    PC.isString(value)]);
                PC.precondition(chain, reject, () => {
                    const profileInfo = this.database.Groups[groupName];
                    profileInfo[fieldName] = value;
                    resolve();
                });
            });
        };

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isBoolean'
//          }]
//      },
//  ]
        LocalDBMS.prototype.doExportGroupNew = function ({groupName, value}={}) {
            return new Promise((resolve, reject) => {
                const chain = PC.chainCheck([groupCheck(groupName, this.database), PC.isBoolean(value)]);
                PC.precondition(chain, reject, () => {
                    const profileInfo = this.database.Groups[groupName];
                    profileInfo['doExport'] = value;
                    resolve();
                });
            });
        };

        const initProfileInfo = (that, type, ownerMapType) => {
            return new Promise((resolve, reject) => {
                Promise.all([
                    that.getAllProfilesNew({type}),
                    that.getProfileStructureNew({type}),
                ]).then(results => {
                    const [profiles, profileStructure] = results;
                    let owners = R.keys(profiles);
                    if (that._getOwnerMap) {
                        owners = that._getOwnerMap(ownerMapType);
                    } else {
                        owners = R.zipObj(owners, R.repeat('user', owners.length));
                    }
                    resolve({
                        profileStructure,
                        owners,
                        profiles
                    });
                }).catch(reject);
            });
        };

        // DBMS.groups.profileFilterInfo.get()
        LocalDBMS.prototype.getProfileFilterInfoNew = function () {
            return new Promise((resolve, reject) => {
                const that = this;
                Promise.all([
                    initProfileInfo(that, 'character', 'Characters'),
                    initProfileInfo(that, 'player', 'Players'),
                    that.getCharactersSummaryNew(),
                    that.getExtendedProfileBindingsNew(),
                ]).then(results => {
                    const [charactersInfo, playersInfo, charactersSummary, bindingData] = results;
                    const info = PU.makeGroupedProfileFilterInfo({
                        characters: charactersInfo,
                        players: playersInfo,
                        charactersSummary,
                        bindingData
                    });
                    resolve(info);
                }).catch(reject);
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

        LocalDBMS.prototype.getGroupCharacterSetsNew = function () {
            return new Promise((resolve, reject) => {
                const that = this;
                this.getProfileFilterInfoNew().then((info) => {
                    resolve(_getGroupCharacterSets(
                        that.database.Groups, R.keys(that.database.Characters),
                        R.clone(that.database.ProfileBindings), info
                    ));
                }).catch(reject)
            });
        };

        function _removeProfileItem({type, index, profileItemName}={}) {
            const prefix = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX);
            const subFilterName = prefix + profileItemName;
            const that = this;
            Object.keys(this.database.Groups).forEach((groupName) => {
                const group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.filter(filterItem => filterItem.name !== subFilterName);
            });
        }

        addListener('removeProfileItem', _removeProfileItem);

        function _changeProfileItemType({type, profileItemName, newType}={}) {
            _removeProfileItem.apply(this, [{type, index: -1, profileItemName}]);
        }

        addListener('changeProfileItemType', _changeProfileItemType);

        function _renameProfileItem({type, newName, oldName}={}) {
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

        addListener('renameProfileItem', _renameProfileItem);

        function _replaceEnumValue({type, profileItemName, defaultValue, newOptionsMap}={}) {
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

        addListener('replaceEnumValue', _replaceEnumValue);

        addListener('replaceMultiEnumValue', _replaceEnumValue);

        function _renameEnumValue({type, profileItemName, fromValue, toValue}={}) {
            const subFilterName = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX) +
                profileItemName;
            const that = this;
            Object.keys(this.database.Groups).forEach((groupName) => {
                const group = that.database.Groups[groupName];
                group.filterModel.forEach((filterItem) => {
                    if (filterItem.name === subFilterName) {
                        if(filterItem.selectedOptions[fromValue]){
                            delete filterItem.selectedOptions[fromValue];
                            filterItem.selectedOptions[toValue] = true;
                        }
                    }
                });
            });
        }

        addListener('renameEnumValue', _renameEnumValue);

        addListener('renameMultiEnumValue', _renameEnumValue);
    }

    callback2(groupsAPI);
})(api => (typeof exports === 'undefined' ? (this.groupsAPI = api) : (module.exports = api)));

// const R = require('ramda');
const Constants = require('./constants');
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

const R = require('ramda');

// ((callback) => {
    // function ProjectUtils(exports, R, Constants, Errors, CU) {
        exports.acceptDataRow = R.curry((model, dataString) => {
            const dataMap = R.indexBy(R.prop('itemName'), dataString);
            return model.every((filterItem) => {
                let regex, result, values;
                result = true;
                const { value } = dataMap[filterItem.name];
                if (value === undefined) {
                    result = false;
                    return result;
                }
                switch (filterItem.type) {
                case 'enum':
                case 'checkbox':
                    if (!filterItem.selectedOptions[value]) {
                        result = false;
                    }
                    break;
                case 'multiEnum':
                    values = value === '' ? [] : value.split(',');
                    switch (filterItem.condition) {
                    case 'every':
                        if (R.keys(filterItem.selectedOptions).length === 0) {
                            result = false;
                        } else {
                            result = R.difference(R.keys(filterItem.selectedOptions), values).length === 0;
                        }
                        break;
                    case 'some':
                        result = R.difference(values, R.keys(filterItem.selectedOptions)).length !== values.length;
                        break;
                    case 'equal':
                        result = R.symmetricDifference(values, R.keys(filterItem.selectedOptions)).length === 0;
                        break;
                    default:
                        throw new Error(`Unexpected condition ${filterItem.condition}`);
                    }
                    break;
                case 'number':
                    switch (filterItem.condition) {
                    case 'greater':
                        result = value > filterItem.num;
                        break;
                    case 'equal':
                        result = value === filterItem.num;
                        break;
                    case 'lesser':
                        result = value < filterItem.num;
                        break;
                    default:
                        throw new Error(`Unexpected condition ${filterItem.condition}`);
                    }
                    break;
                case 'text':
                case 'string':
                    result = value.toLowerCase().indexOf(filterItem.regexString.toLowerCase()) !== -1;
                    break;
                default:
                    throw new Error(`Unexpected type ${filterItem.type}`);
                }
                return result;
            });
        });

        exports.makeGroupedProfileFilterInfo = (opts) => {
            const groupedProfileFilterItems = [];
            let arr = [];
            arr.push({
                name: Constants.CHAR_NAME,
                type: 'string',
                displayName: 'profile-filter-character',
            });
            arr.push({
                name: Constants.CHAR_OWNER,
                type: 'string',
                displayName: 'profile-filter-character-owner',
            });
            arr = arr.concat(opts.characters.profileStructure.map(element => ({
                name: Constants.CHAR_PREFIX + element.name,
                type: element.type,
                displayName: element.name,
                value: element.value
            })));
            groupedProfileFilterItems.push({
                name: 'characterFilterItems',
                profileFilterItems: arr
            });

            arr = [];
            arr.push({
                name: Constants.PLAYER_NAME,
                type: 'string',
                displayName: 'profile-filter-player-name',
            });
            arr.push({
                name: Constants.PLAYER_OWNER,
                type: 'string',
                displayName: 'profile-filter-player-owner',
            });
            arr = arr.concat(opts.players.profileStructure.map(element => ({
                name: Constants.PLAYER_PREFIX + element.name,
                type: element.type,
                displayName: element.name,
                value: element.value
            })));
            groupedProfileFilterItems.push({
                name: 'playerFilterItems',
                profileFilterItems: arr
            });

            arr = Constants.summaryStats.map(stat => ({
                name: Constants.SUMMARY_PREFIX + stat[0],
                type: 'number',
                displayName: stat[1],
            }));
            groupedProfileFilterItems.push({
                name: 'summaryFilterItems',
                profileFilterItems: arr
            });
            opts.groupedProfileFilterItems = groupedProfileFilterItems;
            return opts;
        };

        const getCharacterInfoValue = (info, characterName, profileItemName) => {
            if (profileItemName === Constants.CHAR_NAME) {
                return characterName;
            } else if (profileItemName === Constants.CHAR_OWNER) {
                return info.characters.owners[characterName];
            } else if (R.startsWith(Constants.SUMMARY_PREFIX, profileItemName)) {
                return info.charactersSummary[characterName][profileItemName.substring(Constants
                    .SUMMARY_PREFIX.length)];
            } else if (R.startsWith(Constants.CHAR_PREFIX, profileItemName)) {
                return info.characters.profiles[characterName][profileItemName.substring(Constants
                    .CHAR_PREFIX.length)];
            }
            throw new Error(`Unexpected profileItemName: ${profileItemName}`);
        };
        const getCharacterInfoValue2 = (info, profileId, profileItemName) => {
            if (profileItemName === Constants.CHAR_NAME ||
                    profileItemName === Constants.CHAR_OWNER ||
                    R.startsWith(Constants.SUMMARY_PREFIX, profileItemName, ) ||
                    R.startsWith(Constants.CHAR_PREFIX, profileItemName)) {
                if (profileId[0] === '') return undefined;
                const characterName = profileId[0];
                if (profileItemName === Constants.CHAR_NAME) {
                    return characterName;
                } else if (profileItemName === Constants.CHAR_OWNER) {
                    return info.characters.owners[characterName];
                } else if (R.startsWith(Constants.SUMMARY_PREFIX, profileItemName)) {
                    return info.charactersSummary[characterName][profileItemName.substring(Constants
                        .SUMMARY_PREFIX.length)];
                } else if (R.startsWith(Constants.CHAR_PREFIX, profileItemName)) {
                    return info.characters.profiles[characterName][profileItemName.substring(Constants
                        .CHAR_PREFIX.length)];
                }
            } else if (profileItemName === Constants.PLAYER_NAME ||
                    profileItemName === Constants.PLAYER_OWNER ||
                    R.startsWith(Constants.PLAYER_PREFIX, profileItemName)) {
                if (profileId[1] === '') return undefined;
                const playerName = profileId[1];
                if (profileItemName === Constants.PLAYER_NAME) {
                    return playerName;
                } else if (profileItemName === Constants.PLAYER_OWNER) {
                    return info.players.owners[playerName];
                } else if (R.startsWith(Constants.PLAYER_PREFIX, profileItemName)) {
                    return info.players.profiles[playerName][profileItemName.substring(Constants.PLAYER_PREFIX.length)];
                }
            }
            throw new Error(`Unexpected profileItemName: ${profileItemName}`);
        };

        exports.getDataArray = R.curry((info, profileId) => R.flatten(info.groupedProfileFilterItems.map(R.prop('profileFilterItems'))).map((profileItemInfo) => {
            const value = getCharacterInfoValue2(info, profileId, profileItemInfo.name);
            return {
                value,
                type: profileItemInfo.type,
                itemName: profileItemInfo.name
            };
        }));

        exports.getDataArrays = (info, filterModel) =>
            info.bindingData.map(exports.getDataArray(info)).filter(exports.acceptDataRow(filterModel));

        const findProfileStructureConflicts = (prefix, profileStructure, filterModel) => {
            const conflictTypes = [];
            const profilePart = filterModel.filter(R.compose(R.test(new RegExp(`^${prefix}`)), R.prop('name')));
            const profileSettingsMap = R.indexBy(R.prop('name'), profileStructure);
            profilePart.forEach((modelItem) => {
                const itemName = modelItem.name.substring(prefix.length);
                const profileItem = profileSettingsMap[itemName];
                if (!profileItem || profileItem.type !== modelItem.type) {
                    conflictTypes.push(itemName);
                    return;
                }
                if (profileItem.type === 'enum' || profileItem.type === 'multiEnum') {
                    const profileEnum = profileItem.value.split(',');
                    const modelEnum = Object.keys(modelItem.selectedOptions);
                    if (R.difference(modelEnum, profileEnum).length !== 0) {
                        conflictTypes.push(itemName);
                    }
                }
            });
            return conflictTypes;
        };

        exports.isFilterModelCompatibleWithProfiles = (profileStructure, filterModel) => {
            const charConflicts = findProfileStructureConflicts(
                Constants.CHAR_PREFIX, profileStructure.characters,
                filterModel
            );
            const playerConflicts = findProfileStructureConflicts(
                Constants.PLAYER_PREFIX, profileStructure.players,
                filterModel
            );
            return charConflicts.concat(playerConflicts);
        };

        exports.rel2charArr = R.props(['starter', 'ender']);
        exports.get2ndRelChar = R.curry((char1, rel) => (rel.starter === char1 ? rel.ender : rel.starter));

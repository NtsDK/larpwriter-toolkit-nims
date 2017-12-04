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

"use strict";

(function(callback){

    function ProjectUtils(exports, R, Constants, Errors, CU) {

        exports.acceptDataRow = R.curry(function (model, dataString) {
            var value, regex, result;
            var dataMap = CU.arr2map(dataString, 'itemName');
            return model.every(function(filterItem){
                result = true;
                value = dataMap[filterItem.name].value;
                if (value === undefined) {
                    result = false;
                    return;
                }
                switch (filterItem.type) {
                case "enum":
                case "checkbox":
                    if (!filterItem.selectedOptions[value]) {
                        result = false;
                    }
                    break;
                case "multiEnum":
                    var values = value === '' ? [] : value.split(',');
                    switch (filterItem.condition) {
                    case "every":
                        if(R.keys(filterItem.selectedOptions).length === 0){
                            result = false;
                        } else {
                            result = R.difference(R.keys(filterItem.selectedOptions), values).length === 0;
                        }
                        break;
                    case "some":
                        result = R.difference(values,  R.keys(filterItem.selectedOptions)).length !== values.length;
                        break;
                    case "equal":
                        result = R.symmetricDifference(values,  R.keys(filterItem.selectedOptions)).length === 0;
                        break;
                    default:
                        throw 'Unexpected condition ' + filterItem.condition;
                    }
                    break;
                case "number":
                    switch (filterItem.condition) {
                    case "greater":
                        result = value > filterItem.num;
                        break;
                    case "equal":
                        result = value === filterItem.num;
                        break;
                    case "lesser":
                        result = value < filterItem.num;
                        break;
                    default:
                        throw 'Unexpected condition ' + filterItem.condition;
                    }
                    break;
                case "text":
                case "string":
                    result = value.toLowerCase().indexOf(filterItem.regexString.toLowerCase()) != -1;
                    break;
                default:
                    throw new Error('Unexpected type ' + filterItem.type);
                }
                return result;
            });
        });

        exports.makeGroupedProfileFilterInfo = function(opts){
            var groupedProfileFilterItems = [];
            var arr = [];
            arr.push({
                name : Constants.CHAR_NAME,
                type : "string",
                displayName : "profile-filter-character",
            });
            arr.push({
                name : Constants.CHAR_OWNER,
                type : "string",
                displayName : "profile-filter-character-owner",
            });
            arr = arr.concat(opts.characters.profileStructure.map(function(element){
                return {
                    name: Constants.CHAR_PREFIX + element.name,
                    type: element.type,
                    displayName: element.name,
                    value: element.value
                }
            }));
            groupedProfileFilterItems.push({
                name: 'characterFilterItems',
                profileFilterItems: arr
            });

            arr = [];
            arr.push({
                name : Constants.PLAYER_NAME,
                type : "string",
                displayName : "profile-filter-player-name",
            });
            arr.push({
                name : Constants.PLAYER_OWNER,
                type : "string",
                displayName : "profile-filter-player-owner",
            });
            arr = arr.concat(opts.players.profileStructure.map(function(element){
                return {
                    name: Constants.PLAYER_PREFIX + element.name,
                    type: element.type,
                    displayName: element.name,
                    value: element.value
                }
            }));
            groupedProfileFilterItems.push({
                name: 'playerFilterItems',
                profileFilterItems: arr
            });

            arr = Constants.summaryStats.map(function(stat){
                return {
                    name: Constants.SUMMARY_PREFIX + stat[0],
                    type: 'number',
                    displayName: stat[1],
                };
            });
            groupedProfileFilterItems.push({
                name: 'summaryFilterItems',
                profileFilterItems: arr
            });
            opts.groupedProfileFilterItems = groupedProfileFilterItems;
            return opts;
        };

        var getCharacterInfoValue = function(info, characterName, profileItemName){
            if(profileItemName == Constants.CHAR_NAME){
                return characterName;
            } else if(profileItemName == Constants.CHAR_OWNER){
                return info.characters.owners[characterName];
            } else if(CU.startsWith(profileItemName, Constants.SUMMARY_PREFIX) ){
                return info.charactersSummary[characterName][profileItemName.substring(Constants.SUMMARY_PREFIX.length)];
            } else if(CU.startsWith(profileItemName, Constants.CHAR_PREFIX) ){
                return info.characters.profiles[characterName][profileItemName.substring(Constants.CHAR_PREFIX.length)];
            } else {
                throw new Error('Unexpected profileItemName: ' + profileItemName);
            }
        };
        var getCharacterInfoValue2 = function(info, profileId, profileItemName){
            if (profileItemName == Constants.CHAR_NAME ||
                    profileItemName == Constants.CHAR_OWNER ||
                    CU.startsWith(profileItemName, Constants.SUMMARY_PREFIX) ||
                    CU.startsWith(profileItemName, Constants.CHAR_PREFIX)) {
                if(profileId[0] === '') return undefined;
                var characterName = profileId[0];
                if(profileItemName == Constants.CHAR_NAME){
                    return characterName;
                } else if(profileItemName == Constants.CHAR_OWNER){
                    return info.characters.owners[characterName];
                } else if(CU.startsWith(profileItemName, Constants.SUMMARY_PREFIX) ){
                    return info.charactersSummary[characterName][profileItemName.substring(Constants.SUMMARY_PREFIX.length)];
                } else if(CU.startsWith(profileItemName, Constants.CHAR_PREFIX) ){
                    return info.characters.profiles[characterName][profileItemName.substring(Constants.CHAR_PREFIX.length)];
                }
            } else if(profileItemName == Constants.PLAYER_NAME ||
                    profileItemName == Constants.PLAYER_OWNER ||
                    CU.startsWith(profileItemName, Constants.PLAYER_PREFIX)){
                if(profileId[1] === '') return undefined;
                var playerName = profileId[1];
                if(profileItemName == Constants.PLAYER_NAME){
                    return playerName;
                } else if(profileItemName == Constants.PLAYER_OWNER){
                    return info.players.owners[playerName];
                } else if(CU.startsWith(profileItemName, Constants.PLAYER_PREFIX) ){
                    return info.players.profiles[playerName][profileItemName.substring(Constants.PLAYER_PREFIX.length)];
                }
            } else {
                throw new Error('Unexpected profileItemName: ' + profileItemName);
            }
        };

        exports.getDataArray = R.curry(function (info, profileId) {
            return R.flatten(info.groupedProfileFilterItems.map(R.prop('profileFilterItems'))).map(function(profileItemInfo){
                var value = getCharacterInfoValue2(info, profileId, profileItemInfo.name);
                return {
                    value: value,
                    type: profileItemInfo.type,
                    itemName: profileItemInfo.name
                }
            });
        });

        exports.getDataArrays = function(info, filterModel) {
            return info.bindingData.map(exports.getDataArray(info)).filter(exports.acceptDataRow(filterModel));
        };

        var findProfileStructureConflicts = function(prefix, profileStructure, filterModel){
            var conflictTypes = [];
            var profilePart = filterModel.filter(R.compose(R.test(new RegExp('^' + prefix)), R.prop('name')));
            var profileSettingsMap = R.indexBy(R.prop('name'), profileStructure);
            profilePart.forEach(function(modelItem){
                var itemName = modelItem.name.substring(prefix.length);
                var profileItem = profileSettingsMap[itemName];
                if(!profileItem || profileItem.type !== modelItem.type){
                    conflictTypes.push(itemName);
                    return;
                }
                if(profileItem.type === 'enum' || profileItem.type === 'multiEnum'){
                    var profileEnum = profileItem.value.split(',');
                    var modelEnum = Object.keys(modelItem.selectedOptions);
                    if(R.difference(modelEnum, profileEnum).length != 0){
                        conflictTypes.push(itemName);
                        return;
                    }
                }
            });
            return conflictTypes;
        };

        exports.isFilterModelCompatibleWithProfiles = function(profileStructure, filterModel){
            var charConflicts = findProfileStructureConflicts(Constants.CHAR_PREFIX, profileStructure.characters, filterModel);
            var playerConflicts = findProfileStructureConflicts(Constants.PLAYER_PREFIX, profileStructure.players, filterModel);
            return charConflicts.concat(playerConflicts);
        };

    }

    callback(ProjectUtils);

})(function(api){
    typeof exports === 'undefined'? api(this['ProjectUtils'] = {}, R, Constants, Errors, CommonUtils) : module.exports = api;
}.bind(this));

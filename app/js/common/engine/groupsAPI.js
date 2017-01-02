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

"use strict";

(function(callback){

    function groupsAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners) {
        
        LocalDBMS.prototype.getGroupNamesArray = function(callback) {
            "use strict";
            callback(null, Object.keys(this.database.Groups).sort(CommonUtils.charOrdA));
        };
        
        LocalDBMS.prototype.getGroup = function(groupName, callback) {
            "use strict";
            callback(null, CommonUtils.clone(this.database.Groups[groupName]));
        };
        
        var _getCharacterGroupTexts = function(groups, info, profileId){
            var dataArray = CommonUtils.getDataArray(info, profileId);
            var array = R.values(groups).filter(function(group){
                return group.doExport && CommonUtils.acceptDataRow(group.filterModel, dataArray);
            }).map(function(group){
                return {
                    groupName: group.name,
                    text: group.characterDescription
                }
            });
            array.sort(CommonUtils.charOrdAFactory(R.prop('groupName')));
            return array;
        }
        
        // preview
        LocalDBMS.prototype.getCharacterGroupTexts = function(characterName, callback) {
            var that = this;
            this.getProfileBinding('character', characterName, function(err, profileId){
                if(err) {callback(err); return;}
                profileId = R.equals(profileId, {}) ? [characterName, ''] : R.toPairs(profileId)[0];
                that.getProfileFilterInfo(function(err, info){
                    if(err) {callback(err); return;}
                    callback(null, _getCharacterGroupTexts(that.database.Groups, info, profileId));
                });
            })
        };
        
        // export
        LocalDBMS.prototype.getAllCharacterGroupTexts = function(callback) {
            var that = this;
            
            this.getProfileFilterInfo(function(err, info){
                if(err) {callback(err); return;}
                that.getProfileBindings(function(err, bindings){
                    if(err) {callback(err); return;}
                    var texts = Object.keys(that.database.Characters).reduce(function(result, characterName){
                        var profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                        result[characterName] = _getCharacterGroupTexts(that.database.Groups, info, profileId);
                        return result;
                    }, {});
                    callback(null, texts);
                })
            });
        };
        
        LocalDBMS.prototype.isGroupNameUsed = function(groupName, callback) {
            "use strict";
            callback(null, this.database.Groups[groupName] !== undefined);
        };
        
        LocalDBMS.prototype.createGroup = function(groupName, callback) {
            "use strict";
            if(groupName === ""){
                callback(new Errors.ValidationError("groups-group-name-is-not-specified"));
                return;
            }
            
            if(this.database.Groups[groupName]){
                callback(new Errors.ValidationError("groups-group-name-already-used", [groupName]));
                return;
            }
            
            var newGroup = {
                name : groupName,
                masterDescription : "",
                characterDescription : "",
                filterModel: [],
                doExport: true
            };
    
            this.database.Groups[groupName] = newGroup;
            this.ee.trigger("createGroup", arguments);
            if(callback) callback();
        };

        LocalDBMS.prototype.renameGroup = function(fromName, toName, callback) {
            "use strict";
            if (toName === "") {
                callback(new Errors.ValidationError("groups-new-group-name-is-not-specified"));
                return;
            }

            if (fromName === toName) {
                callback(new Errors.ValidationError("groups-names-are-the-same"));
                return;
            }
            
            if(this.database.Groups[toName]){
                callback(new Errors.ValidationError("groups-group-name-already-used", [toName]));
                return;
            }
            
            var data = this.database.Groups[fromName];
            data.name = toName;
            this.database.Groups[toName] = data;
            delete this.database.Groups[fromName];
            
            this.ee.trigger("renameGroup", arguments);
    
            if(callback) callback();
        };
    
        LocalDBMS.prototype.removeGroup = function(groupName, callback) {
            "use strict";
            delete this.database.Groups[groupName];
            this.ee.trigger("removeGroup", arguments);
            if(callback) callback();
        };
        LocalDBMS.prototype.saveFilterToGroup = function(groupName, filterModel, callback) {
            var conflictTypes = CommonUtils.isFilterModelCompatibleWithProfiles(this.database.CharacterProfileStructure, filterModel);
            if(conflictTypes.length != 0){
                callback(new Errors.ValidationError("groups-page-filter-is-incompatible-with-base-profiles", [conflictTypes.join(',')]));
                return;
            }
            this.database.Groups[groupName].filterModel = filterModel;
            if(callback) callback();
        };
    
        LocalDBMS.prototype.updateGroupField = function(groupName, fieldName, value, callback) {
            var profileInfo = this.database.Groups[groupName];
            profileInfo[fieldName] = value;
            if(callback) callback();
        };
        
        var initProfileInfo = function(that, type, ownerMapType, callback){
            that.getAllProfiles(type, function(err, profiles){
                if(err) {callback(err); return;}
                var owners = R.keys(profiles);
                if(that._getOwnerMap){
                    owners = that._getOwnerMap(ownerMapType);
                } else {
                    owners = R.zipObj(owners, R.repeat('user', owners.length));
                }
                that.getProfileStructure(type, function(err, profileStructure){
                    if(err) {callback(err); return;}
                    callback(null, {
                        'profileStructure':profileStructure,
                        'owners':owners,
                        'profiles':profiles
                    });
                });
            });
        };
        
        LocalDBMS.prototype.getProfileFilterInfo = function(callback) {
            var that = this;
            initProfileInfo(that, 'character', 'Characters', function(err, charactersInfo){
                if(err) {callback(err); return;}
                initProfileInfo(that, 'player', 'Players', function(err, playersInfo){
                    if(err) {callback(err); return;}
                    that.getCharactersSummary(function(err, charactersSummary){
                        if(err) {callback(err); return;}
                        that.getExtendedProfileBindings(function(err, bindingData){
                            if(err) {callback(err); return;}
                            var info = CommonUtils.makeGroupedProfileFilterInfo({
                                'characters' : charactersInfo,
                                'players' : playersInfo,
                                charactersSummary : charactersSummary,
                                bindingData : bindingData
                            });
                            callback(null, info);
                        });
                    });
                });
            });
        };

        function _removeProfileItem(type, index, profileItemName){
            if(type === 'player') return;
            var subFilterName = Constants.CHAR_PREFIX + profileItemName;
            var that = this;
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.filter(function(filterItem){
                    return filterItem.name !== subFilterName;
                });
            });
        };
        
        listeners.removeProfileItem = listeners.removeProfileItem || [];
        listeners.removeProfileItem.push(_removeProfileItem);

        function _changeProfileItemType(type, profileItemName, newType){
            if(type === 'player') return;
            _removeProfileItem.apply(this, [-1, profileItemName]);
        };
        
        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(type, newName, oldName){
            if(type === 'player') return;
            var subFilterName = Constants.CHAR_PREFIX + oldName;
            var that = this;
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.map(function(filterItem){
                    if(filterItem.name === subFilterName){
                        filterItem.name = Constants.CHAR_PREFIX + newName;
                    }
                    return filterItem;
                });
            });
        };
        
        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);
        
        function _replaceEnumValue(type, profileItemName, defaultValue, newOptionsMap){
            if(type === 'player') return;
            var subFilterName = Constants.CHAR_PREFIX + profileItemName;
            var that = this;
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel.forEach(function(filterItem){
                    if(filterItem.name === subFilterName){
                        for(var selectedOption in filterItem.selectedOptions){
                            if (!newOptionsMap[selectedOption]) {
                                delete filterItem.selectedOptions[selectedOption];
                            }
                        }
                    }
                });
            });
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.filter(function(filterItem){
                    if(filterItem.name !== subFilterName){
                        return true;
                    }
                    return Object.keys(filterItem.selectedOptions).length != 0;
                });
            });
        };
        
        listeners.replaceEnumValue = listeners.replaceEnumValue || [];
        listeners.replaceEnumValue.push(_replaceEnumValue);
        
        listeners.replaceMultiEnumValue = listeners.replaceMultiEnumValue || [];
        listeners.replaceMultiEnumValue.push(_replaceEnumValue);
        
        var _isGroupsEqualByFilterModel = function(fm1, fm2){
            var fmMap1 = R.indexBy(R.prop('name'), fm1);
            var fmMap2 = R.indexBy(R.prop('name'), fm2);
            return R.equals(fmMap1, fmMap2);
        };
        var _isGroupsEqualByElements = function(els1, els2){
            return R.symmetricDifference(R.keys(els1),R.keys(els2)).length == 0;
        };
        var _isSuperGroupByElements = function(subGroupEls, superGroupEls){
            return R.difference(R.keys(subGroupEls), R.keys(superGroupEls)).length == 0;
        };
        var _isSuperGroupByFilterModel = function(subGroupFm, superGroupFm){
            var subMap = R.indexBy(R.prop('name'), subGroupFm);
            var superMap = R.indexBy(R.prop('name'), superGroupFm);
            var subKeys = R.keys(subMap);
            var superKeys = R.keys(superMap);
            if(superKeys.length == 0){
                return true;
            }
            if(R.difference(superKeys, subKeys).length != 0){
                return false;
            }
            
            return superKeys.every(function(superKey){
                var superItem = superMap[superKey];
                var subItem = subMap[superKey];
                switch(superItem.type){
                case "text":
                case "string":
                    return subItem.regexString.indexOf(superItem.regexString) !== -1;
                case "enum":
                case "checkbox":
                    return R.difference(R.keys(superItem.selectedOptions), R.keys(subItem.selectedOptions)).length == 0;
                case "number":
                    if(subItem.condition === 'greater' && superItem.condition === 'lesser'){
                        return false;
                    }
                    if(subItem.condition === 'lesser' && superItem.condition === 'greater'){
                        return false;
                    }
                    if(subItem.condition === 'equal'){
                        if(superItem.condition !== 'equal'){
                            return false;
                        } else {
                            return subItem.num == superItem.num;
                        }
                    }
                    if(subItem.condition === 'greater'){
                        return subItem.num <= superItem.num;
                    }
                    if(subItem.condition === 'lesser'){
                        return subItem.num >= superItem.num;
                    }
                case "multiEnum":
                    if(subItem.condition === 'every' && superItem.condition === 'some'){
                        return false;
                    }
                    if(subItem.condition === 'some' && superItem.condition === 'every'){
                        return false;
                    }
                    if(subItem.condition === 'equal'){
                        if(superItem.condition !== 'equal'){
                            return false;
                        } else {
                            return R.difference(R.keys(superItem.selectedOptions), R.keys(subItem.selectedOptions)).length == 0;
                        }
                    }
                    if(subItem.condition === 'every'){
                        return R.difference(R.keys(superItem.selectedOptions), R.keys(subItem.selectedOptions)).length == 0;
                    }
                    if(subItem.condition === 'some'){
                        return R.difference(R.keys(subItem.selectedOptions), R.keys(superItem.selectedOptions)).length == 0;
                    }
                default:
                    throw new Error('Unexpected type ' + superItem.type);
                }
            });
        }
        
        var _removeSuperSuperGroups = function(superGroups){
            R.values(superGroups).forEach(function(superGroupSet){
                var superGroupKeys = R.keys(superGroupSet);
                for(var i=0; i < superGroupKeys.length; ++i){
                    for(var j=0; j < superGroupKeys.length; ++j){
                        if(i==j) continue;
                        var subGroup = superGroupKeys[i];
                        var superGroup = superGroupKeys[j];
                        if(superGroups[subGroup][superGroup]){
                            delete superGroupSet[superGroup];
                        }
                    }
                }
            });
        };
        
        var _makeGraph = function(equalGroups, superGroups, groupCharacterSets){
            var levels = {};
            function getLevel(groupName){
                if(levels[groupName]){
                    return levels[groupName];
                }
                var supers = R.keys(superGroups[groupName]);
                if(supers.length == 0){
                    return 1;
                }
                return supers.map(getLevel).reduce(function(max, cur){
                    return cur > max ? cur : max;
                }, -1) + 1;
            }
            
            R.keys(superGroups).forEach(function(subGroup){
                if(!levels[subGroup]){
                    levels[subGroup] = getLevel(subGroup);
                }
            });
            
            
            var nodes = R.keys(superGroups).map(function(subGroup){
                return {
                    id: subGroup,
                    label: [subGroup].concat(equalGroups[subGroup] || []).join(", "), 
                    level: levels[subGroup],
                    title: R.keys(groupCharacterSets[subGroup]).join(", ")
                };
            });
            var edges = R.keys(superGroups).reduce(function(result, subGroup){
                return result.concat(R.keys(superGroups[subGroup]).map(function(superGroup){
                    return {
                        from: subGroup,
                        to: superGroup,
                        arrow: 'to'
                    }
                }));
            }, []);
            return {
                nodes: nodes,
                edges: edges
            };
        };
        
        var _makeGroupSchema = function(groups, _isGroupsEqual, _isSuperGroup, _extractKeyInfo, groupCharacterSets){
            var groupNames = R.keys(groups);
            var groupNamesSet = R.zipObj(groupNames, R.repeat(true, groupNames.length));
            var equalGroups = {};
            
            for(var i=0; i < groupNames.length; ++i){
                var groupName1 = groupNames[i];
                if(groupNamesSet[groupName1]){
                    for(var j=i+1; j < groupNames.length; ++j){
                        var groupName2 = groupNames[j];
                        if(groupNamesSet[groupName2]){
                            if(_isGroupsEqual(_extractKeyInfo(groupName1), _extractKeyInfo(groupName2))){
                                groupNamesSet[groupName2] = false;
                                equalGroups[groupName1] = equalGroups[groupName1] || [];
                                equalGroups[groupName1].push(groupName2);
                            }
                        }
                    }
                }
            }
//            console.log(equalGroups);
            var uniqueGroups = R.toPairs(groupNamesSet).filter(function(item){
                return item[1];
            }).map(R.head);
//            console.log(uniqueGroups);
            var superGroups = R.zipObj(uniqueGroups, R.ap([R.clone], R.repeat({}, uniqueGroups.length)));
            for(var i=0; i < uniqueGroups.length; ++i){
                for(var j=0; j < uniqueGroups.length; ++j){
                    if(i==j) continue;
                    var groupName1 = uniqueGroups[i];
                    var groupName2 = uniqueGroups[j];
                    if(_isSuperGroup(_extractKeyInfo(groupName1), _extractKeyInfo(groupName2))){
                        superGroups[groupName1][groupName2] = true;
                    }
                }
            }
//            console.log(superGroups);
            _removeSuperSuperGroups(superGroups);
//            console.log(superGroups);
            
            return _makeGraph(equalGroups, superGroups, groupCharacterSets);
        };
        
        var _getGroupCharacterSets = function(groups, characterNames, bindings, info){
            
            var groupNames = R.keys(groups);
            var groupCharacterSets = R.zipObj(groupNames, R.ap([R.clone], R.repeat({}, groupNames.length)));
            characterNames.forEach(function(characterName){
                var profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                var dataArray = CommonUtils.getDataArray(info, profileId);
                groupNames.forEach(function(groupName){
                    if(CommonUtils.acceptDataRow(groups[groupName].filterModel, dataArray)){
                        groupCharacterSets[groupName][characterName] = true;
                    }
                });
            });
            return groupCharacterSets;
        };
        
        LocalDBMS.prototype.getGroupSchemas = function(callback) {
            var that = this;
            
            this.getProfileFilterInfo(function(err, info){
                if(err) {callback(err); return;}
                var schemas = {};
                var groups = that.database.Groups;
                
                var groupCharacterSets = _getGroupCharacterSets(groups, R.keys(that.database.Characters), R.clone(that.database.ProfileBindings), info);

                schemas.theory = _makeGroupSchema(groups, _isGroupsEqualByFilterModel, _isSuperGroupByFilterModel, function(groupName){
                    return groups[groupName].filterModel;
                }, groupCharacterSets);
                
                schemas.practice = _makeGroupSchema(groups, _isGroupsEqualByElements, _isSuperGroupByElements, function(groupName){
                    return groupCharacterSets[groupName];
                }, groupCharacterSets);
                
                callback(null, schemas);
            });
        };
    };
    
    callback(groupsAPI);

})(function(api){
    typeof exports === 'undefined'? this['groupsAPI'] = api: module.exports = api;
}.bind(this));
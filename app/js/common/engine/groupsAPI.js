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
        
        var _getCharacterGroupTexts = function(groups, info, characterName){
            var dataArray = CommonUtils.getDataArray(info, characterName);
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
            this.getCharacterFilterInfo(function(err, info){
                if(err) {callback(err); return;}
                callback(null, _getCharacterGroupTexts(that.database.Groups, info, characterName));
            });
        };
        
        // export
        LocalDBMS.prototype.getAllCharacterGroupTexts = function(callback) {
            var that = this;
            this.getCharacterFilterInfo(function(err, info){
                if(err) {callback(err); return;}
                var texts = Object.keys(that.database.Characters).reduce(function(result, characterName){
                    result[characterName] = _getCharacterGroupTexts(that.database.Groups, info, characterName);
                    return result;
                }, {});
                callback(null, texts);
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
            
            if(this.database.Characters[groupName]){
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
            var conflictTypes = CommonUtils.isFilterModelCompatibleWithProfiles(this.database.ProfileSettings, filterModel);
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
        
        LocalDBMS.prototype.getCharacterFilterInfo = function(callback) {
            var that = this;
            that.getCharacterNamesArray(function(err, characterOwners){
                if(err) {callback(err); return;}
                // _getOwnerMap is part of permission summary API which is available on server 
                if(that._getOwnerMap){
                    characterOwners = that._getOwnerMap('Characters');
                } else {
                    characterOwners = R.zipObj(characterOwners, R.repeat('user', characterOwners.length));
                }
                that.getAllProfiles(function(err, profiles){
                    if(err) {callback(err); return;}
                    that.getCharactersSummary(function(err, charactersSummary){
                        if(err) {callback(err); return;}
                        that.getAllProfileSettings(function(err, allProfileSettings){
                            if(err) {callback(err); return;}
                            var info = CommonUtils.makeFilterInfo(allProfileSettings, characterOwners, profiles, charactersSummary, Constants);
                            callback(null, info);
                        });
                    });
                });
            });
        };

        function _removeProfileItem(index, profileItemName){
            var subFilterName = 'profile-' + profileItemName;
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

        function _changeProfileItemType(profileItemName, newType){
            _removeProfileItem.apply(this, [-1, profileItemName]);
        };
        
        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(newName, oldName){
            var subFilterName = 'profile-' + oldName;
            var that = this;
            Object.keys(this.database.Groups).forEach(function(groupName) {
                var group = that.database.Groups[groupName];
                group.filterModel = group.filterModel.map(function(filterItem){
                    if(filterItem.name === subFilterName){
                        filterItem.name = 'profile-' + newName;
                    }
                    return filterItem;
                });
            });
        };
        
        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);
        
        function _replaceEnumValue(profileItemName, defaultValue, newOptionsMap){
            var subFilterName = 'profile-' + profileItemName;
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
    };
    
    callback(groupsAPI);

})(function(api){
    typeof exports === 'undefined'? this['groupsAPI'] = api: module.exports = api;
}.bind(this));
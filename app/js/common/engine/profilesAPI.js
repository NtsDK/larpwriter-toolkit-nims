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

"use strict";

(function(callback){

    function profilesAPI(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        var listeners     = opts.listeners   ;
        
        function getPath(type){
            if(type === 'character') return ['Characters'];
            if(type === 'player') return ['Players'];
            return null;
        }
        function getStructurePath(type){
            if(type === 'character') return ['CharacterProfileStructure'];
            if(type === 'player') return ['PlayerProfileStructure'];
            return null;
        }
        
        var typeCheck = function(type){
            return CU.chainCheck([CU.isString(type), CU.elementFromEnum(type, Constants.profileTypes)]);
        };
        
        LocalDBMS.prototype.getProfileNamesArray = function(type, callback) {
            CU.precondition(typeCheck(type), callback, () => {
                callback(null, Object.keys(R.path(getPath(type), this.database)).sort(CU.charOrdA));
            });
        };
        
        // profile, preview
        LocalDBMS.prototype.getProfile = function(type, name, callback) {
            CU.precondition(typeCheck(type), callback, () => {
                var container = R.path(getPath(type), this.database);
                CU.precondition(CU.entityExistsCheck(name, R.keys(container)), callback, () => {
                    callback(null, CU.clone(container[name]));
                });
            });
        };
        // social network, character filter
        LocalDBMS.prototype.getAllProfiles = function(type, callback) {
            CU.precondition(typeCheck(type), callback, () => {
                callback(null, CU.clone(R.path(getPath(type), this.database)));
            });
        };
        
        // profiles
        LocalDBMS.prototype.createProfile = function(type, characterName, callback) {
            CU.precondition(typeCheck(type), callback, () => {
                var container = R.path(getPath(type), this.database);
                CU.precondition(CU.createEntityCheck(characterName, R.keys(container)), callback, () => {
                    var newCharacter = {
                            name : characterName
                    };
                    
                    R.path(getStructurePath(type), this.database).forEach(function(profileSettings) {
                        if (profileSettings.type === "enum") {
                            newCharacter[profileSettings.name] = profileSettings.value.split(",")[0];
                        } else if(profileSettings.type === "multiEnum") {
                            newCharacter[profileSettings.name] = '';
                        } else {
                            newCharacter[profileSettings.name] = profileSettings.value;
                        }
                    });
                    
                    R.path(getPath(type), this.database)[characterName] = newCharacter;
                    this.ee.trigger("createProfile", arguments);
                    if(callback) callback();
                });
            });
        };
        // profiles
        LocalDBMS.prototype.renameProfile = function(type, fromName, toName, callback) {
            CU.precondition(typeCheck(type), callback, () => {
                var container = R.path(getPath(type), this.database);
                CU.precondition(CU.renameEntityCheck(fromName, toName, R.keys(container)), callback, () => {
                    var data = container[fromName];
                    data.name = toName;
                    container[toName] = data;
                    delete container[fromName];
                    
                    this.ee.trigger("renameProfile", arguments);
                    
                    if(callback) callback();
                });
            });
        };
    
        // profiles
        LocalDBMS.prototype.removeProfile = function(type, characterName, callback) {
            CU.precondition(typeCheck(type), callback, () => {
                var container = R.path(getPath(type), this.database);
                CU.precondition(CU.removeEntityCheck(characterName, R.keys(container)), callback, () => {
                    delete container[characterName];
                    this.ee.trigger("removeProfile", arguments);
                    if(callback) callback();
                });
            });
        };
        
        var getValueCheck = function(type){
            switch (type) {
            case "checkbox":
                return CU.isBoolean;
            case "number":
                return CU.isNumber;
            }
            return CU.isString;
        };
    
        // profile editor
        LocalDBMS.prototype.updateProfileField = function(type, characterName, fieldName, itemType, value, callback) {
            CU.precondition(typeCheck(type), callback, () => {
                var container = R.path(getPath(type), this.database);
                var containerStructure = R.path(getStructurePath(type), this.database);
                var arr = [CU.entityExistsCheck(characterName, R.keys(container)), 
                           CU.entityExistsCheck(fieldName +'/' + itemType, containerStructure.map(item => item.name + '/' + item.type)), 
                           getValueCheck(itemType)(value)];
                CU.precondition(CU.chainCheck(arr), callback, () => {
                    
                    var profileInfo = container[characterName];
                    switch (itemType) {
                    case "text":
                    case "string":
                    case "enum":
                    case "multiEnum":
                    case "checkbox":
                        profileInfo[fieldName] = value;
                        break;
                    case "number":
                        profileInfo[fieldName] = Number(value);
                        break;
                    default:
                        callback(new Errors.InternalError('errors-unexpected-switch-argument', [itemType]));
                    }
                    if(callback) callback();
                });
            });
        };
        
        function _createProfileItem(type, name, itemType, value){
            var profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach(function(characterName) {
                profileSet[characterName][name] = value;
            });
        };
        
        listeners.createProfileItem = listeners.createProfileItem || [];
        listeners.createProfileItem.push(_createProfileItem);

        function _removeProfileItem(type, index, profileItemName){
            var profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach(function(characterName) {
                delete profileSet[characterName][profileItemName];
            });
        };
        
        listeners.removeProfileItem = listeners.removeProfileItem || [];
        listeners.removeProfileItem.push(_removeProfileItem);

        function _changeProfileItemType(type, profileItemName, newType){
            var profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach(function(characterName) {
                profileSet[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
            });
        };
        
        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(type, newName, oldName){
            var profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach(function(characterName) {
                var tmp = profileSet[characterName][oldName];
                delete profileSet[characterName][oldName];
                profileSet[characterName][newName] = tmp;
            });
        };
        
        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);
        
        function _replaceEnumValue(type, profileItemName, defaultValue, newOptionsMap){
            var profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach(function(characterName) {
                var enumValue = profileSet[characterName][profileItemName];
                if (!newOptionsMap[enumValue]) {
                    profileSet[characterName][profileItemName] = defaultValue;
                }
            });
        };
        
        listeners.replaceEnumValue = listeners.replaceEnumValue || [];
        listeners.replaceEnumValue.push(_replaceEnumValue);
        
        function _replaceMultiEnumValue(type, profileItemName, defaultValue, newOptionsMap){
            var profileSet = R.path(getPath(type), this.database);
            Object.keys(profileSet).forEach(function(characterName) {
                if(value !== ''){
                    var value = profileSet[characterName][profileItemName];
                    value = R.intersection(value.split(','), R.keys(newOptionsMap));
                    profileSet[characterName][profileItemName] = value.join(',');
                }
            });
        };
        
        listeners.replaceMultiEnumValue = listeners.replaceMultiEnumValue || [];
        listeners.replaceMultiEnumValue.push(_replaceMultiEnumValue);
    };
    
    callback(profilesAPI);

})(function(api){
    typeof exports === 'undefined'? this['profilesAPI'] = api: module.exports = api;
}.bind(this));
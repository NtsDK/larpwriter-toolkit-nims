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

    function profilesAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners) {
        
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
        
        LocalDBMS.prototype.getProfileNamesArray = function(type, callback) {
            callback(null, Object.keys(R.path(getPath(type), this.database)).sort(CommonUtils.charOrdA));
        };
        
        // profile, preview
        LocalDBMS.prototype.getProfile = function(type, name, callback) {
            callback(null, CommonUtils.clone(R.path(getPath(type), this.database)[name]));
        };
        // social network, character filter
        LocalDBMS.prototype.getAllProfiles = function(type, callback) {
            callback(null, CommonUtils.clone(R.path(getPath(type), this.database)));
        };
        
        // characters
        LocalDBMS.prototype.isProfileNameUsed = function(type, characterName, callback) {
            callback(null, R.path(getPath(type), this.database)[characterName] !== undefined);
        };
        // characters
        LocalDBMS.prototype.createProfile = function(type, characterName, callback) {
            if(characterName === ""){
                callback(new Errors.ValidationError("profiles-character-name-is-not-specified"));
                return;
            }
            
            var profileSet = R.path(getPath(type), this.database);
            
            if(profileSet[characterName]){
                callback(new Errors.ValidationError("profiles-character-name-already-used", [characterName]));
                return;
            }
            
            var newCharacter = {
                name : characterName
            };
    
            R.path(getStructurePath(type), this.database).forEach(function(profileSettings) {
                if (profileSettings.type === "enum") {
                    newCharacter[profileSettings.name] = profileSettings.value.split(",")[0];
                } else {
                    newCharacter[profileSettings.name] = profileSettings.value;
                }
            });
    
            profileSet[characterName] = newCharacter;
            this.ee.trigger("createProfile", arguments);
            if(callback) callback();
        };
        // characters
        LocalDBMS.prototype.renameProfile = function(type, fromName, toName, callback) {
            if (toName === "") {
                callback(new Errors.ValidationError("profiles-new-character-name-is-not-specified"));
                return;
            }

            if (fromName === toName) {
                callback(new Errors.ValidationError("profiles-names-are-the-same"));
                return;
            }
            
            var profileSet = R.path(getPath(type), this.database);
            
            if(profileSet[toName]){
                callback(new Errors.ValidationError("profiles-character-name-already-used", [toName]));
                return;
            }
            
            var data = profileSet[fromName];
            data.name = toName;
            profileSet[toName] = data;
            delete profileSet[fromName];
            
            this.ee.trigger("renameProfile", arguments);
    
            if(callback) callback();
        };
    
        // characters
        LocalDBMS.prototype.removeProfile = function(type, characterName, callback) {
            delete R.path(getPath(type), this.database)[characterName];
            this.ee.trigger("removeProfile", arguments);
            if(callback) callback();
        };
    
        // profile
        LocalDBMS.prototype.updateProfileField = function(characterName, fieldName, type, value, callback) {
            var profileInfo = this.database.Characters[characterName];
            switch (type) {
            case "text":
            case "string":
            case "enum":
            case "multiEnum":
            case "checkbox":
                profileInfo[fieldName] = value;
                break;
            case "number":
                if (isNaN(value)) {
                    callback(new Errors.ValidationError("profiles-not-a-number"));
                    return;
                }
                profileInfo[fieldName] = Number(value);
                break;
                profileInfo[fieldName] = value;
                break;
            default:
                callback(new Errors.InternalError('errors-unexpected-switch-argument', [type]));
            }
            if(callback) callback();
        };
        
        function _createProfileItem(type, name, itemType, value){
            if(type === 'player') return;
            var that = this;
            Object.keys(that.database.Characters).forEach(function(characterName) {
                that.database.Characters[characterName][name] = value;
            });
        };
        
        listeners.createProfileItem = listeners.createProfileItem || [];
        listeners.createProfileItem.push(_createProfileItem);

        function _removeProfileItem(type, index, profileItemName){
            if(type === 'player') return;
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                delete that.database.Characters[characterName][profileItemName];
            });
        };
        
        listeners.removeProfileItem = listeners.removeProfileItem || [];
        listeners.removeProfileItem.push(_removeProfileItem);

        function _changeProfileItemType(type, profileItemName, newType){
            if(type === 'player') return;
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                that.database.Characters[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
            });
        };
        
        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(type, newName, oldName){
            if(type === 'player') return;
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                var tmp = that.database.Characters[characterName][oldName];
                delete that.database.Characters[characterName][oldName];
                that.database.Characters[characterName][newName] = tmp;
            });
        };
        
        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);
        
        function _replaceEnumValue(type, profileItemName, defaultValue, newOptionsMap){
            if(type === 'player') return;
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                var enumValue = that.database.Characters[characterName][profileItemName];
                if (!newOptionsMap[enumValue]) {
                    that.database.Characters[characterName][profileItemName] = defaultValue;
                }
            });
        };
        
        listeners.replaceEnumValue = listeners.replaceEnumValue || [];
        listeners.replaceEnumValue.push(_replaceEnumValue);
        
        function _replaceMultiEnumValue(type, profileItemName, defaultValue, newOptionsMap){
            if(type === 'player') return;
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                if(value !== ''){
                    var value = that.database.Characters[characterName][profileItemName];
                    value = R.intersection(value.split(','), R.keys(newOptionsMap));
                    that.database.Characters[characterName][profileItemName] = value.join(',');
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
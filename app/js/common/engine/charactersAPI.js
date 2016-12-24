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

(function(callback){

    function charactersAPI(LocalDBMS, Constants, CommonUtils, Errors, listeners) {
        
        LocalDBMS.prototype.getCharacterNamesArray = function(callback) {
            "use strict";
            callback(null, Object.keys(this.database.Characters).sort(CommonUtils.charOrdA));
        };
        
        // profile, preview
        LocalDBMS.prototype.getProfile = function(name, callback) {
            "use strict";
            callback(null, CommonUtils.clone(this.database.Characters[name]));
        };
        // social network, character filter
        LocalDBMS.prototype.getAllProfiles = function(callback) {
            "use strict";
            callback(null, CommonUtils.clone(this.database.Characters));
        };
        
        // characters
        LocalDBMS.prototype.isCharacterNameUsed = function(characterName, callback) {
            "use strict";
            callback(null, this.database.Characters[characterName] !== undefined);
        };
        // characters
        LocalDBMS.prototype.createCharacter = function(characterName, callback) {
            "use strict";
            if(characterName === ""){
                callback(new Errors.ValidationError("characters-character-name-is-not-specified"));
                return;
            }
            
            if(this.database.Characters[characterName]){
                callback(new Errors.ValidationError("characters-character-name-already-used", [characterName]));
                return;
            }
            
            var newCharacter = {
                name : characterName
            };
    
            this.database.ProfileSettings.forEach(function(profileSettings) {
                if (profileSettings.type === "enum") {
                    newCharacter[profileSettings.name] = profileSettings.value.split(",")[0];
                } else {
                    newCharacter[profileSettings.name] = profileSettings.value;
                }
            });
    
            this.database.Characters[characterName] = newCharacter;
            this.ee.trigger("createCharacter", arguments);
            if(callback) callback();
        };
        // characters
        LocalDBMS.prototype.renameCharacter = function(fromName, toName, callback) {
            "use strict";
            if (toName === "") {
                callback(new Errors.ValidationError("characters-new-character-name-is-not-specified"));
                return;
            }

            if (fromName === toName) {
                callback(new Errors.ValidationError("characters-names-are-the-same"));
                return;
            }
            
            if(this.database.Characters[toName]){
                callback(new Errors.ValidationError("characters-character-name-already-used", [toName]));
                return;
            }
            
            var data = this.database.Characters[fromName];
            data.name = toName;
            this.database.Characters[toName] = data;
            delete this.database.Characters[fromName];
            
            this.ee.trigger("renameCharacter", arguments);
    
            if(callback) callback();
        };
    
        // characters
        LocalDBMS.prototype.removeCharacter = function(characterName, callback) {
            "use strict";
            delete this.database.Characters[characterName];
            this.ee.trigger("removeCharacter", arguments);
            if(callback) callback();
        };
    
        // profile
        LocalDBMS.prototype.updateProfileField = function(characterName, fieldName, type, value, callback) {
            "use strict";
            var profileInfo = this.database.Characters[characterName];
            switch (type) {
            case "text":
            case "string":
            case "enum":
                profileInfo[fieldName] = value;
                break;
            case "number":
                if (isNaN(value)) {
                    callback(new Errors.ValidationError("characters-not-a-number"));
                    return;
                }
                profileInfo[fieldName] = Number(value);
                break;
            case "checkbox":
                profileInfo[fieldName] = value;
                break;
            default:
                throw new Error('Unexpected type ' + type);
            }
            if(callback) callback();
        };
        
        function _createProfileItem(name, type, value){
            "use strict";
            var that = this;
            Object.keys(that.database.Characters).forEach(function(characterName) {
                that.database.Characters[characterName][name] = value;
            });
        };
        
        listeners.createProfileItem = listeners.createProfileItem || [];
        listeners.createProfileItem.push(_createProfileItem);

        function _removeProfileItem(index, profileItemName){
            "use strict";
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                delete that.database.Characters[characterName][profileItemName];
            });
        };
        
        listeners.removeProfileItem = listeners.removeProfileItem || [];
        listeners.removeProfileItem.push(_removeProfileItem);

        function _changeProfileItemType(profileItemName, newType){
            "use strict";
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                that.database.Characters[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
            });
        };
        
        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
        listeners.changeProfileItemType.push(_changeProfileItemType);

        function _renameProfileItem(newName, oldName){
            "use strict";
            var that = this;
            Object.keys(this.database.Characters).forEach(function(characterName) {
                var tmp = that.database.Characters[characterName][oldName];
                delete that.database.Characters[characterName][oldName];
                that.database.Characters[characterName][newName] = tmp;
            });
        };
        
        listeners.renameProfileItem = listeners.renameProfileItem || [];
        listeners.renameProfileItem.push(_renameProfileItem);
        
        function _replaceEnumValue(profileItemName, defaultValue, newOptionsMap){
            "use strict";
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
    };
    
    callback(charactersAPI);

})(function(api){
    typeof exports === 'undefined'? this['charactersAPI'] = api: module.exports = api;
}.bind(this));
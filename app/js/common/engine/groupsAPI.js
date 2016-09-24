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
        
//        // social network, character filter
//        LocalDBMS.prototype.getAllProfiles = function(callback) {
//            "use strict";
//            callback(null, CommonUtils.clone(this.database.Characters));
//        };
//        
        LocalDBMS.prototype.isGroupNameUsed = function(groupName, callback) {
            "use strict";
            callback(null, this.database.Groups[groupName] !== undefined);
        };
        
        LocalDBMS.prototype.createGroup = function(groupName, callback) {
            "use strict";
            if(groupName === ""){
                callback(new Errors.ValidationError("characters-character-name-is-not-specified"));
                return;
            }
            
            if(this.database.Characters[groupName]){
                callback(new Errors.ValidationError("characters-character-name-already-used", [groupName]));
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
                callback(new Errors.ValidationError("characters-new-character-name-is-not-specified"));
                return;
            }

            if (fromName === toName) {
                callback(new Errors.ValidationError("characters-names-are-the-same"));
                return;
            }
            
            if(this.database.Groups[toName]){
                callback(new Errors.ValidationError("characters-character-name-already-used", [toName]));
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
            "use strict";
            this.database.Groups[groupName].filterModel = filterModel;
            if(callback) callback();
        };
//    
//        // profile
//        LocalDBMS.prototype.updateProfileField = function(characterName, fieldName, type, value, callback) {
//            "use strict";
//            var profileInfo = this.database.Characters[characterName];
//            switch (type) {
//            case "text":
//            case "string":
//            case "enum":
//                profileInfo[fieldName] = value;
//                break;
//            case "number":
//                if (isNaN(value)) {
//                    callback(new Errors.ValidationError("characters-not-a-number"));
//                    return;
//                }
//                profileInfo[fieldName] = Number(value);
//                break;
//            case "checkbox":
//                profileInfo[fieldName] = value;
//                break;
//            }
//            if(callback) callback();
//        };
//        
//        function _createProfileItem(name, type, value){
//            "use strict";
//            var that = this;
//            Object.keys(that.database.Characters).forEach(function(characterName) {
//                that.database.Characters[characterName][name] = value;
//            });
//        };
//        
//        listeners.createProfileItem = listeners.createProfileItem || [];
//        listeners.createProfileItem.push(_createProfileItem);
//
//        function _removeProfileItem(index, profileItemName){
//            "use strict";
//            var that = this;
//            Object.keys(this.database.Characters).forEach(function(characterName) {
//                delete that.database.Characters[characterName][profileItemName];
//            });
//        };
//        
//        listeners.removeProfileItem = listeners.removeProfileItem || [];
//        listeners.removeProfileItem.push(_removeProfileItem);
//
//        function _changeProfileItemType(profileItemName, newType){
//            "use strict";
//            var that = this;
//            Object.keys(this.database.Characters).forEach(function(characterName) {
//                that.database.Characters[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
//            });
//        };
//        
//        listeners.changeProfileItemType = listeners.changeProfileItemType || [];
//        listeners.changeProfileItemType.push(_changeProfileItemType);
//
//        function _renameProfileItem(newName, oldName){
//            "use strict";
//            var that = this;
//            Object.keys(this.database.Characters).forEach(function(characterName) {
//                var tmp = that.database.Characters[characterName][oldName];
//                delete that.database.Characters[characterName][oldName];
//                that.database.Characters[characterName][newName] = tmp;
//            });
//        };
//        
//        listeners.renameProfileItem = listeners.renameProfileItem || [];
//        listeners.renameProfileItem.push(_renameProfileItem);
//        
//        function _replaceEnumValue(profileItemName, defaultValue, newOptionsMap){
//            "use strict";
//            var that = this;
//            Object.keys(this.database.Characters).forEach(function(characterName) {
//                var enumValue = that.database.Characters[characterName][profileItemName];
//                if (!newOptionsMap[enumValue]) {
//                    that.database.Characters[characterName][profileItemName] = defaultValue;
//                }
//            });
//        };
//        
//        listeners.replaceEnumValue = listeners.replaceEnumValue || [];
//        listeners.replaceEnumValue.push(_replaceEnumValue);
    };
    
    callback(groupsAPI);

})(function(api){
    typeof exports === 'undefined'? this['groupsAPI'] = api: module.exports = api;
}.bind(this));
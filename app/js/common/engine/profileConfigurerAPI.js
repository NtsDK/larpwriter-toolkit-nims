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

    function profileConfigurerAPI(LocalDBMS, Constants, R, CommonUtils, Errors) {
        
        var characterProfilePath = ['CharacterProfileStructure'];
        
        LocalDBMS.prototype.getCharacterProfileStructure = function(callback){
            callback(null, CommonUtils.clone(R.path(characterProfilePath, this.database)));
        };
        // profile configurer
        LocalDBMS.prototype.createProfileItem = function(name, type, value, toEnd, selectedIndex, callback) {
            var that = this;
            this.isProfileItemNameUsed(name, function(err, isUsed){
                if(err) {callback(err);return;}
                
                if(isUsed){
                    callback(new Errors.ValidationError("characters-such-name-already-used"));
                    return;
                }
                
                var profileItem = {
                    name : name,
                    type : type,
                    value : value,
                    doExport : true
                };
                
                if (toEnd) {
                    R.path(characterProfilePath, that.database).push(profileItem);
                } else {
                    R.path(characterProfilePath, that.database).splice(selectedIndex, 0, profileItem);
                }
                that.ee.trigger("createProfileItem", [name, type, value]);
                callback();
            });
            
        };
        
        //profile configurer
        LocalDBMS.prototype.moveProfileItem = function(index, newIndex, callback){
            if(newIndex > index){
                newIndex--;
            }
            var profileSettings = R.path(characterProfilePath, this.database);
            var tmp = profileSettings[index];
            profileSettings.splice(index, 1);
            profileSettings.splice(newIndex, 0, tmp);
            callback();
        };
        // profile configurer
        LocalDBMS.prototype.removeProfileItem = function(index, profileItemName, callback) {
            CommonUtils.removeFromArrayByIndex(R.path(characterProfilePath, this.database), index);
            this.ee.trigger("removeProfileItem", arguments);
            callback();
        };
        // profile configurer
        LocalDBMS.prototype.changeProfileItemType = function(profileItemName, newType, callback) {
            var profileItem = R.path(characterProfilePath, this.database).filter(function(elem) {
                return elem.name === profileItemName;
            })[0];
    
            profileItem.type = newType;
            profileItem.value = Constants.profileFieldTypes[newType].value;
            this.ee.trigger("changeProfileItemType", arguments);
            callback();
        };
    
        // profile configurer
        LocalDBMS.prototype.isProfileItemNameUsed = function(profileItemName, callback) {
            if (profileItemName === "") {
                callback(new Errors.ValidationError("characters-profile-item-name-is-not-specified"));
                return;
            }
            
            if (profileItemName === "name") {
                callback(new Errors.ValidationError("characters-profile-item-name-cant-be-name"));
                return;
            }
            
            var nameUsedTest = function(profile) {
                return profileItemName === profile.name;
            };
    
            callback(null, R.path(characterProfilePath, this.database).some(nameUsedTest));
        };
        // profile configurer
        LocalDBMS.prototype.renameProfileItem = function(newName, oldName, callback) {
            var that = this;
            this.isProfileItemNameUsed(newName, function(err, isUsed){
                if(err) {callback(err);return;}
                
                if(isUsed){
                    callback(new Errors.ValidationError("characters-such-name-already-used"));
                    return;
                }
                
                that.ee.trigger("renameProfileItem", [newName, oldName]);

                R.path(characterProfilePath, that.database).filter(function(elem) {
                    return elem.name === oldName;
                })[0].name = newName;
                callback();
            });
            
        };
        
        LocalDBMS.prototype.doExportProfileItemChange = function(profileItemName, checked, callback) {
            var profileItem = R.path(characterProfilePath, this.database).filter(function(elem) {
                return elem.name === profileItemName;
            })[0];
            
            profileItem.doExport = checked;
            callback();
        };
    
        // profile configurer
        LocalDBMS.prototype.updateDefaultValue = function(profileItemName, value, callback) {
            var info = R.path(characterProfilePath, this.database).filter(R.compose(R.equals(profileItemName), R.prop('name')))[0];
    
            var newOptions, newOptionsMap, missedValues;
    
            switch (info.type) {
            case "text":
            case "string":
            case "checkbox":
                info.value = value;
                break;
            case "number":
                if (isNaN(value)) {
                    callback(new Errors.ValidationError("characters-not-a-number"));
                    return;
                }
                info.value = Number(value);
                break;
            case "enum":
            case "multiEnum":
                if (value === "" && info.type === 'enum') {
                    callback(new Errors.ValidationError("characters-enum-item-cant-be-empty"));
                    return;
                }
                newOptions = value.split(",").map(R.trim);
                missedValues = info.value.trim() === '' ? [] : R.difference(info.value.split(","), newOptions);
                newOptionsMap = R.zipObj(newOptions, R.repeat(true, newOptions.length));
    
                if (missedValues.length !== 0) {
                    this.ee.trigger(info.type === 'enum' ? "replaceEnumValue" : "replaceMultiEnumValue", [profileItemName, newOptions[0], newOptionsMap]);
                }
    
                info.value = newOptions.join(",");
                break;
            default:
                callback(new Errors.InternalError('errors-unexpected-switch-argument', [info.type]));
            }
            callback();
        };
    
    };
    callback(profileConfigurerAPI);

})(function(api){
    typeof exports === 'undefined'? this['profileConfigurerAPI'] = api: module.exports = api;
}.bind(this));

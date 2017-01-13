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

    function profileConfigurerAPI(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CommonUtils   = opts.CommonUtils ;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        
        function getPath(type){
            if(type === 'character') return ['CharacterProfileStructure'];
            if(type === 'player') return ['PlayerProfileStructure'];
            return null;
        }
        
        LocalDBMS.prototype.getCharacterProfileStructure = function(callback){
            this.getProfileStructure('character', callback);
        };
        LocalDBMS.prototype.getProfileStructure = function(type, callback){
            callback(null, CommonUtils.clone(R.path(getPath(type), this.database)));
        };
        // profile configurer
        LocalDBMS.prototype.createProfileItem = function(type, name, itemType, value, toEnd, selectedIndex, callback) {
            var that = this;
            this.isProfileItemNameUsed(type, name, function(err, isUsed){
                if(err) {callback(err);return;}
                
                if(isUsed){
                    callback(new Errors.ValidationError("profiles-such-name-already-used"));
                    return;
                }
                
                var profileItem = {
                    name : name,
                    type : itemType,
                    value : value,
                    doExport : true
                };
                
                if (toEnd) {
                    R.path(getPath(type), that.database).push(profileItem);
                } else {
                    R.path(getPath(type), that.database).splice(selectedIndex, 0, profileItem);
                }
                that.ee.trigger("createProfileItem", [type, name, itemType, value]);
                callback();
            });
            
        };
        
        //profile configurer
        LocalDBMS.prototype.moveProfileItem = function(type, index, newIndex, callback){
            if(newIndex > index){
                newIndex--;
            }
            var profileSettings = R.path(getPath(type), this.database);
            var tmp = profileSettings[index];
            profileSettings.splice(index, 1);
            profileSettings.splice(newIndex, 0, tmp);
            callback();
        };
        // profile configurer
        LocalDBMS.prototype.removeProfileItem = function(type, index, profileItemName, callback) {
            CommonUtils.removeFromArrayByIndex(R.path(getPath(type), this.database), index);
            this.ee.trigger("removeProfileItem", arguments);
            callback();
        };
        // profile configurer
        LocalDBMS.prototype.changeProfileItemType = function(type, profileItemName, newType, callback) {
            var profileItem = R.path(getPath(type), this.database).filter(function(elem) {
                return elem.name === profileItemName;
            })[0];
    
            profileItem.type = newType;
            profileItem.value = Constants.profileFieldTypes[newType].value;
            this.ee.trigger("changeProfileItemType", arguments);
            callback();
        };
        
        LocalDBMS.prototype._changeProfileItemPlayerAccessPrecondition = function(type, profileItemName, playerAccessType){
            if (type !== 'character' && type !== 'player') {
                return [ null, 'binding-wrong-profile-type', [ type ] ];
            } else if (R.find(R.propEq('name', profileItemName), R.path(getPath(type), this.database)) === undefined) {
                return [ null, 'profiles-profile-item-is-not-exist', [ profileItemName ] ];
            } else if (!R.contains(playerAccessType, Constants.playerAccessTypes)) {
                return [ null, 'profiles-wrong-player-access-type', [ playerAccessType ] ];
            }
        };
  
        LocalDBMS.prototype.changeProfileItemPlayerAccess = function(type, profileItemName, playerAccessType, callback) {
            var err = this._changeProfileItemPlayerAccessPrecondition(type, profileItemName, playerAccessType);
            if(err){callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
            
            var profileStructure = R.path(getPath(type), this.database);
            var profileItem = R.find(R.propEq('name', profileItemName), profileStructure);
            profileItem.playerAccess = playerAccessType;
            callback();
        };
    
        // profile configurer
        LocalDBMS.prototype.isProfileItemNameUsed = function(type, profileItemName, callback) {
            if (profileItemName === "") {
                callback(new Errors.ValidationError("profiles-profile-item-name-is-not-specified"));
                return;
            }
            
            if (profileItemName === "name") {
                callback(new Errors.ValidationError("profiles-profile-item-name-cant-be-name"));
                return;
            }
            
            var nameUsedTest = function(profile) {
                return profileItemName === profile.name;
            };
    
            callback(null, R.path(getPath(type), this.database).some(nameUsedTest));
        };
        // profile configurer
        LocalDBMS.prototype.renameProfileItem = function(type, newName, oldName, callback) {
            var that = this;
            this.isProfileItemNameUsed(type, newName, function(err, isUsed){
                if(err) {callback(err);return;}
                
                if(isUsed){
                    callback(new Errors.ValidationError("profiles-such-name-already-used"));
                    return;
                }
                
                that.ee.trigger("renameProfileItem", [type, newName, oldName]);

                R.path(getPath(type), that.database).filter(function(elem) {
                    return elem.name === oldName;
                })[0].name = newName;
                callback();
            });
            
        };
        
        LocalDBMS.prototype.doExportProfileItemChange = function(type, profileItemName, checked, callback) {
            var profileItem = R.path(getPath(type), this.database).filter(function(elem) {
                return elem.name === profileItemName;
            })[0];
            
            profileItem.doExport = checked;
            callback();
        };
    
        // profile configurer
        LocalDBMS.prototype.updateDefaultValue = function(type, profileItemName, value, callback) {
            var info = R.path(getPath(type), this.database).filter(R.compose(R.equals(profileItemName), R.prop('name')))[0];
    
            var newOptions, newOptionsMap, missedValues;
    
            switch (info.type) {
            case "text":
            case "string":
            case "checkbox":
                info.value = value;
                break;
            case "number":
                if (isNaN(value)) {
                    callback(new Errors.ValidationError("profiles-not-a-number"));
                    return;
                }
                info.value = Number(value);
                break;
            case "enum":
            case "multiEnum":
                if (value === "" && info.type === 'enum') {
                    callback(new Errors.ValidationError("profiles-enum-item-cant-be-empty"));
                    return;
                }
                newOptions = value.split(",").map(R.trim);
                missedValues = info.value.trim() === '' ? [] : R.difference(info.value.split(","), newOptions);
                newOptionsMap = R.zipObj(newOptions, R.repeat(true, newOptions.length));
    
                if (missedValues.length !== 0) {
                    this.ee.trigger(info.type === 'enum' ? "replaceEnumValue" : "replaceMultiEnumValue", [type, profileItemName, newOptions[0], newOptionsMap]);
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

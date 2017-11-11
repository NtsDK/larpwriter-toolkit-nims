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
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        
        function getPath(type){
            if(type === 'character') return ['CharacterProfileStructure'];
            if(type === 'player') return ['PlayerProfileStructure'];
            return null;
        }
        
        var typeCheck = function(type){
            return PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes)]);
        };
        var itemTypeCheck = function(type){
            return PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, R.keys(Constants.profileFieldTypes))]);
        };
        var playerAccessCheck = function(type){
            return PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.playerAccessTypes)]);
        };
        
        LocalDBMS.prototype.getProfileStructure = function(type, callback){
            PC.precondition(typeCheck(type), callback, () => {
                callback(null, CU.clone(R.path(getPath(type), this.database)));
            });
        };
        // profile configurer
        LocalDBMS.prototype.createProfileItem = function(type, name, itemType, selectedIndex, callback) {
            var chain = [typeCheck(type), PC.isString(name), PC.notEquals(name, 'name'), 
                         PC.isNumber(selectedIndex), itemTypeCheck(itemType)]; 
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var container = R.path(getPath(type), this.database);
                chain = [PC.createEntityCheck(name, container.map(R.prop('name'))), PC.isInRange(selectedIndex, 0, container.length)];
                PC.precondition(PC.chainCheck(chain), callback, () => {
                    var value = Constants.profileFieldTypes[itemType].value;
                    var profileItem = {
                        name : name,
                        type : itemType,
                        value : value,
                        doExport : true,
                        playerAccess: 'hidden'
                    };
                    
                    container.splice(selectedIndex, 0, profileItem);
                    this.ee.trigger("createProfileItem", [type, name, itemType, value]);
                    callback();
                });
            });
        };
        
        //profile configurer
        LocalDBMS.prototype.moveProfileItem = function(type, index, newIndex, callback){
            var chain = [typeCheck(type),PC.isNumber(index),PC.isNumber(newIndex)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var container = R.path(getPath(type), this.database);
                chain = [PC.isInRange(index, 0, container.length-1), PC.isInRange(newIndex, 0, container.length)];
                PC.precondition(PC.chainCheck(chain), callback, () => {
                    if(newIndex > index){
                        newIndex--;
                    }
                    var tmp = container[index];
                    container.splice(index, 1);
                    container.splice(newIndex, 0, tmp);
                    callback();
                });
            });
        };
        // profile configurer
        LocalDBMS.prototype.removeProfileItem = function(type, index, profileItemName, callback) {
            var chain = [typeCheck(type),PC.isNumber(index),PC.isString(profileItemName)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var container = R.path(getPath(type), this.database);
                var els = container.map((item, i) => i + '/' +item.name);
                PC.precondition(PC.entityExists(index + '/' + profileItemName, els), callback, () => {
                    PC.removeFromArrayByIndex(container, index);
                    this.ee.trigger("removeProfileItem", arguments);
                    callback();
                });
            });
        };
        // profile configurer
        LocalDBMS.prototype.changeProfileItemType = function(type, profileItemName, newType, callback) {
            var chain = [typeCheck(type),PC.isString(profileItemName),itemTypeCheck(newType)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var container = R.path(getPath(type), this.database);
                PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), callback, () => {
                    var profileItem = container.filter((elem) => elem.name === profileItemName)[0];
                    profileItem.type = newType;
                    profileItem.value = Constants.profileFieldTypes[newType].value;
                    this.ee.trigger("changeProfileItemType", arguments);
                    callback();
                });
            });
        };
        
        LocalDBMS.prototype.changeProfileItemPlayerAccess = function(type, profileItemName, playerAccessType, callback) {
            var chain = [typeCheck(type),PC.isString(profileItemName),playerAccessCheck(playerAccessType)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var container = R.path(getPath(type), this.database);
                PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), callback, () => {
                    var profileStructure = R.path(getPath(type), this.database);
                    var profileItem = R.find(R.propEq('name', profileItemName), profileStructure);
                    profileItem.playerAccess = playerAccessType;
                    callback();
                });
            });
        };
    
        // profile configurer
        LocalDBMS.prototype.renameProfileItem = function(type, newName, oldName, callback) {
            PC.precondition(typeCheck(type), callback, () => {
                var container = R.path(getPath(type), this.database);
                PC.precondition(PC.renameEntityCheck(oldName, newName, container.map(R.prop('name'))), callback, () => {
                    this.ee.trigger("renameProfileItem", [type, newName, oldName]);
                    container.filter(function(elem) {
                        return elem.name === oldName;
                    })[0].name = newName;
                    callback();
                });
            });
        };
        
        LocalDBMS.prototype.doExportProfileItemChange = function(type, profileItemName, checked, callback) {
            var chain = [typeCheck(type),PC.isString(profileItemName),PC.isBoolean(checked)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var container = R.path(getPath(type), this.database);
                PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), callback, () => {
                    var profileItem = container.filter(function(elem) {
                        return elem.name === profileItemName;
                    })[0];
                    
                    profileItem.doExport = checked;
                    callback();
                });
            });
        };
        
        var typeSpecificPreconditions = function(itemType, value){
            switch (itemType) {
            case "text":
            case "string":
            case "checkbox":
            case "number":
            case "multiEnum":
                return PC.nil();
            case "enum":
                return PC.isNotEmptyString(value);
            }
        };
    
        // profile configurer
        LocalDBMS.prototype.updateDefaultValue = function(type, profileItemName, value, callback) {
            var chain = [typeCheck(type),PC.isString(profileItemName)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var container = R.path(getPath(type), this.database);
                PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), callback, () => {
                    var info = container.filter(R.compose(R.equals(profileItemName), R.prop('name')))[0];
                    chain = [PC.getValueCheck(info.type)(value),typeSpecificPreconditions(info.type, value)];
                    PC.precondition(PC.chainCheck(chain), callback, () => {
                        var newOptions, newOptionsMap, missedValues;
                
                        switch (info.type) {
                        case "text":
                        case "string":
                        case "checkbox":
                            info.value = value;
                            break;
                        case "number":
                            info.value = Number(value);
                            break;
                        case "enum":
                        case "multiEnum":
                            newOptions = R.uniq(value.split(",").map(R.trim));
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
                    });
                });
            });
        };
    };
    callback(profileConfigurerAPI);

})(function(api){
    typeof exports === 'undefined'? this['profileConfigurerAPI'] = api: module.exports = api;
}.bind(this));

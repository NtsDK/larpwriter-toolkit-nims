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
        
    function CommonUtils(exports, R, Constants, Errors) {
    
        exports.startsWith = function(str1, str2){
            return str1.substring(0, str2.length) === str2;
        };
    
        exports.removeFromArrayByIndex = function(array, from, to) {
            "use strict";
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        };
        
        exports.charOrdAFactoryBase = R.curry(function(sortDir, prepare){
            return function(a, b) {
                a = prepare(a);
                b = prepare(b);
                if(R.isNil(a) && R.isNil(b)) return 0;
                if(R.isNil(a)) return 1;
                if(R.isNil(b)) return -1;
                if (a > b)
                    return sortDir === "asc" ? 1 : -1;
                if (a < b)
                    return sortDir === "asc" ? -1 : 1;
                return 0;
            };
        });
        
        exports.charOrdAFactory = exports.charOrdAFactoryBase('asc');
        
        exports.charOrdA = exports.charOrdAFactory(function(a){return a.toLowerCase();});
        
        exports.eventsByTime = exports.charOrdAFactory(function(a){return new Date(a.time);});
    
        exports.strFormat = function(str, vals){
            "use strict";
            return str.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
                if (m == "{{") { return "{"; }
                if (m == "}}") { return "}"; }
                return vals[n];
            });
        };
        
        exports.consoleLog = function(str){
            "use strict";
            console.log(str);
        };
        
        exports.clone = function(o) {
            "use strict";
            if (!o || 'object' !== typeof o) {
                return o;
            }
            var c = 'function' === typeof o.pop ? [] : {};
            var p, v;
            for (p in o) {
                if (o.hasOwnProperty(p)) {
                    v = o[p];
                    if (v && 'object' === typeof v) {
                        c[p] = exports.clone(v);
                    } else {
                        c[p] = v;
                    }
                }
            }
            return c;
        };
        
        var preg_quote = function (str, delimiter) {
            "use strict";
            // http://kevin.vanzonneveld.net
            // + original by: booeyOH
            // + improved by: Ates Goral (http://magnetiq.com)
            // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // + bugfixed by: Onno Marsman
            // + improved by: Brett Zamir (http://brett-zamir.me)
            // * example 1: preg_quote("$40");
            // * returns 1: '\$40'
            // * example 2: preg_quote("*RRRING* Hello?");
            // * returns 2: '\*RRRING\* Hello\?'
            // * example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
            // * returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
            return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\'
                    + (delimiter || '') + '-]', 'g'), '\\$&');
        };
        
        exports.globStringToRegex = function (str) {
            "use strict";
            return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(
                    /\\\?/g, '.'), 'g');
        };
        
        // taken from MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        exports.escapeRegExp = function(string){
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        };
        
        exports.arr2map = function(array, key){
            return array.reduce(function(a, b) {
                a[b[key]] = b;
                return a;
            }, {});
        };
        
        exports.acceptDataRow = R.curry(function (model, dataString) {
            var value, regex, result;
            var dataMap = exports.arr2map(dataString, 'itemName');
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
            } else if(exports.startsWith(profileItemName, Constants.SUMMARY_PREFIX) ){
                return info.charactersSummary[characterName][profileItemName.substring(Constants.SUMMARY_PREFIX.length)];
            } else if(exports.startsWith(profileItemName, Constants.CHAR_PREFIX) ){
                return info.characters.profiles[characterName][profileItemName.substring(Constants.CHAR_PREFIX.length)];
            } else {
                throw new Error('Unexpected profileItemName: ' + profileItemName);
            }
        };
        var getCharacterInfoValue2 = function(info, profileId, profileItemName){
            if (profileItemName == Constants.CHAR_NAME || 
                    profileItemName == Constants.CHAR_OWNER || 
                    exports.startsWith(profileItemName, Constants.SUMMARY_PREFIX) || 
                    exports.startsWith(profileItemName, Constants.CHAR_PREFIX)) {
                if(profileId[0] === '') return undefined;
                var characterName = profileId[0];
                if(profileItemName == Constants.CHAR_NAME){
                    return characterName;
                } else if(profileItemName == Constants.CHAR_OWNER){
                    return info.characters.owners[characterName];
                } else if(exports.startsWith(profileItemName, Constants.SUMMARY_PREFIX) ){
                    return info.charactersSummary[characterName][profileItemName.substring(Constants.SUMMARY_PREFIX.length)];
                } else if(exports.startsWith(profileItemName, Constants.CHAR_PREFIX) ){
                    return info.characters.profiles[characterName][profileItemName.substring(Constants.CHAR_PREFIX.length)];
                } 
            } else if(profileItemName == Constants.PLAYER_NAME || 
                    profileItemName == Constants.PLAYER_OWNER || 
                    exports.startsWith(profileItemName, Constants.PLAYER_PREFIX)){
                if(profileId[1] === '') return undefined;
                var playerName = profileId[1];
                if(profileItemName == Constants.PLAYER_NAME){
                    return playerName;
                } else if(profileItemName == Constants.PLAYER_OWNER){
                    return info.players.owners[playerName];
                } else if(exports.startsWith(profileItemName, Constants.PLAYER_PREFIX) ){
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
        
        exports.makeValidationError = function(err){
            err.splice(0, 0, null);
            return new (Function.prototype.bind.apply(Errors.ValidationError, err));
        };
        
        // precondition API
        exports.precondition = R.curry(function(check, reject, resolve){
            var err = check();
            if(err === null){
                resolve();
            } else {
                reject(exports.makeValidationError(err));
            }
        });
        
        exports.chainCheck = R.curry(function(arr){
            return () => {
                return arr.reduce(function(err, item){
                    if(err) return err;
                    return item();
                }, null);
            }
        });
        
        exports.eitherCheck = R.curry(function(func1, func2){
            return () => {
                var res1 = func1();
                if(res1 === null){
                    return null;
                }
                var res2 = func2();
                if(res2 === null){
                    return null;
                }
                return res1;
            }
        });
        
        // primitive precondition checks
        var arrContainsElsCheck = R.curry(function(msg, els, valueList){
            return () => {
                var diff = R.difference(els, valueList);
                return diff.length === 0 ? null : [msg, [JSON.stringify(diff)]];
            }
        });
        
        exports.elementsFromEnum = arrContainsElsCheck('errors-unsupported-types-in-list');
        exports.entitiesExist = arrContainsElsCheck('errors-entities-are-not-exist');
        
        var arrContainsElCheck = R.curry(function(msg, el, valueList){
            return () => {
                return R.contains(el, valueList) ? null : [msg, [el]];
            }
        });
        
        exports.elementFromEnum = arrContainsElCheck('errors-unsupported-type-in-list');
        exports.entityExists = arrContainsElCheck('errors-entity-is-not-exist');
        
        exports.entityIsNotUsed = R.curry(function(el, valueList){
            return () => {
                return !R.contains(el, valueList) ? null : ['errors-entity-is-used', [el]];
            }
        });
        
        exports.isString = R.curry(function(el){
            return () => {
                return R.is(String, el) ? null : ['errors-argument-is-not-a-string', [el]];
            }
        });
        
        exports.isEmptyString = R.curry(function(el){
            return () => {
                return R.equals('', el) ? null : ['errors-argument-is-not-empty-string', [el]];
            }
        });
        
        exports.isNotEmptyString = R.curry(function(el){
            return () => {
                return !R.equals('', el) ? null : ['errors-argument-is-empty-string', [el]];
            }
        });
        
        exports.nameIsNotEmpty = R.curry(function(el){
            return () => {
                return !R.equals('', el) ? null : ['errors-name-is-empty-string', [el]];
            }
        });
        
        exports.isArray = R.curry(function(el){
            return () => {
                return R.is(Array, el) ? null : ['errors-argument-is-not-an-array', [el]];
            }
        });
        
        exports.isObject = R.curry(function(el){
            return () => {
                return R.is(Object, el) ? null : ['errors-argument-is-not-an-object', [el]];
            }
        });
        
        exports.isBoolean = R.curry(function(el){
            return () => {
                return R.is(Boolean, el) ? null : ['errors-argument-is-not-a-boolean', [el]];
            }
        });
        
        exports.isNumber = R.curry(function(el){
            return () => {
                return R.is(Number, el) ? null : ['errors-argument-is-not-a-number', [el]];
            }
        });
        
        exports.isNil = R.curry(function(el){
            return () => {
                return R.isNil(el) ? null : ['errors-argument-is-not-nil', [el]];
            }
        });
        
        exports.nil = R.curry(function(){
            return () => {
                return null;
            }
        });
        
        exports.notEquals = R.curry(function(el, el2){
            return () => {
                return !R.equals(el, el2) ? null : ['errors-argument-must-not-be-equal', [el]];
            }
        });
        
        exports.isInRange = R.curry(function(el, low, up){
            return () => {
                return low <= el && el <= up ? null : ['errors-argument-is-not-in-range', [el, low, up]];
            }
        });
        
        exports.createEntityCheck = R.curry(function(entityName, entityList){
            return exports.chainCheck([exports.isString(entityName), exports.nameIsNotEmpty(entityName), exports.entityIsNotUsed(entityName, entityList)]);
        });
        
        exports.entityExistsCheck = exports.removeEntityCheck = R.curry(function(entityName, entityList){
            return exports.chainCheck([exports.isString(entityName), exports.entityExists(entityName, entityList)]);
        });
        
        exports.renameEntityCheck = R.curry(function(fromName, toName, entityList){
            return exports.chainCheck([exports.removeEntityCheck(fromName, entityList), exports.createEntityCheck(toName, entityList)]);
        });
        
        exports.switchEntityCheck = R.curry(function(entity1, entity2, entityList, entityContainerList){
            return exports.chainCheck([exports.entityExistsCheck(entity1, entityList), 
                                       exports.entityExistsCheck(entity2, entityList),
                                       exports.entityExists(entity1, entityContainerList),
                                       exports.entityIsNotUsed(entity2, entityContainerList)]);
        });
        
        exports.getValueCheck = function(type){
            switch (type) {
            case "checkbox":
                return exports.isBoolean;
            case "number":
                return exports.isNumber;
            }
            return exports.isString;
        };
        
    }
    
    callback(CommonUtils);

})(function(api){
    typeof exports === 'undefined'? api(this['CommonUtils'] = {}, R, Constants, Errors) : module.exports = api;
}.bind(this));
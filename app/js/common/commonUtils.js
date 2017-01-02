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
        
    function CommonUtils(exports, R, Constants) {
    
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
            "use strict";
            return function(a, b) {
                a = prepare(a);
                b = prepare(b);
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
            var result = true;
            var value, regex;
            var dataMap = exports.arr2map(dataString, 'itemName');
            model.forEach(function(filterItem){
                if (!result) {
                    return;
                }
                value = dataMap[filterItem.name].value;
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
            });
            return result;
        });
        
        exports.makeGroupedProfileFilterInfo = function(opts){
            var groupedProfileFilterItems = [];
            var arr = [];
            arr.push({
                name : Constants.CHAR_NAME,
                type : "string",
                displayName : "character-filter-character",
            });
            arr.push({
                name : Constants.CHAR_OWNER,
                type : "string",
                displayName : "character-filter-character-owner",
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
                name: 'character',
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
                name: 'summary',
                profileFilterItems: arr
            });
            opts.groupedProfileFilterItems = groupedProfileFilterItems;
            return opts;
        };
        
        exports.getCharacterInfoValue = function(info, characterName, profileItemName){
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
        
        exports.getDataArray = R.curry(function (info, character) {
            return R.flatten(info.groupedProfileFilterItems.map(R.prop('profileFilterItems'))).map(function(profileItemInfo){
                var value = exports.getCharacterInfoValue(info, character, profileItemInfo.name);
                return {
                    value: value,
                    type: profileItemInfo.type,
                    itemName: profileItemInfo.name
                }
            });
        });
        
        exports.getDataArrays = function(info, filterModel) {
            return Object.keys(info.characters.profiles).map(exports.getDataArray(info)).filter(exports.acceptDataRow(filterModel));
        };
        
        exports.isFilterModelCompatibleWithProfiles = function(profileSettings, filterModel){
            var profilePart = filterModel.filter(R.compose(R.test(new RegExp('^' + Constants.CHAR_PREFIX)), R.prop('name')));
            var profileSettingsMap = R.indexBy(R.prop('name'), profileSettings);
            var conflictTypes = [];
            profilePart.forEach(function(modelItem){
                var itemName = modelItem.name.substring(Constants.CHAR_PREFIX.length);
                var profileItem = profileSettingsMap[itemName];
                if(!profileItem || profileItem.type !== modelItem.type){
                    conflictTypes.push(itemName);
                    return;
                }
                if(profileItem.type === 'enum'){
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


    }
    
    callback(CommonUtils);

})(function(api){
    typeof exports === 'undefined'? api(this['CommonUtils'] = {}, R, Constants) : module.exports = api;
}.bind(this));
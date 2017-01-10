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

/*global
 // Utils
 */

"use strict";

(function(exports) {
    
    // isServer - used in server mode. If false then user in logs will be named "user".
    // environment - used to disable this.log function in thin client in server version.
    //      I agree it is strange.
    // extras - additions to include list. Used in server mode.
    exports.attachLogCalls = function(LocalDBMS, R, isServer, extras) {
        
        // argument description
        // add function name to log it
        // ignoreParams - make true if you don't need params in log. 
        //     Example - createMaster params include password.
        // filter - add this function to filter out unnecessary calls. 
        //     Example - we need all meta info calls except description.
        // rewrite - make true if you don't want to flood log with some repeated call. 
        //     For example auto call of getDatabase will flood everything.
        var includeList = {
            "getDatabase": {
                "rewrite" : true
            },
            "setDatabase": {
                "ignoreParams": true
            },
            "setMetaInfo" : {
                "filter": function(args){
                    return args[0] !== "description";
                }
            },
            "createProfile" : {},
            "renameProfile" : {},
            "removeProfile" : {},
            
            "createProfileItem" : {},
            "renameProfileItem" : {},
            "moveProfileItem" : {},
            "removeProfileItem" : {},
            "updateDefaultValue" : {},
            "changeProfileItemType" : {},
            
            "createStory" : {},
            "renameStory" : {},
            "removeStory" : {},
            
            "addStoryCharacter" : {},
            "switchStoryCharacters" : {},
            "removeStoryCharacter" : {},
            "updateCharacterInventory" : {},
            "onChangeCharacterActivity" : {},

            "addCharacterToEvent" : {},
            "removeCharacterFromEvent" : {},

            "createEvent" : {},
            "moveEvent" : {},
            "cloneEvent" : {},
            "mergeEvents" : {},
            "removeEvent" : {},
            "updateEventProperty" : {
                "filter": function(args){
                    return args[2] !== "text";
                }
            },
            
            "createGroup" : {},
            "renameGroup" : {},
            "removeGroup" : {},
            "saveFilterToGroup" : {},
            
            "changeAdaptationReadyStatus" : {},
            "getBriefingData" : {},
            
            "addBoardGroup" : {},
            "switchGroups" : {},
            "setGroupNotes" : {},
            "removeBoardGroup" : {},
            "createResource" : {},
            "renameResource" : {},
            "removeResource" : {},
            "addEdge" : {},
            "setEdgeLabel" : {},
            "removeEdge" : {},
        };
        
        if(extras){
            includeList = R.merge(includeList, extras);
        }
        
        Object.keys(LocalDBMS.prototype)
        .filter(R.prop(R.__, includeList))
        .forEach(function(funcName){
            var oldFun = LocalDBMS.prototype[funcName];
            LocalDBMS.prototype[funcName] = function(){
                
                var arr = [];
                for (var i = 0; i < arguments.length-1; i++) {
                    arr.push(arguments[i]);
                }
                
                var accept = true;
                if(includeList[funcName].filter){
                    accept = includeList[funcName].filter(arr);
                }
                
                if(accept){
                    var userName = "user";
                    if(isServer){
                        userName = arguments[arguments.length-1].name;
                    }
                    
                    this.log(userName, funcName, includeList[funcName].rewrite, includeList[funcName].ignoreParams ? [] : arr);
                }
                
                return oldFun.apply(this, arguments);
            }
        });
        
    };
    
})(typeof exports === 'undefined' ? this['Logger'] = {} : exports);

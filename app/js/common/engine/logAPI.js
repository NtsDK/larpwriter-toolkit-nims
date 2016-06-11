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
    
    // argument description
    // add function name to log it
    // ignoreParams - make true if you don't need params. 
    //     Example - createUser params include password.
    // filter - add this function to filter out unnecessary calls. 
    //     Example - we need all meta info calls except description.
    // rewrite - make true if you don't want to flood log with some repeated call. 
    //     For example auto call of getDatabase will flood everything.
    function logAPI(LocalDBMS, R, CommonUtils, isServer, environment, extras) {
        
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
            "createCharacter" : {},
            "renameCharacter" : {},
            "removeCharacter" : {},
            
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
            
            "changeAdaptationReadyStatus" : {},
            "getBriefingData" : {},
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
                    
                    this.log(userName, funcName, includeList[funcName].ignoreParams ? [] : arr);
                }
                
                return oldFun.apply(this, arguments);
            }
        });
        
        if(environment === "Standalone"){
            LocalDBMS.prototype.log = function(userName, funcName, params) {
                "use strict";
                var info = [userName, new Date().toString(), funcName, JSON.stringify(params)];
                if(this.database){
                    if(includeList[funcName].rewrite && this.database.Log[this.database.Log.length-1] != undefined){
                        if(this.database.Log[this.database.Log.length-1][2] === funcName){
                            this.database.Log[this.database.Log.length-1] = info;
                        }
                    } else {
                        this.database.Log.push(info);
                        if(this.database.Log.length > 2000){
                            this.database.Log.splice(0, 1000);
                        }
                    }
//                console.log(this.database.Log.length);
                }
                console.log(CommonUtils.strFormat("{0},{1},{2},{3}", info));
            };
        }
        
        LocalDBMS.prototype.getLog = function(pageNumber, callback) {
            "use strict";
            var requestedLog = [];
            for (var i = pageNumber*100; i < (pageNumber+1)*100; i++) {
                if(this.database.Log[i]){
                    requestedLog.push([i+1].concat(this.database.Log[i]));
                }
            }
            
            callback(null, {
                requestedLog: requestedLog,
                logSize: Math.ceil(this.database.Log.length/100)
            });
        };
    };
    
    callback(logAPI);

})(function(api){
    typeof exports === 'undefined'? this['logAPI'] = api: module.exports = api;
});
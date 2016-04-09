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
    
    function logAPI(LocalDBMS, R, CommonUtils, isServer, extras) {
        
        var includeList = {
            "getDatabase": {},
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
        
        LocalDBMS.prototype.log = function(userName, funcName, params) {
            "use strict";
            var info = [userName, new Date(), funcName, JSON.stringify(params)];
            if(this.database){
                this.database.Log.push(info);
                if(this.database.Log.length > 2000){
                    this.database.Log.splice(0, 1000);
                }
//                console.log(this.database.Log.length);
            }
            console.log(CommonUtils.strFormat("{0},{1},{2},{3}", info));
        };
    };
    
    callback(logAPI);

})(function(api){
    typeof exports === 'undefined'? this['logAPI'] = api: module.exports = api;
});
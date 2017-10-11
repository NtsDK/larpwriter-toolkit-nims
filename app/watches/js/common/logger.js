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
    
    // argument description
    // add function name to log it
    // ignoreParams - make true if you don't need params in log. 
    //     Example - createMaster params include password.
    // filter - add this function to filter out unnecessary calls. 
    //     Example - we need all meta info calls except description.
    // rewrite - make true if you don't want to flood log with some repeated call. 
    //     For example auto call of getDatabase will flood everything.
    exports.apiInfo = {
        "baseAPI" : {
            "_init" : null,
            "getDatabase" : {"rewrite" : true},
            "setDatabase" : {"ignoreParams": true},
            "getMetaInfo" : null,
            "setMetaInfo" : {}
        },
        "consistencyCheckAPI" : {
            "getConsistencyCheckResult" : null
        },
        "statisticsAPI" : {
            "getStatistics" : null
        },
        "profilesAPI" : {
            "getProfileNamesArray" : null,
            "getProfile" : null,
            "getAllProfiles" : null,
            "createProfile" : {},
            "renameProfile" : {},
            "removeProfile" : {},
            "updateProfileField" : {}
        },
        "profileBindingAPI" : {
            "getProfileBindings" : null,
            "getExtendedProfileBindings" : null,
            "getProfileBinding" : null,
            "createBinding" : {},
            "removeBinding" : {}
        },
        "groupsAPI" : {
            "getGroupNamesArray" : null,
            "getGroup" : null,
            "getCharacterGroupTexts" : null,
            "getAllCharacterGroupTexts" : null,
            "createGroup" : {},
            "renameGroup" : {},
            "removeGroup" : {},
            "saveFilterToGroup" : {},
            "updateGroupField" : {},
            "getProfileFilterInfo" : null,
            "getGroupCharacterSets" : null
        },
        "groupSchemaAPI" : {
            "getGroupSchemas" : null
        },
        "investigationBoardAPI" : {
            "getInvestigationBoardData" : null,
            "addBoardGroup" : {},
            "switchGroups" : {},
            "setGroupNotes" : {},
            "removeBoardGroup" : {},
            "createResource" : {},
            "renameResource" : {},
            "removeResource" : {},
            "addEdge" : {},
            "setEdgeLabel" : {},
            "removeEdge" : {}
        },
        "relationsAPI" : {
            "getRelationsSummary" : null,
            "setCharacterRelation" : {}
        },
        "briefingExportAPI" : {
            "getBriefingData" : {}
        },
        "profileConfigurerAPI" : {
            "getProfileStructure" : null,
            "createProfileItem" : {},
            "moveProfileItem" : {},
            "removeProfileItem" : {},
            "changeProfileItemType" : {},
            "changeProfileItemPlayerAccess" : {},
            "renameProfileItem" : {},
            "doExportProfileItemChange" : {},
            "updateDefaultValue" : {}
        },
        "entityAPI" : {
            "getEntityNamesArray" : null
        },
        "storyBaseAPI" : {
            "getStoryNamesArray" : null,
            "getAllStories" : null,
            "getMasterStory" : null,
            "setMasterStory" : {},
            "createStory" : {},
            "renameStory" : {},
            "removeStory" : {}
        },
        "storyEventsAPI" : {
            "getStoryEvents" : null,
            "createEvent" : {},
            "moveEvent" : {},
            "cloneEvent" : {},
            "mergeEvents" : {},
            "removeEvent" : {},
            "setEventOriginProperty" : {}
        },
        "storyCharactersAPI" : {
            "getStoryCharacterNamesArray" : null,
            "getStoryCharacters" : null,
            "addStoryCharacter" : {},
            "switchStoryCharacters" : {},
            "removeStoryCharacter" : {},
            "updateCharacterInventory" : {},
            "onChangeCharacterActivity" : {},
            "addCharacterToEvent" : {},
            "removeCharacterFromEvent" : {}
        },
        "storyViewAPI" : {
            "getAllInventoryLists" : null,
            "getCharacterEventGroupsByStory" : null,
            "getCharacterEventsByTime" : null,
            "getEventsTimeInfo" : null,
            "getCharactersSummary" : null,
            "getCharacterReport" : null
        },
        "storyAdaptationsAPI" : {
            "getFilteredStoryNames" : null,
            "getStory" : null,
            "setEventAdaptationProperty" : {}
        },
        "accessManagerAPI" : {
            "getManagementInfo" : null,
            "assignAdmin" : {},
            "assignEditor" : {},
            "removeEditor" : {},
            "changeAdaptationRightsMode" : {},
            "createMaster" : {"ignoreParams": true},
            "changeMasterPassword" : {"ignoreParams": true},
            "removeMaster" : {},
            "removePermission" : {},
            "assignPermission" : {},
            "publishPermissionsUpdate" : null,
            "getPlayerLoginsArray" : null,
            "createPlayer" : {"ignoreParams": true},
            "createPlayerLogin" : {"ignoreParams": true},
            "changePlayerPassword" : {"ignoreParams": true},
            "removePlayerLogin" : {},
            "getWelcomeText" : null,
            "setWelcomeText" : {},
            "getPlayersOptions" : null,
            "setPlayerOption" : {},
            "getPlayerProfileInfo" : null,
            "createCharacterByPlayer" : {}
        },
        "textSearchAPI" : {
            "getTexts" : null
        },
        "userAPI" : {
            "getUser" : null,
            "setPassword" : null,
            "checkPassword" : null,
            "login" : null,
            "register" : null,
            "getUserProfile" : null,
            "getCraters" : null,
            "getAnalystInfluences" : null,
            "applyCrater" : {},
            "removePersonInfluence" : {},
            "createMasterPersonInfluence" : {},
            "applyPersonInfluence" : {},
            "hearSummons" : {},
            "unhearSummons" : {},
            "applyInfluence" : {}
        },
        "accessManagerOverridesAPI" : {},
        "overridesAPI" : {},
        "permissionAPI" : {
            "hasPermission" : null
        },
        "permissionSummaryAPI" : {
            "_getOwnerMap" : null,
            "getPermissionsSummary" : null, // special case
            "subscribeOnPermissionsUpdate" : null // special case
        },
        "logAPI" : {
            "log" : null,
            "getLog" : null
        },
        "influencesAPI" : {
            "getInfluences" : null,
            "createInfluence" : {},
            "removeInfluence" : {}
        }
    };
    
    
    // isServer - used in server mode. If false then user in logs will be named "user".
    // environment - used to disable this.log function in thin client in server version.
    //      I agree it is strange.
    exports.attachLogCalls = function(LocalDBMS, R, isServer) {
        
        var apiInfoObj = R.mergeAll(R.values(exports.apiInfo));
        var filteredApi = R.filter(R.compose(R.not, R.isNil), apiInfoObj);
        
        Object.keys(LocalDBMS.prototype)
        .filter(R.prop(R.__, filteredApi))
        .forEach(function(funcName){
            var oldFun = LocalDBMS.prototype[funcName];
            LocalDBMS.prototype[funcName] = function(){
                
                var arr = [];
                for (var i = 0; i < arguments.length-1; i++) {
                    arr.push(arguments[i]);
                }
                
                var accept = true;
                if(filteredApi[funcName].filter){
                    accept = filteredApi[funcName].filter(arr);
                }
                
                if(accept){
                    var userName = "user";
                    if(isServer){
                        userName = arguments[arguments.length-1].name;
                    }
                    
                    this.log(userName, funcName, !!filteredApi[funcName].rewrite, filteredApi[funcName].ignoreParams ? [] : arr);
                }
                
                return oldFun.apply(this, arguments);
            }
        });
        
    };
    
})(typeof exports === 'undefined' ? this['Logger'] = {} : exports);

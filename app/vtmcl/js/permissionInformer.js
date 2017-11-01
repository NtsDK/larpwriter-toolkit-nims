/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

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
 */

"use strict";

(function(exports, mode){

    var state = {};
    
    state.summary = {};
    
    if(mode === "NIMS_Server" && PERMISSION_INFORMER_ENABLED){
        
        exports.refresh = function(callback) {
            callback();
        };
//        exports.refresh = function(callback) {
//            var request = $.ajax({
//                url : "/getPermissionsSummary",
//                dataType : "text",
//                method : "GET",
//                contentType : "application/json;charset=utf-8",
//                timeout: Constants.httpTimeout
//            });
//            
//            request.done(function(data) {
//                state.summary = JSON.parse(data);
//                if(callback){
//                    callback();
//                } else {
//                    exports.subscribe();
//                }
//    //        alert(data);
//    //        alert(state.summary);
//            });
//            
//            request.fail(function(errorInfo, textStatus, errorThrown) {
//                if(callback){
//                    callback(errorInfo.responseText || 'error');
//                } else {
//                    setTimeout(exports.subscribe, 500);
//                }
//            });
//        };
//        
//        exports.subscribe = function() {
//            
//            var request = $.ajax({
//                url : "/subscribeOnPermissionsUpdate",
//                dataType : "text",
//                method : "GET",
//                contentType : "application/json;charset=utf-8",
//                timeout: Constants.httpTimeout
//            });
//            
//            request.done(function(data) {
//                state.summary = JSON.parse(data);
//    //        alert(data);
//    //        alert(state.summary);
//                exports.subscribe();
//            });
//            
//            request.fail(function(errorInfo, textStatus, errorThrown) {
//                setTimeout(exports.subscribe, 500);
//            });
//        };
//        
//        exports.refresh();
    
        exports.isAdmin = function(callback){
            callback(null, state.summary.isAdmin);
        };
        
        exports.isEditor = function(callback){
            callback(null, state.summary.isEditor);
        };
        
        exports.isEntityEditable = function(type, entityName, callback) {
            callback(null, isObjectEditableSync(type, entityName));
        };
        
        var isObjectEditableSync = function(type, name){
            if(state.summary.isEditor){
                return true;
            }
            if(state.summary.existEditor){
                return false;
            }
            return state.summary.user[type].indexOf(name) !== -1;
        };
        
//        exports.getEntityNamesArray = R.curry(function(type, editableOnly, callback){
//            var userEntities = state.summary.user[type];
//            var allEntities = state.summary.all[type];
//            var ownerMap = state.summary.ownerMaps[type];
//            var names = allEntities.filter(function(name){
//                if(editableOnly){
//                    return isObjectEditableSync(type, name);
//                } else {
//                    return true;
//                }
//            }).map(function(name){
//                return {
//                    displayName : ownerMap[name] + ". " + name,
//                    value : name,
//                    editable : isObjectEditableSync(type, name),
//                    isOwner : userEntities.indexOf(name) !== -1
//                };
//            });
//            
//            names.sort(Utils.charOrdAObject);
//            
//            callback(null, names);
//        });
        
        exports.getEntityNamesArray = R.curry(function(type, editableOnly, callback){
            function processNames(err, names){
                if(err) {Utils.handleError(err); return;}
                var newNames = [];
                names.forEach(function(name){
                    newNames.push({
                        displayName:name,
                        value:name,
                        editable: true
                    });
                });
                callback(null, newNames);
            }
            DBMS.getEntityNamesArray(type, processNames);
        });
        
        exports.areAdaptationsEditable = function(adaptations, callback){
            var map = {};
            var isAdaptationRightsByStory = state.summary.isAdaptationRightsByStory;
            
            adaptations.forEach(function(elem){
                var key = elem.storyName + "-" + elem.characterName;
                if(isAdaptationRightsByStory){
                    map[key] = isObjectEditableSync('story', elem.storyName);
                } else {
                    map[key] = isObjectEditableSync('character', elem.characterName);
                }
            });
            
            callback(null, map);
        };
        
    } else if (mode === "Standalone"){
        
        exports.refresh = function(callback) {
            callback();
        };
        
        exports.isAdmin = function(callback){
            callback(null, true);
        };
        
        exports.isEditor = function(callback){
            callback(null, true);
        };
        
        exports.getEntityNamesArray = R.curry(function(type, editableOnly, callback){
            function processNames(err, names){
                if(err) {Utils.handleError(err); return;}
                var newNames = [];
                names.forEach(function(name){
                    newNames.push({
                        displayName:name,
                        value:name,
                        editable: true
                    });
                });
                callback(null, newNames);
            }
            DBMS.getEntityNamesArray(type, processNames);
        });
        
        exports.isEntityEditable = function(type, entityName, callback) {
            callback(null, true);
        };
        
        exports.areAdaptationsEditable = function(adaptations, callback){
            var map = {};
            adaptations.forEach(function(elem){
                map[elem.storyName + "-" + elem.characterName] = true;
            });
            
            callback(null, map);
        };
    }

})(this['PermissionInformer']={}, MODE);
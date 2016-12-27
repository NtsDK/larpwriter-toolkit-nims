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
 */

"use strict";

var PermissionInformer = {};

PermissionInformer.summary = {
};


if(MODE === "NIMS_Server"){
    PermissionInformer.refresh = function(callback) {
        var request = $.ajax({
            url : "/getPermissionsSummary",
            dataType : "text",
            method : "GET",
            contentType : "application/json;charset=utf-8",
            timeout: Constants.httpTimeout
        });
        
        request.done(function(data) {
            PermissionInformer.summary = JSON.parse(data);
            if(callback){
                callback();
            } else {
                PermissionInformer.subscribe();
            }
//        alert(data);
//        alert(PermissionInformer.summary);
        });
        
        request.fail(function(errorInfo, textStatus, errorThrown) {
            if(callback){
                callback(errorInfo.responseText || 'error');
            } else {
                setTimeout(PermissionInformer.subscribe, 500);
            }
        });
    };
    
    PermissionInformer.subscribe = function() {
        
        var request = $.ajax({
            url : "/subscribeOnPermissionsUpdate",
            dataType : "text",
            method : "GET",
            contentType : "application/json;charset=utf-8",
            timeout: Constants.httpTimeout
        });
        
        request.done(function(data) {
            PermissionInformer.summary = JSON.parse(data);
//        alert(data);
//        alert(PermissionInformer.summary);
            PermissionInformer.subscribe();
        });
        
        request.fail(function(errorInfo, textStatus, errorThrown) {
            setTimeout(PermissionInformer.subscribe, 500);
        });
    };
    
    PermissionInformer.refresh();

    PermissionInformer.isAdmin = function(callback){
        callback(null, PermissionInformer.summary.isAdmin);
    };
    
    PermissionInformer.isEditor = function(callback){
        callback(null, PermissionInformer.summary.isEditor);
    };
    
    PermissionInformer.isCharacterEditable = function(characterName, callback){
        callback(null, PermissionInformer.isObjectEditableSync('characters', characterName));
    };

    PermissionInformer.isStoryEditable = function(storyName, callback){
        callback(null, PermissionInformer.isObjectEditableSync('stories', storyName));
    };

    PermissionInformer.isGroupEditable = function(groupName, callback){
        callback(null, PermissionInformer.isObjectEditableSync('groups', groupName));
    };
    
    PermissionInformer.isObjectEditableSync = function(type, name){
        if(PermissionInformer.summary.isEditor){
            return true;
        }
        if(PermissionInformer.summary.existEditor){
            return false;
        }
        return PermissionInformer.summary.user[type].indexOf(name) !== -1;
    };
    
    PermissionInformer.getEntityNamesArray = R.curry(function(type, editableOnly, callback){
        var userEntities = PermissionInformer.summary.user[type];
        var allEntities = PermissionInformer.summary.all[type];
        var ownerMap = PermissionInformer.summary.ownerMaps[type];
        var names = allEntities.filter(function(name){
            if(editableOnly){
                return PermissionInformer.isObjectEditableSync(type, name);
            } else {
                return true;
            }
        }).map(function(name){
            return {
                displayName : ownerMap[name] + ". " + name,
                value : name,
                editable : PermissionInformer.isObjectEditableSync(type, name),
                isOwner : userEntities.indexOf(name) !== -1
            };
        });
        
        names.sort(Utils.charOrdAObject);
        
        callback(null, names);
    });
    
//    PermissionInformer.getCharacterNamesArray = PermissionInformer.getEntityNamesArray('characters');
//    PermissionInformer.getStoryNamesArray = PermissionInformer.getEntityNamesArray('stories');
//    PermissionInformer.getGroupNamesArray = PermissionInformer.getEntityNamesArray('groups');
    
    PermissionInformer.areAdaptationsEditable = function(adaptations, callback){
        var map = {};
        var isAdaptationRightsByStory = PermissionInformer.summary.isAdaptationRightsByStory;
        
        adaptations.forEach(function(elem){
            var key = elem.storyName + "-" + elem.characterName;
            if(isAdaptationRightsByStory){
                map[key] = PermissionInformer.isObjectEditableSync('stories', elem.storyName);
            } else {
                map[key] = PermissionInformer.isObjectEditableSync('characters', elem.characterName);
            }
        });
        
        callback(null, map);
    };
    
} else {
    
    PermissionInformer.refresh = function(callback) {
        callback();
    };
    
    PermissionInformer.isAdmin = function(callback){
        callback(null, true);
    };
    
    PermissionInformer.isEditor = function(callback){
        callback(null, true);
    };
    
//    PermissionInformer.getOwnerMap = function(objectType, callback){
//        var func;
//        switch(objectType){
//        case 'characters': func = 'getCharacterNamesArray'; break;
//        case 'stories': func = 'getStoryNamesArray'; break;
//        case 'groups': func = 'getGroupNamesArray'; break;
//        default: callback("Unknown objectType: " + objectType);
//        }
//        DBMS[func](function(err, names){
//            if(err) {Utils.handleError(err); return;}
//            names = R.zipObj(names, R.repeat('user', names.length));
//            callback(null, names);
//        });
//    };
    
    PermissionInformer.getEntityNamesArray = R.curry(function(type, editableOnly, callback){
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
    
    PermissionInformer.isStoryEditable = 
    PermissionInformer.isGroupEditable = 
    PermissionInformer.isCharacterEditable = function(entityName, callback) {
        callback(null, true);
    };
    
    PermissionInformer.areAdaptationsEditable = function(adaptations, callback){
        var map = {};
        adaptations.forEach(function(elem){
            map[elem.storyName + "-" + elem.characterName] = true;
        });
        
        callback(null, map);
    };
}
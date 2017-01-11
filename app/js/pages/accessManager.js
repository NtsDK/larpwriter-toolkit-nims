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
 Utils, DBMS
 */

"use strict";

(function(exports){
    
    var state = {};

    state.entities = ['characters','stories','groups','players'];
    
    var root = '#accessManagerDiv ';
    
    exports.init = function() {
        listen(getEl("createUserButton"),"click", createMaster);
        listen(getEl("changePasswordButton"),"click", changeMasterPassword);
        listen(getEl("removeUserButton"),"click", removeMaster);
        listen(getEl("assignPermissionButton"),"click", assignPermission);
        listen(getEl("removePermissionButton"),"click", removePermission);
        listen(getEl("newAdminButton"),"click", assignNewAdmin);
        listen(getEl("removeEditorButton"),"click", removeEditor);
        listen(getEl("newEditorButton"),"click", assignEditor);
        
        nl2array(queryElEls(queryEl(root), '.adaptationRights')).map(listen(R.__, "click", changeAdaptationRightsMode));
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        DBMS.getManagementInfo(function(err, managementInfo){
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.isAdmin(function(err, isAdmin){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.isEditor(function(err, isEditor){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.getEntityNamesArray('character', !isAdmin, function(err, characterNames){
                        if(err) {Utils.handleError(err); return;}
                        PermissionInformer.getEntityNamesArray('story', !isAdmin, function(err, storyNames){
                            if(err) {Utils.handleError(err); return;}
                            PermissionInformer.getEntityNamesArray('group', !isAdmin, function(err, groupNames){
                                if(err) {Utils.handleError(err); return;}
                                PermissionInformer.getEntityNamesArray('player', !isAdmin, function(err, playerNames){
                                    if(err) {Utils.handleError(err); return;}
                                    var names = {
                                            characters: characterNames,
                                            groups: groupNames,
                                            stories: storyNames,
                                            players: playerNames,
                                    };
                                    if(!isAdmin && isEditor){
                                        for(var entity in names){
                                            names[entity] = names[entity].filter(R.prop('isOwner'));
                                        }
                                    }
                                    rebuildInterface(names, managementInfo);
                                    Utils.enable(exports.content, "adminOnly", isAdmin);
                                    Utils.enable(exports.content, "editorOrAdmin", isAdmin || isEditor);
                                });
                            });
                        });
                    });
                });
            });
        });
    };
    
    var rebuildInterface = function (names, managementInfo) {
        var usersInfo = managementInfo.usersInfo;
        
        var userNames = Object.keys(usersInfo).sort(CommonUtils.charOrdA);
        
        var selectors = [];
        selectors.push(getEl("passwordUserName"));
        selectors.push(getEl("userPermissionSelector"));
        selectors.push(getEl("newEditorSelector"));
        
        selectors.forEach(function(selector){
            Utils.rebuildSelectorArr(selector, userNames);
        });
        
        var clone = userNames.slice(0);
        clone.splice(userNames.indexOf(managementInfo.admin), 1);
        var selector = getEl("newAdminSelector");
        Utils.rebuildSelectorArr(selector, clone);
        
        selector = getEl("userRemoveSelector");
        Utils.rebuildSelectorArr(selector, clone);
        
        state.entities.forEach(function(entity){
            Utils.rebuildSelector(getEl("permission-selector__" + entity), names[entity]);
        });
        
        addEl(clearEl(getEl("currentAdministrator")), makeText(managementInfo.admin));
    
        var span = clearEl(getEl("currentEditor"));
        if(managementInfo.editor){
            addEl(span,makeText(managementInfo.editor));
        }
        
        getEl("adaptationRights" + managementInfo.adaptationRights).checked = true;
        
        buildPermissionList(names, usersInfo);
    };
    
    var buildPermissionList = function (names, usersInfo) {
        var permissionTable = clearEl(getEl("permissionTable"));
        var treeRoot = makeEl('ul');
        addEl(permissionTable, treeRoot);
        
        R.keys(names).forEach(function(entity){
            names[entity] = names[entity].map(R.prop('value'));
        });
        
        R.values(usersInfo).forEach(function(userInfo){
            R.keys(userInfo).forEach(function(entity){
                names[entity] = R.difference(names[entity], userInfo[entity]);
            });
        });
        
        usersInfo[getL10n('admins-have-not-owner')] = names;
        
        var headers = {
            characters : getL10n("admins-characters"),
            stories : getL10n("admins-stories"),
            groups : getL10n("admins-groups"),
            players : getL10n("admins-players"),
        };
        
        function liMaker(text){
            return addEl(makeEl('li'), makeText(text));
        }
        
        function makeEntityLists(userInfo){
            return state.entities.reduce(function(result, entity){
                result.push(liMaker(headers[entity]));
                result.push(addEls(makeEl('ol'), userInfo[entity].sort().map(liMaker)));
                return result;
            }, []);
        }
        
        var userNames = Object.keys(usersInfo).sort(CommonUtils.charOrdA);
        addEls(treeRoot, userNames.reduce(function(result, userName){
            result.push(liMaker(userName));
            result.push(addEls(makeEl('ol'), makeEntityLists(usersInfo[userName])));
            return result;
        }, []));
    };
    
    var createMaster = function () {
        var userNameInput = getEl("userNameInput");
        var name = userNameInput.value.trim();
    
        if (name === "") {
            Utils.alert(getL10n('admins-user-name-is-not-specified'));
            return;
        }
        
        var userPasswordInput = getEl("userPasswordInput");
        var password = userPasswordInput.value.trim();
        
        if (password === "") {
            Utils.alert(getL10n('admins-password-is-not-specified'));
            return;
        }
        
        DBMS.isMasterNameUsed(name, function(err, isMasterNameUsed){
            if(err) {Utils.handleError(err); return;}
            if (isMasterNameUsed) {
                Utils.alert(getL10n('admins-user-already-exists'));
            } else {
                
                DBMS.createMaster(name, password, Utils.processError(function(){
                    userNameInput.value = '';
                    userPasswordInput.value = '';
                    exports.refresh();
                }));
            }
        });
    };
    
    
    var changeMasterPassword = function () {
        var userName = getEl("passwordUserName").value.trim();
        var newPassword = getEl("newPassword").value.trim();
    
        if (newPassword === "") {
            Utils.alert(getL10n('admins-password-is-not-specified'));
            return;
        }
        
        DBMS.changeMasterPassword(userName, newPassword, Utils.processError(function(){
            getEl("newPassword").value = '';
            exports.refresh();
        }));
    
    };
    
    var removeMaster = function () {
        var name = getEl("userRemoveSelector").value.trim();
    
        if (Utils.confirm(strFormat(getL10n('admins-confirm-user-remove'), [name]))) {
            DBMS.removeMaster(name, Utils.processError(exports.refresh));
        }
    };
    
    var getSelectedOptions = (id) => nl2array(getEl(id).selectedOptions).map(opt => opt.value);
    
    var permissionAction = function(action){
        return function(){
            var userName = getEl("userPermissionSelector").value.trim();
            
            if(userName === ""){
                Utils.alert(getL10n('admins-user-is-not-selected'));
                return;
            }
            
            var names = {};
            state.entities.forEach(function(entity){
                names[entity] = getSelectedOptions("permission-selector__" + entity);
            });
            
            DBMS[action](userName, names, Utils.processError(exports.refresh));
        }
    };
    
    var removePermission = permissionAction('removePermission');
    var assignPermission = permissionAction('assignPermission');
    
    var assignNewAdmin = function() {
        var userName = getEl("newAdminSelector").value.trim();
        if(Utils.confirm(strFormat(getL10n('admins-confirm-admin-assigment'), [userName]))){
            DBMS.assignAdmin(userName, Utils.processError(exports.refresh));
        }
    };
    var removeEditor = function() {
        DBMS.removeEditor(Utils.processError(exports.refresh));
    };
    var assignEditor = function() {
        var userName = getEl("newEditorSelector").value.trim();
        if(Utils.confirm(strFormat(getL10n('admins-confirm-editor-assigment'), [userName]))){
            DBMS.assignEditor(userName, Utils.processError(exports.refresh));
        }
    };
    var changeAdaptationRightsMode = function(event) {
        DBMS.changeAdaptationRightsMode(event.target.value, Utils.processError());
    };

})(this['AccessManager']={});
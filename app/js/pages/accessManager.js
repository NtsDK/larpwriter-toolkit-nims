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
var AccessManager = {};

AccessManager.init = function() {
    "use strict";
    
    listen(getEl("createUserButton"),"click", AccessManager.createUser);
    listen(getEl("changePasswordButton"),"click", AccessManager.changePassword);
    listen(getEl("removeUserButton"),"click", AccessManager.removeUser);
    listen(getEl("assignPermissionButton"),"click", AccessManager.assignPermission);
    listen(getEl("removePermissionButton"),"click", AccessManager.removePermission);
    listen(getEl("newAdminButton"),"click", AccessManager.assignNewAdmin);
    listen(getEl("removeEditorButton"),"click", AccessManager.removeEditor);
    listen(getEl("newEditorButton"),"click", AccessManager.assignEditor);
    
    AccessManager.entities = ['characters','stories','groups'];
    
    var inputs = document.getElementsByClassName("adaptationRights");
    var i, elem;
    for (i = 0; i < inputs.length; i++) {
        elem = inputs[i];
        elem.addEventListener("click", AccessManager.changeAdaptationRightsMode);
    }
    
    AccessManager.content = getEl("accessManagerDiv");
};

AccessManager.refresh = function() {
    "use strict";
    DBMS.getManagementInfo(function(err, managementInfo){
        if(err) {Utils.handleError(err); return;}
        PermissionInformer.isAdmin(function(err, isAdmin){
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.isEditor(function(err, isEditor){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.getCharacterNamesArray(!isAdmin, function(err, characterNames){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.getStoryNamesArray(!isAdmin, function(err, storyNames){
                        if(err) {Utils.handleError(err); return;}
                        PermissionInformer.getGroupNamesArray(!isAdmin, function(err, groupNames){
                            if(err) {Utils.handleError(err); return;}
                            var names = {
                                    characters: characterNames,
                                    groups: groupNames,
                                    stories: storyNames,
                            };
                            if(!isAdmin && isEditor){
                                for(var entity in names){
                                    names[entity] = names[entity].filter(R.prop('isOwner'));
                                }
                            }
                            AccessManager.rebuildInterface(names, managementInfo);
                            Utils.enable(AccessManager.content, "adminOnly", isAdmin);
                            Utils.enable(AccessManager.content, "editorOrAdmin", isAdmin || isEditor);
                        });
                    });
                });
            });
        });
    });
};

AccessManager.rebuildInterface = function (names, managementInfo) {
    "use strict";
    
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
    
    AccessManager.entities.forEach(function(entity){
        Utils.rebuildSelector(getEl("permission-selector__" + entity), names[entity]);
    });
    
    addEl(clearEl(getEl("currentAdministrator")), makeText(managementInfo.admin));

    var span = clearEl(getEl("currentEditor"));
    if(managementInfo.editor){
        addEl(span,makeText(managementInfo.editor));
    }
    
    getEl("adaptationRights" + managementInfo.adaptationRights).checked = true;
    
    AccessManager.buildPermissionList(names, usersInfo);
};

AccessManager.buildPermissionList = function (names, usersInfo) {
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
    };
    
    function liMaker(text){
        return addEl(makeEl('li'), makeText(text));
    }
    
    function makeEntityLists(userInfo){
        return AccessManager.entities.reduce(function(result, entity){
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

AccessManager.createUser = function () {
    "use strict";
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
    
    DBMS.isUserNameUsed(name, function(err, isUserNameUsed){
        if(err) {Utils.handleError(err); return;}
        if (isUserNameUsed) {
            Utils.alert(getL10n('admins-user-already-exists'));
        } else {
            DBMS.createUser(name, password, Utils.processError(AccessManager.refresh));
        }
    });
};


AccessManager.changePassword = function () {
    "use strict";
    var userName = getEl("passwordUserName").value.trim();
    var newPassword = getEl("newPassword").value.trim();

    if (newPassword === "") {
        Utils.alert(getL10n('admins-password-is-not-specified'));
        return;
    }
    
    DBMS.changePassword(userName, newPassword, Utils.processError(AccessManager.refresh));

};

AccessManager.removeUser = function () {
    "use strict";
    var name = getEl("userRemoveSelector").value.trim();

    if (Utils.confirm(strFormat(getL10n('admins-confirm-user-remove'), [name]))) {
        DBMS.removeUser(name, Utils.processError(AccessManager.refresh));
    }
};

AccessManager.getSelectedOptions = function(id){
    var selOptions =  getEl(id).selectedOptions;
    var storyNames = [];
    for (var i = 0; i < selOptions.length; i++) {
        storyNames.push(selOptions[i].value);
    }
    return storyNames;
};

AccessManager.permissionAction = function(action){
    "use strict";
    return function(){
        var userName = getEl("userPermissionSelector").value.trim();
        
        if(userName === ""){
            Utils.alert(getL10n('admins-user-is-not-selected'));
            return;
        }
        
        var names = {};
        AccessManager.entities.forEach(function(entity){
            names[entity] = AccessManager.getSelectedOptions("permission-selector__" + entity);
        });
        
        DBMS[action](userName, names, Utils.processError(AccessManager.refresh));
    }
};

AccessManager.removePermission = AccessManager.permissionAction('removePermission');
AccessManager.assignPermission = AccessManager.permissionAction('assignPermission');

AccessManager.assignNewAdmin = function() {
    "use strict";
    var userName = getEl("newAdminSelector").value.trim();
    if(Utils.confirm(strFormat(getL10n('admins-confirm-admin-assigment'), [userName]))){
        DBMS.assignAdmin(userName, Utils.processError(AccessManager.refresh));
    }
};
AccessManager.removeEditor = function() {
    "use strict";
    DBMS.removeEditor(Utils.processError(AccessManager.refresh));
};
AccessManager.assignEditor = function() {
    "use strict";
    var userName = getEl("newEditorSelector").value.trim();
    if(Utils.confirm(strFormat(getL10n('admins-confirm-editor-assigment'), [userName]))){
        DBMS.assignEditor(userName, Utils.processError(AccessManager.refresh));
    }
};
AccessManager.changeAdaptationRightsMode = function(event) {
    "use strict";
    DBMS.changeAdaptationRightsMode(event.target.value, Utils.processError());
};
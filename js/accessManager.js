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
    
    var button = getEl("createUserButton");
    button.addEventListener("click", AccessManager.createUser);

    button = getEl("changePasswordButton");
    button.addEventListener("click", AccessManager.changePassword);

    button = getEl("removeUserButton");
    button.addEventListener("click", AccessManager.removeUser);
    
    button = getEl("assignPermissionButton");
    button.addEventListener("click", AccessManager.assignPermission);
    
    button = getEl("removePermissionButton");
    button.addEventListener("click", AccessManager.removePermission);

    button = getEl("newAdminButton");
    button.addEventListener("click", AccessManager.assignNewAdmin);
    
    button = getEl("removeEditorButton");
    button.addEventListener("click", AccessManager.removeEditor);
    
    button = getEl("newEditorButton");
    button.addEventListener("click", AccessManager.assignEditor);
    
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
	DBMS.getUsersInfo(function(err, info){
		if(err) {Utils.handleError(err); return;}
        PermissionInformer.isAdmin(function(err, isAdmin){
        	if(err) {Utils.handleError(err); return;}
        	PermissionInformer.isEditor(function(err, isEditor){
        		if(err) {Utils.handleError(err); return;}
        		PermissionInformer.getCharacterNamesArray(!isAdmin, function(err, characterNames){
        			if(err) {Utils.handleError(err); return;}
        			PermissionInformer.getStoryNamesArray(!isAdmin, function(err, storyNames){
        				if(err) {Utils.handleError(err); return;}
        				if(!isAdmin && isEditor){
        					characterNames = characterNames.filter(function(elem){
        						return elem.isOwner;
        					});
        					storyNames = storyNames.filter(function(elem){
        						return elem.isOwner;
        					});
        				}
	    	        	AccessManager.rebuildInterface(characterNames, storyNames, info);
	    	        	Utils.enable(AccessManager.content, "adminOnly", isAdmin);
	    	        	Utils.enable(AccessManager.content, "editorOrAdmin", isAdmin || isEditor);
    	        	});
    	        });
    		});
    	});
    });
};

Utils.rebuildSelector = function(selector, names){
	"use strict";
	clearEl(selector);
	names.forEach(function (nameInfo) {
		var option = makeEl("option");
		option.appendChild(makeText(nameInfo.displayName));
		option.value = nameInfo.value;
		selector.appendChild(option);
	});
};

Utils.rebuildSelectorArr = function(selector, names){
	"use strict";
	clearEl(selector);
	names.forEach(function (name) {
		var option = makeEl("option");
		option.appendChild(makeText(name));
		selector.appendChild(option);
	});
};

AccessManager.rebuildInterface = function (characterNames, storyNames, allInfo) {
    "use strict";
    
    var info = allInfo.usersInfo;
    
    var names = Object.keys(info).sort(CommonUtils.charOrdA);
    
    var selectors = [];
    selectors.push(getEl("passwordUserName"));
    
    selectors.push(getEl("userPermissionSelector"));
    selectors.push(getEl("newEditorSelector"));
    
    selectors.forEach(function(selector){
    	Utils.rebuildSelectorArr(selector, names);
    });
    
    var clone = names.slice(0);
    clone.splice(names.indexOf(allInfo.admin), 1);
    var selector = getEl("newAdminSelector");
    Utils.rebuildSelectorArr(selector, clone);
    
    selector = getEl("userRemoveSelector");
    Utils.rebuildSelectorArr(selector, clone);
    
    selector = getEl("storyPermissionSelector");
    Utils.rebuildSelector(selector, storyNames);
    
    selector = getEl("characterPermissionSelector");
    Utils.rebuildSelector(selector, characterNames);
    
    var span = getEl("currentAdministrator");
    clearEl(span);
    span.appendChild(makeText(allInfo.admin));

    span = getEl("currentEditor");
    clearEl(span);
    if(allInfo.editor){
    	span.appendChild(makeText(allInfo.editor));
    }
    
    getEl("adaptationRights" + allInfo.adaptationRights).checked = true;
    
    var permissionTable = getEl("permissionTable");
    clearEl(permissionTable);
    
    names.forEach(function(name){
    	permissionTable.appendChild(makeText(name));
    	permissionTable.appendChild(makeEl("br"));
    	permissionTable.appendChild(makeText("Персонажи: " + info[name].characters.join(",")));
    	permissionTable.appendChild(makeEl("br"));
    	permissionTable.appendChild(makeText("Истории: " + info[name].stories.join(",")));
    	permissionTable.appendChild(makeEl("br"));
    	permissionTable.appendChild(makeEl("br"));
    });
    
    permissionTable.appendChild(makeText("Не привязаны"));
	permissionTable.appendChild(makeEl("br"));
	
	var isUnused = function(storyName){
		var used = false;
		names.forEach(function(name){
			if(info[name].stories.indexOf(storyName)!==-1){
				used = true;
			}
		});
		return !used;
	};
	var isUnused2 = function(characterName){
		var used = false;
		names.forEach(function(name){
			if(info[name].characters.indexOf(characterName)!==-1){
				used = true;
			}
		});
		return !used;
	};
	
	storyNames = storyNames.map(function(elem){
		return elem.value;
	}).filter(isUnused);
	characterNames = characterNames.map(function(elem){
		return elem.value;
	}).filter(isUnused2);
	permissionTable.appendChild(makeText("Персонажи: " + characterNames.join(",")));
	permissionTable.appendChild(makeEl("br"));
	permissionTable.appendChild(makeText("Истории: " + storyNames.join(",")));
	permissionTable.appendChild(makeEl("br"));
	permissionTable.appendChild(makeEl("br"));
};



AccessManager.createUser = function () {
    "use strict";
    var userNameInput = getEl("userNameInput");
    var name = userNameInput.value.trim();

    if (name === "") {
        Utils.alert("Имя пользователя не указано");
        return;
    }
    
    var userPasswordInput = getEl("userPasswordInput");
    var password = userPasswordInput.value.trim();
    
    if (password === "") {
    	Utils.alert("Пароль не указан");
    	return;
    }
    
    DBMS.isUserNameUsed(name, function(err, isUserNameUsed){
    	if(err) {Utils.handleError(err); return;}
        if (isUserNameUsed) {
            Utils.alert("Такой пользователь уже существует");
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
        Utils.alert("Новый пароль не указан.");
        return;
    }
    
    DBMS.changePassword(userName, newPassword, Utils.processError(AccessManager.refresh));

};

AccessManager.removeUser = function () {
    "use strict";
    var name = getEl("userRemoveSelector").value.trim();

    if (Utils.confirm("Вы уверены, что хотите удалить " + name + "?")) {
    	DBMS.removeUser(name, Utils.processError(AccessManager.refresh));
    }
};

AccessManager.removePermission = function(){
	"use strict";
	
	var userName = getEl("userPermissionSelector").value.trim();
	
	if(userName === ""){
		Utils.alert("Пользователь не выбран");
		return;
	}
	
    var selOptions =  getEl("storyPermissionSelector").selectedOptions;
    var storyNames = [];
    for (var i = 0; i < selOptions.length; i++) {
        storyNames.push(selOptions[i].value);
    }
    
    selOptions =  getEl("characterPermissionSelector").selectedOptions;
    var characterNames = [];
    for (var i = 0; i < selOptions.length; i++) {
    	characterNames.push(selOptions[i].value);
    }
    DBMS.removePermission(userName, storyNames, characterNames, Utils.processError(AccessManager.refresh));
};

AccessManager.assignPermission = function(){
	"use strict";
	
	var userName = getEl("userPermissionSelector").value.trim();
	
	if(userName === ""){
		Utils.alert("Пользователь не выбран");
		return;
	}
	
    var selOptions =  getEl("storyPermissionSelector").selectedOptions;
    var storyNames = [];
    for (var i = 0; i < selOptions.length; i++) {
        storyNames.push(selOptions[i].value);
    }
    
    selOptions =  getEl("characterPermissionSelector").selectedOptions;
    var characterNames = [];
    for (var i = 0; i < selOptions.length; i++) {
    	characterNames.push(selOptions[i].value);
    }
    
    DBMS.assignPermission(userName, storyNames, characterNames, Utils.processError(AccessManager.refresh));
};

AccessManager.assignNewAdmin = function() {
	"use strict";
	var userName = getEl("newAdminSelector").value.trim();
	if(Utils.confirm("Вы уверены, что хотите назначить пользователя " + userName + 
			" администратором? Отменить это действие вы не сможете.")){
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
	if(Utils.confirm("Вы уверены, что хотите назначить пользователя " + userName + 
			" редактором? Пока назначен редактор все другие пользователи не смогут редактировать свои объекты.")){
		DBMS.assignEditor(userName, Utils.processError(AccessManager.refresh));
	}
};
AccessManager.changeAdaptationRightsMode = function(event) {
	"use strict";
	DBMS.changeAdaptationRightsMode(event.target.value, Utils.processError());
};
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
    
    var button = document.getElementById("createUserButton");
    button.addEventListener("click", AccessManager.createUser);

    button = document.getElementById("changePasswordButton");
    button.addEventListener("click", AccessManager.changePassword);

    button = document.getElementById("removeUserButton");
    button.addEventListener("click", AccessManager.removeUser);
    
    button = document.getElementById("assignPermissionButton");
    button.addEventListener("click", AccessManager.assignPermission);
    
    button = document.getElementById("removePermissionButton");
    button.addEventListener("click", AccessManager.removePermission);

    button = document.getElementById("newAdminButton");
    button.addEventListener("click", AccessManager.assignNewAdmin);
    
    button = document.getElementById("removeEditorButton");
    button.addEventListener("click", AccessManager.removeEditor);
    
    button = document.getElementById("newEditorButton");
    button.addEventListener("click", AccessManager.assignEditor);
    
    var inputs = document.getElementsByClassName("adaptationRights");
	var i, elem;
    for (i = 0; i < inputs.length; i++) {
		elem = inputs[i];
		elem.addEventListener("click", AccessManager.changeAdaptationRightsMode);
	}
    
    AccessManager.content = document.getElementById("accessManagerDiv");
};

AccessManager.refresh = function() {
    "use strict";
    DBMS.getUserCharacterNamesArray(function(err, characterNames){
    	if(err) {Utils.handleError(err); return;}
    	DBMS.getUserStoryNamesArray(function(err, storyNames){
    		if(err) {Utils.handleError(err); return;}
    		DBMS.getUsersInfo(function(err, info){
    			if(err) {Utils.handleError(err); return;}
    	        PermissionInformer.isAdmin(function(err, isAdmin){
    	        	if(err) {Utils.handleError(err); return;}
    	        	PermissionInformer.isEditor(function(err, isEditor){
    	        		if(err) {Utils.handleError(err); return;}
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
	Utils.removeChildren(selector);
	names.forEach(function (name) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(name));
		selector.appendChild(option);
	});
};

AccessManager.rebuildInterface = function (characterNames, storyNames, allInfo) {
    "use strict";
    
    var info = allInfo.usersInfo;
    
    var names = Object.keys(info).sort(CommonUtils.charOrdA);
    
    var selectors = [];
    selectors.push(document.getElementById("passwordUserName"));
    
    selectors.push(document.getElementById("userPermissionSelector"));
    selectors.push(document.getElementById("newEditorSelector"));
    
    selectors.forEach(function(selector){
    	Utils.rebuildSelector(selector, names);
    });
    
    var clone = names.slice(0);
    clone.splice(clone.indexOf(allInfo.admin), 1);
    var selector = document.getElementById("newAdminSelector");
    Utils.rebuildSelector(selector, clone);
    
    selector = document.getElementById("userRemoveSelector");
    Utils.rebuildSelector(selector, clone);
    
    selector = document.getElementById("storyPermissionSelector");
    Utils.rebuildSelector(selector, storyNames);
    
    selector = document.getElementById("characterPermissionSelector");
    Utils.rebuildSelector(selector, characterNames);
    
    var span = document.getElementById("currentAdministrator");
    Utils.removeChildren(span);
    span.appendChild(document.createTextNode(allInfo.admin));

    span = document.getElementById("currentEditor");
    Utils.removeChildren(span);
    if(allInfo.editor){
    	span.appendChild(document.createTextNode(allInfo.editor));
    }
    
    document.getElementById("adaptationRights" + allInfo.adaptationRights).checked = true;
    
    var permissionTable = document.getElementById("permissionTable");
    Utils.removeChildren(permissionTable);
    
    names.forEach(function(name){
    	permissionTable.appendChild(document.createTextNode(name));
    	permissionTable.appendChild(document.createElement("br"));
    	permissionTable.appendChild(document.createTextNode("Персонажи: " + info[name].characters.join(",")));
    	permissionTable.appendChild(document.createElement("br"));
    	permissionTable.appendChild(document.createTextNode("Истории: " + info[name].stories.join(",")));
    	permissionTable.appendChild(document.createElement("br"));
    	permissionTable.appendChild(document.createElement("br"));
    });
    
    permissionTable.appendChild(document.createTextNode("Не привязаны"));
	permissionTable.appendChild(document.createElement("br"));
	
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
	
	storyNames = storyNames.filter(isUnused);
	characterNames = characterNames.filter(isUnused2);
	permissionTable.appendChild(document.createTextNode("Персонажи: " + characterNames.join(",")));
	permissionTable.appendChild(document.createElement("br"));
	permissionTable.appendChild(document.createTextNode("Истории: " + storyNames.join(",")));
	permissionTable.appendChild(document.createElement("br"));
	permissionTable.appendChild(document.createElement("br"));
};



AccessManager.createUser = function () {
    "use strict";
    var userNameInput = document.getElementById("userNameInput");
    var name = userNameInput.value.trim();

    if (name === "") {
        Utils.alert("Имя пользователя не указано");
        return;
    }
    
    var userPasswordInput = document.getElementById("userPasswordInput");
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
    var userName = document.getElementById("passwordUserName").value.trim();
    var newPassword = document.getElementById("newPassword").value.trim();

    if (newPassword === "") {
        Utils.alert("Новый пароль не указан.");
        return;
    }
    
    DBMS.changePassword(userName, newPassword, Utils.processError(AccessManager.refresh));

};

AccessManager.removeUser = function () {
    "use strict";
    var name = document.getElementById("userRemoveSelector").value.trim();

    if (Utils.confirm("Вы уверены, что хотите удалить " + name + "?")) {
    	DBMS.removeUser(name, Utils.processError(AccessManager.refresh));
    }
};

AccessManager.removePermission = function(){
	"use strict";
	
	var userName = document.getElementById("userPermissionSelector").value.trim();
	
	if(userName === ""){
		Utils.alert("Пользователь не выбран");
		return;
	}
	
    var selOptions =  document.getElementById("storyPermissionSelector").selectedOptions;
    var storyNames = [];
    for (var i = 0; i < selOptions.length; i++) {
        storyNames.push(selOptions[i].text);
    }
    
    selOptions =  document.getElementById("characterPermissionSelector").selectedOptions;
    var characterNames = [];
    for (var i = 0; i < selOptions.length; i++) {
    	characterNames.push(selOptions[i].text);
    }
    DBMS.removePermission(userName, storyNames, characterNames, Utils.processError(AccessManager.refresh));
};

AccessManager.assignPermission = function(){
	"use strict";
	
	var userName = document.getElementById("userPermissionSelector").value.trim();
	
	if(userName === ""){
		Utils.alert("Пользователь не выбран");
		return;
	}
	
    var selOptions =  document.getElementById("storyPermissionSelector").selectedOptions;
    var storyNames = [];
    for (var i = 0; i < selOptions.length; i++) {
        storyNames.push(selOptions[i].text);
    }
    
    selOptions =  document.getElementById("characterPermissionSelector").selectedOptions;
    var characterNames = [];
    for (var i = 0; i < selOptions.length; i++) {
    	characterNames.push(selOptions[i].text);
    }
    
    DBMS.assignPermission(userName, storyNames, characterNames, Utils.processError(AccessManager.refresh));
};

AccessManager.assignNewAdmin = function() {
	"use strict";
	var userName = document.getElementById("newAdminSelector").value.trim();
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
	var userName = document.getElementById("newEditorSelector").value.trim();
	if(Utils.confirm("Вы уверены, что хотите назначить пользователя " + userName + 
			" редактором? Пока назначен редактор все другие пользователи не смогут редактировать свои объекты.")){
		DBMS.assignEditor(userName, Utils.processError(AccessManager.refresh));
	}
};
AccessManager.changeAdaptationRightsMode = function(event) {
	"use strict";
	DBMS.changeAdaptationRightsMode(event.target.value, Utils.processError());
};
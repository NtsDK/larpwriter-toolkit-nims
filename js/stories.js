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
 Utils, DBMS, StoryEvents, StoryCharacters, EventPresence
 */

"use strict";

var Stories = {};

Stories.init = function () {
    "use strict";
    Stories.left = {views:{}};
    Stories.right = {views:{}};
    var containers = {
        root: Stories.left,
        navigation: getEl("storiesNavigationLeft"),
        content: getEl("storiesContentLeft")
    };
    Utils.addView(containers, "MasterStory", MasterStory, "Мастерская история", {mainPage:true, toggle:true});
    Utils.addView(containers, "StoryEvents", StoryEvents, "События", {toggle:true});
    Utils.addView(containers, "StoryCharacters", StoryCharacters, "Персонажи", {toggle:true});
    Utils.addView(containers, "EventPresence", EventPresence, "Присутствие", {toggle:true});
    containers = {
        root: Stories.right,
        navigation: getEl("storiesNavigationRight"),
        content: getEl("storiesContentRight")
    };
    Utils.addView(containers, "MasterStory", MasterStory, "Мастерская история", {toggle:true});
    Utils.addView(containers, "StoryEvents", StoryEvents, "События", {mainPage:true, toggle:true});
    Utils.addView(containers, "StoryCharacters", StoryCharacters, "Персонажи", {toggle:true});
    Utils.addView(containers, "EventPresence", EventPresence, "Присутствие", {toggle:true});

    listen(getEl('storySelector'), "change", Stories.onStorySelectorChangeDelegate);
    listen(getEl('createStoryButton'), "click", Stories.createStory);
    listen(getEl('renameStoryButton'), "click", Stories.renameStory);
    listen(getEl('removeStoryButton'), "click", Stories.removeStory);

    Stories.content = document.getElementById("storiesDiv");
};

Stories.chainRefresh = function(){
    "use strict";
    if((Stories.left.currentView && Stories.left.currentView.name === "EventPresence") || 
       (Stories.right.currentView && Stories.right.currentView.name === "EventPresence")){
        EventPresence.refresh();
    }
};

Stories.refresh = function () {
    "use strict";
    var selectors = [];
    selectors.push(document.getElementById("fromStory"));
    selectors.push(document.getElementById("storyRemoveSelector"));
    var storySelector = document.getElementById("storySelector");
    Utils.removeChildren(storySelector);
    selectors.forEach(function(selector){
    	Utils.removeChildren(selector);
    });
    PermissionInformer.getStoryNamesArray(false, function(err, allStoryNames){
    	if(err) {Utils.handleError(err); return;}
    	PermissionInformer.getStoryNamesArray(true, function(err, userStoryNames){
    		if(err) {Utils.handleError(err); return;}
    		if(userStoryNames.length > 0){
	            userStoryNames.forEach(function (nameInfo) {
	            	selectors.forEach(function(selector, i){
	            		option = document.createElement("option");
	            		option.appendChild(document.createTextNode(nameInfo.displayName));
	            		option.value = nameInfo.value;
	            		selector.appendChild(option);
	            	});
	            });
    		}
    		
	        if (allStoryNames.length > 0) {
	            var storyName = Stories.getSelectedStoryName(allStoryNames);
	            
	            var first = true;
	            var option;
	            allStoryNames.forEach(function (nameInfo) {
                    option = document.createElement("option");
                    option.appendChild(document.createTextNode(nameInfo.displayName));
                    option.value = nameInfo.value;
                    storySelector.appendChild(option);
                    if(storyName === nameInfo.value){
                    	option.selected = true;
                    	first = false;
                    }
	            });
	            
	            Stories.onStorySelectorChange(storyName);
	        } else {
	            Stories.onStorySelectorChange();
	        }
	        
	        if(Stories.left.currentView)Stories.left.currentView.refresh();
	        if(Stories.right.currentView)Stories.right.currentView.refresh();
    	});
    });
    
};

Stories.getSelectedStoryName = function(storyNames){
    "use strict";
    var settings = DBMS.getSettings();
    if(!settings["Stories"]){
        settings["Stories"] = {
            storyName : storyNames[0].value
        };
    }
    var storyName = settings["Stories"].storyName;
    if(storyNames.map(function(nameInfo){return nameInfo.value;}).indexOf(storyName) === -1){
        settings["Stories"].storyName = storyNames[0].value;
        storyName = storyNames[0].value;
    }
    return storyName;
};

Stories.createStory = function () {
    "use strict";
    var storyName = document.getElementById("createStoryName").value.trim();
    if (storyName === "") {
        Utils.alert("Название истории пусто.");
        return;
    }
    
    DBMS.isStoryExist(storyName, function(err, isExist){
    	if(err) {Utils.handleError(err); return;}
        if(isExist){
            Utils.alert("История с таким именем уже существует.");
        } else {
            DBMS.createStory(storyName, function(err){
            	if(err) {Utils.handleError(err); return;}
                Stories.updateSettings(storyName);
                PermissionInformer.refresh(function(err){
                	if(err) {Utils.handleError(err); return;}
                	Stories.refresh();
                });
            });
        }
    });
};

Stories.renameStory = function () {
    "use strict";
    var fromName = document.getElementById("fromStory").value.trim();
    var toName = document.getElementById("toStory").value.trim();

    if (toName === "") {
        Utils.alert("Новое имя не указано.");
        return;
    }

    if (fromName === toName) {
        Utils.alert("Имена совпадают.");
        return;
    }
    
    DBMS.isStoryExist(toName, function(err, isExist){
    	if(err) {Utils.handleError(err); return;}
        if(isExist){
            Utils.alert("Имя " + toName + " уже используется.");
        } else {
            DBMS.renameStory(fromName, toName, function(err){
            	if(err) {Utils.handleError(err); return;}
                Stories.updateSettings(toName);
                PermissionInformer.refresh(function(err){
                	if(err) {Utils.handleError(err); return;}
                	Stories.refresh();
                });
            });
        }
    });
};

Stories.removeStory = function () {
    "use strict";
    var name = document.getElementById("storyRemoveSelector").value.trim();

    if (Utils.confirm("Вы уверены, что хотите удалить историю " + name
            + "? Все данные связанные с историей будут удалены безвозвратно.")) {
        DBMS.removeStory(name, function(err){
        	if(err) {Utils.handleError(err); return;}
        	PermissionInformer.refresh(function(err){
            	if(err) {Utils.handleError(err); return;}
            	Stories.refresh();
            });
        });
    }
};

Stories.onStorySelectorChangeDelegate = function (event) {
    "use strict";
    var storyName = event.target.value;
    Stories.onStorySelectorChange(storyName);
};

Stories.onStorySelectorChange = function (storyName) {
    "use strict";
    Stories.CurrentStoryName = storyName;
    
    if(storyName){
        Stories.updateSettings(storyName);
        PermissionInformer.isStoryEditable(storyName, function(err, isStoryEditable){
            if (err) {Utils.handleError(err);return;}
            if(Stories.left.currentView)Stories.left.currentView.refresh();
            if(Stories.right.currentView)Stories.right.currentView.refresh();
            Utils.enable(Stories.content, "isStoryEditable", isStoryEditable);
        });
    } else { // when there are no stories at all
        Stories.updateSettings(null);
        if(Stories.left.currentView)Stories.left.currentView.refresh();
        if(Stories.right.currentView)Stories.right.currentView.refresh();
    }
};

Stories.updateSettings = function (storyName) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["Stories"].storyName = storyName;
};

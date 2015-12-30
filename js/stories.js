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
    var root = Stories;
    root.views = {};
    var nav = "storiesNavigation";
    var content = "storiesContent";
    var containers = {
		root: root,
		navigation: document.getElementById(nav),
		content: document.getElementById(content)
    };
    Utils.addView(containers, "StoryEvents", StoryEvents, "События", {mainPage:true});
    Utils.addView(containers, "StoryCharacters", StoryCharacters, "Персонажи");
    Utils.addView(containers, "EventPresence", EventPresence, "Присутствие");

    var selector = document.getElementById("storySelector");
    selector.addEventListener("change", Stories.onStorySelectorChangeDelegate);

    var button = document.getElementById("createStoryButton");
    button.addEventListener("click", Stories.createStory);

    button = document.getElementById("renameStoryButton");
    button.addEventListener("click", Stories.renameStory);

    button = document.getElementById("removeStoryButton");
    button.addEventListener("click", Stories.removeStory);

    button = document.getElementById("masterStoryArea");
    button.addEventListener("change", Stories.updateMasterStory);
    
    button = document.getElementById("masterStoryNavButton");
    button.addEventListener("click", Stories.onMasterStoryNavButtonClick);
    addClass(button, "active");

    Stories.content = document.getElementById("storiesDiv");
};

Stories.onMasterStoryNavButtonClick = function (event) {
    "use strict";
    toggleClass(event.target, "active");
    toggleClass(document.getElementById("masterStoryDiv"), "hidden");
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
	        
	        Stories.currentView.refresh();
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
    var storyArea = document.getElementById("masterStoryArea");
    
    if(storyName){
        Stories.updateSettings(storyName);
        PermissionInformer.isStoryEditable(storyName, function(err, isEditable){
        	if(err) {Utils.handleError(err); return;}
	        DBMS.getMasterStory(storyName, function(err, story){
	        	if(err) {Utils.handleError(err); return;}
	            storyArea.value = story;
	            Stories.currentView.refresh();
	            Utils.enable(Stories.content, "isEditable", isEditable);
	        });
        });
    } else { // when there are no stories at all
        Stories.updateSettings(null);
        storyArea.value = "";
        Stories.currentView.refresh();
    }
};

Stories.updateSettings = function (storyName) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["Stories"].storyName = storyName;
};

Stories.updateMasterStory = function () {
    "use strict";
    var storyArea = document.getElementById("masterStoryArea");
    DBMS.updateMasterStory(Stories.CurrentStoryName, storyArea.value, Utils.processError());
};

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

var Events = {};

Events.headers = [ "Оригинал", "Адаптация"];
Events.finishedText = "Описание завершено";
Events.finishedSuffix = "(завершено)";
Events.emptySuffix = "(пусто)";


Events.init = function () {
    "use strict";
    var selector = document.getElementById("events-storySelector");
    selector.addEventListener("change", Events.updateCharacterSelectorDelegate);
    
    selector = document.getElementById("events-characterSelector");
    selector.addEventListener("change", Events.showPersonalStoriesDelegate);

    selector = document.getElementById("finishedStoryCheckbox");
    selector.addEventListener("change", Events.refresh);
    
    Events.content = document.getElementById("eventsDiv");
};

Events.refresh = function () {
    "use strict";
    var selector = document.getElementById("events-storySelector");
    Utils.removeChildren(selector);
    
    var selector2 = document.getElementById("events-characterSelector");
    Utils.removeChildren(selector2);
    
    var table = document.getElementById("personalStories");
    Utils.removeChildren(table);
    
    var showOnlyUnfinishedStories = document.getElementById("finishedStoryCheckbox").checked;

    PermissionInformer.getStoryNamesArray(false, function(err, allStoryNames){
    	if(err) {Utils.handleError(err); return;}
    	
    	DBMS.getFilteredStoryNames(showOnlyUnfinishedStories, function(err, storyNames){
    		if(err) {Utils.handleError(err); return;}
    		if (storyNames.length > 0) {
    			var storyNamesOnly = storyNames.map(function(elem){
    				return elem.storyName;
    			})
    			var settings = DBMS.getSettings();
    			if(!settings["Events"]){
    				settings["Events"] = {
    						storyName : storyNamesOnly[0]
    				};
    			}
    			var storyName = settings["Events"].storyName;
    			if(storyNamesOnly.indexOf(storyName) === -1){
    				settings["Events"].storyName = storyNamesOnly[0];
    				storyName = storyNamesOnly[0];
    			}
    			
		    	var map = {};
		    	allStoryNames.forEach(function(elem){
		    		map[elem.value] = elem;
		    	});
		    	
		    	storyNames = storyNames.map(function(elem){
		    		var info = map[elem.storyName];
		    		info.isFinished = elem.isFinished;
		    		info.isEmpty = elem.isEmpty;
		    		return info;
		    	});
		    	
		    	storyNames.sort(Utils.charOrdAObject);
    			
    			var isFirst = true;
    			var option;

    			storyNames.forEach(function (tmpStoryName) {
    				option = document.createElement("option");
    				option.appendChild(document.createTextNode(tmpStoryName.displayName + Events.getSuffix(tmpStoryName)));
    				if (tmpStoryName.value === storyName) {
    					Events.updateCharacterSelector(tmpStoryName.value);
    					option.selected = true;
    					isFirst = false;
    				}
    				
    				option.storyInfo = tmpStoryName.value;
    				selector.appendChild(option);
    			});
    		}
    	});
    });
};

Events.getSuffix = function(object){
	"use strict";
	if(object.isEmpty) return Events.emptySuffix;
	if(object.isFinished) return Events.finishedSuffix;
	return "";
}

Events.updateCharacterSelectorDelegate = function (event) {
    "use strict";
    Events.updateCharacterSelector(event.target.selectedOptions[0].storyInfo);
};

Events.updateCharacterSelector = function (storyName) {
    "use strict";
    
    Events.updateSettings("storyName", storyName);
    var selector = document.getElementById("events-characterSelector");
    Utils.removeChildren(selector);
    
    var showOnlyUnfinishedStories = document.getElementById("finishedStoryCheckbox").checked;

    var isFirst = true;
    
	PermissionInformer.getCharacterNamesArray(false, function(err, allCharacters){
    	if(err) {Utils.handleError(err); return;}
    	DBMS.getFilteredCharacterNames(storyName, showOnlyUnfinishedStories, function(err, characterArray){
    		if(err) {Utils.handleError(err); return;}
    		if (characterArray.length > 0) {
    			var settings = DBMS.getSettings();
    			if(!settings["Events"].characterNames){
    				settings["Events"].characterNames = [];
    			}
    			
    			var characterNames = settings["Events"].characterNames;
    			var existingCharacterNames = characterNames.filter(function(name){
    				return characterArray.indexOf(name) !== -1;
    			});
    			
    			Events.updateSettings("characterNames", existingCharacterNames);
    			characterNames = existingCharacterNames;
    			
		    	var map = {};
		    	allCharacters.forEach(function(elem){
		    		map[elem.value] = elem;
		    	});
		    	
		    	characterArray = characterArray.map(function(elem){
		    		var info = map[elem.characterName];
		    		info.isFinished = elem.isFinished;
		    		info.isEmpty = elem.isEmpty;
		    		return info;
		    	});
		    	
		    	characterArray.sort(Utils.charOrdAObject);
    			
    			characterArray.forEach(function (elem) {
    				var option = document.createElement("option");
    				option.appendChild(document.createTextNode(elem.displayName + Events.getSuffix(elem)));
    				if (characterNames.indexOf(elem.value) !== -1) {
    					option.selected = true;
    					isFirst = false;
    				}
    				
    				option.storyInfo = storyName;
    				option.characterInfo = elem.value;
    				selector.appendChild(option);
    			});
    			

    			Events.showPersonalStories(storyName, characterNames);
    		}
    	});
	});
    
};

Events.showPersonalStoriesDelegate = function (event) {
    "use strict";
    
    if(event.target.selectedOptions.length == 0){
        return;
    }
    
    var option = event.target.selectedOptions[0];
    var storyName = option.storyInfo;
    var characterNames = [];
    
    var i;
    for (i = 0; i < event.target.selectedOptions.length; i +=1) {
        characterNames.push(event.target.selectedOptions[i].characterInfo);
    }
    
    Events.updateSettings("characterNames", characterNames);
    
    Events.showPersonalStories(storyName, characterNames);
};



Events.showPersonalStories = function (storyName, characterNames) {
    "use strict";
    
	DBMS.getEvents(storyName, characterNames, function(err, events){
		if(err) {Utils.handleError(err); return;}
	    PermissionInformer.isStoryEditable(storyName, function(err, isStoryEditable){
	    	if(err) {Utils.handleError(err); return;}
	    	var adaptations = characterNames.map(function(characterName){
	    		return {
	    			characterName: characterName,
	    			storyName: storyName
	    		};
	    	});
	    	PermissionInformer.areAdaptationsEditable(adaptations, function(err, areAdaptationsEditable){
	    		if(err) {Utils.handleError(err); return;}
	    		Events.buildAdaptationInterface(storyName, characterNames, events, areAdaptationsEditable);
	    		Utils.enable(Events.content, "isStoryEditable", isStoryEditable);
	    		Utils.enable(Events.content, "notEditable", false);
	    	});
	    });
	});
};
	
Events.buildAdaptationInterface = function (storyName, characterNames, events, areAdaptationsEditable) {
    "use strict";
    
    var table = document.getElementById("personalStories");
    Utils.removeChildren(table);

    var tr;
    var td, span, input, i, div, divContainer;
    
    events.forEach(function (event, i) {
        tr = document.createElement("div");
        addClass(tr, "eventMainPanelRow");
        table.appendChild(tr);
        
        td = document.createElement("div");
        addClass(td, "eventMainPanelRow-left");
        span = document.createElement("div");
        span.appendChild(document.createTextNode(event.name));
        td.appendChild(span);
        
        input = document.createElement("textarea");
        addClass(input,"isStoryEditable");
        addClass(input,"eventPersonalStory");
        input.value = event.text;
        input.eventIndex = event.index;
        input.storyName = storyName;
        
        input.addEventListener("change", Events.onChangePersonalStoryDelegate);
        td.appendChild(input);
        tr.appendChild(td);
        
        td = document.createElement("div");
        addClass(td, "eventMainPanelRow-right");
        
        divContainer = document.createElement("div");
        addClass(divContainer, "events-eventsContainer");
        
        for (var i = 0; i < characterNames.length; i++) {
            var characterName = characterNames[i];
            
            if(!event.characters[characterName]){
                continue;
            }
            div = document.createElement("div");
            addClass(div, "events-singleEventAdaptation");
            div.appendChild(document.createTextNode(characterName));
            
            input = document.createElement("textarea");
            if(!areAdaptationsEditable[storyName + "-" + characterName]){
            	addClass(input,"notEditable");
            }
            addClass(input,"eventPersonalStory");
            input.value = event.characters[characterName].text;
            input.eventIndex = event.index;
            input.storyName = storyName;
            input.characterName = characterName;
            
            input.addEventListener("change", Events.onChangePersonalStoryDelegate);
            div.appendChild(input);
            
            input = document.createElement("input");
            if(!areAdaptationsEditable[storyName + "-" + characterName]){
            	addClass(input,"notEditable");
            }
            input.type = "checkbox";
            input.checked = event.characters[characterName].ready;
            input.eventIndex = event.index;
            input.storyName = storyName;
            input.characterName = characterName;
            
            input.addEventListener("change", Events.onChangeReadyStatus);
            div.appendChild(input);
            div.appendChild(document.createTextNode(Events.finishedText));
            
            divContainer.appendChild(div);
        }
        
        td.appendChild(divContainer);
        
        tr.appendChild(td);
    });
};

Events.onChangeReadyStatus = function (event) {
    "use strict";
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var characterName = event.target.characterName;
    var value = event.target.checked;
    DBMS.changeAdaptationReadyStatus(storyName, eventIndex, characterName, value, Utils.processError());
};

Events.onChangePersonalStoryDelegate = function (event) {
    "use strict";
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var characterName = event.target.characterName;
    var text = event.target.value;
    DBMS.setEventText(storyName, eventIndex, characterName, text, Utils.processError());
};


Events.updateSettings = function (name, value) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["Events"][name] = value;
};
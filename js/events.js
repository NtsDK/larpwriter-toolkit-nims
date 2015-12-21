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

    DBMS.getFilteredStoryNames(showOnlyUnfinishedStories, function(err, storyNames){
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
            
            var isFirst = true;
            storyNames.forEach(function (tmpStoryName) {
                var option = document.createElement("option");
                option.appendChild(document.createTextNode(tmpStoryName.storyName + 
                        (tmpStoryName.isFinished ? Events.finishedSuffix : "")));
                if (tmpStoryName.storyName === storyName) {
                    Events.updateCharacterSelector(tmpStoryName.storyName);
                    option.selected = true;
                    isFirst = false;
                }
                
                option.storyInfo = tmpStoryName.storyName;
                selector.appendChild(option);
            });
        }
    });
    
};

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
    
    DBMS.getFilteredCharacterNames(storyName, showOnlyUnfinishedStories, function(err, characterArray){
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
            
            characterArray.forEach(function (elem) {
                var suffix = elem.isFinished ? Events.finishedSuffix : "";
                var option = document.createElement("option");
                option.appendChild(document.createTextNode(elem.characterName + " " + suffix));
                if (characterNames.indexOf(elem.characterName) !== -1) {
                    option.selected = true;
                    isFirst = false;
                }
                
                option.storyInfo = storyName;
                option.characterInfo = elem.characterName;
                selector.appendChild(option);
            });
            
            DBMS.getEvents(storyName, characterNames, function(err, events){
                Events.showPersonalStories(storyName, characterNames, events);
            });
        }
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
    
    DBMS.getEvents(storyName, characterNames, function(err, events){
        Events.showPersonalStories(storyName, characterNames, events);
    });
};



Events.showPersonalStories = function (storyName, characterNames, events) {
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
        input.className = "eventPersonalStory";
        input.value = event.text;
        input.eventIndex = event.index;
        input.storyName = storyName;
        
        input.addEventListener("change", Events.onChangePersonalStoryDelegate);
        td.appendChild(input);
        tr.appendChild(td);
        
        td = document.createElement("div");
        addClass(td, "eventMainPanelRow-right");
        
        divContainer = document.createElement("div");
        divContainer.className = "events-eventsContainer";
        
        for (var i = 0; i < characterNames.length; i++) {
            var characterName = characterNames[i];
            
            if(!event.characters[characterName]){
                continue;
            }
            div = document.createElement("div");
            div.className = "events-singleEventAdaptation";
            div.appendChild(document.createTextNode(characterName));
            
            input = document.createElement("textarea");
            input.className = "eventPersonalStory";
            input.value = event.characters[characterName].text;
            input.eventIndex = event.index;
            input.storyName = storyName;
            input.characterName = characterName;
            
            input.addEventListener("change", Events.onChangePersonalStoryDelegate);
            div.appendChild(input);
            
            input = document.createElement("input");
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
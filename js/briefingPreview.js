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

var BriefingPreview = {};

BriefingPreview.init = function () {
    "use strict";
    var button = document.getElementById("briefingCharacter");
    button.addEventListener("change", BriefingPreview.buildContentDelegate);

    button = document.getElementById("eventGroupingByStoryRadio");
    button.addEventListener("change", BriefingPreview.refresh);
    button.checked = true;

    button = document.getElementById("eventGroupingByTimeRadio");
    button.addEventListener("change", BriefingPreview.refresh);
    
    DBMS.getAllProfileSettings(function(profileSettings){
        BriefingPreview.profileSettings = profileSettings;
    });
    BriefingPreview.content = document.getElementById("briefingPreviewDiv");
};

BriefingPreview.refresh = function () {
    "use strict";
    var selector = document.getElementById("briefingCharacter");
    Utils.removeChildren(selector);
    
    DBMS.getCharacterNamesArray(function(names){
        if (names.length > 0) {
            var settings = DBMS.getSettings();
            if(!settings["BriefingPreview"]){
                settings["BriefingPreview"] = {
                        characterName : names[0]
                };
            }
            var characterName = settings["BriefingPreview"].characterName;
            if(names.indexOf(characterName) === -1){
                settings["BriefingPreview"].characterName = names[0];
                characterName = names[0];
            }
            
            names.forEach(function (name) {
                var option = document.createElement("option");
                option.appendChild(document.createTextNode(name));
                if(name === characterName){
                    option.selected = true;
                }
                selector.appendChild(option);
            });
            
            BriefingPreview.buildContent(characterName);
        }
    });
    
};

BriefingPreview.buildContentDelegate = function (event) {
    "use strict";
    BriefingPreview.buildContent(event.target.value);
};

BriefingPreview.updateSettings = function (characterName) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["BriefingPreview"].characterName = characterName;
};

BriefingPreview.buildContent = function (characterName) {
    "use strict";
    BriefingPreview.updateSettings(characterName);
    var content = document.getElementById("briefingContent");
    Utils.removeChildren(content);

    content.appendChild(document.createTextNode("Персонаж: " + characterName));
    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));

    DBMS.getProfile(characterName, function(name, profile){
        BriefingPreview.showProfile(content, profile);
        content.appendChild(document.createElement("br"));
        content.appendChild(document.createElement("br"));
        
        content.appendChild(document.createTextNode("Инвентарь"));
        content.appendChild(document.createElement("br"));
        
        DBMS.getAllInventoryLists(characterName, function(allInventoryLists){
            allInventoryLists.forEach(function(elem){
                content.appendChild(document.createTextNode(elem.storyName + ":"));
                var input = document.createElement("input");
                input.value = elem.inventory;
                input.storyName = elem.storyName;
                input.characterName = characterName;
                input.className = "inventoryInput";
                input.addEventListener("change", BriefingPreview.updateCharacterInventory);
                content.appendChild(input);
                
                content.appendChild(document.createElement("br"));
            });
            
            content.appendChild(document.createElement("br"));
            content.appendChild(document.createElement("br"));
            
            content.appendChild(document.createTextNode("События"));
            content.appendChild(document.createElement("br"));
            
            var groupingByStory = document.getElementById("eventGroupingByStoryRadio").checked;
            if (groupingByStory) {
                BriefingPreview.showEventsByStory(content, characterName);
            } else {
                BriefingPreview.showEventsByTime(content, characterName);
            }
        });
    });
};

BriefingPreview.showProfile = function(content, profile){
    "use strict";
    var span;
    
    BriefingPreview.profileSettings.forEach(function (element) {
        content.appendChild(document.createTextNode(element.name + ": "));
        switch (element.type) {
        case "text":
            content.appendChild(document.createElement("br"));
            span = document.createElement("span");
            addClass(span, "briefingTextSpan");
            span.appendChild(document.createTextNode(profile[element.name]));
            content.appendChild(span);
            content.appendChild(document.createElement("br"));
            break;
        case "enum":
        case "number":
        case "string":
            content.appendChild(document.createTextNode(profile[element.name]));
            content.appendChild(document.createElement("br"));
            break;
        case "checkbox":
            content.appendChild(document.createTextNode(profile[element.name] ? "Да" : "Нет"));
            content.appendChild(document.createElement("br"));
            break;
        }
    });
};

BriefingPreview.showEventsByTime = function (content, characterName) {
    "use strict";
    
    DBMS.getCharacterEventsByTime(characterName, function(allEvents){
        allEvents.forEach(function (event) {
            BriefingPreview.showEvent(event, content, characterName);
        });
    });
};

BriefingPreview.showEventsByStory = function (content, characterName) {
    "use strict";
    
    DBMS.getCharacterEventGroupsByStory(characterName, function(eventGroups){
        eventGroups.forEach(function(elem){
            content.appendChild(document.createTextNode(elem.storyName));
            content.appendChild(document.createElement("br"));
            
            elem.events.forEach(function(event){
                BriefingPreview.showEvent(event, content, characterName);
            });
        });
    });
};

BriefingPreview.showEvent = function(event, content, characterName){
    var isOriginal = event.characters[characterName].text === "";
    var type = isOriginal ? "Оригинал события" : "Адаптация";
    
    content.appendChild(document.createTextNode(event.time + " " + event.name + ": " + type));
    var input = document.createElement("textarea");
    input.className = "briefingPersonalStory";

    if(isOriginal){
        input.setAttribute("disabled","disabled");
        var button = document.createElement("button");
        content.appendChild(document.createElement("br"));
        button.appendChild(document.createTextNode("Разблокировать редактирование оригинала события"));
        content.appendChild(button);
        button.addEventListener("click", function(){
            input.removeAttribute("disabled");
        });
    }
    
    content.appendChild(document.createElement("br"));
    
    if (event.characters[characterName].text === "") {
        input.value = event.text;
    } else {
        input.value = event.characters[characterName].text;
        input.characterName = characterName;
    }
    input.eventIndex = event.index;
    input.storyName = event.storyName;
    
    input.addEventListener("change", BriefingPreview.onChangePersonalStory);
    content.appendChild(input);
    
    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));  
};

BriefingPreview.updateCharacterInventory = function (event) {
    "use strict";
    var input = event.target;
    DBMS.updateCharacterInventory(input.storyName, input.characterName, input.value);
};

BriefingPreview.onChangePersonalStory = function (event) {
    "use strict";
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var characterName = event.target.characterName;
    var text = event.target.value;
    DBMS.setEventText(storyName, eventIndex, characterName, text);
};
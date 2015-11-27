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
 Utils, DBMS, Database
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

    BriefingPreview.content = document.getElementById("briefingPreviewDiv");
};

BriefingPreview.refresh = function () {
    "use strict";
    var selector = document.getElementById("briefingCharacter");
    Utils.removeChildren(selector);
    var names = DBMS.getCharacterNamesArray();
    
    if (names.length > 0) {
        if(!Database.Settings["BriefingPreview"]){
            Database.Settings["BriefingPreview"] = {
                characterName : names[0]
            };
        }
        var characterName = Database.Settings["BriefingPreview"].characterName;
        if(names.indexOf(characterName) === -1){
            Database.Settings["BriefingPreview"].characterName = names[0];
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
};

BriefingPreview.buildContentDelegate = function (event) {
    "use strict";
    BriefingPreview.buildContent(event.target.value);
};

BriefingPreview.buildContent = function (characterName) {
    "use strict";
    Database.Settings["BriefingPreview"].characterName = characterName;
    var content = document.getElementById("briefingContent");
    Utils.removeChildren(content);

    content.appendChild(document.createTextNode("Персонаж: " + characterName));
    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));

    var character = Database.Characters[characterName];
    
    var span;

    Database.ProfileSettings.forEach(function (element) {
        content.appendChild(document.createTextNode(element.name + ": "));
        switch (element.type) {
        case "text":
            content.appendChild(document.createElement("br"));
            span = document.createElement("span");
            addClass(span, "briefingTextSpan");
            span.appendChild(document.createTextNode(character[element.name]));
            content.appendChild(span);
            content.appendChild(document.createElement("br"));
            break;
        case "enum":
        case "number":
        case "string":
            content.appendChild(document.createTextNode(character[element.name]));
            content.appendChild(document.createElement("br"));
            break;
        case "checkbox":
            content.appendChild(document.createTextNode(character[element.name] ? "Да" : "Нет"));
            content.appendChild(document.createElement("br"));
            break;
        }
    });

    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));

    content.appendChild(document.createTextNode("Инвентарь"));
    content.appendChild(document.createElement("br"));

    for ( var storyName in Database.Stories) {
        var story = Database.Stories[storyName];
        if (story.characters[characterName]
                && story.characters[characterName].inventory
                && story.characters[characterName].inventory !== "") {
            content.appendChild(document.createTextNode(storyName + ":"));
            var input = document.createElement("input");
            input.value = story.characters[characterName].inventory;
            input.characterInfo = story.characters[characterName];
            input.className = "inventoryInput";
            input.addEventListener("change", BriefingPreview.updateCharacterInventory);
            content.appendChild(input);

            content.appendChild(document.createElement("br"));
        }
    }
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

};

BriefingPreview.showEventsByTime = function (content, characterName) {
    "use strict";
    var allStories = [];
    
    Object.keys(Database.Stories).filter(function(storyName){
        return Database.Stories[storyName].characters[characterName];
    }).forEach(function (storyName) {
        var events = Database.Stories[storyName].events;
        allStories = allStories.concat(events.filter(function (event) {
            return event.characters[characterName];
        }));
    });
    
    allStories.sort(eventsByTime);

    var type, input, isHistory;
    allStories.forEach(function (event) {
        BriefingPreview.showEvent(event, content, characterName);
    });
};

BriefingPreview.showEventsByStory = function (content, characterName) {
    "use strict";
    
    Object.keys(Database.Stories).filter(function(storyName){
        return Database.Stories[storyName].characters[characterName];
    }).forEach(function (storyName) {
        content.appendChild(document.createTextNode(storyName));
        content.appendChild(document.createElement("br"));
        
        var events = Database.Stories[storyName].events;
        events.filter(function (event) {
            return event.characters[characterName];
        }).forEach(function (event) {
            BriefingPreview.showEvent(event, content, characterName);
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
        input.eventInfo = event;
    } else {
        input.value = event.characters[characterName].text;
        input.eventInfo = event.characters[characterName];
    }
    
    input.addEventListener("change", BriefingPreview.onChangePersonalStory);
    content.appendChild(input);
    
    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));  
};

BriefingPreview.updateCharacterInventory = function (event) {
    "use strict";
    event.target.characterInfo.inventory = event.target.value;
};

BriefingPreview.onChangePersonalStory = function (event) {
    "use strict";
    var eventObject = event.target.eventInfo;
    var text = event.target.value;
    eventObject.text = text;
};
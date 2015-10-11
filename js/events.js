/*global
 Utils, Database, DBMS
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

    var storyNames = DBMS.getStoryNamesArray();
    var isFirst = true;
    storyNames.forEach(function (storyName) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(storyName));
        if (isFirst) {
            Events.updateCharacterSelector(storyName);
            option.selected = true;
            isFirst = false;
        }
        
        option.storyInfo = storyName;
        selector.appendChild(option);
    });
};

Events.updateCharacterSelectorDelegate = function (event) {
    "use strict";
    Events.updateCharacterSelector(event.target.selectedOptions[0].storyInfo);
};

Events.updateCharacterSelector = function (storyName) {
    "use strict";
    var selector = document.getElementById("events-characterSelector");
    Utils.removeChildren(selector);
    
    var showOnlyFinishedStory = document.getElementById("finishedStoryCheckbox").checked;

    var isFirst = true;
    var characterArray = DBMS.getStoryCharacterNamesArray(storyName);
    characterArray.filter(function (characterName) {
        if (showOnlyFinishedStory) {
            return !Events.isStoryFinishedForCharacter(storyName, characterName);
        } else {
            return true;
        }
    }).forEach(function (characterName) {
        var suffix = Events.isStoryFinishedForCharacter(storyName, characterName) ? Events.finishedSuffix : "";
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(characterName + " " + suffix));
        if (isFirst) {
            Events.showPersonalStories(storyName, [characterName]);
            option.selected = true;
            isFirst = false;
        }

        option.storyInfo = storyName;
        option.characterInfo = characterName;
        selector.appendChild(option);
    });
};

Events.isStoryFinishedForCharacter = function (storyName, characterName) {
    "use strict";
    return Database.Stories[storyName].events.every(function(event){
        if(event.characters[characterName]){
            return event.characters[characterName].ready;
        } else {
            return true;
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
    
    Events.showPersonalStories(storyName, characterNames);
};

Events.showPersonalStories = function (storyName, characterNames) {
    "use strict";
    var table = document.getElementById("personalStories");
    Utils.removeChildren(table);

    var tr = document.createElement("tr");
    table.appendChild(tr);
    
    Events.headers.forEach(function (header) {
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(header));
        tr.appendChild(th);
    });
    var td, span, input, i, div, divContainer;
    Database.Stories[storyName].events.filter(function (event) {
        for (i = 0; i < characterNames.length; i++) {
            if(event.characters[characterNames[i]]){
                return true;
            }
        }
        return false;
    }).forEach(function (event) {
        tr = document.createElement("tr");
        table.appendChild(tr);

        td = document.createElement("td");
        span = document.createElement("div");
        span.appendChild(document.createTextNode(storyName + ":" + event.name));
        td.appendChild(span);

        input = document.createElement("textarea");
        input.className = "eventPersonalStory";
        input.value = event.text;
        input.eventInfo = event;

        input.addEventListener("change", Events.onChangePersonalStoryDelegate);
        td.appendChild(input);
        tr.appendChild(td);

        td = document.createElement("td");
        
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
            input.eventInfo = event.characters[characterName];
            
            input.addEventListener("change", Events.onChangePersonalStoryDelegate);
            div.appendChild(input);

            input = document.createElement("input");
            input.type = "checkbox";
            input.checked = event.characters[characterName].ready;
            input.eventInfo = event.characters[characterName];
            
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
    var eventObject = event.target.eventInfo;
    var value = event.target.checked;
    eventObject.ready = value;
};

Events.onChangePersonalStoryDelegate = function (event) {
    "use strict";
    var eventObject = event.target.eventInfo;
    var text = event.target.value;
    Events.onChangePersonalStory(eventObject, text);
};

Events.onChangePersonalStory = function (eventObject, text) {
    "use strict";
    eventObject.text = text;
};
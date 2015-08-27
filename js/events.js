/*global
 Utils, Database, DBMS
 */


"use strict";

var Events = {};

Events.init = function () {
    "use strict";
    var selector = document.getElementById("personalStoriesCharacter");
    selector.addEventListener("change", Events.showPersonalStoriesDelegate);

    selector = document.getElementById("finishedStoryCheckbox");
    selector.addEventListener("change", Events.refresh);

    Events.content = document.getElementById("eventsDiv");
};

Events.refresh = function () {
    "use strict";
    var selector = document.getElementById("personalStoriesCharacter");
    Utils.removeChildren(selector);

    var showOnlyFinishedStory = document.getElementById("finishedStoryCheckbox").checked;

    var storyNames = DBMS.getStoryNamesArray();
    var isFirst = true;
    storyNames.forEach(function (storyName) {
        var characterArray = DBMS.getStoryCharacterNamesArray(storyName);
        characterArray.filter(function(characterName){
            if(showOnlyFinishedStory){
                return !Events.isStoryFinishedForCharacter(storyName, characterName);
            } else {
                return true;
            }
        }).forEach(function (characterName) {
            if (isFirst) {
                Events.showPersonalStories(storyName, characterName);
                isFirst = false;
            }
            var suffix = Events.isStoryFinishedForCharacter(storyName, characterName) ? "(завершено)" : "";
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(storyName + ":" + characterName + " " + suffix));
            option.storyInfo = storyName;
            option.characterInfo = characterName;
            selector.appendChild(option);
        });
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
    var option = event.target.selectedOptions[0];
    var storyName = option.storyInfo;
    var characterName = option.characterInfo;
    Events.showPersonalStories(storyName, characterName);
};

Events.showPersonalStories = function (storyName, characterName) {
    "use strict";
    var table = document.getElementById("personalStories");
    Utils.removeChildren(table);

    var tr = document.createElement("tr");
    table.appendChild(tr);
    var headers = [ "Оригинал", "Адаптация", "Описание завершено" ];

    headers.forEach(function (header) {
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(header));
        tr.appendChild(th);
    });
    var td, span, input;
    Database.Stories[storyName].events.filter(function (event) {
        return event.characters[characterName];
    }).forEach(function (event) {
        tr = document.createElement("tr");
        table.appendChild(tr);

        td = document.createElement("td");
        span = document.createElement("div");
        span.appendChild(document.createTextNode(event.name));
        td.appendChild(span);

        input = document.createElement("textarea");
        input.className = "eventPersonalStory";
        input.value = event.text;
        input.eventInfo = event;

        input.addEventListener("change", Events.onChangePersonalStoryDelegate);
        td.appendChild(input);
        tr.appendChild(td);

        td = document.createElement("td");
        span = document.createElement("div");
        span.appendChild(document.createTextNode("\u00A0"));
        td.appendChild(span);

        input = document.createElement("textarea");
        input.className = "eventPersonalStory";
        input.value = event.characters[characterName].text;
        input.eventInfo = event.characters[characterName];
        
        input.addEventListener("change", Events.onChangePersonalStoryDelegate);
        td.appendChild(input);
        tr.appendChild(td);
        
        td = document.createElement("td");
        input = document.createElement("input");
        input.type = "checkbox";
        input.checked = event.characters[characterName].ready;
        input.eventInfo = event.characters[characterName];
        
        input.addEventListener("change", Events.onChangeReadyStatus);
        td.appendChild(input);
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
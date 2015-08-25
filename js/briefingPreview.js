"use strict";

var BriefingPreview = {};

BriefingPreview.init = function () {
    var button = document.getElementById("briefingCharacter");
    button.addEventListener("change", BriefingPreview.buildContentDelegate);

    var button = document.getElementById("eventGroupingByStoryRadio");
    button.addEventListener("change", BriefingPreview.refresh);
    button.checked = true;

    var button = document.getElementById("eventGroupingByTimeRadio");
    button.addEventListener("change", BriefingPreview.refresh);

    BriefingPreview.content = document.getElementById("briefingPreviewDiv");
};

BriefingPreview.refresh = function () {
    var selector = document.getElementById("briefingCharacter");
    removeChildren(selector);
    var names = DBMS.getCharacterNamesArray();

    for (var i = 0; i < names.length; i++) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(names[i]));
        selector.appendChild(option);
    }

    if (names[0]) {
        BriefingPreview.buildContent(names[0]);
    }
};

BriefingPreview.buildContentDelegate = function (event) {
    BriefingPreview.buildContent(event.target.value);
};

BriefingPreview.buildContent = function (characterName) {
    var content = document.getElementById("briefingContent");
    removeChildren(content);

    content.appendChild(document.createTextNode("Персонаж: " + characterName));
    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));

    var character = Database.Characters[characterName];

    Database.ProfileSettings.forEach(function (element) {
        content.appendChild(document.createTextNode(element.name + ": "));
        switch (element.type) {
        case "text":
            content.appendChild(document.createElement("br"));
            content.appendChild(document
                    .createTextNode(character[element.name]));
            content.appendChild(document.createElement("br"));
            break;
        case "enum":
        case "number":
        case "string":
            content.appendChild(document
                    .createTextNode(character[element.name]));
            content.appendChild(document.createElement("br"));
            break;
        case "checkbox":
            content.appendChild(document
                    .createTextNode(character[element.name] ? "Да" : "Нет"));
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
            // content.appendChild(document.createTextNode(storyName + ":" +
            // story.characters[characterName].inventory));
            content.appendChild(document.createTextNode(storyName + ":"));
            var input = document.createElement("input");
            input.value = story.characters[characterName].inventory;
            input.characterInfo = story.characters[characterName];
            input.className = "inventoryInput";
            input.addEventListener("change",
                    BriefingPreview.updateCharacterInventory);
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
    var allStories = [];
    for ( var storyName in Database.Stories) {
        if (!Database.Stories[storyName].characters[characterName]) {
            continue;
        }

        var events = Database.Stories[storyName].events;
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.characters[characterName]) {
                allStories.push(event);
            }
        }
    }

    allStories.sort(eventsByTime);

    for (var i = 0; i < allStories.length; i++) {
        var event = allStories[i];
        var type;
        if (event.characters[characterName].text === "") {
            type = "История";
        } else {
            type = "Персонаж";
        }

        content.appendChild(document.createTextNode(event.time + " "
                + event.name + ": " + type));
        content.appendChild(document.createElement("br"));

        var input = document.createElement("textarea");
        input.className = "eventPersonalStory";

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

    }

};

BriefingPreview.showEventsByStory = function (content, characterName) {
    for ( var storyName in Database.Stories) {
        if (!Database.Stories[storyName].characters[characterName]) {
            continue;
        } else {
            content.appendChild(document.createTextNode(storyName));
            content.appendChild(document.createElement("br"));
        }
        var events = Database.Stories[storyName].events;
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.characters[characterName]) {
                var type;
                if (event.characters[characterName].text === "") {
                    type = "История";
                } else {
                    type = "Персонаж";
                }

                content.appendChild(document.createTextNode(event.time + " "
                        + event.name + ": " + type));
                content.appendChild(document.createElement("br"));

                var input = document.createElement("textarea");
                input.className = "eventPersonalStory";

                if (event.characters[characterName].text === "") {
                    input.value = event.text;
                    input.eventInfo = event;
                    // content.appendChild(document.createTextNode(event.text));
                } else {
                    input.value = event.characters[characterName].text;
                    input.eventInfo = event.characters[characterName];
                    // content.appendChild(document.createTextNode(event.characters[characterName].text));
                }

                input.addEventListener("change",
                        BriefingPreview.onChangePersonalStory);
                content.appendChild(input);

                content.appendChild(document.createElement("br"));
                content.appendChild(document.createElement("br"));
            }
        }

    }
};

BriefingPreview.updateCharacterInventory = function (event) {
    event.target.characterInfo.inventory = event.target.value;
};

BriefingPreview.onChangePersonalStory = function (event) {
    var eventObject = event.target.eventInfo;
    var text = event.target.value;
    eventObject.text = text;
};
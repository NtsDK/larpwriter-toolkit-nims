"use strict";

var EventPresence = {};

EventPresence.init = function () {
    EventPresence.content = document.getElementById("eventPresenceDiv");
};

EventPresence.refresh = function () {
    var table = document.getElementById("eventPresenceTable");
    Utils.removeChildren(table);

    EventPresence.appendTableHeader(table);

    var characterArray = DBMS.getStoryCharacterNamesArray();

    for (var i = 0; i < Stories.CurrentStory.events.length; ++i) {
        EventPresence.appendTableInput(table, Stories.CurrentStory.events[i],
                characterArray);
    }
};

EventPresence.appendTableHeader = function (table) {
    var tr = document.createElement("tr");
    var td = document.createElement("th");
    td.appendChild(document.createTextNode("Событие"));
    tr.appendChild(td);
    var characterArray = DBMS.getStoryCharacterNamesArray();

    for (var i = 0; i < characterArray.length; i++) {
        var td = document.createElement("th");
        td.appendChild(document.createTextNode(characterArray[i]));
        tr.appendChild(td);
    }
    table.appendChild(tr);
};

EventPresence.appendTableInput = function (table, event, characterArray) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(event.name));
    tr.appendChild(td);

    // for(var i=0;i<Database.characters.length;++i){
    // for ( var name in CurrentStory.characters) {
    for (var i = 0; i < characterArray.length; i++) {
        var character = characterArray[i];
        var td = document.createElement("td");
        var input = document.createElement("input");
        input.type = "checkbox";
        if (event.characters[character]) {
            input.checked = true;
        }
        input.eventInfo = event;
        input.nameInfo = character;
        input.addEventListener("change",
                EventPresence.onChangeCharacterCheckbox);
        td.appendChild(input);
        tr.appendChild(td);
    }

    table.appendChild(tr);
};

EventPresence.onChangeCharacterCheckbox = function (event) {
    if (event.target.checked) {
        event.target.eventInfo.characters[event.target.nameInfo] = {
            text : ""
        };
    } else {
        if (Utils.confirm("Вы уверены, что хотите удалить персонажа "
                + event.target.nameInfo
                + " из события '"
                + event.target.eventInfo.name
                + "'? Все данные связанные с персонажем будут удалены безвозвратно.")) {
            delete event.target.eventInfo.characters[event.target.nameInfo];
        } else {
            event.target.checked = true;
        }
    }
};
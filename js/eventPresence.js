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
 Utils, DBMS, Stories
 */

"use strict";

var EventPresence = {};

EventPresence.init = function () {
    "use strict";
    EventPresence.content = document.getElementById("eventPresenceDiv");
};

EventPresence.refresh = function () {
    "use strict";
    var tableHead = document.getElementById("eventPresenceTableHead");
    Utils.removeChildren(tableHead);
    var table = document.getElementById("eventPresenceTable");
    Utils.removeChildren(table);
    
    if(Stories.CurrentStoryName == undefined){
        return;
    }

    DBMS.getStoryCharacterNamesArray(Stories.CurrentStoryName, function(characterArray){
        EventPresence.appendTableHeader(tableHead, characterArray);
        DBMS.getStoryEvents(Stories.CurrentStoryName, function(events){
            events.forEach(function (event, i) {
                EventPresence.appendTableInput(table, event, i, characterArray);
            });
        });
    });
};

EventPresence.appendTableHeader = function (table, characterArray) {
    "use strict";
    var tr = document.createElement("tr");
    var td = document.createElement("th");
    td.appendChild(document.createTextNode("Событие"));
    tr.appendChild(td);

    characterArray.forEach(function (characterName) {
        td = document.createElement("th");
        td.appendChild(document.createTextNode(characterName));
        tr.appendChild(td);
    });
    table.appendChild(tr);
};

EventPresence.appendTableInput = function (table, event, i, characterArray) {
    "use strict";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(event.name));
    tr.appendChild(td);

    characterArray.forEach(function (character) {
        td = document.createElement("td");
        var input = document.createElement("input");
        input.type = "checkbox";
        if (event.characters[character]) {
            input.checked = true;
        }
        input.eventIndex = i;
        input.eventName = event.name;
        input.characterName = character;
        input.hasText = event.characters[character] != null && event.characters[character].text != "";
        input.addEventListener("change", EventPresence.onChangeCharacterCheckbox);
        td.appendChild(input);
        tr.appendChild(td);
    });

    table.appendChild(tr);
};

EventPresence.onChangeCharacterCheckbox = function (event) {
    "use strict";
    if (event.target.checked) {
        DBMS.addCharacterToEvent(Stories.CurrentStoryName, event.target.eventIndex, event.target.characterName);
    } else if (!event.target.hasText){
        DBMS.removeCharacterFromEvent(Stories.CurrentStoryName, event.target.eventIndex, event.target.characterName);
    } else {
        if (Utils.confirm("Вы уверены, что хотите удалить персонажа "
                + event.target.characterName
                + " из события '"
                + event.target.eventName
                + "'? У этого песонажа есть адаптация события, которая будет удалена безвозвратно.")) {
            DBMS.removeCharacterFromEvent(Stories.CurrentStoryName, event.target.eventIndex, event.target.characterName);
        } else {
            event.target.checked = true;
        }
    }
};
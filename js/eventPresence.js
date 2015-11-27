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
 Utils, Database, DBMS, Stories
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
    
    if(Stories.CurrentStory == undefined){
        return;
    }

    EventPresence.appendTableHeader(tableHead);

    var characterArray = DBMS.getStoryCharacterNamesArray();

    Stories.CurrentStory.events.forEach(function (event) {
        EventPresence.appendTableInput(table, event, characterArray);
    });
};

EventPresence.appendTableHeader = function (table) {
    "use strict";
    var tr = document.createElement("tr");
    var td = document.createElement("th");
    td.appendChild(document.createTextNode("Событие"));
    tr.appendChild(td);
    var characterArray = DBMS.getStoryCharacterNamesArray();

    characterArray.forEach(function (characterName) {
        td = document.createElement("th");
        td.appendChild(document.createTextNode(characterName));
        tr.appendChild(td);
    });
    table.appendChild(tr);
};

EventPresence.appendTableInput = function (table, event, characterArray) {
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
        input.eventInfo = event;
        input.nameInfo = character;
        input.addEventListener("change", EventPresence.onChangeCharacterCheckbox);
        td.appendChild(input);
        tr.appendChild(td);
    });

    table.appendChild(tr);
};

EventPresence.onChangeCharacterCheckbox = function (event) {
    "use strict";
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
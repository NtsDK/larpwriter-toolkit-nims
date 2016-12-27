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

var EventPresence = {name:"EventPresence"};

EventPresence.init = function () {
    "use strict";
    listen(getEl('eventPresenceSelector'), "change", UI.showSelectedEls("-dependent"));

    EventPresence.content = getEl("eventPresenceDiv");
};

EventPresence.refresh = function () {
    "use strict";
    var tableHead = getEl("eventPresenceTableHead");
    var table = getEl("eventPresenceTable");
    var characterSelector = getEl('eventPresenceSelector');
    
    if(Stories.CurrentStoryName == undefined){
        clearEl(tableHead);
        clearEl(table);
        clearEl(characterSelector);
        return;
    }
    
    PermissionInformer.isStoryEditable(Stories.CurrentStoryName, function(err, isStoryEditable){
        if(err) {Utils.handleError(err); return;}
        PermissionInformer.getEntityNamesArray('character', false, function(err, allCharacters){
            if(err) {Utils.handleError(err); return;}
            DBMS.getStoryCharacterNamesArray(Stories.CurrentStoryName, function(err, characterArray){
                if(err) {Utils.handleError(err); return;}
                var map = {};
                allCharacters.forEach(function(elem){
                    map[elem.value] = elem;
                });
                var dataArray = characterArray.map(function(elem){
                    return map[elem];
                });
                
                dataArray.sort(Utils.charOrdAObject);
                
                var displayArray = dataArray.map(function(elem){
                    return elem.displayName;
                });
                var characterArray = dataArray.map(function(elem){
                    return elem.value;
                });
                
                DBMS.getStoryEvents(Stories.CurrentStoryName, function(err, events){
                    if(err) {Utils.handleError(err); return;}
                    
                    clearEl(tableHead);
                    clearEl(table);
                    UI.fillShowItemSelector(clearEl(characterSelector), displayArray, characterArray);
                    
                    EventPresence.appendTableHeader(tableHead, displayArray);
                    events.forEach(function (event, i) {
                        EventPresence.appendTableInput(table, event, i, characterArray);
                        Utils.enable(EventPresence.content, "isStoryEditable", isStoryEditable);
                    });
                });
            });
        });
    });
};

EventPresence.appendTableHeader = function (table, characterArray) {
    "use strict";
    var tr = makeEl("tr");

    rAddEl(rAddEl(makeText(getL10n("stories-event")), makeEl("th")), tr);
    characterArray.forEach(function(characterName, i) {
        rAddEl(rAddEl(makeText(characterName), rAddClass(i + "-dependent", makeEl("th"))), tr);
    });
    table.appendChild(tr);
};

EventPresence.appendTableInput = function (table, event, i, characterArray) {
    "use strict";
    var tr = makeEl("tr");
    var td = makeEl("td");
    td.appendChild(makeText(event.name));
    tr.appendChild(td);

    characterArray.forEach(function(character, j) {
        td = addClass(makeEl("td"),'vertical-aligned-td');
        addClass(td, j + "-dependent");
        var input = makeEl("input");
        addClass(input, "isStoryEditable");
        input.type = "checkbox";
        if (event.characters[character]) {
            input.checked = true;
        }
        input.eventIndex = i;
        input.eventName = event.name;
        input.characterName = character;
        input.hasText = event.characters[character] != null && event.characters[character].text != "";
        input.addEventListener("change", EventPresence.onChangeCharacterCheckbox);
        
        var id = i+character;
        setAttr(input, 'id', id);
        addClass(input, 'hidden');
        addEl(td, input);
        var label = addClass(makeEl('label'),'checkbox-label');
        setAttr(label, 'for', id);
        addEl(td, label);
        
        tr.appendChild(td);
    });

    table.appendChild(tr);
};

EventPresence.onChangeCharacterCheckbox = function (event) {
    "use strict";
    if (event.target.checked) {
        DBMS.addCharacterToEvent(Stories.CurrentStoryName, event.target.eventIndex, event.target.characterName, Utils.processError());
    } else if (!event.target.hasText){
        DBMS.removeCharacterFromEvent(Stories.CurrentStoryName, event.target.eventIndex, event.target.characterName, Utils.processError());
    } else {
        if (Utils.confirm(strFormat(getL10n("stories-remove-character-from-event-warning"),[event.target.characterName, event.target.eventName]))) {
            DBMS.removeCharacterFromEvent(Stories.CurrentStoryName, event.target.eventIndex, event.target.characterName, Utils.processError());
        } else {
            event.target.checked = true;
        }
    }
};
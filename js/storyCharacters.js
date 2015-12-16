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

var StoryCharacters = {};

StoryCharacters.inventoryHeader = ["Имя", "Инвентарь"];
StoryCharacters.characterActivityHeader = ["Имя", "Актив", "Спутник", "Защита", "Пассив"];
StoryCharacters.characterActivityDisplayNames = ["Актив", "Спутник", "Защита", "Пассив"];
StoryCharacters.characterActivityTypes = ["active", "follower", "defensive", "passive"];

StoryCharacters.init = function () {
    "use strict";
    var button = document.getElementById("storyCharactersAddButton");
    button.addEventListener("click", StoryCharacters.addCharacter);

    button = document.getElementById("storyCharactersSwitchButton");
    button.addEventListener("click", StoryCharacters.switchCharacters);

    button = document.getElementById("storyCharactersRemoveButton");
    button.addEventListener("click", StoryCharacters.removeCharacter);

    StoryCharacters.addSelector = document.getElementById("storyCharactersAddSelector");
    StoryCharacters.removeSelector = document.getElementById("storyCharactersRemoveSelector");
    StoryCharacters.fromSelector = document.getElementById("storyCharactersFromSelector");
    StoryCharacters.toSelector = document.getElementById("storyCharactersToSelector");

    StoryCharacters.content = document.getElementById("storyCharactersDiv");
};

StoryCharacters.refresh = function () {
    "use strict";

    Utils.removeChildren(StoryCharacters.addSelector);
    Utils.removeChildren(StoryCharacters.removeSelector);
    Utils.removeChildren(StoryCharacters.fromSelector);
    Utils.removeChildren(StoryCharacters.toSelector);
    
    if(!Stories.CurrentStoryName){
        return;
    }
    
    DBMS.getCharacterNamesArray(function(allCharacters){
        DBMS.getStoryCharacters(Stories.CurrentStoryName, function(localCharacters){
            StoryCharacters.rebuildInterface(allCharacters, localCharacters);
        });
    });
};

StoryCharacters.rebuildInterface = function (allCharacters, localCharacters) {
    "use strict";
    var addArray = [];
    var removeArray = [];
    
    for ( var name in localCharacters) {
        removeArray.push(name);
    }
    
    allCharacters.filter(function(name){
        return !localCharacters[name];
    }).forEach(function(name){
        addArray.push(name);
    });
    
    addArray.sort(CommonUtils.charOrdA);
    removeArray.sort(CommonUtils.charOrdA);
    
    var option;
    
    addArray.forEach(function (addValue) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(addValue));
        StoryCharacters.addSelector.appendChild(option);
        option = document.createElement("option");
        option.appendChild(document.createTextNode(addValue));
        StoryCharacters.toSelector.appendChild(option);
    });
    removeArray.forEach(function (removeValue) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(removeValue));
        StoryCharacters.removeSelector.appendChild(option);
        option = document.createElement("option");
        option.appendChild(document.createTextNode(removeValue));
        StoryCharacters.fromSelector.appendChild(option);
    });
    
    var tableHead = document.getElementById("story-characterActivityTableHead");
    var table = document.getElementById("story-characterActivityTable");
    Utils.removeChildren(tableHead);
    Utils.removeChildren(table);
    
    StoryCharacters.appendCharacterHeader(tableHead, "th", StoryCharacters.characterActivityHeader);
    
    removeArray.forEach(function (removeValue) {
        StoryCharacters.appendCharacterActivity(table, localCharacters[removeValue]);
    });
    
    tableHead = document.getElementById("storyCharactersTableHead");
    table = document.getElementById("storyCharactersTable");
    Utils.removeChildren(tableHead);
    Utils.removeChildren(table);
    
    StoryCharacters.appendCharacterHeader(tableHead, "th", StoryCharacters.inventoryHeader);
    
    removeArray.forEach(function (removeValue) {
        StoryCharacters.appendCharacterInput(table, localCharacters[removeValue]);
    });
};

StoryCharacters.addCharacter = function () {
    "use strict";
    var characterName = document.getElementById("storyCharactersAddSelector").value.trim();
    
    if(characterName === ""){
        Utils.alert("Имя персонажа не указано.");
        return;
    }
    
    DBMS.addStoryCharacter(Stories.CurrentStoryName, characterName, StoryCharacters.refresh);
};

StoryCharacters.switchCharacters = function () {
    "use strict";
    var fromName = document.getElementById("storyCharactersFromSelector").value.trim();
    var toName = document.getElementById("storyCharactersToSelector").value.trim();
    
    if(fromName === "" || toName == ""){
        Utils.alert("Имя одного из персонажей не указано.");
        return;
    }
    
    DBMS.switchStoryCharacters(Stories.CurrentStoryName, fromName, toName, StoryCharacters.refresh);
};

StoryCharacters.removeCharacter = function () {
    "use strict";
    var characterName = document.getElementById("storyCharactersRemoveSelector").value.trim();
    
    if(characterName === ""){
        Utils.alert("Имя персонажа не указано.");
        return;
    }

    if (Utils.confirm("Вы уверены, что хотите удалить персонажа "
            + characterName
            + " из истории? Все данные связанные с персонажем будут удалены безвозвратно.")) {
        DBMS.removeStoryCharacter(Stories.CurrentStoryName, characterName, StoryCharacters.refresh);
    }
};

StoryCharacters.appendCharacterHeader = function (table, tag, values) {
    "use strict";
    var td;
    var tr = document.createElement("tr");
    values.forEach(function(value){
        td = document.createElement(tag);
        tr.appendChild(td);
        td.appendChild(document.createTextNode(value));
    });
    
    table.appendChild(tr);
};

StoryCharacters.appendCharacterInput = function (table, character) {
    "use strict";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(character.name));
    tr.appendChild(td);

    td = document.createElement("td");
    var input = document.createElement("input");
    input.value = character.inventory;
    input.characterName = character.name;
    input.className = "inventoryInput";
    input.addEventListener("change", StoryCharacters.updateCharacterInventory);
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
};

StoryCharacters.updateCharacterInventory = function (event) {
    "use strict";
    DBMS.updateCharacterInventory(Stories.CurrentStoryName, event.target.characterName, event.target.value);
};

StoryCharacters.appendCharacterActivity = function (table, character) {
    "use strict";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(character.name));
    tr.appendChild(td);
    
    var input;
    StoryCharacters.characterActivityTypes.forEach(function (activityType) {
        td = document.createElement("td");
        input = document.createElement("input");
        input.type = "checkbox";
        if (character.activity[activityType]) {
            input.checked = true;
        }
        input.characterName = character.name;
        input.activityType = activityType;
        input.addEventListener("change", StoryCharacters.onChangeCharacterActivity);
        td.appendChild(input);
        tr.appendChild(td);
    });
    
    table.appendChild(tr);
};

StoryCharacters.onChangeCharacterActivity = function (event) {
    "use strict";
    DBMS.onChangeCharacterActivity(Stories.CurrentStoryName, event.target.characterName, 
            event.target.activityType, event.target.checked);
};

/*global
 Utils, Database, DBMS
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

    StoryCharacters.content = document.getElementById("storyCharactersDiv");
};

StoryCharacters.refresh = function () {
    "use strict";
    var addSelector = document.getElementById("storyCharactersAddSelector");
    var removeSelector = document.getElementById("storyCharactersRemoveSelector");
    var fromSelector = document.getElementById("storyCharactersFromSelector");
    var toSelector = document.getElementById("storyCharactersToSelector");

    Utils.removeChildren(addSelector);
    Utils.removeChildren(removeSelector);
    Utils.removeChildren(fromSelector);
    Utils.removeChildren(toSelector);

    var addArray = [];
    var removeArray = [];

    var localCharacters = {};
    if(Stories.CurrentStory){
        localCharacters =  Stories.CurrentStory.characters;
    }
    
    for ( var name in localCharacters) {
        removeArray.push(name);
    }

    for ( var name in Database.Characters) {
        if (!localCharacters[name]) {
            addArray.push(name);
        }
    }

    addArray.sort(Utils.charOrdA);
    removeArray.sort(Utils.charOrdA);

    var option;

    addArray.forEach(function (addValue) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(addValue));
        addSelector.appendChild(option);
        option = document.createElement("option");
        option.appendChild(document.createTextNode(addValue));
        toSelector.appendChild(option);
    });
    removeArray.forEach(function (removeValue) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(removeValue));
        removeSelector.appendChild(option);
        option = document.createElement("option");
        option.appendChild(document.createTextNode(removeValue));
        fromSelector.appendChild(option);
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

    Stories.CurrentStory.characters[characterName] = {
        name : characterName,
        inventory : "",
        activity: {}
    };

    StoryCharacters.refresh();
};

StoryCharacters.switchCharacters = function () {
    "use strict";
    var fromName = document.getElementById("storyCharactersFromSelector").value.trim();
    var toName = document.getElementById("storyCharactersToSelector").value.trim();

    Stories.CurrentStory.characters[toName] = Stories.CurrentStory.characters[fromName];
    Stories.CurrentStory.characters[toName].name = toName;
    delete Stories.CurrentStory.characters[fromName];
    Stories.CurrentStory.events.forEach(function (event) {
        if (event.characters[fromName]) {
            event.characters[fromName].name = toName;
            event.characters[toName] = event.characters[fromName];
            delete event.characters[fromName];
        }
    });

    StoryCharacters.refresh();
};

StoryCharacters.removeCharacter = function () {
    "use strict";
    var characterName = document.getElementById("storyCharactersRemoveSelector").value.trim();

    if (Utils.confirm("Вы уверены, что хотите удалить персонажа "
            + name
            + " из истории? Все данные связанные с персонажем будут удалены безвозвратно.")) {
        delete Stories.CurrentStory.characters[characterName];
        Stories.CurrentStory.events.forEach(function (event) {
            delete event.characters[characterName];
        });

        StoryCharacters.refresh();
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
    input.characterInfo = character;
    input.className = "inventoryInput";
    input.addEventListener("change", StoryCharacters.updateCharacterInventory);
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
};

StoryCharacters.onChangeCharacterActivity = function (event) {
    "use strict";
    if (event.target.checked) {
        event.target.activities[event.target.activityType] = true;
    } else {
        delete event.target.activities[event.target.activityType];
    }
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
        input.activities = character.activity;
        input.activityType = activityType;
        input.addEventListener("change", StoryCharacters.onChangeCharacterActivity);
        td.appendChild(input);
        tr.appendChild(td);
    });
    
    table.appendChild(tr);
};

StoryCharacters.updateCharacterInventory = function (event) {
    "use strict";
    event.target.characterInfo.inventory = event.target.value;
    var inventoryCheck = document.getElementById("inventoryCheck");
    Utils.removeChildren(inventoryCheck);
    var arr = event.target.characterInfo.inventory.split(",");
    arr = arr.map(function(value){
        return value.trim();
    });
    inventoryCheck.appendChild(document.createTextNode(JSON.stringify(arr)));
};
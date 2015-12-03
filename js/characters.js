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
 Utils, CharacterProfile, CharacterFilter, CharacterProfileConfigurer, DBMS
 */

"use strict";

var Characters = {};

Characters.init = function () {
    "use strict";
    var root = Characters;
    root.views = {};
    var nav = "charactersNavigation";
    var content = "charactersContent";
    Utils.addView(root, "CharacterProfile", CharacterProfile, "Досье", nav,
            content, true);
    Utils.addView(root, "CharacterProfileConfigurer",
            CharacterProfileConfigurer, "Редактор досье", nav, content);

    var button = document.getElementById("createCharacterButton");
    button.addEventListener("click", Characters.createCharacter);

    button = document.getElementById("renameCharacter");
    button.addEventListener("click", Characters.renameCharacter);

    button = document.getElementById("removeCharacterButton");
    button.addEventListener("click", Characters.removeCharacter);

    Characters.content = document.getElementById("charactersDiv");
};

Characters.refresh = function () {
    "use strict";
    var names = DBMS.getCharacterNamesArray();

    var selector = document.getElementById("fromName");
    Utils.removeChildren(selector);
    names.forEach(function (name) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(name));
        selector.appendChild(option);
    });

    selector = document.getElementById("characterRemoveSelector");
    Utils.removeChildren(selector);
    names.forEach(function (name) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(name));
        selector.appendChild(option);
    });

    Characters.currentView.refresh();
};

Characters.createCharacter = function () {
    "use strict";
    var characterNameInput = document.getElementById("characterNameInput");
    var name = characterNameInput.value.trim();

    if (name === "") {
        Utils.alert("Имя персонажа не указано");
        return;
    }
    
    DBMS.isCharacterNameUsed(name, function(isCharacterNameUsed){
        if (isCharacterNameUsed) {
            Utils.alert("Такой персонаж уже существует");
        } else {
            DBMS.createCharacter(name);
            Characters.refresh();
        }
    });

};

Characters.renameCharacter = function () {
    "use strict";
    var fromName = document.getElementById("fromName").value.trim();
    var toName = document.getElementById("toName").value.trim();

    if (toName === "") {
        Utils.alert("Новое имя не указано.");
        return;
    }

    if (fromName === toName) {
        Utils.alert("Имена совпадают.");
        return;
    }

    DBMS.isCharacterNameUsed(toName, function(isCharacterNameUsed){
        if (isCharacterNameUsed) {
            Utils.alert("Имя " + toName + " уже используется.");
        } else {
            DBMS.renameCharacter(fromName, toName);
            Characters.refresh();
        }
    });
};

Characters.removeCharacter = function () {
    "use strict";
    var name = document.getElementById("characterRemoveSelector").value.trim();

    if (Utils.confirm("Вы уверены, что хотите удалить " + name
            + "? Все данные связанные с персонажем будут удалены безвозвратно.")) {
        DBMS.removeCharacter(name);
        Characters.refresh();
    }
};

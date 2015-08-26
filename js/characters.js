/*global
 Utils, CharacterProfile, CharacterFilter, CharacterProfileConfigurer, Database, DBMS
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
    Utils.addView(root, "CharacterFilter", CharacterFilter, "Фильтр", nav,
            content);
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
        Utils.Utils.alert("Имя персонажа не указано");
        return;
    }

    if (Database.Characters[name]) {
        Utils.Utils.alert("Такой персонаж уже существует");
        return;
    }

    DBMS.createCharacter(name);
    Characters.refresh();
};

Characters.renameCharacter = function () {
    "use strict";
    var fromName = document.getElementById("fromName").value.trim();
    var toName = document.getElementById("toName").value.trim();

    if (toName === "") {
        Utils.Utils.alert("Новое имя не указано.");
        return;
    }

    if (fromName === toName) {
        Utils.Utils.alert("Имена совпадают.");
        return;
    }

    if (Database.Characters[toName]) {
        Utils.Utils.alert("Имя " + toName + " уже используется.");
        return;
    }

    DBMS.renameCharacter(fromName, toName);

    Characters.refresh();
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

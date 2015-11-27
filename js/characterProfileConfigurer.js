/*global
 Utils, Database, DBMS
 */

"use strict";

// Профиль игрока уже содержит поле name.
// У меня был выбор:
// 1. убрать это поле в принципе,
// 2. добавить уровень вложенности для данных профиля,
// 3. запретить называть так поля профиля.
// 1 уже используется в ряде мест
// 2 - на мой взгляд усложнит формат данных
// 3 просто и без усложнений, выбран 3 вариант

var CharacterProfileConfigurer = {};

CharacterProfileConfigurer.mapping = {
    text : {
        displayName : "Текст",
        value : ""
    },
    string : {
        displayName : "Строка",
        value : ""
    },
    enum : {
        displayName : "Единственный выбор",
        value : "_"
    },
    number : {
        displayName : "Число",
        value : 0
    },
    checkbox : {
        displayName : "Галочка",
        value : false
    }
};

CharacterProfileConfigurer.init = function () {
    'use strict';
    var selector = document.getElementById("profileItemTypeSelector");
    Utils.removeChildren(selector);
    CharacterProfileConfigurer.fillSelector(selector);

    var button = document.getElementById("createProfileItemButton");
    button.addEventListener("click", CharacterProfileConfigurer.createProfileItem);

    button = document.getElementById("swapProfileFieldsButton");
    button.addEventListener("click", CharacterProfileConfigurer.swapProfileItems);

    button = document.getElementById("removeProfileItemButton");
    button.addEventListener("click", CharacterProfileConfigurer.removeProfileItem);

    CharacterProfileConfigurer.content = document.getElementById("characterProfileConfigurer");
};

CharacterProfileConfigurer.refresh = function () {
    'use strict';
    var positionSelector = document.getElementById("profileItemPositionSelector");
    Utils.removeChildren(positionSelector);

    Database.ProfileSettings.forEach(function (elem, i) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode("Перед '" + elem.name + "'"));
        positionSelector.appendChild(option);
    });

    var option = document.createElement("option");
    option.appendChild(document.createTextNode("В конец"));
    positionSelector.appendChild(option);

    positionSelector.selectedIndex = Database.ProfileSettings.length;

    var table = document.getElementById("profileConfigBlock");
    Utils.removeChildren(table);

    Database.ProfileSettings.forEach(function (profileSettings, i) {
        CharacterProfileConfigurer.appendInput(table, profileSettings, i + 1);
    });

    var selectorArr = [];

    selectorArr.push(document.getElementById("firstProfileField"));
    selectorArr.push(document.getElementById("secondProfileField"));
    selectorArr.push(document.getElementById("removeProfileItemSelector"));

    selectorArr.forEach(function (selector) {
        Utils.removeChildren(selector);
        Database.ProfileSettings.forEach(function (elem, i) {
            option = document.createElement("option");
            option.appendChild(document.createTextNode(elem.name));
            selector.appendChild(option);
        });
    });
};

CharacterProfileConfigurer.createProfileItem = function () {
    'use strict';
    var name = document.getElementById("profileItemNameInput").value.trim();

    if (!CharacterProfileConfigurer.validateProfileItemName(name)) {
        return;
    }

    var type = document.getElementById("profileItemTypeSelector").value.trim();

    if (!CharacterProfileConfigurer.mapping[type]) {
        Utils.alert("Неизвестный тип поля: " + type);
        return;
    }

    var profileItem = {
        name : name,
        type : type,
        value : CharacterProfileConfigurer.mapping[type].value
    };

    Object.keys(Database.Characters).forEach(function (characterName) {
        Database.Characters[characterName][name] = CharacterProfileConfigurer.mapping[type].value;
    });

    var positionSelector = document.getElementById("profileItemPositionSelector");

    var position = positionSelector.value;
    if (position === "В конец") {
        Database.ProfileSettings.push(profileItem);
    } else {
        Database.ProfileSettings.splice(positionSelector.selectedIndex, 0,
                profileItem);
    }

    CharacterProfileConfigurer.refresh();
};

CharacterProfileConfigurer.swapProfileItems = function () {
    'use strict';
    var index1 = document.getElementById("firstProfileField").selectedIndex;
    var index2 = document.getElementById("secondProfileField").selectedIndex;
    if (index1 === index2) {
        Utils.alert("Позиции совпадают");
        return;
    }

    var tmp = Database.ProfileSettings[index1];
    Database.ProfileSettings[index1] = Database.ProfileSettings[index2];
    Database.ProfileSettings[index2] = tmp;

    CharacterProfileConfigurer.refresh();
};

CharacterProfileConfigurer.removeProfileItem = function () {
    'use strict';
    var index = document.getElementById("removeProfileItemSelector").selectedIndex;

    if (Utils.confirm("Вы уверены, что хотите удалить поле профиля "
                    + Database.ProfileSettings[index].name
                    + "? Все данные связанные с этим полем будут удалены безвозвратно.")) {
        var name = Database.ProfileSettings[index].name;
        Object.keys(Database.Characters).forEach(function (characterName) {
            delete Database.Characters[characterName][name];
        });
        Database.ProfileSettings.remove(index);
        CharacterProfileConfigurer.refresh();
    }
};

CharacterProfileConfigurer.appendHeader = function (table) {
    'use strict';
    var tr = document.createElement("tr");

    var td = document.createElement("th");
    td.appendChild(document.createTextNode("№"));
    tr.appendChild(td);

    td = document.createElement("th");
    td.appendChild(document.createTextNode("Название поля"));
    tr.appendChild(td);

    td = document.createElement("th");
    td.appendChild(document.createTextNode("Тип"));
    tr.appendChild(td);

    td = document.createElement("th");
    td.appendChild(document.createTextNode("Значения"));
    tr.appendChild(td);
    table.appendChild(tr);
};

CharacterProfileConfigurer.fillSelector = function (selector) {
    'use strict';
    Object.keys(CharacterProfileConfigurer.mapping).forEach(function (name) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(CharacterProfileConfigurer.mapping[name].displayName));
        option.value = name;
        selector.appendChild(option);
    });
};

CharacterProfileConfigurer.appendInput = function (table, profileSettings, index) {
    'use strict';
    var tr = document.createElement("tr");

    var td = document.createElement("td");
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(index));
    td.appendChild(span);
    tr.appendChild(td);

    td = document.createElement("td");
    var input; 
    input = document.createElement("input");
    input.value = profileSettings.name;
    input.info = profileSettings;
    addClass(input,"itemNameInput");
    input.addEventListener("change",
            CharacterProfileConfigurer.renameProfileItem);
    td.appendChild(input);
    tr.appendChild(td);

    td = document.createElement("td");
    var selector = document.createElement("select");
    CharacterProfileConfigurer.fillSelector(selector);
    selector.value = profileSettings.type;
    selector.info = profileSettings;
    td.appendChild(selector);
    selector.addEventListener("change",
            CharacterProfileConfigurer.changeProfileItemType);
    tr.appendChild(td);

    td = document.createElement("td");
    if(profileSettings.type == "text" || profileSettings.type == "enum"){
        input = document.createElement("textarea");
    } else {
        input = document.createElement("input");
    }
    input.info = profileSettings;
    addClass(input, "profile-configurer-" + profileSettings.type);

    switch (profileSettings.type) {
    case "text":
    case "string":
    case "enum":
        input.value = profileSettings.value;
        break;
    case "number":
        input.type = "number";
        input.value = profileSettings.value;
        break;
    case "checkbox":
        input.type = "checkbox";
        input.checked = profileSettings.value;
        break;
    }

    input.addEventListener("change", CharacterProfileConfigurer.updateDefaultValue);
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
};

CharacterProfileConfigurer.updateDefaultValue = function (event) {
    'use strict';
    var type = event.target.info.type;

    var oldOptions, newOptions, newOptionsMap, missedValues, name;

    switch (type) {
    case "text":
        event.target.info.value = event.target.value;
        break;
    case "string":
        event.target.info.value = event.target.value;
        break;
    case "enum":
        if (event.target.value === "") {
            Utils.alert("Значение поля с единственным выбором не может быть пустым");
            event.target.value = event.target.info.value;
            return;
        }
        oldOptions = event.target.info.value.split(",");
        newOptions = event.target.value.split(",");
        
        newOptions = newOptions.map(function(elem){
            return elem.trim();
        });

        newOptionsMap = [{}].concat(newOptions).reduce(function (a, b) {
            a[b] = true;
            return a;
        });

        missedValues = oldOptions.filter(function (oldOption) {
            return !newOptionsMap[oldOption];
        });

        if (missedValues.length !== 0) {
            if (Utils.confirm("Новое значение единственного выбора удаляет предыдущие значения: "
                            + missedValues.join(",")
                            + ". Это приведет к обновлению существующих профилей. Вы уверены?")) {
                event.target.info.value = event.target.value;
                name = event.target.info.name;

                Object.keys(Database.Characters).forEach(function (characterName) {
                    var enumValue = Database.Characters[characterName][name];
                    if (!newOptionsMap[enumValue]) {
                        Database.Characters[characterName][name] = newOptions[0];
                    }
                });

                return;
            } else {
                event.target.value = event.target.info.value;
                return;
            }
        }

        event.target.info.value = event.target.value = newOptions.join(",");
        break;
    case "number":
        if (isNaN(event.target.value)) {
            Utils.alert("Введено не число");
            event.target.value = event.target.info.value;
            return;
        }
        event.target.info.value = Number(event.target.value);
        break;
    case "checkbox":
        event.target.info.value = event.target.checked;
        break;
    }

};

CharacterProfileConfigurer.renameProfileItem = function (event) {
    'use strict';
    var newName = event.target.value.trim();
    var oldName = event.target.info.name;

    if (!CharacterProfileConfigurer.validateProfileItemName(newName)) {
        event.target.value = event.target.info.name;
        return;
    }

    Object.keys(Database.Characters).forEach(function (characterName) {
        var tmp = Database.Characters[characterName][oldName];
        delete Database.Characters[characterName][oldName];
        Database.Characters[characterName][newName] = tmp;
    });

    event.target.info.name = newName;
};

CharacterProfileConfigurer.validateProfileItemName = function (name) {
    'use strict';
    if (name === "") {
        Utils.alert("Название поля не указано");
        return false;
    }

    if (name === "name") {
        Utils.alert("Название поля не может быть name");
        return false;
    }

    var nameUsedTest = function (profile) {
        return name === profile.name;
    };

    if (Database.ProfileSettings.some(nameUsedTest)) {
        Utils.alert("Такое имя уже используется.");
        return false;
    }

    return true;
};

CharacterProfileConfigurer.changeProfileItemType = function (event) {
    'use strict';
    if (Utils.confirm("Вы уверены, что хотите изменить тип поля профиля "
            + event.target.info.name
            + "? Все заполнение данного поле в досье будет потеряно.")) {
        event.target.info.type = event.target.value;
        event.target.info.value = CharacterProfileConfigurer.mapping[event.target.value].value;

        Object.keys(Database.Characters).forEach(function (characterName) {
            Database.Characters[characterName][event.target.info.name] = CharacterProfileConfigurer.mapping[event.target.value].value;
        });
    } else {
        event.target.value = event.target.info.type;
    }
    CharacterProfileConfigurer.refresh();
};
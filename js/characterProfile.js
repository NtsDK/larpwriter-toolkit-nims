/*global
 Utils, Database, DBMS
 */

"use strict";

var CharacterProfile = {};

CharacterProfile.init = function () {
    "use strict";
    var button = document.getElementById("bioEditorSelector");
    button.addEventListener("change", CharacterProfile.showProfileInfoDelegate);

    CharacterProfile.content = document.getElementById("characterProfile");
};

CharacterProfile.refresh = function () {
    "use strict";
    var names = DBMS.getCharacterNamesArray();

    var selector = document.getElementById("bioEditorSelector");
    Utils.removeChildren(selector);
    names.forEach(function (name) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(name));
        selector.appendChild(option);
    });

    var profileContentDiv = document.getElementById("profileContentDiv");
    Utils.removeChildren(profileContentDiv);
    profileContentDiv.inputItems = {};
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    addClass(table, "table");
    profileContentDiv.appendChild(table);

    Database.ProfileSettings.forEach(function (profileSettings) {
        CharacterProfile.appendInput(tbody, profileContentDiv.inputItems, profileSettings);
    });
    

    if (names.length > 0) {
        if(!Database.Settings["CharacterProfile"]){
            Database.Settings["CharacterProfile"] = {
                characterName : names[0]
            };
        }
        var characterName = Database.Settings["CharacterProfile"].characterName;
        if(names.indexOf(characterName) === -1){
            Database.Settings["CharacterProfile"].characterName = names[0];
            characterName = names[0];
        }
        CharacterProfile.showProfileInfo(characterName);
        selector.value = characterName;
    }
};

CharacterProfile.appendInput = function (root, inputItems, profileItemConfig) {
    "use strict";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(profileItemConfig.name));
    tr.appendChild(td);

    td = document.createElement("td");
    
    var textarea, input, selector, values;

    switch (profileItemConfig.type) {
    case "text":
        textarea = document.createElement("textarea");
        textarea.className = "profileTextInput";
        textarea.selfName = profileItemConfig.name;
        td.appendChild(textarea);
        inputItems[profileItemConfig.name] = textarea;

        textarea.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            profileContentDiv.profileInfo[event.target.selfName] = event.target.value;
        });

        break;
    case "string":
        input = document.createElement("input");
        input.className = "profileStringInput";
        input.selfName = profileItemConfig.name;
        td.appendChild(input);
        inputItems[profileItemConfig.name] = input;

        input.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            profileContentDiv.profileInfo[event.target.selfName] = event.target.value;
        });

        break;
    case "enum":
        selector = document.createElement("select");
        selector.selfName = profileItemConfig.name;

        values = profileItemConfig.value.split(",");

        values.forEach(function (value) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(value));
            selector.appendChild(option);
        });
        td.appendChild(selector);
        inputItems[profileItemConfig.name] = selector;

        selector.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            profileContentDiv.profileInfo[event.target.selfName] = event.target.value;
        });

        break;
    case "number":
        input = document.createElement("input");
        input.selfName = profileItemConfig.name;
        input.type = "number";
        td.appendChild(input);
        inputItems[profileItemConfig.name] = input;

        input.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            if (isNaN(event.target.value)) {
                Utils.alert("Введенное значение не является числом.");
                event.target.value = profileContentDiv.profileInfo[event.target.selfName];
                return;
            }
            profileContentDiv.profileInfo[event.target.selfName] = Number(event.target.value);
        });

        break;
    case "checkbox":
        input = document.createElement("input");
        input.selfName = profileItemConfig.name;
        input.type = "checkbox";
        td.appendChild(input);
        inputItems[profileItemConfig.name] = input;

        input.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            profileContentDiv.profileInfo[event.target.selfName] = event.target.checked;
        });

        break;
    }

    tr.appendChild(td);
    root.appendChild(tr);
};

CharacterProfile.showProfileInfoDelegate = function (event) {
    "use strict";
    var name = event.target.value.trim();
    CharacterProfile.showProfileInfo(name);
};

CharacterProfile.showProfileInfo = function (name) {
    "use strict";
    var profileContentDiv = document.getElementById("profileContentDiv");
    Database.Settings["CharacterProfile"].characterName = name;
    
    var profile = Database.Characters[name];
    profileContentDiv.profileInfo = profile;
    var inputNames = profileContentDiv.inputItems;
    Object.keys(inputNames).forEach(function (inputName) {
        if (inputNames[inputName].type === "checkbox") {
            inputNames[inputName].checked = profile[inputName];
        } else {
            inputNames[inputName].value = profile[inputName];
        }
    });
};

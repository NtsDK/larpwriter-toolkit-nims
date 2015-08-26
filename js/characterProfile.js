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

    Database.ProfileSettings.forEach(function (profileSettings) {
        CharacterProfile.appendInput(profileContentDiv, profileSettings);
    });

    if (names.length > 0) {
        CharacterProfile.showProfileInfo(names[0]);
        selector.value = names[0];
    }
};

CharacterProfile.appendInput = function (root, profileItemConfig) {
    "use strict";
    root.appendChild(document.createTextNode(profileItemConfig.name));

    var textarea, input, selector, values;

    switch (profileItemConfig.type) {
    case "text":
        textarea = document.createElement("textarea");
        textarea.className = "profileTextInput";
        textarea.selfName = profileItemConfig.name;
        root.appendChild(document.createElement("br"));
        root.appendChild(textarea);
        root.inputItems[profileItemConfig.name] = textarea;

        textarea.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            profileContentDiv.profileInfo[event.target.selfName] = event.target.value;
        });

        break;
    case "string":
        input = document.createElement("input");
        input.className = "profileStringInput";
        input.selfName = profileItemConfig.name;
        root.appendChild(input);
        root.inputItems[profileItemConfig.name] = input;

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
        root.appendChild(selector);
        root.inputItems[profileItemConfig.name] = selector;

        selector.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            profileContentDiv.profileInfo[event.target.selfName] = event.target.value;
        });

        break;
    case "number":
        input = document.createElement("input");
        input.selfName = profileItemConfig.name;
        input.type = "number";
        root.appendChild(input);
        root.inputItems[profileItemConfig.name] = input;

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
        root.appendChild(input);
        root.inputItems[profileItemConfig.name] = input;

        input.addEventListener("change", function (event) {
            var profileContentDiv = document.getElementById("profileContentDiv");
            profileContentDiv.profileInfo[event.target.selfName] = event.target.checked;
        });

        break;
    }

    root.appendChild(document.createElement("br"));
};

CharacterProfile.showProfileInfoDelegate = function (event) {
    "use strict";
    var name = event.target.value.trim();
    CharacterProfile.showProfileInfo(name);
};

CharacterProfile.showProfileInfo = function (name) {
    "use strict";
    var profileContentDiv = document.getElementById("profileContentDiv");
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

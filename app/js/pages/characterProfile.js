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

var CharacterProfile = {};

CharacterProfile.init = function () {
    listen(getEl("bioEditorSelector"), "change", CharacterProfile.showProfileInfoDelegate);
    CharacterProfile.content = getEl("characterProfile");
};

CharacterProfile.refresh = function () {
    PermissionInformer.getCharacterNamesArray(false, function(err, names){
        if(err) {Utils.handleError(err); return;}
        var selector = clearEl(getEl("bioEditorSelector"));
        names.forEach(function (nameInfo) {
            var option = makeEl("option");
            option.appendChild(makeText(nameInfo.displayName));
            option.value = nameInfo.value;
            selector.appendChild(option);
        });
        
        var profileContentDiv = clearEl(getEl("profileContentDiv"));
        var table = makeEl("table");
        var tbody = makeEl("tbody");
        table.appendChild(tbody);
        addClass(table, "table");
        profileContentDiv.appendChild(table);
        
        CharacterProfile.inputItems = {};
        
        DBMS.getAllProfileSettings(function(err, allProfileSettings){
            if(err) {Utils.handleError(err); return;}
            try {
                addEls(tbody, allProfileSettings.map(CharacterProfile.appendInput));
            } catch (err) {
                Utils.handleError(err); return;
            }
            
            CharacterProfile.applySettings(names, selector);
        });
        
    });
};

CharacterProfile.applySettings = function (names, selector) {
    "use strict";
    if (names.length > 0) {
        var name = names[0].value;
        var settings = DBMS.getSettings();
        if(!settings["CharacterProfile"]){
            settings["CharacterProfile"] = {
                characterName : name
            };
        }
        var characterName = settings["CharacterProfile"].characterName;
        if(names.map(function(nameInfo){return nameInfo.value;}).indexOf(characterName) === -1){
            settings["CharacterProfile"].characterName = name;
            characterName = name;
        }
        DBMS.getProfile(characterName, CharacterProfile.showProfileInfoCallback);
        selector.value = characterName;
    }
};

CharacterProfile.appendInput = function (profileItemConfig) {
    var input;
    switch (profileItemConfig.type) {
    case "text":
        input = makeEl("textarea");
        addClass(input, "profileTextInput");
        break;
    case "string":
        input = makeEl("input");
        addClass(input, "profileStringInput");
        break;
    case "enum":
        input = makeEl("select");
        fillSelector(input, profileItemConfig.value.split(",").map(R.compose(R.zipObj(['name']), R.append(R.__, []))));
        break;
    case "number":
        input = makeEl("input");
        input.type = "number";
        break;
    case "checkbox":
        input = makeEl("input");
        input.type = "checkbox";
        break;
    case "multiEnum":
        input = makeEl("input");
        input.type = "checkbox";
        break;
    default:
        throw new Errors.InternalError('errors-unexpected-switch-argument', [profileItemConfig.type]);
    }
    input.addEventListener("change", CharacterProfile.updateFieldValue(profileItemConfig.type));
    input.selfName = profileItemConfig.name;
    addClass(input,"isCharacterEditable");
    CharacterProfile.inputItems[profileItemConfig.name] = input;
    return addEls(makeEl("tr"), [addEl(makeEl("td"), makeText(profileItemConfig.name)), addEl(makeEl("td"), input)]);
};

CharacterProfile.updateFieldValue = function(type){
    "use strict";
    return function(event){
        var fieldName = event.target.selfName;
        var characterName = CharacterProfile.name;
        
        var value;
        switch(type){
        case "text":
        case "string":
        case "enum":
            value = event.target.value;
            break;
        case "number":
            if (isNaN(event.target.value)) {
                Utils.alert(getL10n("characters-not-a-number"));
                event.target.value = event.target.oldValue;
                return;
            }
            value = Number(event.target.value);
            break;
        case "checkbox":
            value = event.target.checked;
            break;
        default:
            throw new Error('Unexpected type ' + type);
        }
        DBMS.updateProfileField(characterName, fieldName, type, value, Utils.processError());
    }
}

CharacterProfile.showProfileInfoDelegate = function (event) {
    "use strict";
    var name = event.target.value.trim();
    DBMS.getProfile(name, CharacterProfile.showProfileInfoCallback);
};

CharacterProfile.showProfileInfoCallback = function (err, profile) {
    "use strict";
    if(err) {Utils.handleError(err); return;}
    var name = profile.name;
    PermissionInformer.isCharacterEditable(name, function(err, isCharacterEditable){
        if(err) {Utils.handleError(err); return;}
        CharacterProfile.updateSettings(name);
        
        CharacterProfile.name = name;
        var inputItems = CharacterProfile.inputItems;
        Object.keys(inputItems).forEach(function (inputName) {
            if (inputItems[inputName].type === "checkbox") {
                inputItems[inputName].checked = profile[inputName];
            } else {
                inputItems[inputName].value = profile[inputName];
            }
            inputItems[inputName].oldValue = profile[inputName];
            Utils.enable(CharacterProfile.content, "isCharacterEditable", isCharacterEditable);
        });
    });
};

CharacterProfile.updateSettings = function (name) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["CharacterProfile"].characterName = name;
};

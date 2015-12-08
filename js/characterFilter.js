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

var CharacterFilter = {};

CharacterFilter.init = function () {
    "use strict";
    CharacterFilter.content = document.getElementById("characterFilterDiv");
};

CharacterFilter.refresh = function () {
    "use strict";
    CharacterFilter.sortKey = "name";
    CharacterFilter.sortDir = "asc";

    var filterSettingsDiv = document.getElementById("filterSettingsDiv");
    Utils.removeChildren(filterSettingsDiv);
    filterSettingsDiv.inputItems = {};

    filterSettingsDiv.appendChild(document.createTextNode("Персонаж"));
    filterSettingsDiv.appendChild(document.createElement("br"));

    var input = document.createElement("input");
    input.selfInfo = {
        name : "name",
        type : "text"
    };
    input.value = "";
    filterSettingsDiv.appendChild(input);
    filterSettingsDiv.inputItems.name = input;
    input.addEventListener("change", CharacterFilter.rebuildContent);
    
    filterSettingsDiv.appendChild(document.createElement("br"));
    
    DBMS.getAllProfiles(function(profiles){
        CharacterFilter.Characters = profiles;
        
        DBMS.getAllProfileSettings(function(allProfileSettings){
            CharacterFilter.allProfileSettings = allProfileSettings.filter(function (value) {
                return true;
            });
            
            CharacterFilter.unshiftedProfileSettings = CharacterFilter.allProfileSettings.filter(function (value) {
                return true;
            });
            CharacterFilter.unshiftedProfileSettings.unshift({
                name : "name",
                type : "text"
            });
            
            CharacterFilter.allProfileSettings.forEach(function (profileSettings) {
                CharacterFilter.appendInput(filterSettingsDiv, profileSettings);
            });
            
            var filterHead = document.getElementById("filterHead");
            Utils.removeChildren(filterHead);
            
            CharacterFilter.appendContentHeader(filterHead, CharacterFilter.allProfileSettings);
            
            CharacterFilter.rebuildContent();
        });
    });
};

CharacterFilter.rebuildContent = function (allProfileSettings) {
    "use strict";
    var filterContent = document.getElementById("filterContent");
    Utils.removeChildren(filterContent);

    Object.keys(CharacterFilter.Characters).filter(CharacterFilter.acceptDataRow).
        sort(CharacterFilter.sortDataRows).forEach(function (name) {
            CharacterFilter.appendDataString(filterContent, CharacterFilter.Characters[name], 
                    CharacterFilter.unshiftedProfileSettings);
    });
};

CharacterFilter.acceptDataRow = function (element) {
    "use strict";
    element = CharacterFilter.Characters[element];
    var filterSettingsDiv = document.getElementById("filterSettingsDiv");
    var result = true;

    var filterValues = function (inputItemName) {
        if (inputItemName.endsWith(":numberInput")) {
            return;
        }
        if (!result) {
            return;
        }
        var inputItem = filterSettingsDiv.inputItems[inputItemName];
        var selectedOptions, regex, num, i;

        switch (inputItem.selfInfo.type) {
        case "enum":
            selectedOptions = {};

            for (i = 0; i < inputItem.options.length; i +=1) {
                if (inputItem.options[i].selected) {
                    selectedOptions[inputItem.options[i].value] = true;
                }
            }

            if (!selectedOptions[element[inputItem.selfInfo.name]]) {
                result = false;
            }

            break;
        case "checkbox":
            selectedOptions = {};

            if (inputItem.options[0].selected) {
                selectedOptions[inputItem.options[0].value === "Да" ? "true" : "false"] = true;
            }
            if (inputItem.options[1].selected) {
                selectedOptions[inputItem.options[1].value === "Да" ? "true" : "false"] = true;
            }

            if (!selectedOptions[element[inputItem.selfInfo.name]]) {
                result = false;
            }

            break;
        case "number":
            num = Number(filterSettingsDiv.inputItems[inputItem.selfInfo.name + ":numberInput"].value);

            switch (inputItem.value) {
            case "Не важно":
                break;
            case "Больше":
                result = element[inputItem.selfInfo.name] > num;
                break;
            case "Равно":
                result = element[inputItem.selfInfo.name] === num;
                break;
            case "Меньше":
                result = element[inputItem.selfInfo.name] < num;
                break;
            }

            break;
        case "text":
        case "string":
            regex = Utils.globStringToRegex(inputItem.value.toLowerCase());
            result = element[inputItem.selfInfo.name].toLowerCase().match(regex);
            break;
        }

    };

    Object.keys(filterSettingsDiv.inputItems).forEach(filterValues);

    return result;
};

CharacterFilter.sortDataRows = function (a, b) {
    "use strict";
    a = CharacterFilter.Characters[a];
    b = CharacterFilter.Characters[b];

    var type = CharacterFilter.sortKey === "name" ? "text"
            : CharacterFilter.allProfileSettings.filter(function (element) {
                return element.name === CharacterFilter.sortKey;
            })[0].type;

    switch (type) {
    case "text":
    case "string":
    case "enum":
        a = a[CharacterFilter.sortKey].toLowerCase();
        b = b[CharacterFilter.sortKey].toLowerCase();
        break;
    case "checkbox":
        a = a[CharacterFilter.sortKey];
        b = b[CharacterFilter.sortKey];
        break;
    case "number":
        a = a[CharacterFilter.sortKey];
        b = b[CharacterFilter.sortKey];
        break;
    }
    if (a > b) {
        return CharacterFilter.sortDir === "asc" ? 1 : -1;
    }
    if (a < b) {
        return CharacterFilter.sortDir === "asc" ? -1 : 1;
    }
    return 0;
};

CharacterFilter.appendDataString = function (table, character, profileSettings) {
    "use strict";
    var tr = document.createElement("tr");

    var inputItems = document.getElementById("filterSettingsDiv").inputItems;

    profileSettings.forEach(function (profileItemInfo) {
        var td = document.createElement("td");
        if (profileItemInfo.type === "checkbox") {
            td.appendChild(document.createTextNode(character[profileItemInfo.name] ? "Да" : "Нет"));
        } else if (profileItemInfo.type === "text" && profileItemInfo.name !== "name") {
            var regex = Utils.globStringToRegex(inputItems[profileItemInfo.name].value);
            var pos = character[profileItemInfo.name].search(regex);
            td.appendChild(document.createTextNode(character[profileItemInfo.name].substring(pos - 5, pos + 15)));
        } else {
            td.appendChild(document.createTextNode(character[profileItemInfo.name]));
        }
        tr.appendChild(td);
    });

    table.appendChild(tr);
};

CharacterFilter.appendContentHeader = function (thead, profileSettings) {
    "use strict";
    var tr = document.createElement("tr");

    var td = document.createElement("th");
    td.appendChild(document.createTextNode("Персонаж"));
    td.appendChild(document.createElement("span"));
    td.info = "name";
    td.addEventListener("click", CharacterFilter.onSortChange);
    tr.appendChild(td);

    profileSettings.forEach(function (element) {
        td = document.createElement("th");
        td.appendChild(document.createTextNode(element.name));
        td.appendChild(document.createElement("span"));
        td.info = element.name;
        td.addEventListener("click", CharacterFilter.onSortChange);
        tr.appendChild(td);
    });

    thead.appendChild(tr);
};

CharacterFilter.onSortChange = function (event) {
    "use strict";
    var target = event.target;
    if(target.tagName.toLowerCase() === "span"){
        target = target.parentElement;
    }
    
    if (CharacterFilter.sortKey === target.info) {
        CharacterFilter.sortDir = CharacterFilter.sortDir === "asc" ? "desc" : "asc";
        if(CharacterFilter.sortDir === "desc"){
            addClass(target, "sortDesc");
            removeClass(target, "sortAsc");
        } else {
            addClass(target, "sortAsc");
            removeClass(target, "sortDesc");
        }
    } else {
        var filterHead = document.getElementById("filterHead");
        var elems = filterHead.getElementsByClassName("sortAsc");
        var i;
        for (i = 0; i < elems.length; i++) {
            removeClass(elems[i], "sortAsc");
        }
        elems = filterHead.getElementsByClassName("sortDesc");
        for (i = 0; i < elems.length; i++) {
            removeClass(elems[i], "sortDesc");
        }
        
        CharacterFilter.sortKey = target.info;
        CharacterFilter.sortDir = "asc";
        addClass(target, "sortAsc");
        
    }
    CharacterFilter.rebuildContent();
};

CharacterFilter.appendInput = function (root, profileItemConfig) {
    "use strict";
    root.appendChild(document.createTextNode(profileItemConfig.name));
    root.appendChild(document.createElement("br"));

    var input, selector, values

    switch (profileItemConfig.type) {
    case "text":
    case "string":
        input = document.createElement("input");
        input.selfInfo = profileItemConfig;
        input.value = "";
        root.appendChild(input);
        root.inputItems[profileItemConfig.name] = input;

        input.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    case "enum":
        selector = document.createElement("select");
        selector.selfInfo = profileItemConfig;
        selector.multiple = "multiple";
        
        values = profileItemConfig.value.split(",");
        selector.size = values.length;

        values.forEach(function (value) {
            var option = document.createElement("option");
            option.selected = true;
            option.appendChild(document.createTextNode(value));
            selector.appendChild(option);
        });
        root.appendChild(selector);
        root.inputItems[profileItemConfig.name] = selector;

        selector.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    case "number":
        selector = document.createElement("select");
        selector.selfInfo = profileItemConfig;

        values = [ "Не важно", "Больше", "Равно", "Меньше" ];
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(value));
            selector.appendChild(option);
        });
        selector.selectedIndex = 0;
        root.appendChild(selector);
        root.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", CharacterFilter.rebuildContent);

        input = document.createElement("input");
        input.value = 0;
        input.type = "number";
        root.appendChild(input);
        root.inputItems[profileItemConfig.name + ":numberInput"] = input;
        input.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    case "checkbox":
        selector = document.createElement("select");
        selector.selfInfo = profileItemConfig;
        selector.multiple = "multiple";
        selector.size = 2;

        values = [ "Да", "Нет" ];
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.selected = true;
            option.appendChild(document.createTextNode(value));
            selector.appendChild(option);
        });
        root.appendChild(selector);
        root.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    }

    root.appendChild(document.createElement("br"));
};
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
    listen(getEl('profileItemSelector'), "change", UI.showSelectedEls("-dependent"));
    
    CharacterFilter.content = getEl("characterFilterDiv");
};

CharacterFilter.refresh = function () {
    "use strict";
    CharacterFilter.sortKey = "name";
    CharacterFilter.sortDir = "asc";

    var filterSettingsDiv = getEl("filterSettingsDiv");
    clearEl(filterSettingsDiv);
    filterSettingsDiv.inputItems = {};

    filterSettingsDiv.appendChild(makeText(getL10n("character-filter-character")));
    filterSettingsDiv.appendChild(makeEl("br"));

    var input = makeEl("input");
    input.selfInfo = {
        name : "name",
        type : "text"
    };
    input.value = "";
    filterSettingsDiv.appendChild(input);
    filterSettingsDiv.inputItems.name = input;
    input.addEventListener("input", CharacterFilter.rebuildContent);
    
    filterSettingsDiv.appendChild(makeEl("br"));
    
    PermissionInformer.getCharacterNamesArray(false, function(err, names){
        if(err) {Utils.handleError(err); return;}
        DBMS.getAllProfiles(function(err, profiles){
            if(err) {Utils.handleError(err); return;}
            CharacterFilter.Characters = profiles;
            
            names.forEach(function(elem){
                profiles[elem.value].name = elem.displayName;
            });
            
            
            DBMS.getAllProfileSettings(function(err, allProfileSettings){
                if(err) {Utils.handleError(err); return;}
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
                
                var profileItemNames = R.map(R.prop('name'), CharacterFilter.allProfileSettings);
                UI.fillShowItemSelector(clearEl(getEl('profileItemSelector')), profileItemNames);

                CharacterFilter.appendContentHeader(clearEl(getEl('filterHead')), profileItemNames);
                
                CharacterFilter.rebuildContent();
            });
        });
    });
};

CharacterFilter.rebuildContent = function () {
    "use strict";
    var filterContent = clearEl(getEl("filterContent"));

    var data = Object.keys(CharacterFilter.Characters).filter(CharacterFilter.acceptDataRow);
    
    addEl(clearEl(getEl("filterResultSize")), makeText(data.length));
    
    data.sort(CharacterFilter.sortDataRows).forEach(function (name) {
            CharacterFilter.appendDataString(filterContent, CharacterFilter.Characters[name], 
                    CharacterFilter.unshiftedProfileSettings);
    });
    UI.showSelectedEls("-dependent")({target:getEl('profileItemSelector')});
};

CharacterFilter.acceptDataRow = function (element) {
    "use strict";
    element = CharacterFilter.Characters[element];
    var filterSettingsDiv = getEl("filterSettingsDiv");
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
                selectedOptions["true"] = true;
            }
            if (inputItem.options[1].selected) {
                selectedOptions["false"] = true;
            }

            if (!selectedOptions[element[inputItem.selfInfo.name]]) {
                result = false;
            }

            break;
        case "number":
            num = Number(filterSettingsDiv.inputItems[inputItem.selfInfo.name + ":numberInput"].value);

            switch (inputItem.value) {
            case "ignore":
                break;
            case "greater":
                result = element[inputItem.selfInfo.name] > num;
                break;
            case "equal":
                result = element[inputItem.selfInfo.name] === num;
                break;
            case "lesser":
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
    var tr = makeEl("tr");

    var inputItems = getEl("filterSettingsDiv").inputItems;

    var td, regex, pos;
    profileSettings.forEach(function (profileItemInfo, i) {
        td = makeEl("td");
        if (profileItemInfo.type === "checkbox") {
            td.appendChild(makeText(constL10n(Constants[character[profileItemInfo.name]])));
        } else if (profileItemInfo.type === "text" && profileItemInfo.name !== "name") {
            regex = Utils.globStringToRegex(inputItems[profileItemInfo.name].value);
            pos = character[profileItemInfo.name].search(regex);
            td.appendChild(makeText(character[profileItemInfo.name].substring(pos - 5, pos + 15)));
        } else {
            td.appendChild(makeText(character[profileItemInfo.name]));
        }
        addClass(td, (i-1) +"-dependent");
        tr.appendChild(td);
    });

    addEl(table, tr);
};

CharacterFilter.appendContentHeader = function (thead, profileItemNames) {
    "use strict";
    var tr = makeEl("tr");

    var td = makeEl("th");
    td.appendChild(makeText(getL10n("character-filter-character")));
    td.appendChild(makeEl("span"));
    td.info = "name";
    td.addEventListener("click", CharacterFilter.onSortChange);
    tr.appendChild(td);

    profileItemNames.forEach(function (name, i) {
        td = makeEl("th");
        td.appendChild(makeText(name));
        td.appendChild(makeEl("span"));
        td.info = name;
        addClass(td, i +"-dependent");
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
        var filterHead = getEl("filterHead");
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
    root.appendChild(makeText(profileItemConfig.name));
    root.appendChild(makeEl("br"));

    var input, selector, values;

    switch (profileItemConfig.type) {
    case "text":
    case "string":
        input = makeEl("input");
        input.selfInfo = profileItemConfig;
        input.value = "";
        root.appendChild(input);
        root.inputItems[profileItemConfig.name] = input;

        input.addEventListener("input", CharacterFilter.rebuildContent);

        break;
    case "enum":
        selector = makeEl("select");
        selector.selfInfo = profileItemConfig;
        selector.multiple = "multiple";
        
        values = profileItemConfig.value.split(",");
        selector.size = values.length;

        values.forEach(function (value) {
            var option = makeEl("option");
            option.selected = true;
            option.appendChild(makeText(value));
            selector.appendChild(option);
        });
        root.appendChild(selector);
        root.inputItems[profileItemConfig.name] = selector;

        selector.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    case "number":
        selector = makeEl("select");
        selector.selfInfo = profileItemConfig;

        Constants.numberFilter.forEach(function (value) {
            var option = makeEl("option");
            option.appendChild(makeText(constL10n(value)));
            option.value = value;
            selector.appendChild(option);
        });
        selector.selectedIndex = 0;
        root.appendChild(selector);
        root.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", CharacterFilter.rebuildContent);

        input = makeEl("input");
        input.value = 0;
        input.type = "number";
        root.appendChild(input);
        root.inputItems[profileItemConfig.name + ":numberInput"] = input;
        input.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    case "checkbox":
        selector = makeEl("select");
        selector.selfInfo = profileItemConfig;
        selector.multiple = "multiple";
        selector.size = 2;

        Constants.yesNo.forEach(function(value){
            var option = makeEl("option");
            option.selected = true;
            option.value = value;
            option.appendChild(makeText(constL10n(value)));
            selector.appendChild(option);
        });
        root.appendChild(selector);
        root.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    }

    root.appendChild(makeEl("br"));
};
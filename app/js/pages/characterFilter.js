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

function FilterData(characterNames, profiles){
    this.profiles = profiles;
    
    characterNames.forEach(function(elem){
        profiles[elem.value].name = elem.displayName;
    });
};

FilterData.prototype.getCharacterData = function(characterName){
    return this.profiles[characterName];
};

FilterData.prototype.getCharactersList = function(){
    return Object.keys(this.profiles);
};

function FilterConfiguration(profileSettings){
    this.profileSettings = profileSettings.filter(function (value) {
        return true;
    });
    
    this.unshiftedProfileSettings = this.profileSettings.filter(function (value) {
        return true;
    });
    this.unshiftedProfileSettings.unshift({
        name : "name",
        type : "text"
    });
};

FilterConfiguration.prototype.getAllProfileSettings = function(){
    return this.profileSettings;
};

FilterConfiguration.prototype.getUnshiftedProfileSettings = function(){
    return this.unshiftedProfileSettings;
};

FilterConfiguration.prototype.getShowProfileItemNames = function(){
    return R.map(R.prop('name'), this.profileSettings);
};

FilterConfiguration.prototype.getProfileItemType = function(itemName){
    return itemName === "name" ? "text"
            : this.profileSettings.filter(function (element) {
                return element.name === itemName;
            })[0].type;;
};

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
    CharacterFilter.inputItems = {};
    
    var filterSettingsDiv = clearEl(getEl("filterSettingsDiv"));

    PermissionInformer.getCharacterNamesArray(false, function(err, names){
        if(err) {Utils.handleError(err); return;}
        DBMS.getAllProfiles(function(err, profiles){
            if(err) {Utils.handleError(err); return;}
            
            CharacterFilter.filterData = new FilterData(names, profiles);
            
            DBMS.getAllProfileSettings(function(err, allProfileSettings){
                if(err) {Utils.handleError(err); return;}
                
                CharacterFilter.filterConfiguration = new FilterConfiguration(allProfileSettings);
                
                addEl(filterSettingsDiv, CharacterFilter.makeNameInput(CharacterFilter.inputItems));
                
                CharacterFilter.filterConfiguration.getAllProfileSettings().forEach(function (profileSettings) {
                    addEl(filterSettingsDiv, CharacterFilter.makeInput(profileSettings, CharacterFilter.inputItems));
                });
                
                var profileItemNames = CharacterFilter.filterConfiguration.getShowProfileItemNames();
                UI.fillShowItemSelector(clearEl(getEl('profileItemSelector')), profileItemNames);

                addEl(clearEl(getEl('filterHead')), CharacterFilter.makeContentHeader(profileItemNames));
                
                CharacterFilter.rebuildContent();
            });
        });
    });
};

CharacterFilter.rebuildContent = function () {
    "use strict";
    var filterContent = clearEl(getEl("filterContent"));

    var data = CharacterFilter.filterData.getCharactersList().filter(CharacterFilter.acceptDataRow);
    
    addEl(clearEl(getEl("filterResultSize")), makeText(data.length));
    
    addEls(filterContent, data.sort(CharacterFilter.sortDataRows).map(function (name) {
        return CharacterFilter.makeDataString(CharacterFilter.filterData.getCharacterData(name));
    }));
    UI.showSelectedEls("-dependent")({target:getEl('profileItemSelector')});
};

CharacterFilter.acceptDataRow = function (element) {
    "use strict";
    element = CharacterFilter.filterData.getCharacterData(element);
    var filterSettingsDiv = getEl("filterSettingsDiv");
    var result = true;

    var filterValues = function (inputItemName) {
        if (inputItemName.endsWith(":numberInput")) {
            return;
        }
        if (!result) {
            return;
        }
        var inputItem = CharacterFilter.inputItems[inputItemName];
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
            num = Number(CharacterFilter.inputItems[inputItem.selfInfo.name + ":numberInput"].value);

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

    Object.keys(CharacterFilter.inputItems).forEach(filterValues);

    return result;
};

CharacterFilter.sortDataRows = function (a, b) {
    "use strict";
    a = CharacterFilter.filterData.getCharacterData(a);
    b = CharacterFilter.filterData.getCharacterData(b);

    var type = CharacterFilter.filterConfiguration.getProfileItemType(CharacterFilter.sortKey);

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

CharacterFilter.makeDataString = function (character, profileSettings) {
    "use strict";
    var tr = makeEl("tr");
    
    var profileSettings = CharacterFilter.filterConfiguration.getUnshiftedProfileSettings();

    var inputItems = CharacterFilter.inputItems;

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

    return tr;
};

CharacterFilter.makeContentHeader = function (profileItemNames) {
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

    return tr;
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

CharacterFilter.makeNameInput = function (inputItems) {
    var div = makeEl('div');
    
    div.appendChild(makeText(getL10n("character-filter-character")));
    div.appendChild(makeEl("br"));
    
    var input = makeEl("input");
    input.selfInfo = {
        name : "name",
        type : "text"
    };
    input.value = "";
    div.appendChild(input);
    inputItems.name = input;
    input.addEventListener("input", CharacterFilter.rebuildContent);
    return div;
};

CharacterFilter.makeInput = function (profileItemConfig, inputItems) {
    "use strict";
    var div = makeEl('div');
    div.appendChild(makeText(profileItemConfig.name));
    div.appendChild(makeEl("br"));

    var input, selector, values;

    switch (profileItemConfig.type) {
    case "text":
    case "string":
        input = makeEl("input");
        input.selfInfo = profileItemConfig;
        input.value = "";
        div.appendChild(input);
        inputItems[profileItemConfig.name] = input;

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
        div.appendChild(selector);
        inputItems[profileItemConfig.name] = selector;

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
        div.appendChild(selector);
        inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", CharacterFilter.rebuildContent);

        input = makeEl("input");
        input.value = 0;
        input.type = "number";
        div.appendChild(input);
        inputItems[profileItemConfig.name + ":numberInput"] = input;
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
        div.appendChild(selector);
        inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", CharacterFilter.rebuildContent);

        break;
    }

    div.appendChild(makeEl("br"));
    return div;
};
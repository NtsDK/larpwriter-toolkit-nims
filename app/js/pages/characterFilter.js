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

var CHAR_NAME = 'char-name';

function FilterConfiguration(profileSettings, characterNames, profiles, charactersSummary){
    this.profiles = profiles;
    this.charactersSummary = charactersSummary;
    
    this.characterNames = {};
    var that = this;
    characterNames.forEach(function(elem){
        that.characterNames[elem.value] = elem.displayName;
    });
    
    this.innerProfileSettings = [ {
        name : CHAR_NAME,
        type : "text",
        canHide : false,
        displayName : getL10n("character-filter-character"),
        value: ""
    } ];
    
    this.innerProfileSettings = this.innerProfileSettings.concat(profileSettings.map(function(element){
        return {
            name: 'profile-' + element.name,
            type: element.type,
            canHide: true,
            displayName: element.name,
            value: element.value
        }
    }));
    
    var summaryStats = [
        ['active'     ,getL10n("constant-active")],
        ['follower'   ,getL10n("constant-follower") ],
        ['defensive'  ,getL10n("constant-defensive")  ],
        ['passive'    ,getL10n("constant-passive")  ],
        ['completeness', getL10n("character-filter-completeness")],
        ['totalStories', getL10n("character-filter-totalStories")]
    ];
    
    var that = this;
    summaryStats.forEach(function(stat){
        that.innerProfileSettings.push({
            name: 'summary-' + stat[0],
            type: 'number',
            canHide: true,
            displayName: stat[1],
            value: ""
        });
    });
};

FilterConfiguration.prototype.getAllProfileSettings = function(){
    return this.innerProfileSettings;
};

FilterConfiguration.prototype.getShowProfileItemNames = function(){
    return R.map(R.prop('displayName'), this.innerProfileSettings.filter(R.prop('canHide')));
};

FilterConfiguration.prototype.getHeaderProfileItemNames = function(){
    return R.map(R.pick(['name', 'displayName']), this.innerProfileSettings);
};

FilterConfiguration.prototype.getProfileItemType = function(itemName){
    return this.innerProfileSettings.filter(function (element) {
        return element.name === itemName;
      })[0].type;
};

FilterConfiguration.prototype.getValue = function(characterName, profileItemName){
    if(profileItemName == CHAR_NAME){
        return this.characterNames[characterName];
    } else if(CommonUtils.startsWith(profileItemName, 'summary-') ){
        return this.charactersSummary[characterName][profileItemName.substring('summary-'.length)];
    } else {
        return this.profiles[characterName][profileItemName.substring('profile-'.length)];
    }
};

var CharacterFilter = {};

CharacterFilter.init = function () {
    "use strict";
    listen(getEl('profileItemSelector'), "change", UI.showSelectedEls("-dependent"));
    
    listen(queryEl("#characterFilterDiv .create-entity-button"), "click", Groups.createGroup('#characterFilterDiv', CharacterFilter.groupAreaRefresh));
    listen(queryEl("#characterFilterDiv .rename-entity-button"), "click", Groups.renameGroup('#characterFilterDiv', CharacterFilter.groupAreaRefresh));
    listen(queryEl("#characterFilterDiv .remove-entity-button"), "click", Groups.removeGroup('#characterFilterDiv', CharacterFilter.groupAreaRefresh));
    listen(queryEl("#characterFilterDiv .show-entity-button"), "click", CharacterFilter.loadFilterFromGroup);
    listen(queryEl("#characterFilterDiv .save-entity-button"), "click", CharacterFilter.saveFilterToGroup);
    
    CharacterFilter.content = getEl("characterFilterDiv");
};

CharacterFilter.groupAreaRefresh = function(){
    PermissionInformer.getGroupNamesArray(true, Utils.processError(function(names){
        Groups.rebuildInterface("#characterFilterDiv", names);
        var data = getSelect2Data(names);
        clearEl(queryEl("#characterFilterDiv .save-entity-select"));
        $("#characterFilterDiv .save-entity-select").select2(data);
    }));
};

CharacterFilter.refresh = function () {
    "use strict";
    CharacterFilter.sortKey = CHAR_NAME;
    CharacterFilter.sortDir = "asc";
    CharacterFilter.inputItems = {};
    
    var filterSettingsDiv = clearEl(getEl("filterSettingsDiv"));
    
    CharacterFilter.groupAreaRefresh();

    PermissionInformer.getCharacterNamesArray(false, function(err, names){
        if(err) {Utils.handleError(err); return;}
        DBMS.getAllProfiles(function(err, profiles){
            if(err) {Utils.handleError(err); return;}
            CharacterFilter.characterList = Object.keys(profiles);
            
            DBMS.getCharactersSummary(function(err, charactersSummary){
                if(err) {Utils.handleError(err); return;}
                
                DBMS.getAllProfileSettings(function(err, allProfileSettings){
                    if(err) {Utils.handleError(err); return;}
                    
                    CharacterFilter.filterConfiguration = new FilterConfiguration(allProfileSettings, names, profiles, charactersSummary);
                    
                    CharacterFilter.filterConfiguration.getAllProfileSettings().forEach(function (profileSettings) {
                        addEl(filterSettingsDiv, CharacterFilter.makeInput(profileSettings, CharacterFilter.inputItems));
                    });
                    
                    UI.fillShowItemSelector(clearEl(getEl('profileItemSelector')), 
                            CharacterFilter.filterConfiguration.getShowProfileItemNames());
    
                    addEl(clearEl(getEl('filterHead')), CharacterFilter.makeContentHeader(
                            CharacterFilter.filterConfiguration.getHeaderProfileItemNames()));
                    
                    CharacterFilter.rebuildContent();
                });
            });
        });
    });
};

CharacterFilter.rebuildContent = function () {
    "use strict";
    var filterContent = clearEl(getEl("filterContent"));

    var data = CharacterFilter.characterList.filter(CharacterFilter.acceptDataRow(CharacterFilter.makeFilterModel()));
    
    addEl(clearEl(getEl("filterResultSize")), makeText(data.length));
    
    var type = CharacterFilter.filterConfiguration.getProfileItemType(CharacterFilter.sortKey);
    addEls(filterContent, data.sort(CharacterFilter.sortDataRows(type)).map(CharacterFilter.makeDataString));
    UI.showSelectedEls("-dependent")({target:getEl('profileItemSelector')});
};

CharacterFilter.saveFilterToGroup = function(){
    var groupName = queryEl("#characterFilterDiv .save-entity-select").value.trim();
    DBMS.saveFilterToGroup(groupName, CharacterFilter.makeFilterModel(), Utils.processError());
};

CharacterFilter.loadFilterFromGroup = function(){
    var groupName = queryEl("#characterFilterDiv .save-entity-select").value.trim();
    DBMS.getGroup(groupName,  function(err, group){
        if(err) {Utils.handleError(err); return;}
        CharacterFilter.applyFilterModel(group.filterModel);
        CharacterFilter.rebuildContent();
    });
};

CharacterFilter.applyFilterModel = function(filterModel){
    var filterModel = filterModel.reduce(function(result, elem){
        result[elem.name] = elem; 
        return result;
    }, {});
    Object.keys(CharacterFilter.inputItems).forEach(function(inputItemName){
        if (inputItemName.endsWith(":numberInput")) {
            return;
        }
        
        var inputItem = CharacterFilter.inputItems[inputItemName];
        var selectedOptions, regex, num, i, counter;
        
        if(!filterModel[inputItemName]){
            switch (inputItem.selfInfo.type) {
            case "enum":
            case "checkbox":
                for (i = 0; i < inputItem.options.length; i +=1) {
                    inputItem.options[i].selected = true;
                }
                break;
            case "number":
                CharacterFilter.inputItems[inputItem.selfInfo.name + ":numberInput"].value = 0;
                inputItem.value = 'ignore';
                break;
            case "text":
            case "string":
                inputItem.value = '';
                break;
            }
        } else {
            var modelItem = filterModel[inputItemName];
            switch (inputItem.selfInfo.type) {
            case "enum":
                for (i = 0; i < inputItem.options.length; i +=1) {
                    inputItem.options[i].selected = modelItem.selectedOptions[inputItem.options[i].value] ? true : false;
                }
                break;
            case "checkbox":
                inputItem.options[0].selected = modelItem.selectedOptions["true"];
                inputItem.options[1].selected = modelItem.selectedOptions["false"];
                break;
            case "number":
                inputItem.value = modelItem.condition;
                CharacterFilter.inputItems[inputItem.selfInfo.name + ":numberInput"].value = modelItem.num;
                break;
            case "text":
            case "string":
                inputItem.value = modelItem.regexString;
                break;
            }
        }
    });
    
};

CharacterFilter.makeFilterModel = function(){
    var model = [];
    Object.keys(CharacterFilter.inputItems).forEach(function(inputItemName){
        if (inputItemName.endsWith(":numberInput")) {
            return;
        }
        var inputItem = CharacterFilter.inputItems[inputItemName];
        var selectedOptions, regex, num, i, counter;

        switch (inputItem.selfInfo.type) {
        case "enum":
            selectedOptions = {};
            counter = 0;
            for (i = 0; i < inputItem.options.length; i +=1) {
                if (inputItem.options[i].selected) {
                    selectedOptions[inputItem.options[i].value] = true;
                    counter++;
                }
            }
            if(inputItem.options.length == counter){
                return; // all selected, nothing to filter
            } else {
                model.push({type: 'enum',name: inputItemName,selectedOptions: selectedOptions});
            }
            break;
        case "checkbox":
            selectedOptions = {};
            if(inputItem.options[0].selected && inputItem.options[1].selected){
                return; // nothing to filter
            }
            if (inputItem.options[0].selected) {
                selectedOptions["true"] = true;
            }
            if (inputItem.options[1].selected) {
                selectedOptions["false"] = true;
            }
            model.push({type: 'checkbox',name: inputItemName,selectedOptions: selectedOptions});
            break;
        case "number":
            if(inputItem.value === 'ignore'){
                return; // nothing to filter
            }
            num = Number(CharacterFilter.inputItems[inputItem.selfInfo.name + ":numberInput"].value);
            model.push({type: 'number',name: inputItemName,num: num,condition: inputItem.value});
            break;
        case "text":
        case "string":
            if(inputItem.value == ''){
                return; // nothing to filter
            }
            model.push({type: inputItem.selfInfo.type,name: inputItemName,regexString: inputItem.value.toLowerCase()});
            break;
        }
    });
    return model;
};

CharacterFilter.acceptDataRow = R.curry(function (model, element) {
    "use strict";
    var result = true;
    var value, regex;
    model.forEach(function(filterItem){
        if (!result) {
            return;
        }
        value = CharacterFilter.filterConfiguration.getValue(element, filterItem.name);
        switch (filterItem.type) {
        case "enum":
        case "checkbox":
            if (!filterItem.selectedOptions[value]) {
                result = false;
            }
            break;
        case "number":
            switch (filterItem.condition) {
            case "greater":
                result = value > filterItem.num;
                break;
            case "equal":
                result = value === filterItem.num;
                break;
            case "lesser":
                result = value < filterItem.num;
                break;
            }
            break;
        case "text":
        case "string":
            regex = Utils.globStringToRegex(filterItem.regexString);
            result = value.toLowerCase().match(regex);
            break;
        }
    });
    return result;
});

CharacterFilter.sortDataRows = R.curry(function (type, a, b) {
    "use strict";
    a = CharacterFilter.filterConfiguration.getValue(a, CharacterFilter.sortKey);
    b = CharacterFilter.filterConfiguration.getValue(b, CharacterFilter.sortKey);

    switch (type) {
    case "text":
    case "string":
    case "enum":
        a = a.toLowerCase();
        b = b.toLowerCase();
        break;
    }
    if (a > b) {
        return CharacterFilter.sortDir === "asc" ? 1 : -1;
    }
    if (a < b) {
        return CharacterFilter.sortDir === "asc" ? -1 : 1;
    }
    return 0;
});

CharacterFilter.makeDataString = function (character) {
    "use strict";
    var tr = makeEl("tr");
    
    var profileSettings = CharacterFilter.filterConfiguration.getAllProfileSettings();

    var inputItems = CharacterFilter.inputItems;

    var td, regex, pos, value;
    profileSettings.forEach(function (profileItemInfo, i) {
        td = makeEl("td");
        value = CharacterFilter.filterConfiguration.getValue(character, profileItemInfo.name);
        if (profileItemInfo.type === "checkbox") {
            td.appendChild(makeText(constL10n(Constants[value])));
        } else if (profileItemInfo.type === "text" && profileItemInfo.name !== CHAR_NAME) {
            regex = Utils.globStringToRegex(inputItems[profileItemInfo.name].value);
            pos = value.search(regex);
            td.appendChild(makeText(value.substring(pos - 5, pos + 15)));
        } else {
            td.appendChild(makeText(value));
        }
        addClass(td, (i-1) +"-dependent");
        tr.appendChild(td);
    });

    return tr;
};

CharacterFilter.makeContentHeader = function (profileItemNames) {
    "use strict";
    var tr = makeEl("tr");

    var td;
    profileItemNames.forEach(function (elem, i) {
        td = makeEl("th");
        td.appendChild(makeText(elem.displayName));
        td.appendChild(makeEl("span"));
        td.info = elem.name;
        addClass(td, (i-1) +"-dependent");
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

CharacterFilter.makeInput = function (profileItemConfig, inputItems) {
    "use strict";
    var div = makeEl('div');
    div.appendChild(makeText(profileItemConfig.displayName));
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
        input.addEventListener("input", CharacterFilter.rebuildContent);

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
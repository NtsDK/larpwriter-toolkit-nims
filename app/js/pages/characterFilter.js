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
    
    listen(queryEl("#characterFilterDiv .create-entity-button"), "click", Groups.createGroup('#characterFilterDiv', CharacterFilter.groupAreaRefresh));
    listen(queryEl("#characterFilterDiv .rename-entity-button"), "click", Groups.renameGroup('#characterFilterDiv', CharacterFilter.groupAreaRefresh));
    listen(queryEl("#characterFilterDiv .remove-entity-button"), "click", Groups.removeGroup('#characterFilterDiv', CharacterFilter.groupAreaRefresh));
    listen(queryEl("#characterFilterDiv .show-entity-button"), "click", CharacterFilter.loadFilterFromGroup);
    listen(queryEl("#characterFilterDiv .save-entity-button"), "click", CharacterFilter.saveFilterToGroup);
    
    CharacterFilter.content = getEl("characterFilterDiv");
};

CharacterFilter.groupAreaRefresh = function(){
    PermissionInformer.getGroupNamesArray(true, Utils.processError(function(userGroupNames){
        PermissionInformer.getGroupNamesArray(false, Utils.processError(function(allGroupNames){
            Groups.rebuildInterface("#characterFilterDiv", userGroupNames);
            var data = getSelect2Data(allGroupNames);
            clearEl(queryEl("#characterFilterDiv .save-entity-select"));
            $("#characterFilterDiv .save-entity-select").select2(data);
        }));
    }));
};

CharacterFilter.refresh = function () {
    "use strict";
    CharacterFilter.sortKey = Constants.CHAR_NAME;
    CharacterFilter.sortDir = "asc";
    CharacterFilter.inputItems = {};
    CharacterFilter.checkboxes = {};
    
    var filterSettingsDiv = clearEl(queryEl("#characterFilterDiv .filter-settings-panel"));
    addEl(filterSettingsDiv, addClass(makeEl('div'), 'separator'));
    
    CharacterFilter.groupAreaRefresh();

    FilterConfiguration.makeFilterConfiguration(function(err, filterConfiguration){
        if(err) {Utils.handleError(err); return;}
                    
        CharacterFilter.filterConfiguration = filterConfiguration;
        
        var profileSettings = filterConfiguration.getAllProfileSettings();
        
        addEls(filterSettingsDiv, profileSettings.map(CharacterFilter.makeInput));
        
        UI.fillShowItemSelector(clearEl(getEl('profileItemSelector')), 
                CharacterFilter.getShowProfileItemNames(profileSettings));

        addEl(clearEl(getEl('filterHead')), CharacterFilter.makeContentHeader(
                CharacterFilter.getHeaderProfileItemNames(profileSettings)));
        
        CharacterFilter.rebuildContent();
    });
};

CharacterFilter.getShowProfileItemNames = function(profileSettings){
    return R.map(R.prop('displayName'), profileSettings.filter(R.prop('canHide')));
};

CharacterFilter.getHeaderProfileItemNames = function(profileSettings){
    return R.map(R.pick(['name', 'displayName']), profileSettings);
};

CharacterFilter.rebuildContent = function () {
    "use strict";
    var filterContent = clearEl(getEl("filterContent"));

    var dataArrays = CharacterFilter.filterConfiguration.getDataArrays(CharacterFilter.makeFilterModel());
    
    addEl(clearEl(getEl("filterResultSize")), makeText(dataArrays.length));
    
    var sortFunc = CommonUtils.charOrdAFactoryBase(CharacterFilter.sortDir, function(a){
        var map = CommonUtils.arr2map(a, 'itemName');
        var item = map[CharacterFilter.sortKey];
        var value = item.value;
        switch (item.type) {
        case "text":
        case "string":
        case "enum":
            value = value.toLowerCase();
            break;
        }
        return value;
    });
    addEls(filterContent, dataArrays.sort(sortFunc).map(CharacterFilter.makeDataString));
    UI.showSelectedEls("-dependent")({target:getEl('profileItemSelector')});
};

CharacterFilter.saveFilterToGroup = function(){
    var groupName = queryEl("#characterFilterDiv .save-entity-select").value.trim();
    PermissionInformer.isGroupEditable(groupName, function(err, isGroupEditable){
        if(err) {Utils.handleError(err); return;}
        if(!isGroupEditable){
            Utils.alert(strFormat(getL10n("groups-group-editing-forbidden"), [groupName]));
            return;
        }
        DBMS.saveFilterToGroup(groupName, CharacterFilter.makeFilterModel(), Utils.processError());
    });
};

CharacterFilter.loadFilterFromGroup = function(){
    var groupName = queryEl("#characterFilterDiv .save-entity-select").value.trim();
    DBMS.getGroup(groupName,  function(err, group){
        if(err) {Utils.handleError(err); return;}
        var conflictTypes = CommonUtils.isFilterModelCompatibleWithProfiles(
                CharacterFilter.filterConfiguration.getBaseProfileSettings(), group.filterModel);
        if(conflictTypes.length != 0){
            Utils.alert(strFormat(getL10n("groups-base-filter-is-incompatible-with-page-profiles"), [conflictTypes.join(',')]));
            return;
        }
        CharacterFilter.applyFilterModel(group.filterModel);
        CharacterFilter.rebuildContent();
    });
};

CharacterFilter.applyFilterModel = function(filterModel){
    var filterModel = CommonUtils.arr2map(filterModel, 'name'); 
    
    Object.keys(CharacterFilter.inputItems).forEach(function(inputItemName){
        if (inputItemName.endsWith(":numberInput")) {
            return;
        }
        
        var inputItem = CharacterFilter.inputItems[inputItemName];
        var selectedOptions, regex, num, i, counter;
        
        if(CharacterFilter.checkboxes[inputItemName].checked != (filterModel[inputItemName] != null)){
            CharacterFilter.checkboxes[inputItemName].click();
        };
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
        if(CharacterFilter.checkboxes[inputItemName].checked === false){
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

CharacterFilter.makeDataString = function (dataArray) {
    "use strict";
    var inputItems = CharacterFilter.inputItems;

    var td, regex, pos, value;
    return addEls(makeEl("tr"), dataArray.map(function (valueInfo, i) {
        value = valueInfo.value;
        if (valueInfo.type === "checkbox") {
            value = constL10n(Constants[value]);
        } else if (valueInfo.type === "text") {
            pos = value.toLowerCase().indexOf(inputItems[valueInfo.itemName].value.toLowerCase());
            value = value.substring(pos - 5, pos + 15);
        }
        td = addEl(makeEl("td"), makeText(value));
        addClass(td, (i-1) +"-dependent");
        return td;
    }));
};

CharacterFilter.makeContentHeader = function (profileItemNames) {
    "use strict";
    return addEls(makeEl("tr"), profileItemNames.map(function (elem, i) {
        var td = addEls(makeEl("th"), [makeText(elem.displayName), makeEl("span")]);
        td.info = elem.name;
        addClass(td, (i-1) +"-dependent");
        listen(td, "click", CharacterFilter.onSortChange);
        return td;
    }));
};

CharacterFilter.onSortChange = function (event) {
    "use strict";
    var target = event.target;
    if(target.tagName.toLowerCase() === "span"){
        target = target.parentElement;
    }
    
    if (CharacterFilter.sortKey === target.info) {
        CharacterFilter.sortDir = CharacterFilter.sortDir === "asc" ? "desc" : "asc";
        setClassByCondition(target, 'sortDesc', CharacterFilter.sortDir === 'desc');
        setClassByCondition(target, 'sortAsc', CharacterFilter.sortDir === 'asc');
    } else {
        var filterHead = getEl("filterHead");
        nl2array(filterHead.getElementsByClassName("sortAsc")).forEach(removeClass(R.__, "sortAsc"));
        nl2array(filterHead.getElementsByClassName("sortDesc")).forEach(removeClass(R.__, "sortDesc"));
        
        CharacterFilter.sortKey = target.info;
        CharacterFilter.sortDir = "asc";
        addClass(target, "sortAsc");
    }
    CharacterFilter.rebuildContent();
};

CharacterFilter.makeInput = function (profileItemConfig) {
    var div = makeEl('div');
    var span = makeEl('label');
    var checkbox = makeEl('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false;
    addEl(span, checkbox);
    addEl(span, makeText(profileItemConfig.displayName));
    var toggleContent = function(itemContainer, inputContainer){
        return function(event){
            setClassByCondition(inputContainer, 'hidden', !event.target.checked);
            setClassByCondition(itemContainer, 'flex-front-element', event.target.checked);
            CharacterFilter.rebuildContent();
        };
    };
    
    addEl(div, span);
    var inputContainer = makeEl('div');
    addClass(inputContainer, 'hidden');
    addEl(div, inputContainer);
    listen(checkbox, 'click', toggleContent(div, inputContainer));
    CharacterFilter.checkboxes[profileItemConfig.name] = checkbox;
    
    addEl(inputContainer, CharacterFilter.makeFilter(profileItemConfig));
    return div;
};

CharacterFilter.makeFilter = function(profileItemConfig){
    switch (profileItemConfig.type) {
    case "text":
    case "string":
        return CharacterFilter.makeTextFilter(profileItemConfig);
    case "enum":
        return CharacterFilter.makeEnumFilter(profileItemConfig);
    case "number":
        return CharacterFilter.makeNumberFilter(profileItemConfig);
    case "checkbox":
        return CharacterFilter.makeCheckboxFilter(profileItemConfig);
    }
};

CharacterFilter.makeTextFilter = function(profileItemConfig){
    var input = makeEl("input");
    input.selfInfo = profileItemConfig;
    input.value = "";
    input.addEventListener("input", CharacterFilter.rebuildContent);
    CharacterFilter.inputItems[profileItemConfig.name] = input;
    return input;
};

CharacterFilter.makeCommonEnumFilter = function(profileItemConfig, values){
    var selector = makeEl("select");
    selector.selfInfo = profileItemConfig;
    selector.multiple = "multiple";
    selector.size = values.length;

    values.forEach(function (value) {
        var option = makeEl("option");
        option.selected = true;
        option.value = value.name;
        option.appendChild(makeText(value.displayName));
        selector.appendChild(option);
    });
    selector.addEventListener("change", CharacterFilter.rebuildContent);
    CharacterFilter.inputItems[profileItemConfig.name] = selector;
    return selector;
};


CharacterFilter.makeEnumFilter = function(profileItemConfig){
    var values = profileItemConfig.value.split(",").map(function(value){
        return {
            name: value,
            displayName: value
        };
    });
    return CharacterFilter.makeCommonEnumFilter(profileItemConfig, values);
};

CharacterFilter.makeCheckboxFilter = function(profileItemConfig){
    var values = [ {
        name : Constants[true],
        displayName : constL10n(Constants[true])
    }, {
        name : Constants[false],
        displayName : constL10n(Constants[false])
    } ];
    return CharacterFilter.makeCommonEnumFilter(profileItemConfig, values);
};

CharacterFilter.makeNumberFilter = function(profileItemConfig){
    var selector = makeEl("select");
    selector.selfInfo = profileItemConfig;

    Constants.numberFilter.forEach(function (value) {
        var option = makeEl("option");
        option.appendChild(makeText(constL10n(value)));
        option.value = value;
        selector.appendChild(option);
    });
    selector.selectedIndex = 0;
    CharacterFilter.inputItems[profileItemConfig.name] = selector;
    selector.addEventListener("change", CharacterFilter.rebuildContent);

    var input = makeEl("input");
    input.value = 0;
    input.type = "number";
    CharacterFilter.inputItems[profileItemConfig.name + ":numberInput"] = input;
    input.addEventListener("input", CharacterFilter.rebuildContent);
    var div = makeEl('div');
    addEl(div, selector);
    addEl(div, input);
    return div;
};
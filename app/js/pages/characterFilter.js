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

(function(exports){
    
    var state = {};
    
    exports.init = function () {
        listen(getEl('profileItemSelector'), "change", UI.showSelectedEls("-dependent"));
        
        listen(queryEl("#characterFilterDiv .create-entity-button"), "click", Groups.createGroup('#characterFilterDiv', groupAreaRefresh));
        listen(queryEl("#characterFilterDiv .rename-entity-button"), "click", Groups.renameGroup('#characterFilterDiv', groupAreaRefresh));
        listen(queryEl("#characterFilterDiv .remove-entity-button"), "click", Groups.removeGroup('#characterFilterDiv', groupAreaRefresh));
        listen(queryEl("#characterFilterDiv .show-entity-button"), "click", loadFilterFromGroup);
        listen(queryEl("#characterFilterDiv .save-entity-button"), "click", saveFilterToGroup);
        listen(queryEl("#download-filter-table"), "click", downloadFilterTable);
        
        exports.content = getEl("characterFilterDiv");
    };
    
    var groupAreaRefresh = function(){
        PermissionInformer.getGroupNamesArray(true, Utils.processError(function(userGroupNames){
            PermissionInformer.getGroupNamesArray(false, Utils.processError(function(allGroupNames){
                Groups.rebuildInterface("#characterFilterDiv", userGroupNames);
                var data = getSelect2Data(allGroupNames);
                clearEl(queryEl("#characterFilterDiv .save-entity-select"));
                $("#characterFilterDiv .save-entity-select").select2(data);
            }));
        }));
    };
    
    exports.refresh = function () {
        state.sortKey = Constants.CHAR_NAME;
        state.sortDir = "asc";
        state.inputItems = {};
        state.checkboxes = {};
        
        var filterSettingsDiv = clearEl(queryEl("#characterFilterDiv .filter-settings-panel"));
        addEl(filterSettingsDiv, addClass(makeEl('div'), 'separator'));
        
        groupAreaRefresh();
    
        FilterConfiguration.makeFilterConfiguration(function(err, filterConfiguration){
            if(err) {Utils.handleError(err); return;}
                        
            state.filterConfiguration = filterConfiguration;
            
            var profileSettings = filterConfiguration.getAllProfileSettings();
            
            addEls(filterSettingsDiv, profileSettings.map(makeInput));
            
            UI.fillShowItemSelector(clearEl(getEl('profileItemSelector')), 
                    getShowProfileItemNames(profileSettings));
    
            addEl(clearEl(getEl('filterHead')), makeContentHeader(
                    getHeaderProfileItemNames(profileSettings)));
            
            rebuildContent();
        });
    };
    
    var getShowProfileItemNames = function(profileSettings){
        return R.map(R.prop('displayName'), profileSettings.filter(R.prop('canHide')));
    };
    
    var getHeaderProfileItemNames = function(profileSettings){
        return R.map(R.pick(['name', 'displayName']), profileSettings);
    };
    
    var makePrintData = function (){
        var dataArrays = state.filterConfiguration.getDataArrays(makeFilterModel());
        
        var sortFunc = CommonUtils.charOrdAFactoryBase(state.sortDir, function(a){
            var map = CommonUtils.arr2map(a, 'itemName');
            var item = map[state.sortKey];
            var value = item.value;
            switch (item.type) {
            case "text":
            case "string":
            case "enum":
                value = value.toLowerCase();
                break;
            case "checkbox":
            case "number":
                break;
            default:
                throw new Error('Unexpected type ' + item.type);
            }
            return value;
        });
        return dataArrays.sort(sortFunc);
    }
    
    var rebuildContent = function () {
        var dataArrays = makePrintData();
        addEl(clearEl(getEl("filterResultSize")), makeText(dataArrays.length));
        addEls(clearEl(getEl("filterContent")), dataArrays.map(makeDataString));
        UI.showSelectedEls("-dependent")({target:getEl('profileItemSelector')});
    };
    
    var saveFilterToGroup = function(){
        var groupName = queryEl("#characterFilterDiv .save-entity-select").value.trim();
        PermissionInformer.isGroupEditable(groupName, function(err, isGroupEditable){
            if(err) {Utils.handleError(err); return;}
            if(!isGroupEditable){
                Utils.alert(strFormat(getL10n("groups-group-editing-forbidden"), [groupName]));
                return;
            }
            DBMS.saveFilterToGroup(groupName, makeFilterModel(), Utils.processError());
        });
    };
    
    var loadFilterFromGroup = function(){
        var groupName = queryEl("#characterFilterDiv .save-entity-select").value.trim();
        DBMS.getGroup(groupName,  function(err, group){
            if(err) {Utils.handleError(err); return;}
            var conflictTypes = CommonUtils.isFilterModelCompatibleWithProfiles(
                    state.filterConfiguration.getBaseProfileSettings(), group.filterModel);
            if(conflictTypes.length != 0){
                Utils.alert(strFormat(getL10n("groups-base-filter-is-incompatible-with-page-profiles"), [conflictTypes.join(',')]));
                return;
            }
            applyFilterModel(group.filterModel);
            rebuildContent();
        });
    };
    
    var downloadFilterTable = function(){
        var el = getEl('profileItemSelector');
        var selected = [true];
        for (var i = 0; i < el.options.length; i += 1) {
            selected[i+1] = el.options[i].selected;
        }
        
        function preprocess(str){
            if(!(typeof str === 'string' || str instanceof String)){
                return str;
            }
            var result = str.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0){
                result = '"' + result + '"';
            }
            return result;
        }
        
        var dataArrays = makePrintData();
        var csv = "\ufeff" + dataArrays.map(function(dataArray){
            return dataArray.filter(function(item, index){
                return selected[index];
            }).map(R.pipe(R.prop('value'), preprocess)).join(';');
        }).join('\n');
        
        var out = new Blob([csv], {
            type : "text/csv;charset=utf-8;"
        });
        saveAs(out, "table.csv");
    };
    
    var applyFilterModel = function(filterModel){
        var filterModel = CommonUtils.arr2map(filterModel, 'name'); 
        
        Object.keys(state.inputItems).forEach(function(inputItemName){
            if (inputItemName.endsWith(":numberInput")) {
                return;
            }
            
            var inputItem = state.inputItems[inputItemName];
            var selectedOptions, regex, num, i, counter;
            
            if(state.checkboxes[inputItemName].checked != (filterModel[inputItemName] != null)){
                state.checkboxes[inputItemName].click();
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
                    state.inputItems[inputItem.selfInfo.name + ":numberInput"].value = 0;
                    inputItem.value = 'ignore';
                    break;
                case "text":
                case "string":
                    inputItem.value = '';
                    break;
                default:
                    throw new Error('Unexpected type ' + inputItem.selfInfo.type);
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
                    state.inputItems[inputItem.selfInfo.name + ":numberInput"].value = modelItem.num;
                    break;
                case "text":
                case "string":
                    inputItem.value = modelItem.regexString;
                    break;
                default:
                    throw new Error('Unexpected type ' + inputItem.selfInfo.type);
                }
            }
        });
        
    };
    
    var makeFilterModel = function(){
        var model = [];
        Object.keys(state.inputItems).forEach(function(inputItemName){
            if (inputItemName.endsWith(":numberInput")) {
                return;
            }
            if(state.checkboxes[inputItemName].checked === false){
                return;
            }
            var inputItem = state.inputItems[inputItemName];
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
                num = Number(state.inputItems[inputItem.selfInfo.name + ":numberInput"].value);
                model.push({type: 'number',name: inputItemName,num: num,condition: inputItem.value});
                break;
            case "text":
            case "string":
                if(inputItem.value == ''){
                    return; // nothing to filter
                }
                model.push({type: inputItem.selfInfo.type,name: inputItemName,regexString: inputItem.value.toLowerCase()});
                break;
            default:
                throw new Error('Unexpected type ' + inputItem.selfInfo.type);
            }
        });
        return model;
    };
    
    var makeDataString = function (dataArray) {
        var inputItems = state.inputItems;
    
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
    
    var makeContentHeader = function (profileItemNames) {
        return addEls(makeEl("tr"), profileItemNames.map(function (elem, i) {
            var td = addEls(makeEl("th"), [makeText(elem.displayName), makeEl("span")]);
            td.info = elem.name;
            addClass(td, (i-1) +"-dependent");
            listen(td, "click", onSortChange);
            return td;
        }));
    };
    
    var onSortChange = function (event) {
        var target = event.target;
        if(target.tagName.toLowerCase() === "span"){
            target = target.parentElement;
        }
        
        if (state.sortKey === target.info) {
            state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
            setClassByCondition(target, 'sortDesc', state.sortDir === 'desc');
            setClassByCondition(target, 'sortAsc', state.sortDir === 'asc');
        } else {
            var filterHead = getEl("filterHead");
            nl2array(filterHead.getElementsByClassName("sortAsc")).forEach(removeClass(R.__, "sortAsc"));
            nl2array(filterHead.getElementsByClassName("sortDesc")).forEach(removeClass(R.__, "sortDesc"));
            
            state.sortKey = target.info;
            state.sortDir = "asc";
            addClass(target, "sortAsc");
        }
        rebuildContent();
    };
    
    var makeInput = function (profileItemConfig) {
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
                rebuildContent();
            };
        };
        
        addEl(div, span);
        var inputContainer = makeEl('div');
        addClass(inputContainer, 'hidden');
        addEl(div, inputContainer);
        listen(checkbox, 'click', toggleContent(div, inputContainer));
        state.checkboxes[profileItemConfig.name] = checkbox;
        
        addEl(inputContainer, makeFilter(profileItemConfig));
        return div;
    };
    
    var makeFilter = function(profileItemConfig){
        switch (profileItemConfig.type) {
        case "text":
        case "string":
            return makeTextFilter(profileItemConfig);
        case "enum":
            return makeEnumFilter(profileItemConfig);
        case "number":
            return makeNumberFilter(profileItemConfig);
        case "checkbox":
            return makeCheckboxFilter(profileItemConfig);
        default:
            throw new Error('Unexpected type ' + profileItemConfig.type);
        }
    };
    
    var makeTextFilter = function(profileItemConfig){
        var input = makeEl("input");
        input.selfInfo = profileItemConfig;
        input.value = "";
        input.addEventListener("input", rebuildContent);
        state.inputItems[profileItemConfig.name] = input;
        return input;
    };
    
    var makeCommonEnumFilter = function(profileItemConfig, values){
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
        selector.addEventListener("change", rebuildContent);
        state.inputItems[profileItemConfig.name] = selector;
        return selector;
    };
    
    
    var makeEnumFilter = function(profileItemConfig){
        var values = profileItemConfig.value.split(",").map(function(value){
            return {
                name: value,
                displayName: value
            };
        });
        return makeCommonEnumFilter(profileItemConfig, values);
    };
    
    var makeCheckboxFilter = function(profileItemConfig){
        var values = [ {
            name : Constants[true],
            displayName : constL10n(Constants[true])
        }, {
            name : Constants[false],
            displayName : constL10n(Constants[false])
        } ];
        return makeCommonEnumFilter(profileItemConfig, values);
    };
    
    var makeNumberFilter = function(profileItemConfig){
        var selector = makeEl("select");
        selector.selfInfo = profileItemConfig;
    
        Constants.numberFilter.forEach(function (value) {
            var option = makeEl("option");
            option.appendChild(makeText(constL10n(value)));
            option.value = value;
            selector.appendChild(option);
        });
        selector.selectedIndex = 0;
        state.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", rebuildContent);
    
        var input = makeEl("input");
        input.value = 0;
        input.type = "number";
        state.inputItems[profileItemConfig.name + ":numberInput"] = input;
        input.addEventListener("input", rebuildContent);
        var div = makeEl('div');
        addEl(div, selector);
        addEl(div, input);
        return div;
    };

})(this['CharacterFilter']={});
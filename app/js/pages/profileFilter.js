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
    const root = '.profile-filter-tab ';
    
    exports.init = function () {
        listen(queryEl(root + '.profile-item-selector'), "change", UI.showSelectedEls("-dependent"));
        
        listen(queryEl(root + ".create-entity-button"), "click", Groups.createGroup(root, groupAreaRefresh));
        listen(queryEl(root + ".rename-entity-button"), "click", Groups.renameGroup(root, groupAreaRefresh));
        listen(queryEl(root + ".remove-entity-button"), "click", Groups.removeGroup(root, groupAreaRefresh));
        listen(queryEl(root + ".show-entity-button"), "click", loadFilterFromGroup);
        listen(queryEl(root + ".save-entity-button"), "click", saveFilterToGroup);
        listen(queryEl(root + ".download-filter-table"), "click", downloadFilterTable);
        
        exports.content = queryEl(root);
    };
    
    var groupAreaRefresh = function(){
        PermissionInformer.getEntityNamesArray('group', true, Utils.processError(function(userGroupNames){
            PermissionInformer.getEntityNamesArray('group', false, Utils.processError(function(allGroupNames){
                Groups.rebuildInterface(root, userGroupNames);
                var data = getSelect2Data(allGroupNames);
                clearEl(queryEl(root +".save-entity-select"));
                $(root + ".save-entity-select").select2(data);
            }));
        }));
    };
    
    exports.refresh = function () {
        state.sortKey = Constants.CHAR_NAME;
        state.sortDir = "asc";
        state.inputItems = {};
        state.checkboxes = {};
        
        var filterSettingsDiv = clearEl(queryEl(root + ".filter-settings-panel"));
        addEl(filterSettingsDiv, addClass(makeEl('div'), 'separator'));
        
        groupAreaRefresh();
    
        FilterConfiguration.makeFilterConfiguration(function(err, filterConfiguration){
            if(err) {Utils.handleError(err); return;}
                        
            state.filterConfiguration = filterConfiguration;
            
            let groupedProfileFilterItems = filterConfiguration.getGroupedProfileFilterItems();
            addEls(filterSettingsDiv, R.flatten(groupedProfileFilterItems.map(item => {
                return R.concat(item.profileFilterItems.map(makeInput), [addClass(makeEl('div'), 'filterSeparator')]);
            })));
            
            UI.fillShowItemSelector2(clearEl(queryEl(root + '.profile-item-selector')), 
                    getShowProfileItemNames(filterConfiguration.getGroupedProfileFilterItems()));
    
            addEl(clearEl(queryEl(root + '.filter-head')), makeContentHeader(
                    getHeaderProfileItemNames(filterConfiguration.getProfileFilterItems())));
            
            rebuildContent();
        });
    };
    
    var getShowProfileItemNames = function(groups){
        return groups.map(function(group){
            let data = group.profileFilterItems.map(function(item){
                return {
                    name: item.displayName,
                    hidden: !item.canHide
                };
            });
            return {
                name: getL10n('profile-filter-'+group.name),
                array: data
            };
        });
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
            if(value === undefined) return value;
            switch (item.type) {
            case "text":
            case "string":
            case "enum":
            case "multiEnum":
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
        addEl(clearEl(queryEl(root + ".filter-result-size")), makeText(dataArrays.length));
        addEls(clearEl(queryEl(root + ".filter-content")), dataArrays.map(makeDataString));
        UI.showSelectedEls("-dependent")({target:queryEl(root + '.profile-item-selector')});
    };
    
    var saveFilterToGroup = function(){
        var groupName = queryEl(root + ".save-entity-select").value.trim();
        PermissionInformer.isEntityEditable('group', groupName, function(err, isGroupEditable){
            if(err) {Utils.handleError(err); return;}
            if(!isGroupEditable){
                Utils.alert(strFormat(getL10n("groups-group-editing-forbidden"), [groupName]));
                return;
            }
            DBMS.saveFilterToGroup(groupName, makeFilterModel(), Utils.processError());
        });
    };
    
    var loadFilterFromGroup = function(){
        var groupName = queryEl(root + ".save-entity-select").value.trim();
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
        var el = queryEl(root + '.profile-item-selector');
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
            if (inputItemName.endsWith(":numberInput") || inputItemName.endsWith(":multiEnumInput")) {
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
                case "multiEnum":
                    var select = state.inputItems[inputItem.selfInfo.name + ":multiEnumInput"];
                    for (i = 0; i < select.options.length; i +=1) {
                        select.options[i].selected = true;
                    }
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
                case "multiEnum":
                    inputItem.value = modelItem.condition;
                    var select = state.inputItems[inputItem.selfInfo.name + ":multiEnumInput"];
                    for (i = 0; i < select.options.length; i +=1) {
                        select.options[i].selected = modelItem.selectedOptions[select.options[i].value] ? true : false;
                    }
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
            if (inputItemName.endsWith(":numberInput") || inputItemName.endsWith(":multiEnumInput")) {
                return;
            }
            if(state.checkboxes[inputItemName].checked === false){
                return;
            }
            var inputItem = state.inputItems[inputItemName];
            var selectedOptions, regex, num, i, arr;
            var type = inputItem.selfInfo.type;
    
            switch (type) {
            case "enum":
                arr = nl2array(inputItem.selectedOptions).map(R.prop('value'));
                model.push({type: type, name: inputItemName, selectedOptions: R.zipObj(arr, R.repeat(true, arr.length))});
                break;
            case "checkbox":
                selectedOptions = {};
                if (inputItem.options[0].selected) {selectedOptions["true"] = true;}
                if (inputItem.options[1].selected) {selectedOptions["false"] = true;}
                model.push({type: type, name: inputItemName, selectedOptions: selectedOptions});
                break;
            case "number":
                if(inputItem.value === 'ignore'){return;}
                num = Number(state.inputItems[inputItem.selfInfo.name + ":numberInput"].value);
                model.push({type: type, name: inputItemName, num: num, condition: inputItem.value});
                break;
            case "multiEnum":
                if(inputItem.value === 'ignore'){return;}
                selectedOptions = {};
                var select2 = state.inputItems[inputItem.selfInfo.name + ":multiEnumInput"];
                arr = nl2array(select2.selectedOptions).map(R.prop('value'));
                model.push({type: type, name: inputItemName, condition: inputItem.value, selectedOptions: R.zipObj(arr, R.repeat(true, arr.length))});
                break;
            case "text":
            case "string":
                model.push({type: type, name: inputItemName, regexString: inputItem.value.toLowerCase()});
                break;
            default:
                throw new Error('Unexpected type ' + type);
            }
        });
        return model;
    };
    
    var makeDataString = function (dataArray) {
        var inputItems = state.inputItems;
    
        var td, regex, pos, value, displayValue;
        return addEls(makeEl("tr"), dataArray.map(function (valueInfo, i) {
            value = valueInfo.value;
            if(value === undefined){
                displayValue = constL10n('notAvailable');
            } else if (valueInfo.type === "checkbox") {
                displayValue = constL10n(Constants[value]);
            } else if (valueInfo.type === "text") {
                pos = value.toLowerCase().indexOf(inputItems[valueInfo.itemName].value.toLowerCase());
                displayValue = value.substring(pos - 5, pos + 15);
            } else if(R.contains(valueInfo.type, ['number', 'enum', 'multiEnum', 'string'])){
                displayValue = value;
            } else {
                throw new Error('Unexpected valueInfo.type: ' + valueInfo.type);
            }
            td = addEl(setClassByCondition(makeEl("td"), 'lightGrey', value === undefined), makeText(displayValue));
            addClass(td, i +"-dependent");
            return td;
        }));
    };
    
    var makeContentHeader = function (profileItemNames) {
        return addEls(makeEl("tr"), profileItemNames.map(function (elem, i) {
            var td = addEls(makeEl("th"), [makeText(elem.displayName), makeEl("span")]);
            td.info = elem.name;
            addClass(td, i +"-dependent");
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
            var filterHead = queryEl(root + ".filter-head");
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
        case "multiEnum":
            return makeMultiEnumFilter(profileItemConfig);
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
    
        fillSelector(selector, values.map(function(value){
            value.selected = true;
            return value;
        }));
        selector.addEventListener("change", rebuildContent);
        state.inputItems[profileItemConfig.name] = selector;
        return selector;
    };
    
    var makeEnumFilter = function(profileItemConfig){
        var values = arr2Select(profileItemConfig.value.split(","));
        return makeCommonEnumFilter(profileItemConfig, values);
    };
    
    var makeCheckboxFilter = function(profileItemConfig){
        var values = [ {
            value : Constants[true],
            name : constL10n(Constants[true])
        }, {
            value : Constants[false],
            name : constL10n(Constants[false])
        } ];
        return makeCommonEnumFilter(profileItemConfig, values);
    };
    
    var makeMultiEnumFilter = function(profileItemConfig){
        var selector = makeEl("select");
        selector.selfInfo = profileItemConfig;
    
        Constants.multiEnumFilter.forEach(function (value) {
            var option = makeEl("option");
            option.appendChild(makeText(constL10n(value)));
            option.value = value;
            selector.appendChild(option);
        });
        selector.selectedIndex = 0;
        state.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener("change", rebuildContent);
        
        var selector2 = makeEl("select");
        var values = arr2Select(profileItemConfig.value.split(","));
        fillSelector(selector2, values.map(function(value){
            value.selected = true;
            return value;
        }));
        selector2.multiple = "multiple";
        selector2.size = values.length;
        
        state.inputItems[profileItemConfig.name + ":multiEnumInput"] = selector2;
        selector2.addEventListener("change", rebuildContent);
        return addEls(makeEl('div'), [selector, makeEl('br'), selector2]);
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
        return addEls(makeEl('div'), [selector, input]);
    };

})(this['ProfileFilter']={});
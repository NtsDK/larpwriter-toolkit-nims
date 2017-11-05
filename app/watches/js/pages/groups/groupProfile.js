/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
        listen(queryEl(".group-profile-tab .entity-selector"), "change", showProfileInfoDelegate);
        
        var tbody = clearEl(queryEl(".group-profile-tab .entity-profile"));
        
        state.inputItems = {};
        
        Constants.groupProfileStructure.forEach(function (profileSettings) {
            profileSettings.displayName = getL10n("groups-" + profileSettings.name);
            addEl(tbody, makeInput(profileSettings));
        });
        
        exports.content = queryEl(".group-profile-tab");
    };
    
    exports.refresh = function () {
        PermissionInformer.getEntityNamesArray('group', false, function(err, groupNames){
            if(err) {Utils.handleError(err); return;}
            
            var sel = clearEl(queryEl(".group-profile-tab .entity-selector"));
            fillSelector(sel, groupNames.map(remapProps4Select));
            
            applySettings(groupNames, sel);
        });
    };
    
    var applySettings = function (names, selector) {
        if (names.length > 0) {
            var name = names[0].value;
            var settings = DBMS.getSettings();
            if(!settings["GroupProfile"]){
                settings["GroupProfile"] = {
                    groupName : name
                };
            }
            var groupName = settings["GroupProfile"].groupName;
            if(names.map(function(nameInfo){return nameInfo.value;}).indexOf(groupName) === -1){
                settings["GroupProfile"].groupName = name;
                groupName = name;
            }
            DBMS.getGroup(groupName, showProfileInfoCallback);
            selector.value = groupName;
        }
    };
    
    var makeInput = function (profileItemConfig) {
        var span = setAttr(makeEl('span'), "l10n-id", "groups-" + profileItemConfig.name);
        var tr = addEl(makeEl("tr"), addEl(makeEl('td'), addEl(span, makeText(profileItemConfig.displayName))))
        var input;
        switch (profileItemConfig.type) {
        case "text":
            input = makeEl("textarea");
            addClass(input, "profileTextInput");
            input.addEventListener("change", updateFieldValue(profileItemConfig.type));
            break;
        case "checkbox":
            input = makeEl("input");
            input.type = "checkbox";
            input.addEventListener("change", updateFieldValue(profileItemConfig.type));
            break;
        case "container":
            input = makeEl("div");
            input.type = "container";
            break;
        default:
            throw new Error('Unexpected type ' + profileItemConfig.type);
        }
        input.selfName = profileItemConfig.name;
        addClass(input,"isGroupEditable");
        state.inputItems[profileItemConfig.name] = input;
    
        return addEl(tr, addEl(makeEl('td'), input));
    };
    
    var updateFieldValue = function(type){
        return function(event){
            var fieldName = event.target.selfName;
            var groupName = state.name;
            
            var value;
            switch(type){
            case "text":
                value = event.target.value;
                break;
            case "checkbox":
                value = event.target.checked;
                break;
            default:
                throw new Error('Unexpected type ' + type);
            }
            DBMS.updateGroupField(groupName, fieldName, value, Utils.processError());
        }
    };
    
    var showProfileInfoDelegate = function (event) {
        var name = event.target.value.trim();
        DBMS.getGroup(name, showProfileInfoCallback);
    };
    
    var showProfileInfoCallback = function (err, group) {
        if(err) {Utils.handleError(err); return;}
        var name = group.name;
        FilterConfiguration.makeFilterConfiguration(function(err, filterConfiguration){
            if(err) {Utils.handleError(err); return;}
    
            PermissionInformer.isEntityEditable('group', name, function(err, isGroupEditable){
                if(err) {Utils.handleError(err); return;}
                updateSettings(name);
                
                state.name = name;
                var inputItems = state.inputItems;
                Object.keys(inputItems).forEach(function (inputName) {
                    if (inputItems[inputName].type === "checkbox") {
                        inputItems[inputName].checked = group[inputName];
                    } else if (inputItems[inputName].type === "container") {
                        if(inputName === 'filterModel'){
                            var table = addClass(makeEl('table'), 'table');
                            var tbody = addEls(makeEl('tbody'), group.filterModel.map(makeFilterItemString(filterConfiguration)));
                            addEl(clearEl(inputItems[inputName]), addEl(table, tbody));
                        } else if(inputName === 'characterList'){
                            var data = filterConfiguration.getProfileIds(group.filterModel);
                            var inputItem = clearEl(inputItems[inputName]);
                            addEls(inputItem, [makeText(data.join(', ')), makeEl('br'), makeText(getL10n('groups-total') + data.length)]);
                        } else {
                            throw new Error('Unexpected container: ' + inputName);
                        }
                    } else if (inputItems[inputName].type === "textarea") {
                        inputItems[inputName].value = group[inputName];
                    } else {
                        throw new Error('Unexpected input type: ' + inputItems[inputName].type);
                    }
                    inputItems[inputName].oldValue = group[inputName];
                    Utils.enable(exports.content, "isGroupEditable", isGroupEditable);
                });
            });
        });
    };
    
    var getHeaderDisplayName = function(filterConfiguration, name){
        return CommonUtils.arr2map(filterConfiguration.getProfileFilterItems(), 'name')[name].displayName;
    };
    
    var makeFilterItemString = R.curry(function(filterConfiguration, filterItem){
        var displayName = getHeaderDisplayName(filterConfiguration, filterItem.name);
        var condition;
        switch(filterItem.type){
        case "enum":
            condition = strFormat("{0}",[Object.keys(filterItem.selectedOptions).join(', ')]);
            break;
        case "checkbox":
            var arr = [];
            if(filterItem.selectedOptions["true"]){arr.push(getL10n('constant-yes'));}
            if(filterItem.selectedOptions["false"]){arr.push(getL10n('constant-no'));}
            condition = strFormat("{0}",[arr.join(', ')]);
            break;
        case "number":
            condition = strFormat("{0} {1}", [getL10n('constant-' + filterItem.condition), filterItem.num]); 
            break;
        case "multiEnum":
            condition = strFormat("{0}: {1}", [getL10n('constant-' + filterItem.condition), Object.keys(filterItem.selectedOptions).join(', ')]); 
            break;
        case "text":
        case "string":
            condition = strFormat(getL10n("groups-text-contains"), [filterItem.regexString]);
            break;
        default:
            throw new Error('Unexpected type ' + filterItem.type);
        }
        var td1 = addEl(makeEl('td'), makeText(displayName));
        var td2 = addEl(makeEl('td'), makeText(condition));
        return addEls(makeEl('tr'), [td1, td2]);
    });
    
    var updateSettings = function (name) {
        var settings = DBMS.getSettings();
        settings["GroupProfile"].groupName = name;
    };

})(this['GroupProfile']={});
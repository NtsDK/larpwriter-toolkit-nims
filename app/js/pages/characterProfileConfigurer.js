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


// Character profile already ha field 'name'
// I had some choices:
// 1. remove this field at all
// 2. Add one more object to divide special values (name) and user defined values
// 3. Prohibit to make field - name
// 1. This field is used in many places
// 2. - too complex way
// 3. simple and lesser complexity, I choose this way

(function(exports){
    
    var root = ".character-profile-configurer-tab ";

    exports.init = function () {
        var sel = clearEl(queryEl(root+".create-entity-type-select"));
        var fillMainSel = function(){
            fillSelector(clearEl(sel));
        };
        fillMainSel();
        L10n.onL10nChange(fillMainSel);
    
        listen(queryEl(root+".create-entity-button"), "click", createProfileItem);
        listen(queryEl(root+".move-entity-button"), "click", moveProfileItem);
        listen(queryEl(root+".remove-entity-button"), "click", removeProfileItem);
    
        exports.content = queryEl(root);
    };
    
    exports.refresh = function () {
        var positionSelectors = [];
        
        positionSelectors.push(queryEl(root+".create-entity-position-select"));
        positionSelectors.push(queryEl(root+".move-entity-position-select"));
    
        DBMS.getAllProfileSettings(function(err, allProfileSettings){
            if(err) {Utils.handleError(err); return;}
            
            var option;
            positionSelectors.forEach(function(sel){
                clearEl(sel);
                
                var addOpt = function(text){
                    addEl(sel, addEl(makeEl('option'), makeText(text)));
                };
                
                allProfileSettings.forEach(function (elem) {
                    addOpt(strFormat(getL10n("common-set-item-before"), [elem.name]));
                });
                
                addOpt(getL10n("common-set-item-as-last"));
                
                sel.selectedIndex = allProfileSettings.length;
            });
            
            
            var table = clearEl(queryEl(root+".profile-config-container"));
            
            allProfileSettings.forEach(function (profileSettings, i) {
                addEl(table, getInput(profileSettings, i + 1));
            });
            
            PermissionInformer.isAdmin(function(err, isAdmin){
                if(err) {Utils.handleError(err); return;}
                Utils.enable(exports.content, "adminOnly", isAdmin);
            });
            
            var selectorArr = [];
            
            selectorArr.push(queryEl(root+".move-entity-select"));
            selectorArr.push(queryEl(root+".remove-entity-select"));
            
            selectorArr.forEach(function (selector) {
                clearEl(selector);
                allProfileSettings.forEach(function (elem, i) {
                    option = makeEl("option");
                    option.appendChild(makeText(elem.name));
                    option.profileItemIndex = i;
                    selector.appendChild(option);
                });
            });
        });
    };
    
    var createProfileItem = function () {
        var name = queryEl(root+".create-entity-input").value.trim();
    
        validateProfileItemName(name, function(){
            var type = queryEl(root+".create-entity-type-select").value.trim();
            
            if (!Constants.profileFieldTypes[type]) {
                Utils.alert(strFormat(getL10n("characters-unknown-profile-item-type"), [type]));
                return;
            }
            var value = Constants.profileFieldTypes[type].value;
            
            var positionSelector = queryEl(root+".create-entity-position-select");
            
            var position = positionSelector.value;
            
            DBMS.createProfileItem(name, type, value, position === getL10n("common-set-item-as-last"), 
                    positionSelector.selectedIndex, Utils.processError(exports.refresh));
        });
    };
    
    var moveProfileItem = function () {
        var index = queryEl(root+".move-entity-select").selectedOptions[0].profileItemIndex;
        var newIndex = queryEl(root+".move-entity-position-select").selectedIndex;
        
        if (index === newIndex) {
          Utils.alert(getL10n("characters-profile-item-positions-are-equal"));
          return;
        }
        
        DBMS.moveProfileItem(index, newIndex, Utils.processError(exports.refresh));
    };
    
    var removeProfileItem = function () {
        var selector = queryEl(root+".remove-entity-select");
        var index = selector.selectedIndex;
        var name = selector.value;
    
        if (Utils.confirm(strFormat(getL10n("characters-are-you-sure-about-removing-profile-item"), [name]))) {
            DBMS.removeProfileItem(index, name, Utils.processError(exports.refresh));
        }
    };
    
    var fillSelector = function (sel) {
        var makeOption = function(value, displayName){
            return setProp(addEl(makeEl("option"), makeText(displayName)),'value', value);
        };
        R.values(Constants.profileFieldTypes).forEach(function (value) {
            addEl(sel, makeOption(value.name, constL10n(value.name)))
        });
    };
    
    var getInput = function (profileSettings, index) {
        var tr = makeEl("tr");
        
        var addColumn = R.compose(addEl(tr), function(el){
            return addEl(makeEl("td"), el);
        });
        addColumn(addEl(makeEl("span"),makeText(index)));
    
        var input = setProps(makeEl("input"), {
            value: profileSettings.name,
            info: profileSettings.name
        });
        listen(input, "change", renameProfileItem);
        addClass(input,"itemNameInput");
        addClass(input, "adminOnly");
        addColumn(input);
    
        var sel = makeEl("select"); 
        fillSelector(sel);
        setProps(sel, {
            value: profileSettings.type,
            info: profileSettings.name,
            oldType: profileSettings.type
        });
        listen(sel, "change", changeProfileItemType);
        addClass(sel, "adminOnly");
        addColumn(sel);
    
        var isTextarea = profileSettings.type == "text" || profileSettings.type == "enum" || profileSettings.type == "multiEnum";
        input = isTextarea ? makeEl("textarea") : makeEl("input");
        setProps(input, {
            info: profileSettings.name,
            infoType: profileSettings.type,
            oldValue: profileSettings.value
        });
        addClass(input, "adminOnly");
        addClass(input, "profile-configurer-" + profileSettings.type);
    
        switch (profileSettings.type) {
        case "text":
        case "string":
        case "enum":
        case "multiEnum":
            input.value = profileSettings.value;
            break;
        case "number":
            input.type = "number";
            input.value = profileSettings.value;
            break;
        case "checkbox":
            input.type = "checkbox";
            input.checked = profileSettings.value;
            break;
        }
    
        listen(input, "change", updateDefaultValue);
        addColumn(input);
        
        var input = setProps(makeEl("input"), {
            checked: profileSettings.doExport,
            info: profileSettings.name,
            type: "checkbox"
        });
        listen(input, "change", doExportChange);
        addClass(input, "adminOnly");
        addColumn(input);
        
        return tr;
    };
    
    var updateDefaultValue = function (event) {
        var name = event.target.info;
        var type = event.target.infoType;
        var oldValue = event.target.oldValue;
        
        var value = type === 'checkbox' ? event.target.checked : event.target.value;
        
        var newOptions, missedValues, newValue;
        
        switch (type) {
        case "text":
        case "string":
        case "checkbox":
            DBMS.updateDefaultValue(name, value, Utils.processError());
            break;
        case "number":
            if (isNaN(value)) {
                Utils.alert(getL10n("characters-not-a-number"));
                event.target.value = oldValue;
                return;
            }
            DBMS.updateDefaultValue(name, Number(value), Utils.processError());
            break;
        case "multiEnum":
        case "enum":
            if (value === "" && type === "enum") {
                Utils.alert(getL10n("characters-enum-item-cant-be-empty"));
                event.target.value = oldValue;
                return;
            }
            newOptions = value.split(",").map(R.trim);
            missedValues = oldValue.trim() === '' ? [] : R.difference(oldValue.split(","), newOptions);
            
            var updateEnum = function(){
                newValue = newOptions.join(",");
                event.target.value = newValue;
                event.target.oldValue = newValue;
                DBMS.updateDefaultValue(name, newValue, Utils.processError());
            };
            
            if (missedValues.length !== 0) {
                if (Utils.confirm(strFormat(getL10n("characters-new-enum-values-remove-some-old-values"),[missedValues.join(",")]))) {
                    updateEnum();
                } else {
                    event.target.value = oldValue;
                }
            } else {
                updateEnum();
            }
            break;
        }
    };
    
    var doExportChange = function (event) {
        DBMS.doExportProfileItemChange(event.target.info, event.target.checked, Utils.processError());
    };
    
    var renameProfileItem = function (event) {
        var newName = event.target.value.trim();
        var oldName = event.target.info;
    
        validateProfileItemName(newName, function(){
            DBMS.renameProfileItem(newName, oldName, Utils.processError(exports.refresh));
        }, function(){
            event.target.value = event.target.info;
        });
    };
    
    var validateProfileItemName = function (name, success, failure) {
        if (name === "") {
            Utils.alert(getL10n("characters-profile-item-name-is-not-specified"));
            if(failure) failure();
            return;
        }
        
        if (name === "name") {
            Utils.alert(getL10n("characters-profile-item-name-cant-be-name"));
            if(failure) failure();
            return;
        }
        
        var tmpFailure = function(){
            Utils.alert(getL10n("characters-such-name-already-used"));
            if(failure) failure();
        };
        
        DBMS.isProfileItemNameUsed(name, function(err, isUsed){
            if(err) {Utils.handleError(err); return;}
            if(isUsed){
                tmpFailure();
            } else {
                success();
            }
        });
    };
    
    var changeProfileItemType = function (event) {
        if (Utils.confirm(strFormat(getL10n("characters-are-you-sure-about-changing-profile-item-type"), [event.target.info]))) {
            
            var newType = event.target.value;
            var name = event.target.info;
            
            DBMS.changeProfileItemType(name, newType, Utils.processError(exports.refresh));
            
        } else {
            event.target.value = event.target.oldType;
        }
    };

})(this['CharacterProfileConfigurer']={});
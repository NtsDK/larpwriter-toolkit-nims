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

var CharacterProfileConfigurer = {};

CharacterProfileConfigurer.init = function () {
    'use strict';

    var sel = clearEl(getEl("profileItemTypeSelector"));
    var fillMainSel = function(){
        CharacterProfileConfigurer.fillSelector(clearEl(sel));
    };
    fillMainSel();
    L10n.onL10nChange(fillMainSel);

    listen(getEl("createProfileItemButton"), "click", CharacterProfileConfigurer.createProfileItem);
    listen(getEl("moveProfileItemButton"), "click", CharacterProfileConfigurer.moveProfileItem);
    listen(getEl("removeProfileItemButton"), "click", CharacterProfileConfigurer.removeProfileItem);

    CharacterProfileConfigurer.content = getEl("characterProfileConfigurer");
};

CharacterProfileConfigurer.refresh = function () {
    'use strict';
    
    var positionSelectors = [];
    
    positionSelectors.push(getEl("profileItemPositionSelector"));
    positionSelectors.push(getEl("moveProfileItemPositionSelector"));

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
        
        
        var table = clearEl(getEl("profileConfigBlock"));
        
        allProfileSettings.forEach(function (profileSettings, i) {
            addEl(table, CharacterProfileConfigurer.getInput(profileSettings, i + 1));
        });
        
        PermissionInformer.isAdmin(function(err, isAdmin){
            if(err) {Utils.handleError(err); return;}
            Utils.enable(CharacterProfileConfigurer.content, "adminOnly", isAdmin);
        });
        
        var selectorArr = [];
        
        selectorArr.push(getEl("moveProfileItemSelector"));
        selectorArr.push(getEl("removeProfileItemSelector"));
        
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

CharacterProfileConfigurer.createProfileItem = function () {
    'use strict';
    var name = getEl("profileItemNameInput").value.trim();

    CharacterProfileConfigurer.validateProfileItemName(name, function(){
        var type = getEl("profileItemTypeSelector").value.trim();
        
        if (!Constants.profileFieldTypes[type]) {
            Utils.alert(strFormat(getL10n("characters-unknown-profile-item-type"), [type]));
            return;
        }
        var value = Constants.profileFieldTypes[type].value;
        
        var positionSelector = getEl("profileItemPositionSelector");
        
        var position = positionSelector.value;
        
        DBMS.createProfileItem(name, type, value, position === getL10n("common-set-item-as-last"), 
                positionSelector.selectedIndex, Utils.processError(CharacterProfileConfigurer.refresh));
    });
};

CharacterProfileConfigurer.moveProfileItem = function () {
    'use strict';
    var index = getEl("moveProfileItemSelector").selectedOptions[0].profileItemIndex;
    var newIndex = getEl("moveProfileItemPositionSelector").selectedIndex;
    
    if (index === newIndex) {
      Utils.alert(getL10n("characters-profile-item-positions-are-equal"));
      return;
    }
    
    DBMS.moveProfileItem(index, newIndex, Utils.processError(CharacterProfileConfigurer.refresh));
};



CharacterProfileConfigurer.removeProfileItem = function () {
    'use strict';
    var index = getEl("removeProfileItemSelector").selectedIndex;
    var name = getEl("removeProfileItemSelector").value;

    if (Utils.confirm(strFormat(getL10n("characters-are-you-sure-about-removing-profile-item"), [name]))) {
        DBMS.removeProfileItem(index, name, Utils.processError(CharacterProfileConfigurer.refresh));
    }
};

CharacterProfileConfigurer.fillSelector = function (sel) {
    'use strict';
    var makeOption = function(value, displayName){
        return setProp(addEl(makeEl("option"), makeText(displayName)),'value', value);
    };
    R.values(Constants.profileFieldTypes).forEach(function (value) {
        addEl(sel, makeOption(value.name, constL10n(value.name)))
    });
};

CharacterProfileConfigurer.getInput = function (profileSettings, index) {
    'use strict';
    var tr = makeEl("tr");
    
    var addColumn = R.compose(addEl(tr), function(el){
        return addEl(makeEl("td"), el);
    });
    addColumn(addEl(makeEl("span"),makeText(index)));

    var input = setProps(makeEl("input"), {
        value: profileSettings.name,
        info: profileSettings.name
    });
    listen(input, "change", CharacterProfileConfigurer.renameProfileItem);
    addClass(input,"itemNameInput");
    addClass(input, "adminOnly");
    addColumn(input);

    var sel = makeEl("select"); 
    CharacterProfileConfigurer.fillSelector(sel);
    setProps(sel, {
        value: profileSettings.type,
        info: profileSettings.name,
        oldType: profileSettings.type
    });
    listen(sel, "change", CharacterProfileConfigurer.changeProfileItemType);
    addClass(sel, "adminOnly");
    addColumn(sel);

    var isTextarea = profileSettings.type == "text" || profileSettings.type == "enum";
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

    listen(input, "change", CharacterProfileConfigurer.updateDefaultValue);
    addColumn(input);
    
    var input = setProps(makeEl("input"), {
        checked: profileSettings.doExport,
        info: profileSettings.name,
        type: "checkbox"
    });
    listen(input, "change", CharacterProfileConfigurer.doExportChange);
    addClass(input, "adminOnly");
    addColumn(input);
    
    return tr;
};

CharacterProfileConfigurer.updateDefaultValue = function (event) {
    'use strict';
    var name = event.target.info;
    var type = event.target.infoType;
    var oldValue = event.target.oldValue;
    
    var value ;
    
    switch (type) {
    case "text":
    case "string":
    case "number":
    case "enum":
        value = event.target.value;
        break;
    case "checkbox":
        value = event.target.checked;
        break;
    }
    
    var oldOptions, newOptions, newOptionsMap, missedValues, newValue;
    
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
    case "enum":
        if (value === "") {
            Utils.alert(getL10n("characters-enum-item-cant-be-empty"));
            event.target.value = oldValue;
            return;
        }
        oldOptions = oldValue.split(",");
        newOptions = value.split(",");
        
        newOptions = newOptions.map(function(elem){
            return elem.trim();
        });
        
        newOptionsMap = [{}].concat(newOptions).reduce(function (a, b) {
            a[b] = true;
            return a;
        });
        
        missedValues = oldOptions.filter(function (oldOption) {
            return !newOptionsMap[oldOption];
        });
        
        if (missedValues.length !== 0) {
            if (Utils.confirm(strFormat(getL10n("characters-new-enum-values-remove-some-old-values"),[missedValues.join(",")]))) {
                newValue = newOptions.join(",");
                event.target.value = newValue;
                DBMS.updateDefaultValue(name, newValue, Utils.processError());
                return;
            } else {
                event.target.value = oldValue;
                return;
            }
        }
        newValue = newOptions.join(",");
        event.target.value = newValue;
        DBMS.updateDefaultValue(name, newValue, Utils.processError());
        break;
    }
};

CharacterProfileConfigurer.doExportChange = function (event) {
    'use strict';
    DBMS.doExportProfileItemChange(event.target.info, event.target.checked, Utils.processError());
};

CharacterProfileConfigurer.renameProfileItem = function (event) {
    'use strict';
    var newName = event.target.value.trim();
    var oldName = event.target.info;

    CharacterProfileConfigurer.validateProfileItemName(newName, function(){
        DBMS.renameProfileItem(newName, oldName, Utils.processError(CharacterProfileConfigurer.refresh));
    }, function(){
        event.target.value = event.target.info;
    });
};

CharacterProfileConfigurer.validateProfileItemName = function (name, success, failure) {
    'use strict';
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

CharacterProfileConfigurer.changeProfileItemType = function (event) {
    'use strict';
    if (Utils.confirm(strFormat(getL10n("characters-are-you-sure-about-changing-profile-item-type"), [event.target.info]))) {
        
        var newType = event.target.value;
        var name = event.target.info;
        
        DBMS.changeProfileItemType(name, newType, Utils.processError(CharacterProfileConfigurer.refresh));
        
    } else {
        event.target.value = event.target.oldType;
    }
};
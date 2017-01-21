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
    
    var root = ".profile-configurer-tab ";
    var characterPanel = root + ".character-profile-panel ";
    var playerPanel = root + ".player-profile-panel ";

    exports.init = function () {
        var sel = clearEl(queryEl(characterPanel+".create-entity-type-select"));
        var fillMainSel = function(){fillItemTypesSel(clearEl(sel));};
        fillMainSel();
        L10n.onL10nChange(fillMainSel);
        var sel2 = clearEl(queryEl(playerPanel+".create-entity-type-select"));
        var fillMainSel2 = function(){fillItemTypesSel(clearEl(sel2));};
        fillMainSel2();
        L10n.onL10nChange(fillMainSel2);
    
        listen(queryEl(characterPanel+".create-entity-button"), "click", createProfileItem('character', characterPanel));
        listen(queryEl(characterPanel+".move-entity-button"), "click", moveProfileItem('character', characterPanel));
        listen(queryEl(characterPanel+".remove-entity-button"), "click", removeProfileItem('character', characterPanel));
        
        listen(queryEl(playerPanel+".create-entity-button"), "click", createProfileItem('player', playerPanel));
        listen(queryEl(playerPanel+".move-entity-button"), "click", moveProfileItem('player', playerPanel));
        listen(queryEl(playerPanel+".remove-entity-button"), "click", removeProfileItem('player', playerPanel));
    
        exports.content = queryEl(root);
    };
    
    exports.refresh = function () {
        refreshPanel('character', characterPanel);
        refreshPanel('player', playerPanel);
    };
    
    var refreshPanel = function(type, root){
        DBMS.getProfileStructure(type,function(err, allProfileSettings){
            if(err) {Utils.handleError(err); return;}
            
            var arr = allProfileSettings.map(R.compose(strFormat(getL10n("common-set-item-before")), R.append(R.__, []), R.prop('name')));
            arr.push(getL10n("common-set-item-as-last"));
            var positionSelectors = [queryEl(root+".create-entity-position-select"), queryEl(root+".move-entity-position-select")];
            positionSelectors.map(clearEl).map(fillSelector(R.__, arr2Select(arr))).map(setProp(R.__, 'selectedIndex', allProfileSettings.length));
            
            var table = clearEl(queryEl(root+".profile-config-container"));
            
            try {
                addEls(table, allProfileSettings.map(getInput(type)));
            } catch (err) {
                Utils.handleError(err); return;
            }
            
            PermissionInformer.isAdmin(function(err, isAdmin){
                if(err) {Utils.handleError(err); return;}
                Utils.enable(exports.content, "adminOnly", isAdmin);
            });
            
            var selectorArr = [queryEl(root+".move-entity-select"), queryEl(root+".remove-entity-select")];
            selectorArr.map(clearEl).map(fillSelector(R.__, arr2Select(allProfileSettings.map(R.prop('name')))))
        });
    }
    
    var createProfileItem = function (type, root) {
        return function(){
            var input = queryEl(root+".create-entity-input");
            var name = input.value.trim();
            var itemType = queryEl(root+".create-entity-type-select").value.trim();
            var positionSelector = queryEl(root+".create-entity-position-select");
            
            DBMS.createProfileItem(type, name, itemType, positionSelector.selectedIndex, Utils.processError(function(){
                input.value = '';
                exports.refresh();
            }));
        }
    };
    
    var moveProfileItem = function (type, root) {
        return function(){
            var index = queryEl(root+".move-entity-select").selectedOptions[0].index;
            var newIndex = queryEl(root+".move-entity-position-select").selectedIndex;
            DBMS.moveProfileItem(type, index, newIndex, Utils.processError(exports.refresh));
        }
    };
    
    var removeProfileItem = function (type, root) {
        return function(){
            var selector = queryEl(root+".remove-entity-select");
            var index = selector.selectedIndex;
            var name = selector.value;
        
            if (Utils.confirm(strFormat(getL10n("profiles-are-you-sure-about-removing-profile-item"), [name]))) {
                DBMS.removeProfileItem(type, index, name, Utils.processError(exports.refresh));
            }
        }
    };
    
    var fillItemTypesSel = (sel) => fillSelector(sel, constArr2Select(R.keys(Constants.profileFieldTypes)));
    var fillPlayerAccessSel = (sel) => fillSelector(sel, constArr2Select(Constants.playerAccessTypes));
    
    var getInput = R.curry(function (type, profileSettings, index) { // throws InternalError
        index++;
        var els = [];

        els.push(addEl(makeEl("span"),makeText(index)));
    
        var input = setProps(makeEl("input"), {
            value: profileSettings.name,
            info: profileSettings.name
        });
        listen(input, "change", renameProfileItem(type));
        addClass(input,"itemNameInput");
        els.push(input);
    
        var sel = makeEl("select"); 
        fillItemTypesSel(sel);
        setProps(sel, {
            value: profileSettings.type,
            info: profileSettings.name,
            oldType: profileSettings.type
        });
        listen(sel, "change", changeProfileItemType(type));
        els.push(sel);
    
        switch (profileSettings.type) {
        case "text":
        case "enum":
        case "multiEnum":
            input = makeEl("textarea");
            input.value = profileSettings.value;
            break;
        case "string":
            input = makeEl("input");
            input.value = profileSettings.value;
            break;
        case "number":
            input = makeEl("input");
            input.type = "number";
            input.value = profileSettings.value;
            break;
        case "checkbox":
            input = makeEl("input");
            input.type = "checkbox";
            input.checked = profileSettings.value;
            break;
        default:
            throw new Errors.InternalError('errors-unexpected-switch-argument', [profileSettings.type]);
        }
    
        setProps(input, {
            info: profileSettings.name,
            infoType: profileSettings.type,
            oldValue: profileSettings.value
        });
        addClass(input, "profile-configurer-" + profileSettings.type);
        listen(input, "change", updateDefaultValue(type));
        els.push(input);
        
        var input = setProps(makeEl("input"), {
            checked: profileSettings.doExport,
            info: profileSettings.name,
            type: "checkbox"
        });
        listen(input, "change", doExportChange(type));
        els.push(input);
        
        var sel = makeEl("select"); 
        fillPlayerAccessSel(sel);
        setProps(sel, {
            value: profileSettings.playerAccess,
            info: profileSettings.name,
            oldValue: profileSettings.playerAccess,
        });
        listen(sel, "change", changeProfileItemPlayerAccess(type));
        els.push(sel);
        
        return addEls(makeEl("tr"), els.map(el => addEl(makeEl("td"), addClass(el, 'adminOnly'))));
    });
    
    var updateDefaultValue = function (type) {
        return function(event){
            var name = event.target.info;
            var itemType = event.target.infoType;
            var oldValue = event.target.oldValue;
            
            var value = itemType === 'checkbox' ? event.target.checked : event.target.value;
            
            var newOptions, missedValues, newValue;
            
            switch (itemType) {
            case "text":
            case "string":
            case "checkbox":
                DBMS.updateDefaultValue(type, name, value, Utils.processError());
                break;
            case "number":
                if (isNaN(value)) {
                    Utils.alert(getL10n("profiles-not-a-number"));
                    event.target.value = oldValue;
                    return;
                }
                DBMS.updateDefaultValue(type, name, Number(value), Utils.processError());
                break;
            case "multiEnum":
            case "enum":
                if (value === "" && itemType === "enum") {
                    Utils.alert(getL10n("profiles-enum-item-cant-be-empty"));
                    event.target.value = oldValue;
                    return;
                }
                newOptions = value.split(",").map(R.trim);
                missedValues = oldValue.trim() === '' ? [] : R.difference(oldValue.split(","), newOptions);
                
                var updateEnum = function(){
                    newValue = newOptions.join(",");
                    event.target.value = newValue;
                    event.target.oldValue = newValue;
                    DBMS.updateDefaultValue(type, name, newValue, Utils.processError());
                };
                
                if (missedValues.length !== 0) {
                    if (Utils.confirm(strFormat(getL10n("profiles-new-enum-values-remove-some-old-values"),[missedValues.join(",")]))) {
                        updateEnum();
                    } else {
                        event.target.value = oldValue;
                    }
                } else {
                    updateEnum();
                }
                break;
            default:
                Utils.handleError(new Errors.InternalError('errors-unexpected-switch-argument', [itemType]))
                return;
            }
        }
    };
    
    var doExportChange = function (type) {
        return function(event){
            DBMS.doExportProfileItemChange(type, event.target.info, event.target.checked, Utils.processError());
        }
    };
    
    var renameProfileItem = function (type) {
        return function(event){
            var newName = event.target.value.trim();
            var oldName = event.target.info;
            
            DBMS.renameProfileItem(type, newName, oldName, function(err){
                if(err){
                    event.target.value = event.target.info;
                    Utils.handleError(err); 
                    return;
                }
                exports.refresh();
            });
        }
    };
    
    var changeProfileItemType = function (type) {
        return function(event){
            if (Utils.confirm(strFormat(getL10n("profiles-are-you-sure-about-changing-profile-item-type"), [event.target.info]))) {
                var newType = event.target.value;
                var name = event.target.info;
                DBMS.changeProfileItemType(type, name, newType, Utils.processError(exports.refresh));
            } else {
                event.target.value = event.target.oldType;
            }
        }
    };
    
    var changeProfileItemPlayerAccess = function (type) {
        return function(event){
            var playerAccessType = event.target.value;
            var name = event.target.info;
            DBMS.changeProfileItemPlayerAccess(type, name, playerAccessType, function(err){
                if(err){
                    event.target.value = event.target.oldValue;
                    Utils.processError()(err);
                }
            });
        };
    };

})(this['ProfileConfigurer']={});
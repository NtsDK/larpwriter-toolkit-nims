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

((exports) => {

    const state = {};

    exports.init = function () {
        var button = getEl("storyCharactersAddButton");
        button.addEventListener("click", addCharacter);

        button = getEl("storyCharactersSwitchButton");
        button.addEventListener("click", switchCharacters);

        button = getEl("storyCharactersRemoveButton");
        button.addEventListener("click", removeCharacter);

        state.ExternalCharacterSelectors = [getEl("storyCharactersAddSelector"), getEl("storyCharactersToSelector")];
        state.InternalCharacterSelectors = [getEl("storyCharactersRemoveSelector"), getEl("storyCharactersFromSelector")];

        exports.content = getEl("storyCharactersDiv");
    };

    exports.refresh = function () {
        state.ExternalCharacterSelectors.forEach(clearEl);
        state.InternalCharacterSelectors.forEach(clearEl);

        clearEl(getEl("story-characterActivityTableHead"));
        clearEl(getEl("story-characterActivityTable"));
        clearEl(getEl("storyCharactersTableHead"));
        clearEl(getEl("storyCharactersTable"));

        if(!Stories.getCurrentStoryName()){return;}

        PermissionInformer.isEntityEditable('story', Stories.getCurrentStoryName(), function(err, isStoryEditable){
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.getEntityNamesArray('character', false, function(err, allCharacters){
                if(err) {Utils.handleError(err); return;}
                DBMS.getStoryCharacters(Stories.getCurrentStoryName(), function(err, localCharacters){
                    if(err) {Utils.handleError(err); return;}
                    rebuildInterface(allCharacters, localCharacters);
                    Utils.enable(exports.content, "isStoryEditable", isStoryEditable);
                    Stories.chainRefresh();
                });
            });
        });
    };

    var rebuildInterface = function (allCharacters, localCharacters) {
        var addArray = [];
        var removeArray = [];

        allCharacters.filter(function(nameInfo){
            return !localCharacters[nameInfo.value];
        }).forEach(function(nameInfo){
            addArray.push(nameInfo);
        });

        allCharacters.filter(function(nameInfo){
            return localCharacters[nameInfo.value];
        }).forEach(function(nameInfo){
            removeArray.push(nameInfo);
        });

        addArray.sort(Utils.charOrdAObject);
        removeArray.sort(Utils.charOrdAObject);

        var addData = getSelect2Data(addArray);
        var removeData = getSelect2Data(removeArray);

        state.ExternalCharacterSelectors.forEach(function(selector){
            $("#" + selector.id).select2(addData);
        });
        state.InternalCharacterSelectors.forEach(function(selector){
            $("#" + selector.id).select2(removeData);
        });

        var tableHead = clearEl(getEl("story-characterActivityTableHead"));
        var table = clearEl(getEl("story-characterActivityTable"));
        addEl(tableHead, getCharacterHeader([getL10n("stories-name")].concat(Constants.characterActivityTypes.map(constL10n))));
        removeArray.forEach(function (removeValue) {
            addEl(table, getCharacterActivity(removeValue, localCharacters[removeValue.value]));
        });

        tableHead = clearEl(getEl("storyCharactersTableHead"));
        table = clearEl(getEl("storyCharactersTable"));
        addEl(tableHead, getCharacterHeader([getL10n("stories-name"), getL10n("stories-inventory")]));
        removeArray.forEach(function (removeValue) {
            addEl(table, getCharacterInput(removeValue, localCharacters[removeValue.value]));
        });
    };

    var addCharacter = function () {
        var characterName = getEl("storyCharactersAddSelector").value.trim();
        DBMS.addStoryCharacter(Stories.getCurrentStoryName(), characterName, Utils.processError(exports.refresh));
    };

    var switchCharacters = function () {
        var fromName = getEl("storyCharactersFromSelector").value.trim();
        var toName = getEl("storyCharactersToSelector").value.trim();
        DBMS.switchStoryCharacters(Stories.getCurrentStoryName(), fromName, toName, Utils.processError(exports.refresh));
    };

    var removeCharacter = function () {
        var characterName = getEl("storyCharactersRemoveSelector").value.trim();
        Utils.confirm(strFormat(getL10n("stories-remove-character-from-story-warning"),[characterName]), () => {
            DBMS.removeStoryCharacter(Stories.getCurrentStoryName(), characterName, Utils.processError(exports.refresh));
        });
    };

    var getCharacterHeader = function (values) {
        var tr = makeEl("tr");
        values.forEach(function(value){
            addEl(tr, addEl(makeEl('th'), makeText(value)));
        });
        return tr;
    };

    var getCharacterInput = function (characterMeta, character) {
        var tr = makeEl("tr");
        var td = makeEl("td");
        td.appendChild(makeText(characterMeta.displayName));
        tr.appendChild(td);

        td = makeEl("td");
        var input = makeEl("input");
        input.value = character.inventory;
        input.characterName = character.name;
        addClass(input, "inventoryInput");
        addClass(input, "isStoryEditable");
        input.addEventListener("change", updateCharacterInventory);
        td.appendChild(input);
        tr.appendChild(td);
        return tr;
    };

    var updateCharacterInventory = function (event) {
        DBMS.updateCharacterInventory(Stories.getCurrentStoryName(), event.target.characterName, event.target.value, Utils.processError());
    };

    var getCharacterActivity = function (characterMeta, character) {
        var tr = makeEl("tr");
        var td = makeEl("td");
        td.appendChild(makeText(characterMeta.displayName));
        tr.appendChild(td);

        var input;
        addEls(tr, Constants.characterActivityTypes.map(function (activityType) {
            td = addClass(makeEl("td"),'vertical-aligned-td');
            input = makeEl("input");
            addClass(input, "isStoryEditable");
            input.type = "checkbox";
            if (character.activity[activityType]) {
                input.checked = true;
            }
            input.characterName = character.name;
            input.activityType = activityType;
            input.addEventListener("change", onChangeCharacterActivity);
            setAttr(input, 'id', character.name + activityType);
            addClass(input, 'hidden')
            addEl(td, input)
            var label = addClass(makeEl('label'),'checkbox-label');
            setAttr(label, 'for', character.name + activityType);
            return addEl(td, label);
        }));
        return tr;
    };

    var onChangeCharacterActivity = function (event) {
        DBMS.onChangeCharacterActivity(Stories.getCurrentStoryName(), event.target.characterName,
                event.target.activityType, event.target.checked, Utils.processError());
    };
})(this.StoryCharacters = {});

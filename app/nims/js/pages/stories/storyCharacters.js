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

'use strict';

((exports) => {
    const state = {};
    const root = '.story-characters-tab ';

    exports.init = () => {
        let button = queryEl(root + '.storyCharactersAddButton');
        button.addEventListener('click', addCharacter);

        button = queryEl(root + '.storyCharactersSwitchButton');
        button.addEventListener('click', switchCharacters);

        button = queryEl(root + '.storyCharactersRemoveButton');
        button.addEventListener('click', removeCharacter);

        state.ExternalCharacterSelectors = [queryEl(root + '.storyCharactersAddSelector'), queryEl(root + '.storyCharactersToSelector')];
        state.InternalCharacterSelectors = [queryEl(root + '.storyCharactersRemoveSelector'), queryEl(root + '.storyCharactersFromSelector')];

        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        state.ExternalCharacterSelectors.forEach(clearEl);
        state.InternalCharacterSelectors.forEach(clearEl);

        clearEl(queryEl(root + '.story-characterActivityTable'));
        clearEl(queryEl(root + '.storyCharactersTable'));

        if (!Stories.getCurrentStoryName()) { return; }

        PermissionInformer.isEntityEditable('story', Stories.getCurrentStoryName(), (err, isStoryEditable) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray('character', false, (err2, allCharacters) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getStoryCharacters(Stories.getCurrentStoryName(), (err3, localCharacters) => {
                    if (err3) { Utils.handleError(err3); return; }
                    rebuildInterface(allCharacters, localCharacters);
                    Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
                    Stories.chainRefresh();
                });
            });
        });
    };

    function rebuildInterface(allCharacters, localCharacters) {
        const addArray = [];
        const removeArray = [];

        allCharacters.filter(nameInfo => !localCharacters[nameInfo.value]).forEach((nameInfo) => {
            addArray.push(nameInfo);
        });

        allCharacters.filter(nameInfo => localCharacters[nameInfo.value]).forEach((nameInfo) => {
            removeArray.push(nameInfo);
        });

        addArray.sort(Utils.charOrdAObject);
        removeArray.sort(Utils.charOrdAObject);

        const addData = getSelect2Data(addArray);
        const removeData = getSelect2Data(removeArray);

        state.ExternalCharacterSelectors.forEach((selector) => {
            $(selector).select2(addData);
        });
        state.InternalCharacterSelectors.forEach((selector) => {
            $(selector).select2(removeData);
        });

        let table = clearEl(queryEl(root + '.storyCharactersTable'));
        removeArray.forEach((removeValue) => {
            addEl(table, getCharacterInput(removeValue, localCharacters[removeValue.value]));
        });
    }

    function addCharacter() {
        const characterName = queryEl(root + '.storyCharactersAddSelector').value.trim();
        DBMS.addStoryCharacter(Stories.getCurrentStoryName(), characterName, Utils.processError(exports.refresh));
    }

    function switchCharacters() {
        const fromName = queryEl(root + '.storyCharactersFromSelector').value.trim();
        const toName = queryEl(root + '.storyCharactersToSelector').value.trim();
        DBMS.switchStoryCharacters(
            Stories.getCurrentStoryName(),
            fromName, toName, Utils.processError(exports.refresh)
        );
    }

    function removeCharacter() {
        const characterName = queryEl(root + '.storyCharactersRemoveSelector').value.trim();
        Utils.confirm(strFormat(getL10n('stories-remove-character-from-story-warning'), [characterName]), () => {
            DBMS.removeStoryCharacter(
                Stories.getCurrentStoryName(),
                characterName, Utils.processError(exports.refresh)
            );
        });
    }

    function getCharacterInput(characterMeta, character) {
        const el = wrapEl('tr', qte(`${root} .story-character-row-tmpl` ));
        L10n.localizeStatic(el);
        const qe = qee(el);
        
        addEl(qe('.character-name'), makeText(characterMeta.displayName));
        
        let input = qe('.inventoryInput');
        input.value = character.inventory;
        input.characterName = character.name;
        listen(input, 'change', updateCharacterInventory);
        
        Constants.characterActivityTypes.map((activityType) => {
            input = qe('.' + activityType + ' input');
            if (character.activity[activityType]) {
                input.checked = true;
            }
            input.characterName = character.name;
            input.activityType = activityType;
            listen(input, 'change', onChangeCharacterActivity);
            setAttr(input, 'id', character.name + activityType);
            setAttr(qe('.' + activityType + ' label'), 'for', character.name + activityType);
        }); 
        return el;
    }

    function updateCharacterInventory(event) {
        DBMS.updateCharacterInventory(
            Stories.getCurrentStoryName(),
            event.target.characterName, event.target.value, Utils.processError()
        );
    }

    function onChangeCharacterActivity(event) {
        DBMS.onChangeCharacterActivity(
            Stories.getCurrentStoryName(), event.target.characterName,
            event.target.activityType, event.target.checked, Utils.processError()
        );
    }
})(this.StoryCharacters = {});

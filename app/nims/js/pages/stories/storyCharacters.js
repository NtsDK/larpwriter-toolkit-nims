/*Copyright 2015-2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
    const superRoot = '.stories-tab ';
    let initialized = false;

    exports.init = () => {
        if (initialized) return;
        exports.addCharacterDialog = UI.createModalDialog(superRoot, addCharacter, {
            bodySelector: 'modal-add-character-body',
            dialogTitle: 'stories-add-character-title',
            actionButtonTitle: 'common-add',
        });

        //        listen(qe(`${root}.add.character`), 'click', () => addCharacterDialog.showDlg());

        state.switchCharacterDialog = UI.createModalDialog(root, switchCharacters, {
            bodySelector: 'modal-switch-event-body',
            dialogTitle: 'stories-switch-character-title',
            actionButtonTitle: 'common-replace',
        });
        state.ExternalCharacterSelectors = [queryEl(`${superRoot}.storyCharactersAddSelector`),
            queryEl(`${root}.storyCharactersToSelector`)];

        exports.content = queryEl(root);
        initialized = true;
    };

    exports.refresh = () => {
        state.ExternalCharacterSelectors.forEach(clearEl);

        clearEl(queryEl(`${root}.storyCharactersTable`));

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

        const table = clearEl(queryEl(`${root}.storyCharactersTable`));
        removeArray.forEach((removeValue) => {
            addEl(table, getCharacterInput(removeValue, localCharacters[removeValue.value]));
        });
    }

    function addCharacter(dialog) {
        return () => {
            const characterName = queryEl(`${superRoot}.storyCharactersAddSelector`).value.trim();
            DBMS.addStoryCharacter(Stories.getCurrentStoryName(), characterName, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        };
    }

    function switchCharacters(dialog) {
        return () => {
            const toName = queryEl(`${root}.storyCharactersToSelector`).value.trim();
            DBMS.switchStoryCharacters(Stories.getCurrentStoryName(), dialog.characterName, toName, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        };
    }

    function removeCharacter(characterName) {
        return () => {
            Utils.confirm(strFormat(getL10n('stories-remove-character-from-story-warning'), [characterName]), () => {
                DBMS.removeStoryCharacter(
                    Stories.getCurrentStoryName(),
                    characterName, Utils.processError(exports.refresh)
                );
            });
        };
    }

    function getCharacterInput(characterMeta, character) {
        const el = wrapEl('tr', qte(`${root} .story-character-row-tmpl`));
        L10n.localizeStatic(el);
        const qe = qee(el);

        addEl(qe('.character-name'), makeText(characterMeta.displayName));

        let input = qe('.inventoryInput');
        input.value = character.inventory;
        input.characterName = character.name;
        listen(input, 'change', updateCharacterInventory);

        Constants.characterActivityTypes.forEach((activityType) => {
            input = qe(`.${activityType} input`);
            if (character.activity[activityType]) {
                input.checked = true;
            }
            input.characterName = character.name;
            input.activityType = activityType;
            listen(input, 'change', onChangeCharacterActivity);
            setAttr(input, 'id', character.name + activityType);
            setAttr(qe(`.${activityType} label`), 'for', character.name + activityType);
        });

        listen(qe('.replace.character'), 'click', () => {
            state.switchCharacterDialog.characterName = character.name;
            state.switchCharacterDialog.showDlg();
        });
        listen(qe('.remove.character'), 'click', removeCharacter(character.name));
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

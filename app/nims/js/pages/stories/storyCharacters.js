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

// ((exports) => {
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

        //        U.listen(U.qe(`${root}.add.character`), 'click', () => addCharacterDialog.showDlg());

        state.switchCharacterDialog = UI.createModalDialog(root, switchCharacters, {
            bodySelector: 'modal-switch-event-body',
            dialogTitle: 'stories-switch-character-title',
            actionButtonTitle: 'common-replace',
        });
        state.ExternalCharacterSelectors = [U.queryEl(`${superRoot}.storyCharactersAddSelector`),
            U.queryEl(`${root}.storyCharactersToSelector`)];

        exports.content = U.queryEl(root);
        initialized = true;
    };

    exports.refresh = () => {
        state.ExternalCharacterSelectors.forEach(clearEl);

        U.clearEl(U.queryEl(`${root}.storyCharactersTable`));

        if (!Stories.getCurrentStoryName()) { return; }

        Promise.all([
            PermissionInformer.isEntityEditable({type: 'story', name: Stories.getCurrentStoryName()}),
            PermissionInformer.getEntityNamesArray({type: 'character', editableOnly: false}),
            DBMS.getStoryCharacters({storyName: Stories.getCurrentStoryName()})
        ]).then(results => {
            const [isStoryEditable, allCharacters, localCharacters] = results;
            rebuildInterface(allCharacters, localCharacters);
            Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
            Stories.chainRefresh();
        }).catch(Utils.handleError);
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

        const addData = UI.getSelect2Data(addArray);
        const removeData = UI.getSelect2Data(removeArray);

        state.ExternalCharacterSelectors.forEach((selector) => {
            $(selector).select2(addData);
        });

        const table = U.clearEl(U.queryEl(`${root}.storyCharactersTable`));

        U.showEl(U.qe(`${root} table`), R.keys(localCharacters).length !== 0 );
        U.showEl(U.qe(`${root} .alert`), R.keys(localCharacters).length === 0 );

        removeArray.forEach((removeValue) => {
            U.addEl(table, getCharacterInput(removeValue, localCharacters[removeValue.value]));
        });
    }

    function addCharacter(dialog) {
        return () => {
            const characterName = U.queryEl(`${superRoot}.storyCharactersAddSelector`).value.trim();
            DBMS.addStoryCharacter({
                storyName: Stories.getCurrentStoryName(),
                characterName
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    function switchCharacters(dialog) {
        return () => {
            const toName = U.queryEl(`${root}.storyCharactersToSelector`).value.trim();
            DBMS.switchStoryCharacters({
                storyName: Stories.getCurrentStoryName(),
                fromName: dialog.characterName,
                toName
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    function removeCharacter(characterName) {
        return () => {
            Utils.confirm(U.strFormat(L10n.getValue('stories-remove-character-from-story-warning'), [characterName]), () => {
                DBMS.removeStoryCharacter({
                    storyName: Stories.getCurrentStoryName(),
                    characterName
                }).then(exports.refresh).catch(Utils.handleError);
            });
        };
    }

    function getCharacterInput(characterMeta, character) {
        const el = U.wrapEl('tr', U.qte(`${root} .story-character-row-tmpl`));
        L10n.localizeStatic(el);
        const qe = U.qee(el);

        U.addEl(U.qe('.character-name'), U.makeText(characterMeta.displayName));

        let input = U.qe('.inventoryInput');
        input.value = character.inventory;
        input.characterName = character.name;
        U.listen(input, 'change', updateCharacterInventory);

        Constants.characterActivityTypes.forEach((activityType) => {
            input = U.qe(`.${activityType} input`);
            if (character.activity[activityType]) {
                input.checked = true;
            }
            input.characterName = character.name;
            input.activityType = activityType;
            U.listen(input, 'change', onChangeCharacterActivity);
            U.setAttr(input, 'id', character.name + activityType);
            U.setAttr(U.qe(`.${activityType} label`), 'for', character.name + activityType);
        });

        U.listen(U.qe('.replace.character'), 'click', () => {
            state.switchCharacterDialog.characterName = character.name;
            state.switchCharacterDialog.showDlg();
        });
        U.listen(U.qe('.remove.character'), 'click', removeCharacter(character.name));
        return el;
    }

    function updateCharacterInventory(event) {
        DBMS.updateCharacterInventory({
            storyName: Stories.getCurrentStoryName(),
            characterName: event.target.characterName,
            inventory: event.target.value
        }).catch(Utils.handleError);
    }

    function onChangeCharacterActivity(event) {
        DBMS.onChangeCharacterActivity({
            storyName: Stories.getCurrentStoryName(),
            characterName: event.target.characterName,
            activityType: event.target.activityType,
            checked: event.target.checked
        }).catch(Utils.handleError);
    }
// })(window.StoryCharacters = {});

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
 Utils, DBMS, Stories
 */

'use strict';

((exports) => {
    const state = {};
    exports.name = 'EventPresence';
    const root = '#eventPresenceDiv ';

    exports.init = () => {
        listen(getEl('eventPresenceSelector'), 'change', UI.showSelectedEls('-dependent'));
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        const tableHead = getEl('eventPresenceTableHead');
        const table = getEl('eventPresenceTable');
        const characterSelector = getEl('eventPresenceSelector');

        if (Stories.getCurrentStoryName() === undefined) {
            clearEl(tableHead);
            clearEl(table);
            clearEl(characterSelector);
            return;
        }

        PermissionInformer.isEntityEditable('story', Stories.getCurrentStoryName(), (err, isStoryEditable) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray('character', false, (err2, allCharacters) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getStoryCharacterNamesArray(Stories.getCurrentStoryName(), (err3, characterArray) => {
                    if (err3) { Utils.handleError(err3); return; }
                    const map = {};
                    allCharacters.forEach((elem) => {
                        map[elem.value] = elem;
                    });
                    const dataArray = characterArray.map(elem => map[elem]);

                    dataArray.sort(Utils.charOrdAObject);

                    const displayArray = dataArray.map(elem => elem.displayName);
                    characterArray = dataArray.map(elem => elem.value);

                    DBMS.getStoryEvents(Stories.getCurrentStoryName(), (err4, events) => {
                        if (err4) { Utils.handleError(err4); return; }

                        clearEl(tableHead);
                        clearEl(table);
                        
                        showEl(queryEl(`${root} .alert.no-characters`), characterArray.length === 0);
                        showEl(queryEl(`${root} .alert.no-events`), events.length === 0);
                        showEl(queryEl(`${root} .panel-body`), events.length !== 0 && characterArray.length !== 0);
                        
                        UI.fillShowItemSelector(
                            clearEl(characterSelector),
                            displayArray.map(name => ({ name, hidden: false }))
                        );

                        appendTableHeader(tableHead, displayArray);
                        events.forEach((event, i) => {
                            appendTableInput(table, event, i, characterArray);
                            Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
                        });
                    });
                });
            });
        });
    };

    function appendTableHeader(table, characterArray) {
        const tr = makeEl('tr');

        rAddEl(rAddEl(makeText(getL10n('stories-event')), makeEl('th')), tr);
        characterArray.forEach((characterName, i) => {
            rAddEl(rAddEl(makeText(characterName), rAddClass(`${i}-dependent`, makeEl('th'))), tr);
        });
        table.appendChild(tr);
    }

    function appendTableInput(table, event, i, characterArray) {
        const tr = makeEl('tr');
        let td = makeEl('td');
        td.appendChild(makeText(event.name));
        tr.appendChild(td);

        characterArray.forEach((character, j) => {
            td = addClass(makeEl('td'), 'vertical-aligned-td');
            addClass(td, `${j}-dependent`);
            const input = makeEl('input');
            addClass(input, 'isStoryEditable');
            input.type = 'checkbox';
            if (event.characters[character]) {
                input.checked = true;
            }
            input.eventIndex = i;
            input.eventName = event.name;
            input.characterName = character;
            input.hasText = event.characters[character] !== undefined && event.characters[character].text !== '';
            input.addEventListener('change', onChangeCharacterCheckbox);

            const id = i + character;
            setAttr(input, 'id', id);
            addClass(input, 'hidden');
            addEl(td, input);
            const label = addClass(makeEl('label'), 'checkbox-label checkbox-label-icon');
            setAttr(label, 'for', id);
            addEl(td, label);

            tr.appendChild(td);
        });

        table.appendChild(tr);
    }

    function onChangeCharacterCheckbox(event) {
        if (event.target.checked) {
            DBMS.addCharacterToEvent(
                Stories.getCurrentStoryName(),
                event.target.eventIndex, event.target.characterName, Utils.processError()
            );
        } else if (!event.target.hasText) {
            DBMS.removeCharacterFromEvent(
                Stories.getCurrentStoryName(),
                event.target.eventIndex, event.target.characterName, Utils.processError()
            );
        } else {
            Utils.confirm(strFormat(
                getL10n('stories-remove-character-from-event-warning'),
                [event.target.characterName, event.target.eventName]
            ), () => {
                DBMS.removeCharacterFromEvent(
                    Stories.getCurrentStoryName(),
                    event.target.eventIndex, event.target.characterName, Utils.processError()
                );
            }, () => {
                event.target.checked = true;
            });
        }
    }
})(this.EventPresence = {});

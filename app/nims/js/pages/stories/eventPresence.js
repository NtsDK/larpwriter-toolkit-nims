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

const PermissionInformer = require("permissionInformer");

'use strict';

module.exports = (Stories) => {
    const exports = {};
    const state = {};
    exports.name = 'EventPresence';
    const root = '#eventPresenceDiv ';

    exports.init = () => {
        U.listen(U.queryEl('#eventPresenceSelector'), 'change', UI.showSelectedEls3(root, 'dependent', 'dependent-index'));
        exports.content = U.queryEl(root);
    };

    exports.refresh = () => {
        const tableHead = U.queryEl('#eventPresenceTableHead');
        const table = U.queryEl('#eventPresenceTable');
        const characterSelector = U.queryEl('#eventPresenceSelector');

        if (Stories.getCurrentStoryName() === undefined) {
            U.clearEl(tableHead);
            U.clearEl(table);
            U.clearEl(characterSelector);
            return;
        }

        Promise.all([
            PermissionInformer.isEntityEditable({type: 'story', name: Stories.getCurrentStoryName()}),
            PermissionInformer.getEntityNamesArray({type: 'character', editableOnly: false}),
            DBMS.getStoryCharacterNamesArray({storyName: Stories.getCurrentStoryName()}),
            DBMS.getStoryEvents({storyName: Stories.getCurrentStoryName()})
        ]).then(results => {
            let [isStoryEditable, allCharacters, characterArray, events] = results;
            const map = {};
            allCharacters.forEach((elem) => {
                map[elem.value] = elem;
            });
            const dataArray = characterArray.map(elem => map[elem]);

            dataArray.sort(Utils.charOrdAObject);

            const displayArray = dataArray.map(elem => elem.displayName);
            characterArray = dataArray.map(elem => elem.value);
            U.clearEl(tableHead);
            U.clearEl(table);

            U.showEl(U.queryEl(`${root} .alert.no-characters`), characterArray.length === 0);
            U.showEl(U.queryEl(`${root} .alert.no-events`), events.length === 0);
            U.showEl(U.queryEl(`${root} .panel-body`), events.length !== 0 && characterArray.length !== 0);

            UI.fillShowItemSelector(
                U.clearEl(characterSelector),
                displayArray.map(name => ({ name, hidden: false }))
            );

            appendTableHeader(tableHead, displayArray);
            events.forEach((event, i) => {
                appendTableInput(table, event, i, characterArray);
                Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
            });
        }).catch(Utils.handleError);
    };

    function appendTableHeader(table, characterArray) {
        const eventName = U.addEl(U.makeEl('th'), U.makeText(L10n.getValue('stories-event')));
        const els = characterArray.map((characterName, i) => {
            const th = U.addEl(U.makeEl('th'), U.makeText(characterName));
            U.addClass(th, `dependent`);
            U.setAttr(th, 'dependent-index', i);
            return th;
        });
        U.addEl(table, U.addEls(U.makeEl('tr'), R.concat([eventName], els)));
    }

    function appendTableInput(table, event, i, characterArray) {
        const tr = U.makeEl('tr');
        let td = U.makeEl('td');
        td.appendChild(U.makeText(event.name));
        tr.appendChild(td);

        U.addEls(tr, characterArray.map((character, j) => {
            const td = U.qmte(`${root} .event-presence-cell`);
            U.addClass(td, `dependent`);
            U.setAttr(td, 'dependent-index', j);
            const input = U.qee(td, 'input');
            const label = U.qee(td, 'label');
            if (event.characters[character]) {
                input.checked = true;
            }
            input.eventIndex = i;
            input.eventName = event.name;
            input.characterName = character;
            input.hasText = event.characters[character] !== undefined && event.characters[character].text !== '';
            input.addEventListener('change', onChangeCharacterCheckbox);

            const span = U.qee(td, 'span');
            if(event.characters[character] !== undefined){
                if(event.characters[character].ready){
                    U.addClass(span, 'finished');
                    U.setAttr(span, 'title', L10n.get('adaptations', 'adaptation-finished'));
                } else if(input.hasText) {
                    U.addClass(span, 'in-progress');
                    U.setAttr(span, 'title', L10n.get('adaptations', 'adaptation-in-progress'));
                }
            }

            const id = i + character;
            U.setAttr(input, 'id', id);
            U.setAttr(label, 'for', id);
            return td;
        }));

        table.appendChild(tr);
    }

    function onChangeCharacterCheckbox(event) {
        if (event.target.checked) {
            DBMS.addCharacterToEvent({
                storyName: Stories.getCurrentStoryName(),
                eventIndex: event.target.eventIndex,
                characterName: event.target.characterName
            }).catch(Utils.handleError);
        } else if (!event.target.hasText) {
            DBMS.removeCharacterFromEvent({
                storyName: Stories.getCurrentStoryName(),
                eventIndex: event.target.eventIndex,
                characterName: event.target.characterName
            }).catch(Utils.handleError);
        } else {
            Utils.confirm(U.strFormat(
                L10n.getValue('stories-remove-character-from-event-warning'),
                [event.target.characterName, event.target.eventName]
            ), () => {
                DBMS.removeCharacterFromEvent({
                    storyName: Stories.getCurrentStoryName(),
                    eventIndex: event.target.eventIndex,
                    characterName: event.target.characterName
                }).catch(Utils.handleError);
            }, () => {
                event.target.checked = true;
            });
        }
    }
    return exports;
}

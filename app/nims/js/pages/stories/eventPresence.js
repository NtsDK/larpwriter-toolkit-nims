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
        listen(getEl('eventPresenceSelector'), 'change', UI.showSelectedEls3(root, 'dependent', 'dependent-index'));
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

        Promise.all([
            PermissionInformer.isEntityEditableNew({type: 'story', name: Stories.getCurrentStoryName()}),
            PermissionInformer.getEntityNamesArrayNew({type: 'character', editableOnly: false}),
            DBMS.getStoryCharacterNamesArrayNew({storyName: Stories.getCurrentStoryName()}),
            DBMS.getStoryEventsNew({storyName: Stories.getCurrentStoryName()})
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
        }).catch(Utils.handleError);
    };

    function appendTableHeader(table, characterArray) {
        const eventName = addEl(makeEl('th'), makeText(getL10n('stories-event')));
        const els = characterArray.map((characterName, i) => {
            const th = addEl(makeEl('th'), makeText(characterName));
            addClass(th, `dependent`);
            setAttr(th, 'dependent-index', i);
            return th;
        });
        addEl(table, addEls(makeEl('tr'), R.concat([eventName], els)));
    }

    function appendTableInput(table, event, i, characterArray) {
        const tr = makeEl('tr');
        let td = makeEl('td');
        td.appendChild(makeText(event.name));
        tr.appendChild(td);

        addEls(tr, characterArray.map((character, j) => {
            const td = qmte(`${root} .event-presence-cell`);
            addClass(td, `dependent`);
            setAttr(td, 'dependent-index', j);
            const input = qee(td, 'input');
            const label = qee(td, 'label');
            if (event.characters[character]) {
                input.checked = true;
            }
            input.eventIndex = i;
            input.eventName = event.name;
            input.characterName = character;
            input.hasText = event.characters[character] !== undefined && event.characters[character].text !== '';
            input.addEventListener('change', onChangeCharacterCheckbox);
            
            const span = qee(td, 'span');
            if(event.characters[character] !== undefined){
                if(event.characters[character].ready){
                    addClass(span, 'finished');
                    setAttr(span, 'title', L10n.get('adaptations', 'adaptation-finished'));
                } else if(input.hasText) {
                    addClass(span, 'in-progress');
                    setAttr(span, 'title', L10n.get('adaptations', 'adaptation-in-progress'));
                }
            }
            
            const id = i + character;
            setAttr(input, 'id', id);
            setAttr(label, 'for', id);
            return td;
        }));

        table.appendChild(tr);
    }

    function onChangeCharacterCheckbox(event) {
        if (event.target.checked) {
            DBMS.addCharacterToEventNew({
                storyName: Stories.getCurrentStoryName(), 
                eventIndex: event.target.eventIndex, 
                characterName: event.target.characterName
            }).catch(Utils.handleError);
        } else if (!event.target.hasText) {
            DBMS.removeCharacterFromEventNew({
                storyName: Stories.getCurrentStoryName(), 
                eventIndex: event.target.eventIndex, 
                characterName: event.target.characterName
            }).catch(Utils.handleError);
        } else {
            Utils.confirm(strFormat(
                getL10n('stories-remove-character-from-event-warning'),
                [event.target.characterName, event.target.eventName]
            ), () => {
                DBMS.removeCharacterFromEventNew({
                    storyName: Stories.getCurrentStoryName(), 
                    eventIndex: event.target.eventIndex, 
                    characterName: event.target.characterName
                }).catch(Utils.handleError);
            }, () => {
                event.target.checked = true;
            });
        }
    }
})(this.EventPresence = {});

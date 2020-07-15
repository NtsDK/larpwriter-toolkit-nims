import PermissionInformer from "permissionInformer";

import ReactDOM from 'react-dom';
import { getEventPresenceCell } from "./EventPresenceCell.jsx";
import { getEventPresenceTemplate } from "./EventPresenceTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';

export default function createEventPresence(Stories) {
    const state = {};
    const root = '#eventPresenceDiv ';
    let content;
    function getContent() {
        return content;
    }

    function init(){
        content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), content);
        ReactDOM.render(getEventPresenceTemplate(), content);
        L10n.localizeStatic(content);

        U.listen(U.queryEl('#eventPresenceSelector'), 'change', UI.showSelectedEls3(root, 'dependent', 'dependent-index'));
        content = U.queryEl(root);
    };

    function refresh(){
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
            PermissionInformer.isEntityEditable({ type: 'story', name: Stories.getCurrentStoryName() }),
            PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
            DBMS.getStoryCharacterNamesArray({ storyName: Stories.getCurrentStoryName() }),
            DBMS.getStoryEvents({ storyName: Stories.getCurrentStoryName() })
        ]).then((results) => {
            const [isStoryEditable, allCharacters, characterArray, events] = results;
            const map = {};
            allCharacters.forEach((elem) => {
                map[elem.value] = elem;
            });
            const dataArray = characterArray.map(elem => map[elem]);

            dataArray.sort(CU.charOrdAObject);

            const displayArray = dataArray.map(elem => elem.displayName);
            const characterArray2 = dataArray.map(elem => elem.value);
            U.clearEl(tableHead);
            U.clearEl(table);

            U.showEl(U.queryEl(`${root} .alert.no-characters`), characterArray2.length === 0);
            U.showEl(U.queryEl(`${root} .alert.no-events`), events.length === 0);
            U.showEl(U.queryEl(`${root} .panel-body`), events.length !== 0 && characterArray2.length !== 0);

            UI.fillShowItemSelector(
                U.clearEl(characterSelector),
                displayArray.map(name => ({ name, hidden: false }))
            );

            appendTableHeader(tableHead, displayArray);
            events.forEach((event, i) => {
                appendTableInput(table, event, i, characterArray2);
                UI.enable(content, 'isStoryEditable', isStoryEditable);
            });
        }).catch(UI.handleError);
    };

    function appendTableHeader(table, characterArray) {
        const eventName = U.addEl(U.makeEl('th'), U.makeText(L10n.getValue('stories-event')));
        const els = characterArray.map((characterName, i) => {
            const th = U.addEl(U.makeEl('th'), U.makeText(characterName));
            U.addClass(th, 'dependent');
            U.setAttr(th, 'dependent-index', i);
            return th;
        });
        U.addEl(table, U.addEls(U.makeEl('tr'), R.concat([eventName], els)));
    }

    function appendTableInput(table, event, i, characterArray) {
        const tr = U.makeEl('tr');
        const td1 = U.makeEl('td');
        td1.appendChild(U.makeText(event.name));
        tr.appendChild(td1);

        U.addEls(tr, characterArray.map((character, j) => {
            const content = U.makeEl('tr');
            ReactDOM.render(getEventPresenceCell(), content);
            const td =  U.qee(content, '.EventPresenceCell');

            U.addClass(td, 'dependent');
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
            if (event.characters[character] !== undefined) {
                if (event.characters[character].ready) {
                    U.addClass(span, 'finished');
                    U.setAttr(span, 'title', L10n.get('adaptations', 'adaptation-finished'));
                } else if (input.hasText) {
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
            }).catch(UI.handleError);
        } else if (!event.target.hasText) {
            DBMS.removeCharacterFromEvent({
                storyName: Stories.getCurrentStoryName(),
                eventIndex: event.target.eventIndex,
                characterName: event.target.characterName
            }).catch(UI.handleError);
        } else {
            UI.confirm(CU.strFormat(
                L10n.getValue('stories-remove-character-from-event-warning'),
                [event.target.characterName, event.target.eventName]
            ), () => {
                DBMS.removeCharacterFromEvent({
                    storyName: Stories.getCurrentStoryName(),
                    eventIndex: event.target.eventIndex,
                    characterName: event.target.characterName
                }).catch(UI.handleError);
            }, () => {
                event.target.checked = true;
            });
        }
    }
    return {
        init, refresh, getContent
    };
};

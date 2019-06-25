/* eslint-disable indent */
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

const PermissionInformer = require('permissionInformer');
//const R = require('ramda');


module.exports = (Stories) => {
    const exports = {};
    const state = {};
    const root = '.story-events-tab ';
    let initialized = false;

    exports.init = () => {
        if (initialized) return;
        exports.createEventDialog = UI.createModalDialog('.stories-tab ', createEvent, {
            bodySelector: 'create-event-body',
            dialogTitle: 'stories-event-creation',
            actionButtonTitle: 'common-create',
        });

        //        U.listen(U.qe(`${root}.create.event`), 'click', () => createEventDialog.showDlg());

        state.moveEventDialog = UI.createModalDialog(root, moveEvent, {
            bodySelector: 'move-event-body',
            dialogTitle: 'stories-move-event',
            actionButtonTitle: 'common-move',
        });
        exports.content = U.qe(root);
        initialized = true;
    };

    exports.refresh = () => {
        clearInterface();
        if (Stories.getCurrentStoryName() === undefined) {
            return;
        }

        Promise.all([
            PermissionInformer.isEntityEditable({ type: 'story', name: Stories.getCurrentStoryName() }),
            DBMS.getMetaInfo(),
            DBMS.getStoryEvents({ storyName: Stories.getCurrentStoryName() })
        ]).then((results) => {
            const [isStoryEditable, metaInfo, events] = results;
            rebuildInterface(events, metaInfo);
            UI.enable(exports.content, 'isStoryEditable', isStoryEditable);
            Stories.chainRefresh();
        }).catch(UI.handleError);
    };

    function clearInterface() {
        U.clearEl(U.queryEl('#eventBlock'));
        const positionSelectors = U.nl2array(document.querySelectorAll('.eventPositionSelector'));
        R.ap([U.clearEl], positionSelectors);
        const selectorArr = U.nl2array(document.querySelectorAll('.eventEditSelector'));
        R.ap([U.clearEl], selectorArr);
    }

    function rebuildInterface(events, metaInfo) {
        // event part
        const table = U.clearEl(U.queryEl('#eventBlock'));

        U.showEl(table, events.length !== 0);
        U.showEl(U.qe(`${root} .alert`), events.length === 0);

        // refresh position selector
        const addOpt = R.curry((sel, text) => {
            U.addEl(sel, U.addEl(U.makeEl('option'), U.makeText(text)));
        });

        let option, addOptLoc;
        const positionSelectors = U.nl2array(document.querySelectorAll('.eventPositionSelector'));
        R.ap([U.clearEl], positionSelectors);
        positionSelectors.forEach((positionSelector) => {
            addOptLoc = addOpt(positionSelector);

            events.forEach((event) => {
                addOptLoc(CU.strFormat(L10n.getValue('common-set-item-before'), [event.name]));
            });

            addOptLoc(L10n.getValue('common-set-item-as-last'));

            positionSelector.selectedIndex = events.length;
        });

        state.eventsLength = events.length;

        R.ap([U.addEl(table)], events.map((event, i, events2) => appendEventInput(event, i, events2, metaInfo.date, metaInfo.preGameDate)));

        // refresh swap selector
        const selectorArr = U.nl2array(document.querySelectorAll('.eventEditSelector'));
        R.ap([U.clearEl], selectorArr);

        events.forEach((event, i) => {
            selectorArr.forEach((selector) => {
                option = U.makeEl('option');
                option.appendChild(U.makeText(event.name));
                option.eventIndex = i;
                selector.appendChild(option);
            });
        });
    }

    function createEvent(dialog) {
        return () => {
            const eventNameInput = U.qee(dialog, '.eventNameInput');
            const eventName = eventNameInput.value.trim();
            const positionSelector = U.qee(dialog, '.positionSelector');

            DBMS.createEvent({
                storyName: Stories.getCurrentStoryName(),
                eventName,
                selectedIndex: positionSelector.selectedIndex
            }).then(() => {
                eventNameInput.value = '';
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => UI.setError(dialog, err));
        };
    }

    function appendEventInput(event, index, events, date, preGameDate) {
        const el = U.wrapEl('tr', U.qte(`${root} .event-tmpl`));
        L10n.localizeStatic(el);
        const qe = U.qee(el);
        U.addEl(qe('.event-number'), U.makeText(index + 1));
        const nameInput = qe('.event-name-input');
        nameInput.value = event.name;
        nameInput.eventIndex = index;
        U.listen(nameInput, 'change', updateEventName);

        const textInput = qe('.event-text');
        textInput.value = event.text;
        textInput.eventIndex = index;
        U.listen(textInput, 'change', updateEventText);

        UI.makeEventTimePicker2(qe('.event-time'), {
            eventTime: event.time,
            index,
            preGameDate,
            date,
            onChangeDateTimeCreator
        });

        U.listen(U.qee(el, '.move'), 'click', () => {
            state.moveEventDialog.index = index;
            state.moveEventDialog.showDlg();
        });

        U.listen(U.qee(el, '.clone'), 'click', cloneEvent(index));
        if (state.eventsLength === index + 1) {
            U.setAttr(U.qee(el, '.merge'), 'disabled', 'disabled');
        } else {
            U.listen(U.qee(el, '.merge'), 'click', mergeEvents(index, event.name, events[index + 1].name));
        }
        U.listen(U.qee(el, '.remove'), 'click', removeEvent(event.name, index));

        return el;
    }

    function moveEvent(dialog) {
        return () => {
            const newIndex = U.queryEl('.movePositionSelector').selectedIndex;
            DBMS.moveEvent({
                storyName: Stories.getCurrentStoryName(),
                index: dialog.index,
                newIndex
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => UI.setError(dialog, err));
        };
    }

    function cloneEvent(index) {
        return () => {
            DBMS.cloneEvent({
                storyName: Stories.getCurrentStoryName(),
                index
            }).then(exports.refresh, UI.handleError);
        };
    }

    function mergeEvents(index, firstName, secondName) {
        return () => {
            if (state.eventsLength === index + 1) {
                UI.alert(L10n.getValue('stories-cant-merge-last-event'));
                return;
            }

            UI.confirm(L10n.format('stories', 'confirm-event-merge', [firstName, secondName]), () => {
                DBMS.mergeEvents({
                    storyName: Stories.getCurrentStoryName(),
                    index
                }).then(exports.refresh, UI.handleError);
            });
        };
    }

    function removeEvent(name, index) {
        return () => {
            UI.confirm(CU.strFormat(L10n.getValue('stories-remove-event-warning'), [name]), () => {
                DBMS.removeEvent({
                    storyName: Stories.getCurrentStoryName(),
                    index
                }).then(exports.refresh, UI.handleError);
            });
        };
    }

    function getEventHeader() {
        const tr = U.makeEl('tr');
        U.addEl(tr, U.addEl(U.makeEl('th'), U.makeText('№')));
        U.addEl(tr, U.addEl(U.makeEl('th'), U.makeText(L10n.getValue('stories-event'))));
        return tr;
    }

    function onChangeDateTimeCreator(myInput) {
        return (dp, input) => {
            DBMS.setEventOriginProperty({
                storyName: Stories.getCurrentStoryName(),
                index: myInput.eventIndex,
                property: 'time',
                value: input.val()
            }).catch(UI.handleError);
            U.removeClass(myInput, 'defaultDate');
        };
    }

    function updateEventName(event) {
        const input = event.target;
        DBMS.setEventOriginProperty({
            storyName: Stories.getCurrentStoryName(),
            index: input.eventIndex,
            property: 'name',
            value: input.value
        }).then(exports.refresh, UI.handleError);
    }

    function updateEventText(event) {
        const input = event.target;
        DBMS.setEventOriginProperty({
            storyName: Stories.getCurrentStoryName(),
            index: input.eventIndex,
            property: 'text',
            value: input.value
        }).catch(UI.handleError);
    }
    return exports;
};
// )(window.StoryEvents = {});

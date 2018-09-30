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
    const root = '.story-events-tab ';
    let initialized = false;

    exports.init = () => {
        if (initialized) return;
        exports.createEventDialog = UI.createModalDialog('.stories-tab ', createEvent, {
            bodySelector: 'create-event-body',
            dialogTitle: 'stories-event-creation',
            actionButtonTitle: 'common-create',
        });

        //        listen(qe(`${root}.create.event`), 'click', () => createEventDialog.showDlg());

        state.moveEventDialog = UI.createModalDialog(root, moveEvent, {
            bodySelector: 'move-event-body',
            dialogTitle: 'stories-move-event',
            actionButtonTitle: 'common-move',
        });
        exports.content = qe(root);
        initialized = true;
    };

    exports.refresh = () => {
        clearInterface();
        if (Stories.getCurrentStoryName() === undefined) {
            return;
        }

        Promise.all([
            PermissionInformer.isEntityEditableNew({type: 'story', name: Stories.getCurrentStoryName()}),
            DBMS.getMetaInfoNew(),
            DBMS.getStoryEventsNew({storyName: Stories.getCurrentStoryName()})
        ]).then(results => {
            const [isStoryEditable, metaInfo, events] = results;
            rebuildInterface(events, metaInfo);
            Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
            Stories.chainRefresh();
        }).catch(Utils.handleError);
    };

    function clearInterface() {
        clearEl(getEl('eventBlock'));
        const positionSelectors = nl2array(document.querySelectorAll('.eventPositionSelector'));
        R.ap([clearEl], positionSelectors);
        const selectorArr = nl2array(document.querySelectorAll('.eventEditSelector'));
        R.ap([clearEl], selectorArr);
    }

    function rebuildInterface(events, metaInfo) {
        // event part
        const table = clearEl(getEl('eventBlock'));
        
        showEl(table, events.length !== 0 );
        showEl(qe(`${root} .alert`), events.length === 0 );

        // refresh position selector
        const addOpt = R.curry((sel, text) => {
            addEl(sel, addEl(makeEl('option'), makeText(text)));
        });

        let option, addOptLoc;
        const positionSelectors = nl2array(document.querySelectorAll('.eventPositionSelector'));
        R.ap([clearEl], positionSelectors);
        positionSelectors.forEach((positionSelector) => {
            addOptLoc = addOpt(positionSelector);

            events.forEach((event) => {
                addOptLoc(strFormat(getL10n('common-set-item-before'), [event.name]));
            });

            addOptLoc(getL10n('common-set-item-as-last'));

            positionSelector.selectedIndex = events.length;
        });

        state.eventsLength = events.length;

        R.ap([addEl(table)], events.map((event, i, events2) =>
            appendEventInput(event, i, events2, metaInfo.date, metaInfo.preGameDate)));

        // refresh swap selector
        const selectorArr = nl2array(document.querySelectorAll('.eventEditSelector'));
        R.ap([clearEl], selectorArr);

        events.forEach((event, i) => {
            selectorArr.forEach((selector) => {
                option = makeEl('option');
                option.appendChild(makeText(event.name));
                option.eventIndex = i;
                selector.appendChild(option);
            });
        });
    }

    function createEvent(dialog) {
        return () => {
            const eventNameInput = qee(dialog, '.eventNameInput');
            const eventName = eventNameInput.value.trim();
            const positionSelector = qee(dialog, '.positionSelector');

            DBMS.createEventNew({
                storyName: Stories.getCurrentStoryName(), 
                eventName, 
                selectedIndex: positionSelector.selectedIndex
            }).then(() => {
                eventNameInput.value = '';
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    function appendEventInput(event, index, events, date, preGameDate) {
        const el = wrapEl('tr', qte(`${root} .event-tmpl`));
        L10n.localizeStatic(el);
        const qe = qee(el);
        addEl(qe('.event-number'), makeText(index + 1));
        const nameInput = qe('.event-name-input');
        nameInput.value = event.name;
        nameInput.eventIndex = index;
        listen(nameInput, 'change', updateEventName);

        const textInput = qe('.event-text');
        textInput.value = event.text;
        textInput.eventIndex = index;
        listen(textInput, 'change', updateEventText);

        UI.makeEventTimePicker2(qe('.event-time'), {
            eventTime: event.time,
            index,
            preGameDate,
            date,
            onChangeDateTimeCreator
        });

        listen(qee(el, '.move'), 'click', () => {
            state.moveEventDialog.index = index;
            state.moveEventDialog.showDlg();
        });

        listen(qee(el, '.clone'), 'click', cloneEvent(index));
        if (state.eventsLength === index + 1) {
            setAttr(qee(el, '.merge'), 'disabled', 'disabled');
        } else {
            listen(qee(el, '.merge'), 'click', mergeEvents(index, event.name, events[index + 1].name));
        }
        listen(qee(el, '.remove'), 'click', removeEvent(event.name, index));

        return el;
    }

    function moveEvent(dialog) {
        return () => {
            const newIndex = queryEl('.movePositionSelector').selectedIndex;
            DBMS.moveEventNew({
                storyName: Stories.getCurrentStoryName(), 
                index: dialog.index, 
                newIndex
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    function cloneEvent(index) {
        return () => {
            DBMS.cloneEventNew({
                storyName: Stories.getCurrentStoryName(), 
                index
            }).then(exports.refresh, Utils.handleError);
        };
    }

    function mergeEvents(index, firstName, secondName) {
        return () => {
            if (state.eventsLength === index + 1) {
                Utils.alert(getL10n('stories-cant-merge-last-event'));
                return;
            }

            Utils.confirm(L10n.format('stories', 'confirm-event-merge', [firstName, secondName]), () => {
                DBMS.mergeEventsNew({
                    storyName: Stories.getCurrentStoryName(), 
                    index
                }).then(exports.refresh, Utils.handleError);
            });
        };
    }

    function removeEvent(name, index) {
        return () => {
            Utils.confirm(strFormat(getL10n('stories-remove-event-warning'), [name]), () => {
                DBMS.removeEventNew({
                    storyName: Stories.getCurrentStoryName(), 
                    index
                }).then(exports.refresh, Utils.handleError);
            });
        };
    }

    function getEventHeader() {
        const tr = makeEl('tr');
        addEl(tr, addEl(makeEl('th'), makeText('№')));
        addEl(tr, addEl(makeEl('th'), makeText(getL10n('stories-event'))));
        return tr;
    }

    function onChangeDateTimeCreator(myInput) {
        return (dp, input) => {
            DBMS.setEventOriginPropertyNew({
                storyName: Stories.getCurrentStoryName(), 
                index: myInput.eventIndex, 
                property: 'time', 
                value: input.val()
            }).catch(Utils.handleError);
            removeClass(myInput, 'defaultDate');
        };
    }

    function updateEventName(event) {
        const input = event.target;
        DBMS.setEventOriginPropertyNew({
            storyName: Stories.getCurrentStoryName(), 
            index: input.eventIndex, 
            property: 'name', 
            value: input.value
        }).then(exports.refresh, Utils.handleError);
    }

    function updateEventText(event) {
        const input = event.target;
        DBMS.setEventOriginPropertyNew({
            storyName: Stories.getCurrentStoryName(), 
            index: input.eventIndex, 
            property: 'text', 
            value: input.value
        }).catch(Utils.handleError);
    }
})(this.StoryEvents = {});

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

        PermissionInformer.isEntityEditable('story', Stories.getCurrentStoryName(), (err, isStoryEditable) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getMetaInfo((err2, metaInfo) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getStoryEvents(Stories.getCurrentStoryName(), (err3, events) => {
                    if (err3) { Utils.handleError(err3); return; }
                    rebuildInterface(events, metaInfo);
                    Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
                    Stories.chainRefresh();
                });
            });
        });
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

            DBMS.createEvent(
                Stories.getCurrentStoryName(), eventName, positionSelector.selectedIndex,
                (err) => {
                    if (err) {
                        setError(dialog, err);
                    } else {
                        eventNameInput.value = '';
                        dialog.hideDlg();
                        exports.refresh();
                    }
                }
            );
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

            Utils.processError(exports.refresh);
            DBMS.moveEvent(Stories.getCurrentStoryName(), dialog.index, newIndex, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        };
    }

    function cloneEvent(index) {
        return () => {
            DBMS.cloneEvent(Stories.getCurrentStoryName(), index, Utils.processError(exports.refresh));
        };
    }

    function mergeEvents(index, firstName, secondName) {
        return () => {
            if (state.eventsLength === index + 1) {
                Utils.alert(getL10n('stories-cant-merge-last-event'));
                return;
            }

            Utils.confirm(L10n.format('stories', 'confirm-event-merge', [firstName, secondName]), () => {
                DBMS.mergeEvents(Stories.getCurrentStoryName(), index, Utils.processError(exports.refresh));
            });
        };
    }

    function removeEvent(name, index) {
        return () => {
            Utils.confirm(strFormat(getL10n('stories-remove-event-warning'), [name]), () => {
                DBMS.removeEvent(Stories.getCurrentStoryName(), index, Utils.processError(exports.refresh));
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
            DBMS.setEventOriginProperty(Stories.getCurrentStoryName(), myInput.eventIndex, 'time', input.val(), Utils.processError());
            //            StoryEvents.lastDate = input.val();
            removeClass(myInput, 'defaultDate');
        };
    }

    function updateEventName(event) {
        const input = event.target;
        DBMS.setEventOriginProperty(Stories.getCurrentStoryName(), input.eventIndex, 'name', input.value, Utils.processError(exports.refresh));
    }

    function updateEventText(event) {
        const input = event.target;
        DBMS.setEventOriginProperty(Stories.getCurrentStoryName(), input.eventIndex, 'text', input.value, Utils.processError());
    }
})(this.StoryEvents = {});

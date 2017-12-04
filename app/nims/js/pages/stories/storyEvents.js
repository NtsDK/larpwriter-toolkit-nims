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

    exports.init = function () {
        let button = getEl('createEventButton');
        button.addEventListener('click', createEvent);

        button = getEl('moveEventButton');
        button.addEventListener('click', moveEvent);

        button = getEl('cloneEventButton');
        button.addEventListener('click', cloneEvent);

        button = getEl('mergeEventButton');
        button.addEventListener('click', mergeEvents);

        button = getEl('removeEventButton');
        button.addEventListener('click', removeEvent);

        exports.content = getEl('storyEventsDiv');
    };

    exports.refresh = function () {
        clearInterface();
        if (Stories.getCurrentStoryName() === undefined) {
            return;
        }

        PermissionInformer.isEntityEditable('story', Stories.getCurrentStoryName(), (err, isStoryEditable) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getMetaInfo((err, metaInfo) => {
                if (err) { Utils.handleError(err); return; }
                DBMS.getStoryEvents(Stories.getCurrentStoryName(), (err, events) => {
                    if (err) { Utils.handleError(err); return; }
                    rebuildInterface(events, metaInfo);
                    Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
                    Stories.chainRefresh();
                });
            });
        });
    };

    var clearInterface = function () {
        clearEl(getEl('eventBlockHead'));
        clearEl(getEl('eventBlock'));
        const positionSelectors = nl2array(document.querySelectorAll('.eventPositionSelector'));
        R.ap([clearEl], positionSelectors);
        const selectorArr = nl2array(document.querySelectorAll('.eventEditSelector'));
        R.ap([clearEl], selectorArr);
    };

    var rebuildInterface = function (events, metaInfo) {
        // event part
        const tableHead = clearEl(getEl('eventBlockHead'));
        const table = clearEl(getEl('eventBlock'));

        addEl(tableHead, getEventHeader());

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

        R.ap([addEl(table)], events.map((event, i) => appendEventInput(event, i, metaInfo.date, metaInfo.preGameDate)));

        state.eventsLength = events.length;

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
    };

    var createEvent = function () {
        const eventNameInput = getEl('eventNameInput');
        const eventName = eventNameInput.value.trim();
        const eventTextInput = getEl('eventTextInput');
        const positionSelector = getEl('positionSelector');
        const eventText = eventTextInput.value.trim();

        DBMS.createEvent(Stories.getCurrentStoryName(), eventName, eventText, positionSelector.selectedIndex, (err) => {
            if (err) { Utils.handleError(err); return; }
            eventNameInput.value = '';
            eventTextInput.value = '';
            exports.refresh();
        });
    };

    var moveEvent = function () {
        const index = getEl('moveEventSelector').selectedOptions[0].eventIndex;
        const newIndex = getEl('movePositionSelector').selectedIndex;

        DBMS.moveEvent(Stories.getCurrentStoryName(), index, newIndex, Utils.processError(exports.refresh));
    };

    var cloneEvent = function () {
        const index = getEl('cloneEventSelector').selectedIndex;
        DBMS.cloneEvent(Stories.getCurrentStoryName(), index, Utils.processError(exports.refresh));
    };

    var mergeEvents = function () {
        const index = getEl('mergeEventSelector').selectedIndex;
        if (state.eventsLength == index + 1) {
            Utils.alert(getL10n('stories-cant-merge-last-event'));
            return;
        }

        DBMS.mergeEvents(Stories.getCurrentStoryName(), index, Utils.processError(exports.refresh));
    };

    var removeEvent = function () {
        const sel = getEl('removeEventSelector');
        Utils.confirm(strFormat(getL10n('stories-remove-event-warning'), [sel.value]), () => {
            DBMS.removeEvent(Stories.getCurrentStoryName(), sel.selectedIndex, Utils.processError(exports.refresh));
        });
    };

    var getEventHeader = function () {
        const tr = makeEl('tr');
        addEl(tr, addEl(makeEl('th'), makeText('№')));
        addEl(tr, addEl(makeEl('th'), makeText(getL10n('stories-event'))));
        return tr;
    };

    var appendEventInput = function (event, index, date, preGameDate) {
        const tr = makeEl('tr');

        // first col - event number
        addEl(tr, addEl(makeEl('td'), addEl(makeEl('span'), makeText(index + 1))));

        // second col
        const td = makeEl('td');

        const divMain = addClass(makeEl('div'), 'story-events-div-main');
        const divLeft = addClass(makeEl('div'), 'story-events-div-left');
        const divRight = addClass(makeEl('div'), 'story-events-div-right');
        addEl(divMain, divLeft);
        addEl(divMain, divRight);
        addEl(td, divMain);

        addEl(divLeft, makeEventNameInput(event, index));
        addEl(divRight, UI.makeEventTimePicker({
            eventTime: event.time,
            index,
            preGameDate,
            date,
            extraClasses: ['isStoryEditable'],
            onChangeDateTimeCreator
        }));
        addEl(td, makeEventTextInput(event, index));
        addEl(tr, td);

        return tr;
    };

    var makeEventNameInput = function (event, index) {
        const input = makeEl('input');
        addClass(input, 'isStoryEditable');
        input.value = event.name;
        input.eventIndex = index;
        input.addEventListener('change', updateEventName);
        return input;
    };

    var makeEventTextInput = function (event, index) {
        const input = makeEl('textarea');
        addClass(input, 'isStoryEditable');
        addClass(input, 'eventText');
        input.value = event.text;
        input.eventIndex = index;
        input.addEventListener('change', updateEventText);
        return input;
    };

    var onChangeDateTimeCreator = function (myInput) {
        return function (dp, input) {
            DBMS.setEventOriginProperty(Stories.getCurrentStoryName(), myInput.eventIndex, 'time', input.val(), Utils.processError());
            //            StoryEvents.lastDate = input.val();
            removeClass(myInput, 'defaultDate');
        };
    };

    var updateEventName = function (event) {
        const input = event.target;
        DBMS.setEventOriginProperty(Stories.getCurrentStoryName(), input.eventIndex, 'name', input.value, Utils.processError(exports.refresh));
    };

    var updateEventText = function (event) {
        const input = event.target;
        DBMS.setEventOriginProperty(Stories.getCurrentStoryName(), input.eventIndex, 'text', input.value, Utils.processError());
    };
})(this.StoryEvents = {});

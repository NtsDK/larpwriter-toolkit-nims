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

const vis = require('vis');
require('vis/dist/vis.min.css');
const R = require('ramda');

const PermissionInformer = require('permissionInformer');

const dateFormat = require('dateformat');

'use strict';

// ((exports) => {
const state = {};
const root = '.timeline-tab';

exports.init = () => {
    U.listen(U.queryEl('#timelineStorySelector'), 'change', onStorySelectorChangeDelegate);

    state.TimelineDataset = new vis.DataSet();
    state.TagDataset = new vis.DataSet();

    U.queryEls(`${root} input[name=timelineFilter]`).map(U.listen(R.__, 'change', refreshTimeline));
    U.queryEl('#timelineFilterByStory').checked = true;

    // specify options
    const options = {
        orientation: 'top',
        showCurrentTime: false,
        //        editable : {
        //            updateTime : true
        //        },
        //        onMove : function (item, callback) {
        //            if (item.storyName) {
        //                DBMS.setEventTime(item.storyName, item.eventIndex, item.start, function(err){
        //                    if(err) {UI.handleError(err); return;}
        //                    callback(item);
        //                });
        //            }
        //        },
        //        multiselect : true
    };

    const timeline = new vis.Timeline(U.queryEl('#timelineContainer'), null, options);
    timeline.setGroups(state.TagDataset);
    timeline.setItems(state.TimelineDataset);
    state.timelineComponent = timeline;

    exports.content = U.queryEl(root);
};

exports.refresh = () => {
    Promise.all([
        DBMS.getMetaInfo(),
        DBMS.getEventsTimeInfo(),
        PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }),
        PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
    ]).then((results) => {
        const [metaInfo, eventsTimeInfo, allStoryNames, allCharacterNames] = results;

        state.postDate = metaInfo.date;
        state.preDate = metaInfo.preGameDate;

        const endDate = new Date(state.postDate);
        const startDate = new Date(state.preDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        startDate.setFullYear(startDate.getFullYear() - 1);

        state.timelineComponent.setOptions({
            end: endDate,
            start: startDate,
        });

        state.eventsTimeInfo = eventsTimeInfo;
        state.eventsByStories = R.groupBy(R.prop('storyName'), eventsTimeInfo);
        state.eventsByCharacters = R.uniq(R.flatten(eventsTimeInfo.map(event => event.characters)));
        state.eventsByCharacters = R.zipObj(
            state.eventsByCharacters,
            R.ap([R.clone], R.repeat([], state.eventsByCharacters.length))
        );
        eventsTimeInfo.forEach(event => event.characters.forEach(character => state.eventsByCharacters[character].push(event)));
        suffixy(allStoryNames, state.eventsByStories);
        state.allStoryNames = allStoryNames;
        suffixy(allCharacterNames, state.eventsByCharacters);
        state.allCharacterNames = allCharacterNames;
        refreshTimeline();
    }).catch(UI.handleError);
};

function suffixy(entityNames, data) {
    entityNames.forEach((nameInfo) => {
        nameInfo.hasEvents = data[nameInfo.value] !== undefined;
    });
}

function refreshTimeline() {
    const selectorValues = U.queryEl('#timelineFilterByStory').checked ? state.allStoryNames : state.allCharacterNames;

    const selector = U.clearEl(U.queryEl('#timelineStorySelector'));
    U.fillSelector(selector, selectorValues.map(obj => ({
        name: obj.displayName,
        value: obj.value,
        className: obj.hasEvents
            ? 'fa-icon finished transparent-icon select-icon-padding'
            : 'fa-icon empty icon-padding select-icon-padding'
    })));
    U.setAttr(selector, 'size', selectorValues.length > 15 ? 15 : selectorValues.length);

    if (selectorValues.length !== 0) {
        selector.options[0].selected = true;
        onStorySelectorChange([selectorValues[0].value]);
    }
}

function onStorySelectorChangeDelegate(event) {
    onStorySelectorChange(U.nl2array(event.target.selectedOptions).map(opt => opt.value));
}

const prepareLabel = label => `<span class="timeline-label">${label}</span>`;

function onStorySelectorChange(entityNames) {
    state.TagDataset.clear();
    state.TimelineDataset.clear();

    state.TagDataset.add(entityNames.map(entityName => R.always({ id: entityName, content: entityName })()));

    const byStory = U.queryEl('#timelineFilterByStory').checked;
    const data = byStory ? state.eventsByStories : state.eventsByCharacters;
    entityNames = R.intersection(entityNames, R.keys(data));
    const usedData = R.pick(entityNames, data);
    fillTimelines(usedData);
    const events = R.uniq(R.flatten(R.values(usedData))
        .map((event) => {
            event.time = new Date(event.time !== '' ? event.time : state.postDate);
            event.characters.sort(CU.charOrdA);
            return event;
        }));

    events.sort(CU.charOrdAFactory(R.prop('time')));

    U.addEls(U.clearEl(U.queryEl(`${root} .timeline-list`)), events.map((event) => {
        const row = U.qmte(`${root} .timeline-event-tmpl`);
        U.addEl(U.qee(row, '.time'), U.makeText(dateFormat(event.time, 'yyyy/mm/dd h:MM')));
        U.addEl(U.qee(row, '.story-name'), U.makeText(event.storyName));
        U.addEl(U.qee(row, '.event-name'), U.makeText(event.name));
        U.addEl(U.qee(row, '.characters'), U.makeText(event.characters.join(', ')));
        return row;
    }));

    if (entityNames[0]) {
        state.TimelineDataset.add({
            content: prepareLabel(L10n.getValue('overview-pre-game-end-date')),
            start: new Date(state.postDate),
            group: entityNames[0],
            className: 'importantItem',
            editable: false
        });
        state.TimelineDataset.add({
            content: prepareLabel(L10n.getValue('overview-pre-game-start-date')),
            start: new Date(state.preDate),
            group: entityNames[0],
            className: 'importantItem',
            editable: false
        });
    }
}

function fillTimelines(usedData) {
    state.TimelineDataset.add(R.flatten(R.toPairs(usedData).map((pair) => {
        const entityName = pair[0];
        return pair[1].map(event => ({
            content: prepareLabel(event.name),
            start: event.time !== '' ? event.time : state.postDate,
            group: entityName
        }));
    })));
}
// })(window.Timeline = {});

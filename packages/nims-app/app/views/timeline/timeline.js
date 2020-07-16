
import vis from "vis";
import dateFormat from "dateformat";
import 'vis/dist/vis.min.css';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';

/* eslint-disable-next-line import/no-unresolved */
import PermissionInformer from "permissionInformer";

import { getTimelineEventTemplate } from "./TimelineEventTemplate.jsx";
import { getTimelineTemplate } from "./TimelineTemplate.jsx";

const root = '.timeline-tab';

const prepareLabel = label => `<span class="timeline-label">${label}</span>`;

function suffixy(entityNames, data) {
    entityNames.forEach((nameInfo) => {
        nameInfo.hasEvents = data[nameInfo.value] !== undefined;
    });
}

export class Timeline {

    state = {};

    content;

    constructor({L10n, DBMS}) {
        this.onStorySelectorChangeDelegate = this.onStorySelectorChangeDelegate.bind(this);
        this.refreshTimeline = this.refreshTimeline.bind(this);
        this.L10nObj = L10n;
        this.DBMSObj = DBMS;
    }

    getContent(){
        return this.content;
    }

    init(){
        this.content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), this.content);
        ReactDOM.render(getTimelineTemplate(), this.content);
        this.L10nObj.localizeStatic(this.content);

        U.listen(U.queryEl('#timelineStorySelector'), 'change', this.onStorySelectorChangeDelegate);

        this.state.TimelineDataset = new vis.DataSet();
        this.state.TagDataset = new vis.DataSet();

        U.queryEls(`${root} input[name=timelineFilter]`).map(U.listen(R.__, 'change', this.refreshTimeline));
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
        timeline.setGroups(this.state.TagDataset);
        timeline.setItems(this.state.TimelineDataset);
        this.state.timelineComponent = timeline;

        this.content = U.queryEl(root);
    };

    refresh(){
        Promise.all([
            this.DBMSObj.getMetaInfo(),
            this.DBMSObj.getEventsTimeInfo(),
            PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }),
            PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
        ]).then((results) => {
            const [metaInfo, eventsTimeInfo, allStoryNames, allCharacterNames] = results;

            this.state.postDate = metaInfo.date;
            this.state.preDate = metaInfo.preGameDate;

            const endDate = new Date(this.state.postDate);
            const startDate = new Date(this.state.preDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            startDate.setFullYear(startDate.getFullYear() - 1);

            this.state.timelineComponent.setOptions({
                end: endDate,
                start: startDate,
            });

            this.state.eventsTimeInfo = eventsTimeInfo;
            this.state.eventsByStories = R.groupBy(R.prop('storyName'), eventsTimeInfo);
            this.state.eventsByCharacters = R.uniq(R.flatten(eventsTimeInfo.map(event => event.characters)));
            this.state.eventsByCharacters = R.zipObj(
                this.state.eventsByCharacters,
                R.ap([R.clone], R.repeat([], this.state.eventsByCharacters.length))
            );
            eventsTimeInfo.forEach(event => event.characters.forEach(character => this.state.eventsByCharacters[character].push(event)));
            suffixy(allStoryNames, this.state.eventsByStories);
            this.state.allStoryNames = allStoryNames;
            suffixy(allCharacterNames, this.state.eventsByCharacters);
            this.state.allCharacterNames = allCharacterNames;
            this.refreshTimeline();
        }).catch(UI.handleError);
    };

    refreshTimeline() {
        const selectorValues = U.queryEl('#timelineFilterByStory').checked ? this.state.allStoryNames : this.state.allCharacterNames;

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
            this.onStorySelectorChange([selectorValues[0].value]);
        }
    }

    onStorySelectorChangeDelegate(event) {
        this.onStorySelectorChange(U.nl2array(event.target.selectedOptions).map(opt => opt.value));
    }

    onStorySelectorChange(entityNames) {
        this.state.TagDataset.clear();
        this.state.TimelineDataset.clear();

        this.state.TagDataset.add(entityNames.map(entityName => R.always({ id: entityName, content: entityName })()));

        const byStory = U.queryEl('#timelineFilterByStory').checked;
        const data = byStory ? this.state.eventsByStories : this.state.eventsByCharacters;
        entityNames = R.intersection(entityNames, R.keys(data));
        const usedData = R.pick(entityNames, data);
        this.fillTimelines(usedData);
        const events = R.uniq(R.flatten(R.values(usedData))
            .map((event) => {
                event.time = new Date(event.time !== '' ? event.time : this.state.postDate);
                event.characters.sort(CU.charOrdA);
                return event;
            }));

        events.sort(CU.charOrdAFactory(R.prop('time')));

        U.addEls(U.clearEl(U.queryEl(`${root} .timeline-list`)), events.map((event) => {
            const content = U.makeEl('div');
            ReactDOM.render(getTimelineEventTemplate({
                time: dateFormat(event.time, 'yyyy/mm/dd h:MM'),
                storyName: event.storyName,
                eventName: event.name,
                characters: event.characters.join(', '),
            }), content);
            return U.qee(content, '.row');
        }));

        if (entityNames[0]) {
            this.state.TimelineDataset.add({
                content: prepareLabel(this.L10nObj.getValue('overview-pre-game-end-date')),
                start: new Date(this.state.postDate),
                group: entityNames[0],
                className: 'importantItem',
                editable: false
            });
            this.state.TimelineDataset.add({
                content: prepareLabel(this.L10nObj.getValue('overview-pre-game-start-date')),
                start: new Date(this.state.preDate),
                group: entityNames[0],
                className: 'importantItem',
                editable: false
            });
        }
    }

    fillTimelines(usedData) {
        this.state.TimelineDataset.add(R.flatten(R.toPairs(usedData).map((pair) => {
            const entityName = pair[0];
            return pair[1].map(event => ({
                content: prepareLabel(event.name),
                start: event.time !== '' ? event.time : this.state.postDate,
                group: entityName
            }));
        })));
    }
}

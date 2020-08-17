import React, { Component } from 'react';
import './TimelineCore.css';
import { UI, U, L10n } from 'nims-app-core';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import PermissionInformer from 'permissionInformer';
import { classNames } from 'classnames';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect
} from 'react-router-dom';

import {
  NavButton, NavSeparator, NavViewLink, NavContainer
} from '../../commons/NavComponent.jsx';
import { TimelineList } from './TimelineList.jsx';
import { InteractiveTimeline } from './InteractiveTimeline.jsx';
import { EventGroupSelector } from './EventGroupSelector.jsx';

function suffixy(entityNames, data) {
  entityNames.forEach((nameInfo) => {
    nameInfo.hasEvents = data[nameInfo.value] !== undefined;
  });
}

export class TimelineCore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allStoryNames: [],
      allCharacterNames: [],
      timelineFilter: 'ByStory',
      eventsByStories: {},
      eventsByCharacters: {},
      selectedValues: []
    };
    this.onTimelineFilterChange = this.onTimelineFilterChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('TimelineCore mounted');
  }

  componentDidUpdate() {
    console.log('TimelineCore did update');
  }

  componentWillUnmount() {
    console.log('TimelineCore will unmount');
  }

  onSelectChange(e) {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    this.setState({
      selectedValues: value
    });
    // console.log(value);
  }

  onTimelineFilterChange(e) {
    const { value } = e.target;
    this.setState((prevState) => {
      const selectorValues = value === 'ByStory' ? prevState.allStoryNames : prevState.allCharacterNames;
      return {
        timelineFilter: value,
        selectedValues: selectorValues.length > 0 ? [selectorValues[0].value] : []
      };
    });
  }

  refresh() {
    const { dbms } = this.props;
    Promise.all([
      dbms.getMetaInfo(),
      dbms.getEventsTimeInfo(),
      PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
    ]).then((results) => {
      const [metaInfo, eventsTimeInfo, allStoryNames, allCharacterNames] = results;
      // this.state.eventsTimeInfo = eventsTimeInfo;
      const eventsByStories = R.groupBy(R.prop('storyName'), eventsTimeInfo);
      const eventsByCharacters1 = R.uniq(R.flatten(eventsTimeInfo.map((event) => event.characters)));
      const eventsByCharacters = R.zipObj(
        eventsByCharacters1,
        R.ap([R.clone], R.repeat([], eventsByCharacters1.length))
      );
      eventsTimeInfo.forEach((event) => event.characters.forEach((character) => eventsByCharacters[character].push(event)));
      suffixy(allStoryNames, eventsByStories);
      suffixy(allCharacterNames, eventsByCharacters);
      this.setState((prevState) => {
        const selectorValues = prevState.timelineFilter === 'ByStory' ? allStoryNames : allCharacterNames;
        return {
          postDate: metaInfo.date,
          preDate: metaInfo.preGameDate,
          allStoryNames,
          allCharacterNames,
          eventsByStories,
          eventsByCharacters,
          selectedValues: selectorValues.length > 0 ? [selectorValues[0].value] : []
        };
      });
    }).catch(UI.handleError);
  }

  render() {
    const {
      timelineFilter, allStoryNames, allCharacterNames, selectedValues, eventsByStories, eventsByCharacters, postDate, preDate
    } = this.state;
    const { t } = this.props;

    const selectorValues = timelineFilter === 'ByStory' ? allStoryNames : allCharacterNames;

    // const byStory = U.queryEl('#timelineFilterByStory').checked;
    const data = timelineFilter === 'ByStory' ? eventsByStories : eventsByCharacters;
    const entityNames = R.intersection(selectedValues, R.keys(data));
    const usedData = R.pick(entityNames, data);
    // this.fillTimelines(usedData);
    const events = R.uniq(R.flatten(R.values(usedData))
      .map((event) => {
        event.time = new Date(event.time !== '' ? event.time : postDate);
        event.characters.sort(CU.charOrdA);
        return event;
      }));

    events.sort(CU.charOrdAFactory(R.prop('time')));

    return (
      <div className="TimelineCore timeline-tab block">
        <div className="flex-row">
          <div className="storySelectorContainer">
            <EventGroupSelector
              timelineFilter={timelineFilter}
              onTimelineFilterChange={this.onTimelineFilterChange}
              selectedValues={selectedValues}
              selectorValues={selectorValues}
              onSelectChange={this.onSelectChange}
            />
          </div>
          <div className="panel panel-default flex-1-1-auto">
            <div className="panel-body">
              <NavContainer className="sub-tab-navigation">
                <NavViewLink labelKey="timeline.list" to="/timeline/list" />
                <NavViewLink labelKey="timeline.interactive" to="/timeline/interactive" />
              </NavContainer>
              <Switch>
                <Route path="/timeline/list">
                  <TimelineList events={events} />
                </Route>
                <Route path="/timeline/interactive">
                  <InteractiveTimeline
                    selectedValues={selectedValues}
                    usedData={usedData}
                    postDate={postDate}
                    preDate={preDate}
                    t={t}
                  />
                </Route>
                <Redirect to="/timeline/list" />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Timeline.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';

import { nl2array } from '../../../utils/domUtils';
import TimelineList from './TimelineList';
import TimelineDiagram from './TimelineDiagram';

const MAX_LINES = 15;

export default class Timeline extends Component {
  state = {
    mode: 'ByStory',
    selectedValues: []
  };

  componentDidMount = () => {
    console.log('Timeline mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Timeline did update');
  }

  componentWillUnmount = () => {
    console.log('Timeline will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getMetaInfo(),
      dbms.getEventsTimeInfo(),
      dbms.getEntityNamesArray({ type: 'story' }),
      dbms.getEntityNamesArray({ type: 'character' }),
    ]).then((results) => {
      const [metaInfo, eventsTimeInfo, allStoryNames, allCharacterNames] = results;
      this.setState({
        metaInfo, eventsTimeInfo, allStoryNames, allCharacterNames
      });
    });
  }

  onChange = (event) => {
    // console.log(event);
    const selectedValues = nl2array(event.target.selectedOptions).map(opt => opt.value);
    this.setState({
      selectedValues
    });
  }

  setModeState = mode => () => {
    this.setState(state => (state.mode !== mode ? {
      mode,
      selectedValues: []
    } : null));
  }

  render() {
    const {
      mode, metaInfo, eventsTimeInfo, allStoryNames, allCharacterNames, selectedValues
    } = this.state;
    const { t, dbms } = this.props;

    const selectorValues = mode === 'ByStory' ? allStoryNames : allCharacterNames;

    if (!eventsTimeInfo) {
      // return <div> Timeline stub </div>;

      return null;
    }
    return (
      <div className="Timeline block">
        <Route path="/timeline" render={() => <Redirect to="/timeline/eventList" />} exact />
        <div className="flex-row">
          <div className="storySelectorContainer">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">{t('timeline.timeline')}</h3>
              </div>
              <div className="panel-body panel-resizable">
                <div>
                  <input
                    type="radio"
                    name="timelineFilter"
                    value="ByStory"
                    id="timelineFilterByStory"
                    checked={mode === 'ByStory'}
                    onClick={this.setModeState('ByStory')}
                  />
                  <label htmlFor="timelineFilterByStory" className="radio-label-icon common-radio">
                    <span>{t('timeline.filter-by-stories')}</span>
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="timelineFilter"
                    value="ByCharacter"
                    id="timelineFilterByCharacter"
                    checked={mode === 'ByCharacter'}
                    onClick={this.setModeState('ByCharacter')}
                  />
                  <label htmlFor="timelineFilterByCharacter" className="radio-label-icon common-radio">
                    <span>{t('timeline.filter-by-characters')}</span>
                  </label>
                </div>

                <input selector-filter="#timelineStorySelector" />
                <select
                  size={Math.min(MAX_LINES, selectorValues.length)}
                  id="timelineStorySelector"
                  multiple
                  className="form-control"
                  onChange={this.onChange}
                >
                  {
                    selectorValues.map(value => (
                      <option
                        value={value}
                        selected={selectedValues.includes(value)}
                      >
                        {value}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>
          <div className="flex-1-1-auto">
            <nav className="view-switch ">
              <ul>
                <li>
                  <NavLink to="/timeline/eventList">{t('timeline.list')}</NavLink>
                </li>
                <li>
                  <NavLink to="/timeline/interactiveDiagram">{t('timeline.interactive')}</NavLink>
                </li>
              </ul>
            </nav>

            <Route path="/timeline/eventList" render={() => <TimelineList dbms={dbms} />} />
            <Route path="/timeline/interactiveDiagram" render={() => <TimelineDiagram dbms={dbms} />} />
            {/* <Route path="/characterSheets/export" render={() => <CharSheetExport dbms={dbms} />} /> */}
            {/* <div className="panel panel-default">

              <div className="panel-body" >
            </div> */}
          </div>
        </div>
      </div>
    );
  }
}

// <ul class="nav nav-pills margin-bottom-16">
//   <li class="btn-default active"><a href="#timeline-list" data-toggle="tab" l10n-id="timeline-list"></a>
//   </li>
//   <li class="btn-default"><a href="#timeline-interactive" data-toggle="tab" l10n-id="timeline-interactive"></a></li>
// </ul>


// <div class="tab-content clearfix">
//   <div class="tab-pane active" id="timeline-list">
//     <div class="container-fluid">
//       <div class="row margin-bottom-8">
//         <div class="col-xs-2 white-space-normal" style="font-weight: bold;" l10n-id="timeline-time"></div>
//         <div class="col-xs-2 white-space-normal" style="font-weight: bold;" l10n-id="timeline-story-name"></div>
//         <div class="col-xs-3 white-space-normal" style="font-weight: bold;" l10n-id="timeline-event-name"></div>
//         <div class="col-xs-5 white-space-normal" style="font-weight: bold;" l10n-id="timeline-characters"></div>
//       </div>
//     </div>
//     <div class="container-fluid timeline-list"></div>
//   </div>
//   <div class="tab-pane" id="timeline-interactive">
//     <div class="visualObjectContainer full-screen-elem " id="timelineContainer"></div>
//   </div>
// </div>


// {/* <template class="timeline-event-tmpl">
// <div class="row">
//   <div class="col-xs-2 white-space-normal time"></div>
//   <div class="col-xs-2 white-space-normal story-name"></div>
//   <div class="col-xs-3 white-space-normal event-name"></div>
//   <div class="col-xs-5 white-space-normal characters"></div>
// </div>
// </template> */}

Timeline.propTypes = {
  // bla: PropTypes.string,
};

Timeline.defaultProps = {
  // bla: 'test',
};

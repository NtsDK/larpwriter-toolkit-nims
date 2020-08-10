import React, { Component } from 'react';
import PermissionInformer from 'permissionInformer';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect,
  useParams,
  useHistory
} from 'react-router-dom';
import './Adaptations.css';

import { AdaptationsStorySelector } from './AdaptationsStorySelector';
import { InlineNotification } from '../../commons/uiCommon3.jsx';

function getEntityStatus(object) {
  if (object.isEmpty) return 'empty';
  if (object.isFinished) return 'finished';
  return 'unfinished';
  // if (object.isEmpty) return 'fa-icon empty select-icon-padding';
  // if (object.isFinished) return 'fa-icon finished select-icon-padding';
  // return 'fa-icon finished transparent-icon select-icon-padding';
}

export class Adaptations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOnlyUnfinishedStories: false,
      allStoryNames: null,
      storyNames: null,
      storyNames2: null
    };
  }

  componentDidMount() {
    this.refresh();
    console.log('Adaptations mounted');
  }

  componentDidUpdate() {
    console.log('Adaptations did update');
  }

  componentWillUnmount() {
    console.log('Adaptations will unmount');
  }

  refresh() {
    const { showOnlyUnfinishedStories } = this.state;
    Promise.all([
      PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }),
      DBMS.getFilteredStoryNames({ showOnlyUnfinishedStories })
    ]).then((results) => {
      const [allStoryNames, storyNames] = results;

      const filteredArr = R.indexBy(R.prop('storyName'), storyNames);

      const storyNames2 = allStoryNames.filter((story) => R.contains(story.value, R.keys(filteredArr))).map((story) => {
        const elem = filteredArr[story.value];
        elem.status = getEntityStatus(elem);
        elem.displayName = story.displayName;
        elem.value = story.value;
        return elem;
      });

      this.setState({
        allStoryNames,
        storyNames,
        storyNames2
      });
    }).catch(UI.handleError);
  }

  render() {
    const { allStoryNames, storyNames, storyNames2 } = this.state;
    const { t } = this.props;
    if (allStoryNames === null) {
      return null;
    }

    return (
      <div className="Adaptations adaptations-tab block">
        <Switch>
          <Route path="/adaptations/:id" />
          <Route path="/adaptations">
            {storyNames.length > 0 && <Redirect to={`/adaptations/${storyNames[0].storyName}`} />}
          </Route>
        </Switch>

        <InlineNotification type="info" showIf={storyNames.length === 0}>
          {t('advices.no-story')}
        </InlineNotification>

        <div className="adaptations-content">
          <div className="main-container">
            <div>
              <div id="personalStoriesCharacterContainer">
                <Route path="/adaptations/:id">
                  <AdaptationsStorySelector options={storyNames2} />
                </Route>
                <div>Filter</div>

                {/* <div className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title" l10n-id="adaptations-filter" />
                  </div>
                  <div className="panel-body">

                    <div>
                      <input type="radio" name="adaptationFilter" value="ByCharacter" id="adaptationFilterByCharacter" className="hidden" />
                      <label htmlFor="adaptationFilterByCharacter" className="radio-label-icon common-radio"><span l10n-id="adaptations-by-characters" /></label>
                    </div>
                    <div>
                      <input type="radio" name="adaptationFilter" value="ByEvent" id="adaptationFilterByEvent" className="hidden" />
                      <label htmlFor="adaptationFilterByEvent" className="radio-label-icon common-radio"><span l10n-id="adaptations-by-events" /></label>
                    </div>

                    <div id="events-characterSelectorDiv">
                      <h4 l10n-id="adaptations-characters" />
                      <select id="events-characterSelector" className="form-control" multiple />
                    </div>
                    <div id="events-eventSelectorDiv" className="hidden">
                      <h4 l10n-id="adaptations-events" />
                      <select id="events-eventSelector" className="form-control" multiple size={15} />
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
            <div>Adaptation cards</div>
            {/* <div id="personalStories" style={{ flexGrow: 1 }} /> */}
          </div>
        </div>
      </div>
    );
  }
}

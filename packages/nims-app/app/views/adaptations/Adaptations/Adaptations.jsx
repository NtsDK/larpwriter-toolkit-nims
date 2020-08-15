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
import { AdaptationsContent } from './AdaptationsContent';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { getEntityStatus } from '../adaptationUtils';

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
            {/* <div> */}
            <div id="personalStoriesCharacterContainer">
              <Route path="/adaptations/:id">
                <AdaptationsStorySelector options={storyNames2} />
              </Route>
            </div>
            <Route
              path="/adaptations/:id"
              render={({ match }) => {
                const { id } = match.params;
                return (
                  // <div className="panel-body">
                  <AdaptationsContent
                    key={id}
                    storyName={id}
                    // isAdaptationsMode
                    // characterProfileStructure={characterProfileStructure}
                  />
                  // </div>
                );
              }}
            />
            {/* <AdaptationsContent /> */}
          </div>
        </div>
      </div>
    );
  }
}

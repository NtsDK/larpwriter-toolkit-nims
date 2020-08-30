import React, { useContext, useEffect, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import PermissionInformer from 'permissionInformer';
import {
  NavLink, Route, Redirect
} from 'react-router-dom';
import {
  NavButton, NavSeparator, NavViewLink, NavContainer
} from '../../commons/NavComponent.jsx';
import './Stories.css';

// import { CharacterProfile } from './CharacterProfile';
// import { StoryReport } from './StoryReport';
// import { RelationReport } from './RelationReport';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { EntityNav } from '../../commons/EntityNav';
import { CreateStoryDialog } from './CreateStoryDialog.jsx';
import { StoryDropdown } from './StoryDropdown.jsx';
import { WriterStory } from './WriterStory.jsx';
import { EventPresence } from './EventPresence.jsx';

export function Stories(props) {
  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }).then((allStoryNames) => {
      setState({ allStoryNames });
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  if (!state) {
    return null;
  }

  const { allStoryNames } = state;

  const storyList = allStoryNames.map((el) => ({
    primaryName: el.displayName
  }));

  function getEntityDropdown(entity) {
    return (
      <StoryDropdown
        entity={entity}
        primaryNames={storyList}
        refresh={refresh}
      />
    );
  }

  return (

    <div className="Stories block">
      <Route path="/stories">
        {allStoryNames.length > 0 && <Redirect to={`/stories/${allStoryNames[0].displayName}`} />}
      </Route>
      <div className="container-fluid height-100p">
        <div className="row height-100p">
          <div className="col-xs-3 height-100p">
            <Route path={['/stories/:id', '/stories']}>
              <EntityNav
                entityList={storyList}
                createEntityText="stories.create-entity"
                entityUrl="/stories"
                createEntityDialog={<CreateStoryDialog refresh={refresh} />}
                getEntityDropdown={getEntityDropdown}
              />
            </Route>
          </div>

          <div className="col-xs-9 content-column height-100p">
            <InlineNotification type="info" showIf={allStoryNames.length === 0}>
              {t('advices.no-story')}
            </InlineNotification>

            <Route
              path="/stories/:id"
              render={({ match }) => {
                const { id } = match.params;
                if (R.pluck('primaryName', storyList).includes(id)) {
                  return null;
                }
                return (
                  <InlineNotification type="info" showIf>
                    {t('advices.story-not-found', { storyName: id })}
                  </InlineNotification>
                );
              }}
            />

            <Route
              path="/stories/:id"
              exact
              render={({ match }) => {
                const { id } = match.params;
                return (
                  // <Redirect to={`/stories/${id}/writerStory`} />
                  <Redirect to={`/stories/${id}/eventPresence`} />
                );
              }}
            />

            <Route
              path="/stories/:id"
              render={({ match }) => {
                const { id } = match.params;
                return (
                  <>
                    <NavContainer className="sub-tab-navigation">
                      <NavViewLink labelKey="header.writer-story" to={`/stories/${id}/writerStory`} />
                      <NavViewLink labelKey="header.story-events" to={`/stories/${id}/storyEvents`} />
                      <NavViewLink labelKey="header.story-characters" to={`/stories/${id}/storyCharacters`} />
                      <NavViewLink labelKey="header.event-presence" to={`/stories/${id}/eventPresence`} />
                    </NavContainer>
                    <Route path="/stories/:id/writerStory">
                      <WriterStory storyName={id} key={id} />
                    </Route>
                    <Route path="/stories/:id/eventPresence">
                      <EventPresence storyName={id} key={id} />
                    </Route>
                    {/* <StoryReport id={id} />
                    <RelationReport id={id} />
                    <CharacterProfile key={id} id={id} /> */}
                  </>
                );
              }}
            />
            {/* <Route
              path="/characters/characterEditor/:id"
              render={({ match }) => {
                const { id } = match.params;

                return (
                  <>
                    <StoryReport id={id} />
                    <RelationReport id={id} />
                    <CharacterProfile key={id} id={id} />
                  </>
                );
              }}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

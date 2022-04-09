import React, {
  useContext, useEffect, useState, useMemo
} from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';
import { Constants } from 'nims-dbms';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import {
  NavLink, Route, Redirect
} from 'react-router-dom';
import EventEmitter from 'events';
import {
  NavButton, NavSeparator, NavViewLink, NavContainer
} from '../../commons/NavComponent.jsx';
import './Stories.css';

import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { EntityNav } from '../../commons/EntityNav';
import { CreateStoryDialog } from './CreateStoryDialog.jsx';
import { StoryDropdown } from './StoryDropdown.jsx';
import { WriterStory } from './WriterStory.jsx';
import { EventPresence } from './EventPresence.jsx';
import { StoryEvents } from './StoryEvents.jsx';
import { CreateStoryEventDialog } from './CreateStoryEventDialog.jsx';
import { AddStoryCharacterDialog } from './AddStoryCharacterDialog.jsx';
import { StoryCharacters } from './StoryCharacters/StoryCharacters.jsx';

export function Stories(props) {
  const { t } = useTranslation();
  const { dbms, permissionInformer } = useContext(DbmsContext);

  const [state, setState] = useState(null);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showAddCharacterDialog, setShowAddCharacterDialog] = useState(false);

  function refresh() {
    permissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }).then((allStoryNames) => {
      setState({ allStoryNames });
    }).catch(UI.handleError);
  }

  const ee = useMemo(() => new EventEmitter(), []);

  // ee.on('eventsChange', () => console.log('on eventsChange'));
  // ee.on('charactersChange', () => console.log('on charactersChange'));

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

  function showCreateEvent() {
    setShowCreateEventDialog(true);
  }
  function hideCreateEvent() {
    setShowCreateEventDialog(false);
  }
  function showAddCharacter() {
    setShowAddCharacterDialog(true);
  }
  function hideAddCharacter() {
    setShowAddCharacterDialog(false);
  }
  function onCreateEvent() {
    ee.emit('eventsChange');
  }
  function onCharacterAdded() {
    ee.emit('charactersChange');
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
                  <Redirect to={`/stories/${id}/storyEvents`} />
                );
              }}
            />

            <Route
              path="/stories/:id"
              render={({ match }) => {
                const { id } = match.params;
                return (
                  <>
                    <div className="tw-flex">
                      <NavContainer className="sub-tab-navigation tw-flex-auto">
                        <NavViewLink labelKey="header.writer-story" to={`/stories/${id}/writerStory`} />
                        <NavViewLink labelKey="header.story-events" to={`/stories/${id}/storyEvents`} />
                        <NavViewLink labelKey="header.story-characters" to={`/stories/${id}/storyCharacters`} />
                        <NavViewLink labelKey="header.event-presence" to={`/stories/${id}/eventPresence`} />
                      </NavContainer>

                      <div>
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon create event flex-0-0-auto icon-padding isStoryEditable tw-mr-4"
                          onClick={showCreateEvent}
                        >
                          <span>{t('stories.create-event')}</span>
                        </button>
                        {
                          showCreateEventDialog
                        && (
                          <CreateStoryEventDialog
                            show={showCreateEventDialog}
                            onCancel={hideCreateEvent}
                            storyName={id}
                            onCreate={onCreateEvent}
                          />
                        )
                        }
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon add character flex-0-0-auto icon-padding isStoryEditable"
                          onClick={showAddCharacter}
                        >
                          <span>{t('stories.add-character')}</span>
                        </button>
                        {
                          showAddCharacterDialog
                        && (
                          <AddStoryCharacterDialog
                            show={showAddCharacterDialog}
                            onCancel={hideAddCharacter}
                            storyName={id}
                            onAdd={onCharacterAdded}
                          />
                        )
                        }
                      </div>
                    </div>
                    <Route path="/stories/:id/writerStory">
                      <WriterStory storyName={id} key={id} />
                    </Route>
                    <Route path="/stories/:id/eventPresence">
                      <EventPresence storyName={id} key={id} ee={ee} />
                    </Route>
                    <Route path="/stories/:id/storyCharacters">
                      <StoryCharacters storyName={id} key={id} ee={ee} />
                    </Route>
                    <Route path="/stories/:id/storyEvents">
                      <StoryEvents storyName={id} key={id} ee={ee} />
                    </Route>
                  </>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

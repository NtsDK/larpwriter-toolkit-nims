import React, { Component, useContext } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch, useHistory, useRouteMatch
} from 'react-router-dom';
import { CU } from 'nims-dbms-core';
import * as R from 'ramda';
import Button from 'react-bootstrap/es/Button';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { useTranslation } from 'react-i18next';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ModalTrigger } from '../../../commons/uiCommon3/ModalTrigger.jsx';
import { RemoveStoryEventDialog } from './RemoveStoryEventDialog.jsx';
import { MergeStoryEventsDialog } from './MergeStoryEventsDialog.jsx';
import './StoryEventDropdown.css';

export function StoryEventDropdown(props) {
  const {
    event, nextEvent, storyName, refresh
  } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function cloneEvent() {
    dbms.cloneEvent({
      storyName,
      index: event.index
    }).then(refresh, UI.handleError);
  }

  return (
    <Dropdown pullRight>
      <Dropdown.Toggle
        noCaret
        className="btn btn-default fa-icon kebab story-event-dropdown-btn"
      />
      <Dropdown.Menu>
        <MenuItem onClick={cloneEvent}>{t('stories.clone-event')}</MenuItem>
        {
          !!nextEvent && (
            <ModalTrigger
              modal={(
                <MergeStoryEventsDialog
                  storyName={storyName}
                  event={event}
                  nextEvent={nextEvent}
                  onMerge={refresh}
                />
              )}
            >
              <MenuItem>
                {t('stories.merge-events')}
              </MenuItem>
            </ModalTrigger>
          )
        }
        <MenuItem divider />
        <ModalTrigger
          modal={(
            <RemoveStoryEventDialog
              storyName={storyName}
              event={event}
              onRemove={refresh}
            />
          )}
        >
          <MenuItem>
            {t('stories.remove-event')}
          </MenuItem>
        </ModalTrigger>
      </Dropdown.Menu>
    </Dropdown>
  );
}

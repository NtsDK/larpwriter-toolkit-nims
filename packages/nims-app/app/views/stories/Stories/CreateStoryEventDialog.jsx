import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { FormDialog } from '../../commons/uiCommon3/FormDialog.jsx';

export function CreateStoryEventDialog(props) {
  const {
    storyName, onCreate, ...elementProps
  } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    // hard removing state, removing event doesn't work without it
    // I don't know why
    // setState(null);
    dbms.getStoryEvents({ storyName }).then((events) => {
      setState({ events });
    }).catch(UI.handleError);
  }

  useEffect(refresh, [storyName]);

  if (!state) {
    return null;
  }

  const { events } = state;

  async function onSubmit({ eventName, eventPosition }) {
    return dbms.createEvent({
      storyName,
      eventName,
      selectedIndex: Number(eventPosition)
    }).then(onCreate).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <FormDialog
      formId="replaceStoryCharacterForm"
      title={t('stories.event-creation')}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
      onSubmit={onSubmit}
    >
      <FormGroup>
        <ControlLabel>{t('stories.event-name')}</ControlLabel>
        <FormControl name="eventName" />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{t('stories.event-position')}</ControlLabel>
        <FormControl componentClass="select" name="eventPosition" defaultValue={events.length}>
          {
            events.map((event, i) => (
              <option value={i} key={String(i) + event.name}>{t('common.set-item-before2', { name: event.name })}</option>
            ))
          }
          <option value={events.length}>{t('common.set-item-as-last')}</option>
        </FormControl>
      </FormGroup>
    </FormDialog>
  );
}

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import PermissionInformer from 'permissionInformer';
import { ConfirmDialog } from '../../../commons/uiCommon3/ConfirmDialog.jsx';

export function MergeStoryEventsDialog(props) {
  const {
    event, storyName, nextEvent, onMerge, ...elementProps
  } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function onSubmit() {
    return dbms.mergeEvents({
      storyName,
      index: event.index
    }).then(onMerge, UI.handleError);
  }

  return (
    <ConfirmDialog
      message={t('stories.confirm-event-merge2', {
        eventName1: event.name,
        eventName2: nextEvent.name,
      })}
      onConfirm={onSubmit}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
    />
  );
}

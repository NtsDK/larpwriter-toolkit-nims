import React, { useContext, useEffect, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import FormControl from 'react-bootstrap/es/FormControl';
import classNames from 'classnames';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { ConfirmDialog } from '../../commons/uiCommon3/ConfirmDialog.jsx';

export function EventPresenceCell(props) {
  const {
    checked, eventIndex, characterName, eventName,
    isReady, hasText, storyName, refresh
  } = props;
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  function onChange(event) {
    if (event.target.checked) {
      dbms.addCharacterToEvent({
        storyName,
        eventIndex,
        characterName
      }).then(refresh).catch(UI.handleError);
    } else if (!hasText) {
      dbms.removeCharacterFromEvent({
        storyName,
        eventIndex,
        characterName
      }).then(refresh).catch(UI.handleError);
    } else {
      setShowConfirmDelete(true);
    }
  }

  function onDeleteConfirm() {
    dbms.removeCharacterFromEvent({
      storyName,
      eventIndex,
      characterName
    }).then(refresh).catch(UI.handleError);
    setShowConfirmDelete(false);
  }
  function onDeleteCancel() {
    setShowConfirmDelete(false);
  }

  return (
    <td className="EventPresenceCell vertical-aligned-td">
      <input
        className="isStoryEditable hidden"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        id={characterName + eventIndex}
      />
      <label htmlFor={characterName + eventIndex} className="checkbox-label checkbox-label-icon">
        {(isReady || hasText)
          && (
            <span
              title={isReady ? t('adaptations.adaptation-finished') : t('adaptations.adaptation-in-progress')}
              className={classNames('margin-left-8', {
                finished: isReady,
                'in-progress': hasText && !isReady,
              })}
            />
          )}
      </label>
      <ConfirmDialog
        show={showConfirmDelete}
        message={t('stories.remove-character-from-event-warning2', { characterName, eventName })}
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </td>
  );
}

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Constants } from 'nims-dbms';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ConfirmDialog } from '../../../commons/uiCommon3/ConfirmDialog.jsx';

export function RemoveStoryCharacterDialog(props) {
  const {
    storyName, characterName, onRemove, ...elementProps
  } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function onSubmit() {
    return dbms.removeStoryCharacter({
      storyName,
      characterName
    }).then(() => onRemove({ storyName, characterName })).catch(UI.handleError);
  }

  return (
    <ConfirmDialog
      message={t('stories.remove-character-from-story-warning2', { characterName })}
      onConfirm={onSubmit}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
    />
  );
}

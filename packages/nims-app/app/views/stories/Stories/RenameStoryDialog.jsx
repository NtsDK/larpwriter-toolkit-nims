import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import { PromptDialog } from '../../commons/uiCommon3/PromptDialog.jsx';

export function RenameStoryDialog(props) {
  const { storyName, onRename, ...elementProps } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  function onSubmit({ value: toName }) {
    return dbms.renameStory({
      fromName: storyName,
      toName
    }).then(() => onRename({
      fromName: storyName,
      toName
    })).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <PromptDialog
      title={t('stories.enter-new-story-name')}
      defaultValue={storyName}
      onSubmit={onSubmit}
      {...elementProps}
    />
  );
}

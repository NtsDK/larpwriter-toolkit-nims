import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import { PromptDialog } from '../../commons/uiCommon3/PromptDialog.jsx';

export function CommonCreateStoryDialog(props) {
  const { onCreate, ...elementProps } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function onSubmit({ value: storyName }) {
    return dbms.createStory({
      storyName
    }).then(() => onCreate({
      storyName
    })).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <PromptDialog
      title={t('stories.enter-story-name')}
      onSubmit={onSubmit}
      {...elementProps}
    />
  );
}

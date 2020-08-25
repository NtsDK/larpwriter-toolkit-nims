import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import { PromptDialog } from '../../commons/uiCommon3/PromptDialog.jsx';

export function RenameProfileDialog(props) {
  const { profileName, onRename, ...elementProps } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  function onSubmit({ value: toName }) {
    return dbms.renameProfile({
      type: 'character',
      fromName: profileName,
      toName
    }).then(() => onRename({
      fromName: profileName,
      toName
    })).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <PromptDialog
      title={t('profiles.enter-new-character-name')}
      defaultValue={profileName}
      onSubmit={onSubmit}
      {...elementProps}
    />
  );
}

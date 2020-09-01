import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import { PromptDialog } from '../../commons/uiCommon3/PromptDialog.jsx';

export function RenameProfileItemDialog(props) {
  const { profileItemName, onRename, ...elementProps } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  async function onSubmit({ value: newName }) {
    return dbms.renameProfileItem({
      type: 'character', oldName: profileItemName, newName
    }).then(onRename).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <PromptDialog
      title={t('profiles.enter-new-profile-item-name')}
      defaultValue={profileItemName}
      {...elementProps}
      onSubmit={onSubmit}
    />
  );
}

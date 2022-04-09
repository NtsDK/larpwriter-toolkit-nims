import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Constants } from 'nims-dbms';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import { PromptDialog } from '../../commons/uiCommon3/PromptDialog.jsx';

export function RenameGroupDialog(props) {
  const { groupName, onRename, ...elementProps } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function onSubmit({ value: toName }) {
    return dbms.renameGroup({
      fromName: groupName,
      toName
    }).then(() => onRename({
      fromName: groupName,
      toName
    })).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <PromptDialog
      title={t('groups.enter-new-group-name')}
      defaultValue={groupName}
      onSubmit={onSubmit}
      {...elementProps}
    />
  );
}

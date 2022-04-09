import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Constants } from 'nims-dbms';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ConfirmDialog } from '../../commons/uiCommon3/ConfirmDialog.jsx';

export function RemoveGroupDialog(props) {
  const {
    groupName, onRemove, ...elementProps
  } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function onSubmit() {
    return dbms.removeGroup({
      groupName
    }).then(() => onRemove({ groupName })).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <ConfirmDialog
      message={t('groups.are-you-sure-about-group-removing2', { groupName })}
      onConfirm={onSubmit}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
    />
  );
}

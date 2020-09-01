import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ConfirmDialog } from '../../commons/uiCommon3/ConfirmDialog.jsx';

export function RemoveProfileItemDialog(props) {
  const {
    profileItemName, onRemove, index, ...elementProps
  } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  async function onSubmit() {
    return dbms.removeProfileItem({
      type: 'character', index, profileItemName
    }).then(onRemove).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <ConfirmDialog
      message={t('profiles.are-you-sure-about-removing-profile-item2', { profileName: profileItemName })}
      onConfirm={onSubmit}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
    />
  );
}

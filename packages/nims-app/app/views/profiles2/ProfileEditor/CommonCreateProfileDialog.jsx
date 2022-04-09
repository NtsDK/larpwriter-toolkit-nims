import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Constants } from 'nims-dbms';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import { PromptDialog } from '../../commons/uiCommon3/PromptDialog.jsx';

export function CommonCreateProfileDialog(props) {
  const { profileName, onCreate, ...elementProps } = props;

  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function onSubmit({ value: profileName }) {
    return dbms.createProfile({
      type: 'character',
      characterName: profileName
    }).then(() => onCreate({
      profileName
    })).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <PromptDialog
      title={t('profiles.enter-character-name')}
      onSubmit={onSubmit}
      {...elementProps}
    />
  );
}

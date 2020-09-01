import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { FormDialog } from '../../commons/uiCommon3/FormDialog.jsx';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';

export function ChangeProfileItemTypeDialog(props) {
  const {
    profileItemName, onChange, profileItemType, ...elementProps
  } = props;
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  async function onSubmit({ newItemType }) {
    return dbms.changeProfileItemType({
      type: 'character', profileItemName, newType: newItemType
    }).then(onChange).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <FormDialog
      formId="changeProfileItemType"
      title={t('profiles.change-profile-item-type')}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
      onSubmit={onSubmit}
    >
      <FormGroup>
        <ControlLabel>{t('profiles.profile-item-type')}</ControlLabel>
        <FormControl componentClass="select" name="newItemType" autoFocus defaultValue={profileItemType}>
          {
            Constants.profileFieldTypesNames.map((value) => <option value={value} key={value}>{t(`constant.${value}`)}</option>)
          }
        </FormControl>
      </FormGroup>
      <InlineNotification type="warning">
        {t('profiles.warning-change-profile-item-is-destructive')}
      </InlineNotification>
    </FormDialog>
  );
}

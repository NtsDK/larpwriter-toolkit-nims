import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import { Constants } from 'nims-dbms';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { FormDialog } from '../../commons/uiCommon3/FormDialog.jsx';

export function CreateProfileItemDialog(props) {
  const { profileStructure, onCreate, ...elementProps } = props;
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);
  const getPositionOptions = R.pipe(R.pluck('name'), R.map((name) => t('common.set-item-before2', { name })));
  const positionOptions = [...getPositionOptions(profileStructure), t('common.set-item-as-last')];

  async function onSubmit({ itemName, itemPosition, itemType }) {
    return dbms.createProfileItem({
      type: 'character', name: itemName, itemType, selectedIndex: Number(itemPosition)
    }).then(onCreate).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <FormDialog
      formId="createProfileItem"
      title={t('profiles.create-profile-item')}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
      onSubmit={onSubmit}
    >
      <FormGroup>
        <ControlLabel>{t('profiles.profile-item-name')}</ControlLabel>
        <FormControl name="itemName" autoFocus autoComplete="off" />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{t('profiles.profile-item-position')}</ControlLabel>
        <FormControl componentClass="select" name="itemPosition" defaultValue={String(profileStructure.length)}>
          {
            positionOptions.map((name, index) => <option value={String(index)} key={String(index)}>{name}</option>)
          }
        </FormControl>
      </FormGroup>
      <FormGroup>
        <ControlLabel>{t('profiles.profile-item-type')}</ControlLabel>
        <FormControl componentClass="select" name="itemType">
          {
            Constants.profileFieldTypesNames.map((value) => <option value={value} key={value}>{t(`constant.${value}`)}</option>)
          }
        </FormControl>
      </FormGroup>
    </FormDialog>
  );
}

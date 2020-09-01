import React, { useContext, useState } from 'react';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import { UI, U, L10n } from 'nims-app-core';
import DropdownButton from 'react-bootstrap/es/DropdownButton';
import MenuItem from 'react-bootstrap/es/MenuItem';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';
import HelpBlock from 'react-bootstrap/es/HelpBlock';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';

export function EnumDefaultValueEditor(props) {
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);
  const { profileItemName, list, setList } = props;

  function setDefaultValue(e) {
    const { value } = e.target;
    const newList = [value, ...R.without([value], list)];

    dbms.updateDefaultValue({
      type: 'character',
      profileItemName,
      value: newList.join(',')
    }).then(() => {
      setList(newList);
    }).catch((err) => {
      UI.processError()(err);
    });
  }
  return (
    <div>
      <span className="tw-mr-4">{t('profiles.default-value-with-colon')}</span>
      <FormControl
        componentClass="select"
        className="tw-inline-block tw-w-auto"
        style={{ minWidth: '15rem' }}
        value={list[0]}
        onChange={setDefaultValue}
      >
        {
          R.sort(CU.charOrdA, list).map((value) => (
            <option value={value} key={value}>{value}</option>
          ))
        }
      </FormControl>
    </div>
  );
}

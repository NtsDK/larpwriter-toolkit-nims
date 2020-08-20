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

export function EnumEditor(props) {
  const dbms = useContext(DbmsContext);
  const { profileStructureItem, refresh } = props;
  // const list = profileStructureItem.value.split(',');
  // const defaultValue = list[0];
  // list.sort(CU.charOrdA);
  const [errorText, setErrorText] = useState(null);
  const [newEnum, setNewEnum] = useState('');
  const [list, setList] = useState(profileStructureItem.value.split(','));
  // const [errorText, setErrorText] = useState('sdfsdfsdf');

  // DBMS.updateDefaultValue({
  //   type: tabType,
  //   profileItemName: name,
  //   value: newVals.join(',')
  // }).then(() => {
  //   dialog.hideDlg();
  //   innerExports.refresh();
  // }, (err) => UI.setError(dialog, err));

  function onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { target } = e;
    const enumName = formData.get('enumName').trim();
    if (enumName === '' || list.includes(enumName)) {
      return;
    }
    if (enumName.includes(',')) {
      setErrorText('Запятые нельзя использовать');
      return;
    }
    dbms.updateDefaultValue({
      type: 'character',
      profileItemName: profileStructureItem.name,
      value: [...list, enumName].join(',')
    }).then(() => {
      setNewEnum('');
      setList([...list, enumName]);
    }).catch((err) => {
      UI.processError()(err);
    });
  }
  function onChange(e) {
    setNewEnum(e.target.value);
    if (errorText !== null) {
      setErrorText(null);
    }
  }
  return (
    <div>
      <div className="tw-mb-6">
        {
          R.sort(CU.charOrdA, list).map((name) => (
            <DropdownButton
              bsStyle={name === list[0] ? 'primary' : 'default'}
              title={name}
              key={name}
              className="tw-mr-4"
            >
              <MenuItem>Переименовать</MenuItem>
              <MenuItem>Выбрать значением по умолчанию</MenuItem>
              <MenuItem divider />
              <MenuItem>Удалить</MenuItem>
            </DropdownButton>
          ))
        }
      </div>
      <form onSubmit={onSubmit}>
        <FormControl
          className="tw-w-64 tw-inline-block tw-mr-4"
          name="enumName"
          autoComplete="off"
          onChange={onChange}
          value={newEnum}
        />
        <Button type="submit">Добавить</Button>
        {errorText && <HelpBlock>{errorText}</HelpBlock>}
      </form>
    </div>
  );
}

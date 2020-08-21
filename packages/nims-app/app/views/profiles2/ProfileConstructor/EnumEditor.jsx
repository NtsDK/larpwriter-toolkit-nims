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

export function EnumEditor(props) {
  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);
  const { profileStructureItem, refresh } = props;
  const [errorText, setErrorText] = useState(null);
  const [newEnum, setNewEnum] = useState('');
  const [list, setList] = useState(profileStructureItem.value.split(','));
  const [renameValue, setRenameValue] = useState(null);
  // const [errorText, setErrorText] = useState('sdfsdfsdf');

  function onAddSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { target } = e;
    const enumName = formData.get('enumName').trim();
    if (enumName === '' || list.includes(enumName)) {
      return;
    }
    if (enumName.includes(',')) {
      return;
    }
    const newList = [...list, enumName];
    dbms.updateDefaultValue({
      type: 'character',
      profileItemName: profileStructureItem.name,
      value: newList.join(',')
    }).then(() => {
      setNewEnum('');
      setList(newList);
    }).catch((err) => {
      UI.processError()(err);
    });
  }
  function onRenameSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { target } = e;
    const enumName = formData.get('enumName').trim();
    if (enumName === '' || list.includes(enumName)) {
      return;
    }
    if (enumName.includes(',')) {
      return;
    }
    const newList = [...list];
    const index = newList.findIndex((el) => el === renameValue);
    newList[index] = enumName;
    dbms.updateDefaultValue({
      type: 'character',
      profileItemName: profileStructureItem.name,
      value: newList.join(',')
    }).then(() => {
      setRenameValue(null);
      setList(newList);
    }).catch((err) => {
      UI.processError()(err);
    });
  }
  function cancelRename() {
    setRenameValue(null);
  }

  function onAddEnumNameChange(e) {
    const enumName = e.target.value;
    setNewEnum(enumName);
    if (enumName.includes(',')) {
      setErrorText(t('profiles.error-prohibited-to-use-commas'));
    } else {
      setErrorText(null);
    }
  }
  function onRenameEnumNameChange(e) {
    const enumName = e.target.value;
    if (enumName.includes(',')) {
      setErrorText(t('profiles.error-prohibited-to-use-commas'));
    } else {
      setErrorText(null);
    }
  }

  function setDefaultValue(e) {
    const { value } = e.target;
    const newList = [value, ...R.without([value], list)];

    dbms.updateDefaultValue({
      type: 'character',
      profileItemName: profileStructureItem.name,
      value: newList.join(',')
    }).then(() => {
      setList(newList);
    }).catch((err) => {
      UI.processError()(err);
    });
  }

  function renameEnumItem(e) {
    const { enumItemName } = e.target.dataset;
    setRenameValue(enumItemName);
  }

  function removeEnumItem(e) {
    const { enumItemName } = e.target.dataset;
    const newList = R.without([enumItemName], list);

    dbms.updateDefaultValue({
      type: 'character',
      profileItemName: profileStructureItem.name,
      value: newList.join(',')
    }).then(() => {
      setList(newList);
    }).catch((err) => {
      UI.processError()(err);
    });
  }
  return (
    <div>
      <div className="tw-mb-4">
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
      <div className="tw-mb-6 tw-flex tw-flex-wrap">
        {
          R.sort(CU.charOrdA, list).map((name) => {
            if (name === renameValue) {
              return (
                <form className="tw-inline-block tw-mb-2 tw-mr-2" key={name} onSubmit={onRenameSubmit}>
                  <FormControl
                    className="tw-w-64 tw-inline-block"
                    name="enumName"
                    autoComplete="off"
                    autoFocus
                    defaultValue={renameValue}
                    onBlur={cancelRename}
                    onChange={onRenameEnumNameChange}
                  />
                </form>
              );
            }

            return (
              <DropdownButton
                // bsStyle={name === list[0] ? 'primary' : 'default'}
                bsStyle="default"
                title={name}
                key={name}
                className="tw-mr-2 tw-mb-2"
              >
                <MenuItem onClick={renameEnumItem} data-enum-item-name={name}>{t('common.rename')}</MenuItem>
                {
                  list.length > 1
                  && (
                    <>
                      <MenuItem divider />
                      <MenuItem onClick={removeEnumItem} data-enum-item-name={name}>{t('common.remove')}</MenuItem>
                    </>
                  )
                }
              </DropdownButton>
            );
          })
        }
        <form className="tw-inline-block tw-mb-2" onSubmit={onAddSubmit}>
          <FormControl
            className="tw-w-64 tw-inline-block"
            name="enumName"
            autoComplete="off"
            onChange={onAddEnumNameChange}
            value={newEnum}
            placeholder={t('profiles.add-enum-value')}
          />
        </form>
      </div>
      <div>
        {errorText && <HelpBlock>{errorText}</HelpBlock>}
      </div>
    </div>
  );
}

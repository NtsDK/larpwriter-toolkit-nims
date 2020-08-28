import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
// import { PromptDialog } from '../../commons/uiCommon3/PromptDialog.jsx';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import { FormDialog } from '../../commons/uiCommon3/FormDialog.jsx';
import { ToggleButton } from '../../commons/uiCommon3/ToggleButton.jsx';

export function BindProfileDialog(props) {
  const {
    onBind, primaryName, secondaryNames, profileBinding, ...elementProps
  } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  function onSubmit({ secondaryName }) {
    console.log(secondaryName);
    return Promise.resolve();
    // return dbms.renameProfile({
    //   type: 'character',
    //   fromName: profileName,
    //   toName
    // }).then(() => onRename({
    //   fromName: profileName,
    //   toName
    // })).catch((err) => UI.handleErrorMsg(err));
  }

  // async function onSubmit({ newItemType }) {
  //   return dbms.changeProfileItemType({
  //     type: 'character', profileItemName, newType: newItemType
  //   }).then(onChange).catch((err) => UI.handleErrorMsg(err));
  // }

  return (
    // <PromptDialog
    //   title={t('profiles.enter-new-character-name')}
    //   defaultValue={profileName}
    //   onSubmit={onSubmit}
    //   {...elementProps}
    // />
    // data={{ defaultValue }}
    <FormDialog {...elementProps} formId="bindProfileForm" title={t('binding.bind-character-n-player')} onSubmit={onSubmit}>
      <FormGroup>
        <div className="btn-group tw-flex">
          <ToggleButton
            type="radio"
            // checked={filterBy === 'ByCharacter'}
            text={t('binding.bonded')}
            name="adaptation-story-switch"
            // className="tw-flex-auto"
            // data={{ 'show-type': 'ByCharacter' }}
            // onChange={onShowTypeChange}
          />
          <ToggleButton
            type="radio"
            // checked={filterBy === 'ByEvent'}
            name="adaptation-story-switch"
            // className="tw-flex-auto"
            text={t('binding.unbonded')}
            // data={{ 'show-type': 'ByEvent' }}
            // onChange={onShowTypeChange}
          />
          <ToggleButton
            type="radio"
            // checked={filterBy === 'ByEvent'}
            name="adaptation-story-switch"
            // className="tw-flex-auto"
            text={t('binding.all')}
            // data={{ 'show-type': 'ByEvent' }}
            // onChange={onShowTypeChange}
          />
        </div>

      </FormGroup>
      <FormGroup>
        <FormControl componentClass="select" name="secondaryName" autoFocus>
          {
            secondaryNames.map((value) => (
              <option
                value={value}
                key={value}
              >
                {value + (profileBinding[value] !== undefined ? (` / ${profileBinding[value]}`) : '') }
              </option>
            ))
          }
        </FormControl>
        {/* <FormControl
          type="text"
          name="value"
          autoFocus
          // defaultValue={defaultValue}
          // onChange={() => setErrorText(null)}
          // validationState={errorText ? 'error' : null}
          autoComplete="off"
        /> */}
      </FormGroup>
    </FormDialog>
  );
}

// export function PromptDialog(props) {
//   const {
//     defaultValue = '', ...elementProps
//   } = props;
//   return (
//   );
// }

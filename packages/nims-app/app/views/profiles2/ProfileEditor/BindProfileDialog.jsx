import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Constants } from 'nims-dbms';
import * as R from 'ramda';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import { FormDialog } from '../../commons/uiCommon3/FormDialog.jsx';
import { ToggleButton } from '../../commons/uiCommon3/ToggleButton.jsx';

export function BindProfileDialog(props) {
  const {
    onBind, primaryName, secondaryNames, profileBinding, ...elementProps
  } = props;

  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('unbonded');
  const { dbms } = useContext(DbmsContext);

  function onSelectedFilterChange(e) {
    setSelectedFilter(e.target.dataset.selectedFilter);
  }

  function onSubmit({ secondaryName }) {
    return dbms.createBinding({
      characterName: primaryName,
      playerName: secondaryName,
    }).then(onBind, UI.handleError);
  }

  const secondaryNamesList = secondaryNames
    .filter((value) => {
      if (selectedFilter === 'unbonded') {
        return profileBinding[value] === undefined;
      }
      if (selectedFilter === 'bonded') {
        return profileBinding[value] !== undefined;
      }
      return true; // selectedFilter === 'all'
    });

  return (
    <FormDialog {...elementProps} formId="bindProfileForm" title={t('binding.bind-character-n-player')} onSubmit={onSubmit}>
      <FormGroup>
        <div className="btn-group tw-flex">
          <ToggleButton
            type="radio"
            checked={selectedFilter === 'unbonded'}
            name="selected-filter-radio"
            // className="tw-flex-auto"
            text={t('binding.unbonded')}
            data={{ 'selected-filter': 'unbonded' }}
            onChange={onSelectedFilterChange}
          />
          <ToggleButton
            type="radio"
            checked={selectedFilter === 'bonded'}
            name="selected-filter-radio"
            // className="tw-flex-auto"
            text={t('binding.bonded')}
            data={{ 'selected-filter': 'bonded' }}
            onChange={onSelectedFilterChange}
          />
          <ToggleButton
            type="radio"
            checked={selectedFilter === 'all'}
            name="selected-filter-radio"
            // className="tw-flex-auto"
            text={t('binding.all')}
            data={{ 'selected-filter': 'all' }}
            onChange={onSelectedFilterChange}
          />
        </div>

      </FormGroup>
      <FormGroup>
        <FormControl componentClass="select" name="secondaryName" autoFocus disabled={secondaryNamesList.length === 0}>
          {
            secondaryNamesList.map((value) => (
              <option
                value={value}
                key={value}
              >
                {value + (profileBinding[value] !== undefined ? (` / ${profileBinding[value]}`) : '') }
              </option>
            ))
          }
        </FormControl>
      </FormGroup>
    </FormDialog>
  );
}

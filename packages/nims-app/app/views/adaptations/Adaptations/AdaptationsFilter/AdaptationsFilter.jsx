import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import { UI, U, L10n } from 'nims-app-core';
import classNames from 'classnames';
import './AdaptationsFilter.css';
import { ToggleButton } from '../../../commons/uiCommon3.jsx';

import {
  getEntityStatus
} from '../../adaptationUtils';

export function AdaptationsFilter(props) {
  const {
    characterArray, eventArray, selectedCharacterNames, selectedEventIndexes, filterBy, setFilterBy,

    setSelectedCharacterNames, setSelectedEventIndexes
  } = props;
  const { t } = useTranslation();
  // const [showType, setShowType] = useState('ByCharacter');
  function onShowTypeChange(e) {
    setFilterBy(e.target.dataset.showType);
  }

  function onCharactersChange(e) {
    const selectedCharacterNames = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedCharacterNames(selectedCharacterNames);
  }
  function onEventsChange(e) {
    const selectedEventIndexes = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedEventIndexes(selectedEventIndexes);
  }

  return (
    <div className="AdaptationsFilter panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">{t('adaptations.filter')}</h3>
      </div>
      <div className="panel-body">

        <div className="btn-group tw-flex">
          <ToggleButton
            type="radio"
            checked={filterBy === 'ByCharacter'}
            text={t('adaptations.characters')}
            name="adaptation-story-switch"
            className="tw-flex-auto"
            data={{ 'show-type': 'ByCharacter' }}
            onChange={onShowTypeChange}
          />
          <ToggleButton
            type="radio"
            checked={filterBy === 'ByEvent'}
            name="adaptation-story-switch"
            className="tw-flex-auto"
            text={t('adaptations.events')}
            data={{ 'show-type': 'ByEvent' }}
            onChange={onShowTypeChange}
          />
        </div>
        {
          filterBy === 'ByCharacter'
          && (
            <div>
              {/* <h4 l10n-id="adaptations-characters" /> */}
              <select
                className="form-control"
                multiple
                size={characterArray.length}
                value={selectedCharacterNames}
                onChange={onCharactersChange}
              >
                {
                  characterArray.map((elem) => {
                    const status = getEntityStatus(elem);
                    return (
                      <option
                        className={classNames('fa-icon select-icon-padding', {
                          empty: status === 'empty',
                          finished: status === 'finished',
                          'finished transparent-icon': status === 'unfinished',
                        })}
                        key={elem.value}
                        value={elem.value}
                      >
                        {elem.displayName}
                      </option>
                    );
                  })
                }
              </select>
            </div>
          )
        }
        {
          filterBy === 'ByEvent'
          && (
            <div>
              {/* <h4 l10n-id="adaptations-events" /> */}
              <select
                className="form-control"
                multiple
                size={eventArray.length}
                value={selectedEventIndexes}
                onChange={onEventsChange}
              >
                {
                  eventArray.map((elem) => {
                    const status = getEntityStatus(elem);
                    return (
                      <option
                        className={classNames('fa-icon select-icon-padding', {
                          empty: status === 'empty',
                          finished: status === 'finished',
                          'finished transparent-icon': status === 'unfinished',
                        })}
                        key={String(elem.index)}
                        value={String(elem.index)}
                      >
                        {elem.name}
                      </option>
                    );
                  })
                }
              </select>
            </div>
          )
        }
      </div>
    </div>
  );
}

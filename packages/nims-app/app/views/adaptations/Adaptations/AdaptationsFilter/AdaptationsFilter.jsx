import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import { UI, U, L10n } from 'nims-app-core';
import './AdaptationsFilter.css';
import { ToggleButton } from '../../../commons/uiCommon3.jsx';

import {
  getStoryCharacterCompleteness, getStoryEventCompleteness, getCharacterNames, getEventIndexes
} from '../../adaptationUtils';

export function AdaptationsFilter(props) {
  const { story, allCharacters } = props;
  const { t } = useTranslation();
  const [showType, setShowType] = useState('ByCharacter');
  function onShowTypeChange(e) {
    setShowType(e.target.dataset.showType);
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
            checked={showType === 'ByCharacter'}
            text={t('adaptations.characters')}
            name="adaptation-story-switch"
            className="tw-flex-auto"
            data={{ 'show-type': 'ByCharacter' }}
            onChange={onShowTypeChange}
          />
          <ToggleButton
            type="radio"
            checked={showType === 'ByEvent'}
            name="adaptation-story-switch"
            className="tw-flex-auto"
            text={t('adaptations.events')}
            data={{ 'show-type': 'ByEvent' }}
            onChange={onShowTypeChange}
          />
        </div>
        {
          showType === 'ByCharacter'
          && (
            <div id="events-characterSelectorDiv">
              {/* <h4 l10n-id="adaptations-characters" /> */}
              123
              <select id="events-characterSelector" className="form-control" multiple />
            </div>
          )
        }
        {
          showType === 'ByEvent'
          && (
            <div id="events-eventSelectorDiv">
              {/* <h4 l10n-id="adaptations-events" /> */}
              234
              <select id="events-eventSelector" className="form-control" multiple size={15} />
            </div>
          )
        }
      </div>
    </div>
  );
}

// function updateAdaptationSelector(story, allCharacters) {
//   const characterSelector = U.clearEl(U.queryEl('#events-characterSelector'));
//   const eventSelector = U.clearEl(U.queryEl('#events-eventSelector'));

//   let characterArray = getStoryCharacterCompleteness(story);
//   let eventArray = getStoryEventCompleteness(story);

//   const showOnlyUnfinishedStories = U.queryEl('#finishedStoryCheckbox').checked;
//   if (showOnlyUnfinishedStories) {
//     characterArray = characterArray.filter((elem) => !elem.isFinished || elem.isEmpty);
//     eventArray = eventArray.filter((elem) => !elem.isFinished || elem.isEmpty);
//   }

//   const characterNames = getCharacterNames(characterArray);
//   const eventIndexes = getEventIndexes(eventArray);

//   const map = R.indexBy(R.prop('value'), allCharacters);

//   characterArray.forEach((elem) => {
//     elem.displayName = map[elem.characterName].displayName;
//     elem.value = map[elem.characterName].value;
//   });

//   characterArray.sort(CU.charOrdAObject);

//   let option;
//   characterArray.forEach((elem) => {
//     option = U.addEl(U.makeEl('option'), (U.makeText(elem.displayName)));
//     U.addClass(option, getIconClass(elem));
//     U.setProp(option, 'selected', characterNames.indexOf(elem.value) !== -1);
//     U.setProp(option, 'storyInfo', story.name);
//     U.setProp(option, 'characterName', elem.value);
//     U.addEl(characterSelector, option);
//   });
//   U.setAttr(characterSelector, 'size', characterArray.length);

//   eventArray.forEach((elem) => {
//     option = U.addEl(U.makeEl('option'), (U.makeText(elem.name)));
//     U.addClass(option, getIconClass(elem));
//     U.setProp(option, 'selected', eventIndexes.indexOf(elem.index) !== -1);
//     U.setProp(option, 'storyInfo', story.name);
//     U.setProp(option, 'eventIndex222', elem.index);
//     U.addEl(eventSelector, option);
//   });
//   U.setAttr(eventSelector, 'size', eventArray.length);

//   const { selectedFilter } = SM.getSettings().Adaptations;
//   U.queryEl(`#${selectedFilter}`).checked = true;
//   updateFilter({
//     target: {
//       id: selectedFilter
//     }
//   });
// }

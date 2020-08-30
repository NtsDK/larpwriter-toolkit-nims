import React, { useContext, useEffect, useState } from 'react';
import FormControl from 'react-bootstrap/es/FormControl';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { UI, U, L10n } from 'nims-app-core';
import * as Constants from 'nims-dbms/nimsConstants';
import { StoryCharacterDropdown } from './StoryCharacterDropdown.jsx';

export function StoryCharacterRow(props) {
  const {
    character, storyName, refresh, outOfStoryChars
  } = props;
  const dbms = useContext(DbmsContext);

  function onInventoryChange(event) {
    dbms.updateCharacterInventory({
      storyName,
      characterName: character.name,
      inventory: event.target.value
    }).catch(UI.handleError);
  }

  function onChangeCharacterActivity(event) {
    const { activityType } = event.target.dataset;
    dbms.onChangeCharacterActivity({
      storyName,
      characterName: character.name,
      activityType,
      checked: event.target.checked
    }).catch(UI.handleError);
  }

  return (
    <tr className="StoryCharacterRow">
      <td className="character-name tw-flex">
        <span className="tw-flex-1">{character.name}</span>
        <StoryCharacterDropdown
          storyName={storyName}
          characterName={character.name}
          refresh={refresh}
          outOfStoryChars={outOfStoryChars}
        />
      </td>
      <td>
        <FormControl
          className="inventoryInput isStoryEditable"
          defaultValue={character.inventory}
          onChange={onInventoryChange}
        />
      </td>
      {
        Constants.characterActivityTypes.map((activityType) => (
          <td className={`vertical-aligned-td ${activityType}`}>
            <input
              className="isStoryEditable hidden"
              type="checkbox"
              defaultChecked={!!character.activity[activityType]}
              id={character.name + activityType}
              onChange={onChangeCharacterActivity}
              data-activity-type={activityType}
            />
            <label
              htmlFor={character.name + activityType}
              className={`${'checkbox-label fa-icon activity-icon-'}${activityType}`}
            />
          </td>
        ))
      }
    </tr>
  );
}

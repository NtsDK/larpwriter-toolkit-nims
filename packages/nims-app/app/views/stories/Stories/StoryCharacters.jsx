import React, { useContext, useEffect, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import PermissionInformer from 'permissionInformer';
import FormControl from 'react-bootstrap/es/FormControl';
import classNames from 'classnames';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { StoryCharacterRow } from './StoryCharacterRow.jsx';

export function StoryCharacters(props) {
  const { storyName } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  function refresh() {
    Promise.all([
      PermissionInformer.isEntityEditable({ type: 'story', name: storyName }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
      dbms.getStoryCharacters({ storyName })
    ]).then((results) => {
      const [isStoryEditable, allCharacters, localCharacters] = results;
      const addArray = [];
      const removeArray = [];

      const charGroups = R.groupBy((nameInfo) => (localCharacters[nameInfo.value] ? 'inStoryChars' : 'outOfStoryChars'), allCharacters);
      setState({
        ...charGroups,
        localCharacters
      });

      // allCharacters.filter((nameInfo) => !localCharacters[nameInfo.value]).forEach((nameInfo) => {
      //   addArray.push(nameInfo);
      // });

      // allCharacters.filter((nameInfo) => localCharacters[nameInfo.value]).forEach((nameInfo) => {
      //   removeArray.push(nameInfo);
      // });

      // addArray.sort(CU.charOrdAObject);
      // removeArray.sort(CU.charOrdAObject);

      // const allCharactersIndex = R.indexBy(R.prop('value'), allCharacters);

      // const sortedCharacterList = R.sort(CU.charOrdAObject,
      //   R.values(R.pick(characterArray, allCharactersIndex)));
      // setState({
      //   sortedCharacterList,
      //   events,
      // });
      // setSelectedCharacters(CU.sortStrIgnoreCase(characterArray));
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  if (!state) {
    return null;
  }

  // function getCharacterInput(characterMeta, character) {
  //   const content = U.makeEl('tbody');
  //   ReactDOM.render(getStoryCharacterRow(), content);
  //   const el = U.qee(content, '.StoryCharacterRow');

  //   L10n.localizeStatic(el);
  //   const qe = U.qee(el);

  //   U.addEl(qe('.character-name'), U.makeText(characterMeta.displayName));

  //   let input = qe('.inventoryInput');
  //   input.value = character.inventory;
  //   input.characterName = character.name;
  //   U.listen(input, 'change', updateCharacterInventory);

  //   Constants.characterActivityTypes.forEach((activityType) => {
  //     input = qe(`.${activityType} input`);
  //     if (character.activity[activityType]) {
  //       input.checked = true;
  //     }
  //     input.characterName = character.name;
  //     input.activityType = activityType;
  //     U.listen(input, 'change', onChangeCharacterActivity);
  //     U.setAttr(input, 'id', character.name + activityType);
  //     U.setAttr(qe(`.${activityType} label`), 'for', character.name + activityType);
  //   });

  //   U.listen(qe('.replace.character'), 'click', () => {
  //     state.switchCharacterDialog.characterName = character.name;
  //     state.switchCharacterDialog.showDlg();
  //   });
  //   U.listen(qe('.remove.character'), 'click', removeCharacter(character.name));
  //   return el;
  // }

  const { localCharacters, inStoryChars, outOfStoryChars } = state;
  return (
    <div className="story-characters-tab">
      <div className="panel panel-default">
        <InlineNotification type="info" showIf={localCharacters.length === 0}>
          {t('advices.no-characters-in-story')}
        </InlineNotification>
        {
          localCharacters.length !== 0
        && (
          <table className="table table-bordered character-inventory-area">
            <thead>
              <tr>
                <th>{t('stories.name')}</th>
                <th>{t('stories.inventory')}</th>
                <th>{t('constant.active')}</th>
                <th>{t('constant.follower')}</th>
                <th>{t('constant.defensive')}</th>
                <th>{t('constant.passive')}</th>
              </tr>
            </thead>
            <tbody className="storyCharactersTable">
              {
                inStoryChars.map((char) => (
                  <StoryCharacterRow
                    storyName={storyName}
                    character={localCharacters[char.value]}
                    outOfStoryChars={outOfStoryChars}
                    refresh={refresh}
                  />
                ))
              }
            </tbody>
          </table>
        )
        }
      </div>
    </div>
  );
}

// export function getStoryCharactersTemplate() {
//   return <StoryCharactersTemplate />;
// }

// export const ModalSwitchEventBody = function () {
//   return (
//     <div className="ModalSwitchEventBody form-group">
//       <select className="isStoryEditable storyCharactersToSelector form-control" style={{ width: '100%' }} />
//     </div>
//   );
// };

// export function getModalSwitchEventBody() {
//   return <ModalSwitchEventBody />;
// }
// export const ModalAddCharacterBody = function () {
//   return (
//     <div className="ModalAddCharacterBody form-group">
//       <select className="isStoryEditable storyCharactersAddSelector form-control" style={{ width: '100%' }} />
//     </div>
//   );
// };

// export function getModalAddCharacterBody() {
//   return <ModalAddCharacterBody />;
// }

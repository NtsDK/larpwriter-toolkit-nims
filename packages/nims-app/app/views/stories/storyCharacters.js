import PermissionInformer from 'permissionInformer';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';
import { Constants } from 'nims-dbms';

import { getStoryCharacterRow } from './StoryCharacterRow.jsx';
import {
  getStoryCharactersTemplate,
  getModalAddCharacterBody,
  getModalSwitchEventBody
} from './StoryCharactersTemplate.jsx';
import { createModalDialog } from '../commons/uiCommons';

export default function createStoryCharacters(Stories) {
  const state = {};
  const root = '.story-characters-tab ';
  const superRoot = '.stories-tab ';
  let initialized = false;

  let addCharacterDialog;
  function getAddCharacterDialog() {
    return addCharacterDialog;
  }
  let content;
  function getContent() {
    return content;
  }

  function init() {
    if (initialized) return;

    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getStoryCharactersTemplate(), content);
    L10n.localizeStatic(content);

    addCharacterDialog = createModalDialog(superRoot, addCharacter, {
      // bodySelector: 'modal-add-character-body',
      dialogTitle: 'stories-add-character-title',
      actionButtonTitle: 'common-add',
      getComponent: getModalAddCharacterBody,
      componentClass: 'ModalAddCharacterBody'
    });

    //        U.listen(U.qe(`${root}.add.character`), 'click', () => addCharacterDialog.showDlg());

    state.switchCharacterDialog = createModalDialog(root, switchCharacters, {
      // bodySelector: 'modal-switch-event-body',
      dialogTitle: 'stories-switch-character-title',
      actionButtonTitle: 'common-replace',
      getComponent: getModalSwitchEventBody,
      componentClass: 'ModalSwitchEventBody'
    });
    state.ExternalCharacterSelectors = [U.queryEl(`${superRoot}.storyCharactersAddSelector`),
      U.queryEl(`${root}.storyCharactersToSelector`)];

    content = U.queryEl(root);
    initialized = true;
  }

  function refresh() {
    state.ExternalCharacterSelectors.forEach(U.clearEl);

    U.clearEl(U.queryEl(`${root}.storyCharactersTable`));

    if (!Stories.getCurrentStoryName()) { return; }

    Promise.all([
      PermissionInformer.isEntityEditable({ type: 'story', name: Stories.getCurrentStoryName() }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
      DBMS.getStoryCharacters({ storyName: Stories.getCurrentStoryName() })
    ]).then((results) => {
      const [isStoryEditable, allCharacters, localCharacters] = results;
      rebuildInterface(allCharacters, localCharacters);
      UI.enable(content, 'isStoryEditable', isStoryEditable);
      Stories.chainRefresh();
    }).catch(UI.handleError);
  }

  function rebuildInterface(allCharacters, localCharacters) {
    const addArray = [];
    const removeArray = [];

    allCharacters.filter((nameInfo) => !localCharacters[nameInfo.value]).forEach((nameInfo) => {
      addArray.push(nameInfo);
    });

    allCharacters.filter((nameInfo) => localCharacters[nameInfo.value]).forEach((nameInfo) => {
      removeArray.push(nameInfo);
    });

    addArray.sort(CU.charOrdAObject);
    removeArray.sort(CU.charOrdAObject);

    const addData = UI.getSelect2Data(addArray);
    const removeData = UI.getSelect2Data(removeArray);

    state.ExternalCharacterSelectors.forEach((selector) => {
      $(selector).select2(addData);
    });

    const table = U.clearEl(U.queryEl(`${root}.storyCharactersTable`));

    U.showEl(U.qe(`${root} table`), R.keys(localCharacters).length !== 0);
    U.showEl(U.qe(`${root} .alert`), R.keys(localCharacters).length === 0);

    removeArray.forEach((removeValue) => {
      U.addEl(table, getCharacterInput(removeValue, localCharacters[removeValue.value]));
    });
  }

  function addCharacter(dialog) {
    return () => {
      const characterName = U.queryEl(`${superRoot}.storyCharactersAddSelector`).value.trim();
      DBMS.addStoryCharacter({
        storyName: Stories.getCurrentStoryName(),
        characterName
      }).then(() => {
        dialog.hideDlg();
        refresh();
      }).catch((err) => UI.setError(dialog, err));
    };
  }

  function switchCharacters(dialog) {
    return () => {
      const toName = U.queryEl(`${root}.storyCharactersToSelector`).value.trim();
      DBMS.switchStoryCharacters({
        storyName: Stories.getCurrentStoryName(),
        fromName: dialog.characterName,
        toName
      }).then(() => {
        dialog.hideDlg();
        refresh();
      }).catch((err) => UI.setError(dialog, err));
    };
  }

  function removeCharacter(characterName) {
    return () => {
      UI.confirm(CU.strFormat(L10n.getValue('stories-remove-character-from-story-warning'), [characterName]), () => {
        DBMS.removeStoryCharacter({
          storyName: Stories.getCurrentStoryName(),
          characterName
        }).then(refresh).catch(UI.handleError);
      });
    };
  }

  function getCharacterInput(characterMeta, character) {
    const content = U.makeEl('tbody');
    ReactDOM.render(getStoryCharacterRow(), content);
    const el = U.qee(content, '.StoryCharacterRow');

    L10n.localizeStatic(el);
    const qe = U.qee(el);

    U.addEl(qe('.character-name'), U.makeText(characterMeta.displayName));

    let input = qe('.inventoryInput');
    input.value = character.inventory;
    input.characterName = character.name;
    U.listen(input, 'change', updateCharacterInventory);

    Constants.characterActivityTypes.forEach((activityType) => {
      input = qe(`.${activityType} input`);
      if (character.activity[activityType]) {
        input.checked = true;
      }
      input.characterName = character.name;
      input.activityType = activityType;
      U.listen(input, 'change', onChangeCharacterActivity);
      U.setAttr(input, 'id', character.name + activityType);
      U.setAttr(qe(`.${activityType} label`), 'for', character.name + activityType);
    });

    U.listen(qe('.replace.character'), 'click', () => {
      state.switchCharacterDialog.characterName = character.name;
      state.switchCharacterDialog.showDlg();
    });
    U.listen(qe('.remove.character'), 'click', removeCharacter(character.name));
    return el;
  }

  function updateCharacterInventory(event) {
    DBMS.updateCharacterInventory({
      storyName: Stories.getCurrentStoryName(),
      characterName: event.target.characterName,
      inventory: event.target.value
    }).catch(UI.handleError);
  }

  function onChangeCharacterActivity(event) {
    DBMS.onChangeCharacterActivity({
      storyName: Stories.getCurrentStoryName(),
      characterName: event.target.characterName,
      activityType: event.target.activityType,
      checked: event.target.checked
    }).catch(UI.handleError);
  }
  return {
    init, refresh, getContent, getAddCharacterDialog
  };
}

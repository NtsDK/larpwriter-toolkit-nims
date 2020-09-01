import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { FormDialog } from '../../commons/uiCommon3/FormDialog.jsx';

export function AddStoryCharacterDialog(props) {
  const {
    storyName, onAdd, ...elementProps
  } = props;

  const { t } = useTranslation();
  const { dbms, permissionInformer } = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    // hard removing state, removing event doesn't work without it
    // I don't know why
    // setState(null);
    Promise.all([
      permissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
      dbms.getStoryCharacters({ storyName })
    ]).then((results) => {
      const [allCharacters, localCharacters] = results;
      const charGroups = R.groupBy((nameInfo) => (localCharacters[nameInfo.value] ? 'inStoryChars' : 'outOfStoryChars'), allCharacters);
      setState({
        ...charGroups,
        characterList: R.pluck('value', allCharacters),
        localCharacters
      });
    }).catch(UI.handleError);
  }

  useEffect(refresh, [storyName]);

  if (!state) {
    return null;
  }

  const { outOfStoryChars, characterList } = state;

  async function onSubmit({ characterName }) {
    if (!characterName) {
      return Promise.reject();
    }

    if (!characterList.includes(characterName)) {
      await dbms.createProfile({ type: 'character', characterName });
    }
    return dbms.addStoryCharacter({
      storyName,
      characterName
    }).then(refresh).then(onAdd).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <FormDialog
      formId="replaceStoryCharacterForm"
      title={t('stories.add-character-title')}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
      onSubmit={onSubmit}
    >
      <FormGroup>
        <FormControl name="characterName" list="story-character-datalist" />
      </FormGroup>
      <datalist id="story-character-datalist">
        {
          outOfStoryChars.map((char) => <option key={char.value} value={char.value} />)
        }
      </datalist>
    </FormDialog>
  );
}

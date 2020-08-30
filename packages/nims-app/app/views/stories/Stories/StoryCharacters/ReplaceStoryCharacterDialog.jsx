import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { FormDialog } from '../../../commons/uiCommon3/FormDialog.jsx';

export function ReplaceStoryCharacterDialog(props) {
  const {
    storyName, characterName, onReplace, outOfStoryChars, ...elementProps
  } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  async function onSubmit({ toCharacter }) {
    return dbms.switchStoryCharacters({
      storyName,
      toName: toCharacter,
      fromName: characterName
    }).then(onReplace).catch((err) => UI.handleErrorMsg(err));
  }

  return (
    <FormDialog
      formId="replaceStoryCharacterForm"
      title={t('stories.switch-character-title')}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
      onSubmit={onSubmit}
    >
      <FormGroup>
        <FormControl componentClass="select" name="toCharacter">
          {
            outOfStoryChars.map((char) => <option value={char.value} key={char.value}>{char.value}</option>)
          }
        </FormControl>
      </FormGroup>
    </FormDialog>
  );
}

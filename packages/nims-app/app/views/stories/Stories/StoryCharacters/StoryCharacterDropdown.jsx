import React, { Component, useContext } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch, useHistory, useRouteMatch
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import PermissionInformer from 'permissionInformer';
import Button from 'react-bootstrap/es/Button';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { useTranslation } from 'react-i18next';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ModalTrigger } from '../../../commons/uiCommon3/ModalTrigger.jsx';
import { RemoveStoryCharacterDialog } from './RemoveStoryCharacterDialog.jsx';
import { ReplaceStoryCharacterDialog } from './ReplaceStoryCharacterDialog.jsx';

export function StoryCharacterDropdown(props) {
  const {
    storyName, characterName, refresh, outOfStoryChars
  } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  return (
    <Dropdown>
      <Dropdown.Toggle noCaret className="btn btn-default fa-icon kebab" />
      <Dropdown.Menu>
        <ModalTrigger
          modal={(
            <ReplaceStoryCharacterDialog
              storyName={storyName}
              characterName={characterName}
              onReplace={refresh}
              outOfStoryChars={outOfStoryChars}
            />
          )}
        >
          <MenuItem>
            {t('stories.replace-character')}
          </MenuItem>
        </ModalTrigger>
        <MenuItem divider />
        <ModalTrigger
          modal={(
            <RemoveStoryCharacterDialog
              storyName={storyName}
              characterName={characterName}
              onRemove={refresh}
            />
          )}
        >
          <MenuItem>
            {t('stories.remove-character')}
          </MenuItem>
        </ModalTrigger>
      </Dropdown.Menu>
    </Dropdown>
  );
}

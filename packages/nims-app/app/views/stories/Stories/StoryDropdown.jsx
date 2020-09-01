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
import { ModalTrigger } from '../../commons/uiCommon3/ModalTrigger.jsx';
import { RenameStoryDialog } from './RenameStoryDialog.jsx';
import { RemoveStoryDialog } from './RemoveStoryDialog.jsx';

export function StoryDropdown(props) {
  const {
    entity, primaryNames, refresh
  } = props;

  const { t } = useTranslation();
  const match = useRouteMatch('/stories/:id');
  const history = useHistory();
  const { dbms } = useContext(DbmsContext);

  async function onRenameStory({ toName, fromName }) {
    const { id: currentStoryName } = match.params;
    try {
      try {
        await PermissionInformer.refresh();
        await refresh();
        if (fromName === currentStoryName) {
          history.push(`/stories/${toName}`);
        }
      } catch (err) {
        UI.handleError(err);
      }
    } catch (err) {
      console.error(err);
      return UI.handleErrorMsg(err);
    }
    return null;
  }

  async function onRemoveStory({ profileName: removableStory }) {
    const { id: currentStoryName } = match.params;
    try {
      const index = R.findIndex(R.equals(removableStory), primaryNames);
      let nextProfile = null;
      if (index === -1 || primaryNames.length === 1) {
        // do nothing
      } else if (index + 1 < primaryNames.length) {
        nextProfile = primaryNames[index + 1];
      } else if (index - 1 > 0) {
        nextProfile = primaryNames[index - 1];
      }

      await PermissionInformer.refresh();
      await refresh();

      if (removableStory === currentStoryName && nextProfile !== null) {
        history.push(`/stories/${nextProfile}`);
      }
    } catch (err) {
      UI.handleError(err);
    }
    return null;
  }

  return (
    <Dropdown>
      <Dropdown.Toggle noCaret className="btn btn-default fa-icon kebab" />
      <Dropdown.Menu>
        <ModalTrigger
          modal={(
            <RenameStoryDialog
              storyName={entity.primaryName}
              onRename={onRenameStory}
            />
          )}
        >
          <MenuItem>
            {t('stories.rename-entity')}
          </MenuItem>
        </ModalTrigger>
        <MenuItem divider />
        <ModalTrigger
          modal={(
            <RemoveStoryDialog
              storyName={entity.primaryName}
              onRemove={onRemoveStory}
            />
          )}
        >
          <MenuItem>
            {t('stories.remove-entity')}
          </MenuItem>
        </ModalTrigger>
      </Dropdown.Menu>
    </Dropdown>
  );
}

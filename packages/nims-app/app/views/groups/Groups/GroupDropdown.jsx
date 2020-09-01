import React, { Component, useContext } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch, useHistory, useRouteMatch
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import Button from 'react-bootstrap/es/Button';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { useTranslation } from 'react-i18next';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ModalTrigger } from '../../commons/uiCommon3/ModalTrigger.jsx';
import { RenameGroupDialog } from './RenameGroupDialog.jsx';
import { RemoveGroupDialog } from './RemoveGroupDialog.jsx';

export function GroupDropdown(props) {
  const {
    entity, primaryNames, refresh
  } = props;

  const { t } = useTranslation();
  const match = useRouteMatch('/groups/:id');
  const history = useHistory();
  const { dbms, permissionInformer } = useContext(DbmsContext);

  async function onRenameGroup({ toName, fromName }) {
    const { id: currentStoryName } = match.params;
    try {
      try {
        await permissionInformer.refresh();
        await refresh();
        if (fromName === currentStoryName) {
          history.push(`/groups/${toName}`);
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

  async function onRemoveGroup({ groupName: removableGroup }) {
    const { id: currentStoryName } = match.params;
    try {
      const index = R.findIndex(R.equals(removableGroup), primaryNames);
      let nextProfile = null;
      if (index === -1 || primaryNames.length === 1) {
        // do nothing
      } else if (index + 1 < primaryNames.length) {
        nextProfile = primaryNames[index + 1];
      } else if (index - 1 > 0) {
        nextProfile = primaryNames[index - 1];
      }

      await permissionInformer.refresh();
      await refresh();

      if (removableGroup === currentStoryName && nextProfile !== null) {
        history.push(`/groups/${nextProfile}`);
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
            <RenameGroupDialog
              groupName={entity.primaryName}
              onRename={onRenameGroup}
            />
          )}
        >
          <MenuItem>
            {t('groups.rename-entity')}
          </MenuItem>
        </ModalTrigger>
        <MenuItem divider />
        <ModalTrigger
          modal={(
            <RemoveGroupDialog
              groupName={entity.primaryName}
              onRemove={onRemoveGroup}
            />
          )}
        >
          <MenuItem>
            {t('groups.remove-entity')}
          </MenuItem>
        </ModalTrigger>
      </Dropdown.Menu>
    </Dropdown>
  );
}

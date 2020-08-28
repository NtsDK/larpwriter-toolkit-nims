import React, { Component } from 'react';
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
import { ModalTrigger } from '../../commons/uiCommon3/ModalTrigger.jsx';
import { RenameProfileDialog } from './RenameProfileDialog.jsx';
import { RemoveProfileDialog } from './RemoveProfileDialog.jsx';

export function ProfileDropdown(props) {
  const { entity, primaryNames, refresh } = props;
  const { t } = useTranslation();
  const match = useRouteMatch('/characters/characterEditor/:id');
  const history = useHistory();

  async function onRenameProfile({ toName, fromName }) {
    const { id: currentProfileName } = match.params;
    try {
      try {
        await PermissionInformer.refresh();
        await refresh();
        if (fromName === currentProfileName) {
          history.push(`/characters/characterEditor/${toName}`);
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

  async function onRemoveProfile({ profileName: removableProfile }) {
    const { id: currentProfileName } = match.params;
    try {
      const index = R.findIndex(R.equals(removableProfile), primaryNames);
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

      if (removableProfile === currentProfileName && nextProfile !== null) {
        history.push(`/characters/characterEditor/${nextProfile}`);
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
            <RenameProfileDialog
              profileName={entity.primaryName}
              onRename={onRenameProfile}
            />
          )}
        >
          <MenuItem>
            {t('profiles.rename-character')}
          </MenuItem>
        </ModalTrigger>
        <MenuItem divider />
        <ModalTrigger
          modal={(
            <RemoveProfileDialog
              profileName={entity.primaryName}
              onRemove={onRemoveProfile}
            />
          )}
        >
          <MenuItem>
            {t('profiles.remove-character')}
          </MenuItem>
        </ModalTrigger>
      </Dropdown.Menu>
    </Dropdown>
  );
}

import React, { Component, useContext } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch, useHistory, useRouteMatch
} from 'react-router-dom';
import { CU } from 'nims-dbms-core';
import * as R from 'ramda';
import Button from 'react-bootstrap/es/Button';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { useTranslation } from 'react-i18next';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ModalTrigger } from '../../commons/uiCommon3/ModalTrigger.jsx';
import { RenameProfileDialog } from './RenameProfileDialog.jsx';
import { RemoveProfileDialog } from './RemoveProfileDialog.jsx';
import { BindProfileDialog } from './BindProfileDialog.jsx';

export function ProfileDropdown(props) {
  const {
    entity, primaryNames, secondaryNames, profileBinding, refresh
  } = props;

  const { t } = useTranslation();
  const match = useRouteMatch('/characters/characterEditor/:id');
  const history = useHistory();
  const { dbms, permissionInformer } = useContext(DbmsContext);

  async function onRenameProfile({ toName, fromName }) {
    const { id: currentProfileName } = match.params;
    try {
      try {
        await permissionInformer.refresh();
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

      await permissionInformer.refresh();
      await refresh();

      if (removableProfile === currentProfileName && nextProfile !== null) {
        history.push(`/characters/characterEditor/${nextProfile}`);
      }
    } catch (err) {
      UI.handleError(err);
    }
    return null;
  }
  function removeBinding(e) {
    const { characterName, playerName } = e.target.dataset;
    dbms.removeBinding({
      characterName,
      playerName
    }).then(refresh, UI.handleError);
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
        {
          secondaryNames.length !== 0
          && (
            <ModalTrigger
              modal={(
                <BindProfileDialog
                  primaryName={entity.primaryName}
                  secondaryNames={secondaryNames}
                  profileBinding={R.invertObj(profileBinding)}
                  onBind={refresh}
                />
              )}
            >
              <MenuItem>
                {t('binding.bind-character-n-player')}
              </MenuItem>
            </ModalTrigger>
          )
        }
        <MenuItem divider />
        {
          entity.secondaryName !== undefined
          && (
            <MenuItem
              onClick={removeBinding}
              data-character-name={entity.primaryName}
              data-player-name={entity.secondaryName}
            >
              {t('binding.unlink-binding2')}
            </MenuItem>
          )
        }
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

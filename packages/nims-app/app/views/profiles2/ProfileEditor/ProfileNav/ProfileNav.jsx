import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import PermissionInformer from 'permissionInformer';
import Button from 'react-bootstrap/es/Button';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { PromptDialog } from '../../../commons/uiCommon3/PromptDialog.jsx';
import { ConfirmDialog } from '../../../commons/uiCommon3/ConfirmDialog.jsx';
import { ModalTrigger } from '../../../commons/uiCommon3/ModalTrigger.jsx';

import './ProfileNav.css';

export class ProfileNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.createProfile = this.createProfile.bind(this);
    this.renameProfile = this.renameProfile.bind(this);
    this.removeProfile = this.removeProfile.bind(this);
  }

  componentDidMount() {
    console.log('ProfileNav mounted');
  }

  componentDidUpdate() {
    console.log('ProfileNav did update');
  }

  componentWillUnmount() {
    console.log('ProfileNav will unmount');
  }

  async createProfile({ value: profileName }) {
    const { history, refresh, dbms } = this.props;
    try {
      await dbms.createProfile({ type: 'character', characterName: profileName });
      try {
        await PermissionInformer.refresh();
        await refresh();
        history.push(`/characters/characterEditor/${profileName}`);
      } catch (err) {
        UI.handleError(err);
      }
    } catch (err) {
      console.error(err);
      return UI.handleErrorMsg(err);
    }
    return null;
  }

  async renameProfile({ value: profileName }, { defaultValue: renamableProfile }) {
    const {
      history, match, refresh, dbms
    } = this.props;
    const { id: currentProfileName } = match.params;
    try {
      await dbms.renameProfile({ type: 'character', fromName: renamableProfile, toName: profileName });
      try {
        await PermissionInformer.refresh();
        await refresh();
        if (renamableProfile === currentProfileName) {
          history.push(`/characters/characterEditor/${profileName}`);
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

  async removeProfile({ removableProfile }) {
    const {
      history, match, refresh, primaryNames, dbms
    } = this.props;
    const { id: currentProfileName } = match.params;
    try {
      await dbms.removeProfile({ type: 'character', characterName: removableProfile });
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

  render() {
    const { t, primaryNames, profileBinding } = this.props;

    return (
      <div className="ProfileNav panel panel-default  entity-select height-100p">
        <div className="panel-body height-100p">
          <div className="flex-row entity-toolbar">
            <input className="form-control entity-filter flex-1-1-auto" type="search" />
            <ModalTrigger
              modal={(
                <PromptDialog
                  title={t('profiles.enter-character-name')}
                  onSubmit={this.createProfile}
                />
              )}
            >
              <Button
                className="btn-reduced fa-icon create flex-0-0-auto"
                title={t('profiles.create-character')}
              />
            </ModalTrigger>
          </div>
          <ul className="entity-list ">
            {
              primaryNames.map((primaryName) => (
                <li className="flex-row">
                  <NavLink className="btn btn-default flex-1-1-auto text-align-left" to={`/characters/characterEditor/${primaryName}`}>
                    <div>{primaryName}</div>
                    {profileBinding[primaryName] && <div className="small">{profileBinding[primaryName]}</div>}
                  </NavLink>
                  <Dropdown>
                    <Dropdown.Toggle noCaret className="btn btn-default fa-icon kebab" />
                    <Dropdown.Menu>

                      <ModalTrigger
                        modal={(
                          <PromptDialog
                            title={t('profiles.enter-new-character-name')}
                            defaultValue={primaryName}
                            onSubmit={this.renameProfile}
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
                          <ConfirmDialog
                            message={t('profiles.are-you-sure-about-character-removing2', { profileName: primaryName })}
                            onConfirm={this.removeProfile}
                            data={{ removableProfile: primaryName }}
                          />
                        )}
                      >
                        <MenuItem>
                          {t('profiles.remove-character')}
                        </MenuItem>
                      </ModalTrigger>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    );
  }
}

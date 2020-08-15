import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import PermissionInformer from 'permissionInformer';
import DropdownButton from 'react-bootstrap/es/DropdownButton';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { PromptDialog } from '../../../commons/uiCommon3/PromptDialog.jsx';
import { ConfirmDialog } from '../../../commons/uiCommon3/ConfirmDialog.jsx';

import './ProfileNav.css';

export class ProfileNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCreateProfilePrompt: false,
      showRenameProfilePrompt: false,
      showRemoveProfileConfirm: false,
      renamableProfile: '',
      removableProfile: ''
    };
    this.onCreateProfileCancel = this.onCreateProfileCancel.bind(this);
    this.onRenameProfileCancel = this.onRenameProfileCancel.bind(this);
    this.onRemoveProfileCancel = this.onRemoveProfileCancel.bind(this);
    this.onCreateProfileRequest = this.onCreateProfileRequest.bind(this);
    this.onRenameProfileRequest = this.onRenameProfileRequest.bind(this);
    this.onRemoveProfileRequest = this.onRemoveProfileRequest.bind(this);
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

  onCreateProfileCancel() {
    this.setState({
      showCreateProfilePrompt: false
    });
  }

  onRenameProfileCancel() {
    this.setState({
      showRenameProfilePrompt: false
    });
  }

  onRemoveProfileCancel() {
    this.setState({
      showRemoveProfileConfirm: false
    });
  }

  onCreateProfileRequest() {
    this.setState({
      showCreateProfilePrompt: true
    });
  }

  onRenameProfileRequest(e) {
    const { profileName } = e.target.dataset;
    this.setState({
      showRenameProfilePrompt: true,
      renamableProfile: profileName
    });
  }

  onRemoveProfileRequest(e) {
    const { profileName } = e.target.dataset;
    this.setState({
      showRemoveProfileConfirm: true,
      removableProfile: profileName
    });
  }

  async createProfile(profileName) {
    const { history, refresh } = this.props;
    try {
      await DBMS.createProfile({ type: 'character', characterName: profileName });
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

  async renameProfile(profileName) {
    const { history, match, refresh } = this.props;
    const { id: currentProfileName } = match.params;
    const { renamableProfile } = this.state;
    try {
      await DBMS.renameProfile({ type: 'character', fromName: renamableProfile, toName: profileName });
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

  async removeProfile(e) {
    const {
      history, match, refresh, primaryNames
    } = this.props;
    const { id: currentProfileName } = match.params;
    const { removableProfile } = this.state;
    try {
      await DBMS.removeProfile({ type: 'character', characterName: removableProfile });
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
      this.onRemoveProfileCancel();
    } catch (err) {
      UI.handleError(err);
    }
    return null;
  }

  render() {
    const {
      showCreateProfilePrompt, showRenameProfilePrompt, renamableProfile,
      showRemoveProfileConfirm, removableProfile
    } = this.state;
    const { t, primaryNames, profileBinding } = this.props;

    return (
      <div className="ProfileNav panel panel-default  entity-select height-100p">
        <div className="panel-body height-100p">
          <div className="flex-row entity-toolbar">
            <input className="form-control entity-filter flex-1-1-auto" type="search" />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon create flex-0-0-auto"
              onClick={this.onCreateProfileRequest}
              title={t('profiles.create-character')}
            />
          </div>
          <ul className="entity-list ">
            {
              primaryNames.map((primaryName) => (
                <li className="flex-row">
                  <NavLink className="btn btn-default flex-1-1-auto text-align-left" to={`/characters/characterEditor/${primaryName}`}>
                    <div>{primaryName}</div>
                    {profileBinding[primaryName] && <div className="small">{profileBinding[primaryName]}</div>}
                  </NavLink>
                  <Dropdown id="dropdown-custom-2">
                    <Dropdown.Toggle noCaret className="btn btn-default fa-icon kebab" />
                    <Dropdown.Menu>
                      <MenuItem
                        onClick={this.onRenameProfileRequest}
                        data-profile-name={primaryName}
                      >
                        {t('profiles.rename-character')}
                      </MenuItem>
                      <MenuItem divider />
                      <MenuItem
                        onClick={this.onRemoveProfileRequest}
                        data-profile-name={primaryName}
                      >
                        {t('profiles.remove-character')}
                      </MenuItem>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              ))
            }
          </ul>
        </div>
        <PromptDialog
          show={showCreateProfilePrompt}
          title={t('profiles.enter-character-name')}
          onSubmit={this.createProfile}
          onCancel={this.onCreateProfileCancel}
        />
        <PromptDialog
          show={showRenameProfilePrompt}
          title={t('profiles.enter-new-character-name')}
          defaultValue={renamableProfile}
          onSubmit={this.renameProfile}
          onCancel={this.onRenameProfileCancel}
        />
        <ConfirmDialog
          show={showRemoveProfileConfirm}
          message={t('profiles.are-you-sure-about-character-removing2', { profileName: removableProfile })}
          onConfirm={this.removeProfile}
          onCancel={this.onRemoveProfileCancel}
        />
      </div>
    );
  }
}

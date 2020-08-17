import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';

import Button from 'react-bootstrap/es/Button';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { ProfileConstructorRow } from './ProfileConstructorRow';
import { CreateProfileItemDialog } from './CreateProfileItemDialog.jsx';
import { ModalTrigger } from '../../commons/uiCommon3/ModalTrigger.jsx';
import './ProfileConstructor.css';

export class ProfileConstructor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profileStructure: null,
    };
    this.createProfileItem = this.createProfileItem.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
  }

  // componentDidUpdate() {
  //   this.getStateInfo();
  // }

  refresh() {
    const { dbms } = this.props;
    Promise.all([dbms.getProfileStructure({ type: 'character' })]).then((results) => {
      const [profileStructure] = results;
      this.setState({
        profileStructure
      });
    }).catch(UI.handleError);
  }

  createProfileItem() {
    return Promise.resolve();
  }

  render() {
    const { profileStructure } = this.state;
    if (!profileStructure) {
      return null;
    }

    const { dbms, t } = this.props;

    return (
      <div className="profile-constructor block">
        <div className="panel panel-default max-height-100p overflow-auto">
          <div className="panel-body profile-panel">
            <div className="entity-management">
              <div>
                <ModalTrigger
                  modal={(
                    <CreateProfileItemDialog profileStructure={profileStructure} onCreate={this.refresh} />
                  )}
                >
                  <Button
                    className="fa-icon create adminOnly icon-padding"
                  >
                    {t('profiles.create-profile-item')}
                  </Button>
                </ModalTrigger>
              </div>
            </div>
            {/* profileStructure.length === 0 */}
            <InlineNotification type="info" showIf={profileStructure.length === 0}>
              {t('advices.empty-character-profile-structure')}
            </InlineNotification>
            {/* <div className="alert alert-info">{t('advices.empty-character-profile-structure')}</div> */}
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>№</th>
                  <th>{t('profiles.table-profile-item-name')}</th>
                  <th>{t('profiles.profile-item-type')}</th>
                  <th>{t('profiles.profile-item-default-value')}</th>
                  <th>{t('profiles.profile-item-player-access')}</th>
                  {/* <th className="hidden">{t('profiles.show-in-role-grid')}</th> */}
                </tr>
              </thead>
              <tbody className="profile-config-container">
                {
                  profileStructure.map((profileStructureItem, i) => (
                    <ProfileConstructorRow profileStructureItem={profileStructureItem} i={i} refresh={this.refresh} />
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/*
  <template class="enum-value-editor-tmpl">
    <div class="flex-row">
      <div class="margin-right-8 flex-1-1-auto">
        <span class="text"></span>
      </div>
      <div class="flex-0-0-auto">
        <button class="btn btn-default btn-reduced fa-icon add flex-0-0-auto adminOnly" l10n-title="profiles-add-remove-values"></button>
        <button class="btn btn-default btn-reduced fa-icon rename flex-0-0-auto adminOnly" l10n-title="profiles-rename-enum-item"></button>
      </div>
    </div>
  </template> */}
      </div>
    );
  }
}

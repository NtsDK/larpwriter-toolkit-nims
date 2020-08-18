import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { RenameProfileItemDialog } from '../RenameProfileItemDialog.jsx';
import { RemoveProfileItemDialog } from '../RemoveProfileItemDialog.jsx';
import { ChangeProfileItemTypeDialog } from '../ChangeProfileItemTypeDialog.jsx';
import { ModalTrigger } from '../../../commons/uiCommon3/ModalTrigger.jsx';
import { ToggleButton } from '../../../commons/uiCommon3/ToggleButton.jsx';
import './ProfileConstructorRow.css';

export class ProfileConstructorRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.changeProfileItemPlayerAccess = this.changeProfileItemPlayerAccess.bind(this);
    this.doExportProfileItemChange = this.doExportProfileItemChange.bind(this);
  }

  componentDidMount() {
    console.log('ProfileConstructorRow mounted');
  }

  componentDidUpdate() {
    console.log('ProfileConstructorRow did update');
  }

  componentWillUnmount() {
    console.log('ProfileConstructorRow will unmount');
  }

  changeProfileItemPlayerAccess(event) {
    const {
      dbms, refresh
    } = this.props;
    const { value } = event.target;
    const { profileItemName } = event.target.dataset;

    dbms.changeProfileItemPlayerAccess({
      type: 'character',
      profileItemName,
      playerAccessType: value
    }).then(refresh).catch((err) => {
      UI.processError()(err);
    });
  }

  doExportProfileItemChange(e) {
    const { checked } = e.target;
    const {
      dbms, refresh
    } = this.props;
    const { profileItemName } = e.target.dataset;
    dbms.doExportProfileItemChange({
      type: 'character',
      profileItemName,
      checked
    }).then(refresh).catch((err) => {
      UI.processError()(err);
    });
  }

  render() {
    // const { something } = this.state;

    const {
      profileStructureItem, i, t, refresh
    } = this.props;

    const selectData = R.keys(Constants.profileFieldTypes).map((type) => ({
      value: type,
      displayName: t(`constant.${type}`)
    }));

    selectData.sort(CU.charOrdAObject);

    const playerAccessData = Constants.playerAccessTypes.map((type) => ({
      value: type,
      displayName: t(`constant.${type}`)
    }));

    return (
      <tr>
        <td><span>{i + 1}</span></td>
        <td><span>{profileStructureItem.name}</span></td>
        <td>
          <span>{t(`constant.${profileStructureItem.type}`)}</span>
        </td>
        <td className="item-default-value-container" />
        <td>
          <select
            className="player-access form-control"
            value={profileStructureItem.playerAccess}
            onChange={this.changeProfileItemPlayerAccess}
            data-profile-item-name={profileStructureItem.name}
          >
            {
              playerAccessData.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.displayName}
                </option>
              ))
            }
          </select>
        </td>
        <td>
          <ToggleButton
            type="checkbox"
            checked={profileStructureItem.doExport}
            title={t('profiles.profile-item-do-export')}
            onChange={this.doExportProfileItemChange}
            className="print"
            data={{ 'profile-item-name': profileStructureItem.name }}
          />
        </td>
        <td>
          <Dropdown pullRight>
            <Dropdown.Toggle noCaret className="btn btn-default fa-icon kebab" />
            <Dropdown.Menu>
              <MenuItem>
                {t('profiles.move-profile-item')}
              </MenuItem>

              <ModalTrigger
                modal={(
                  <RenameProfileItemDialog
                    profileItemName={profileStructureItem.name}
                    onRename={refresh}
                  />
                )}
              >
                <MenuItem>
                  {t('profiles.rename-profile-item')}
                </MenuItem>
              </ModalTrigger>

              <ModalTrigger
                modal={(
                  <ChangeProfileItemTypeDialog
                    profileItemName={profileStructureItem.name}
                    profileItemType={profileStructureItem.type}
                    onChange={refresh}
                  />
                )}
              >
                <MenuItem>
                  {t('profiles.change-profile-item-type')}
                </MenuItem>
              </ModalTrigger>

              <MenuItem divider />

              <ModalTrigger
                modal={(
                  <RemoveProfileItemDialog
                    profileItemName={profileStructureItem.name}
                    index={i}
                    onRemove={refresh}
                  />
                )}
              >
                <MenuItem>
                  {t('profiles.remove-profile-item')}
                </MenuItem>
              </ModalTrigger>
            </Dropdown.Menu>
          </Dropdown>

        </td>
      </tr>
    );
  }
}

import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { RenameProfileItemDialog } from '../RenameProfileItemDialog.jsx';
import { RemoveProfileItemDialog } from '../RemoveProfileItemDialog.jsx';
import { ModalTrigger } from '../../../commons/uiCommon3/ModalTrigger.jsx';
import './ProfileConstructorRow.css';

export class ProfileConstructorRow extends Component {
  state = {
  };

  componentDidMount() {
    console.log('ProfileConstructorRow mounted');
  }

  componentDidUpdate() {
    console.log('ProfileConstructorRow did update');
  }

  componentWillUnmount() {
    console.log('ProfileConstructorRow will unmount');
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

    const item2Option = (selectedValue) => (item) => (
      <option
        value={item.value}
        // selected={selectedValue === item.value}
      >
        {item.displayName}
      </option>
    );

    // if (!something) {
    //   return null;
    // }
    return (
      <tr>
        <td><span>{i + 1}</span></td>
        <td><span>{profileStructureItem.name}</span></td>
        <td>
          <span>{t(`constant.${profileStructureItem.type}`)}</span>
          {/* <select className="item-type form-control">
            {
              selectData.map(item2Option(profileStructureItem.type))
            }
          </select> */}
        </td>
        <td className="item-default-value-container" />
        <td>
          <select className="player-access form-control" value={profileStructureItem.playerAccess}>
            {
              playerAccessData.map(item2Option(profileStructureItem.playerAccess))
            }
          </select>
        </td>
        <td>
          <button
            type="button"
            className={`btn btn-default btn-reduced fa-icon print flex-0-0-auto ${profileStructureItem.doExport && 'btn-primary'}`}
            title={t('profiles.profile-item-do-export')}
          />
        </td>
        {/* <td className="hidden"><input type="checkbox" className="show-in-role-grid  form-control" /></td> */}
        <td>
          {/* <button
            type="button"
            className="btn btn-default btn-reduced fa-icon move flex-0-0-auto "
            title={t('profiles.move-profile-item')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon rename rename-profile-item flex-0-0-auto "
            title={t('profiles.rename-profile-item')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon remove flex-0-0-auto "
            title={t('profiles.remove-profile-item')}
          /> */}
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
              <MenuItem>
                {t('profiles.change-profile-item-type')}
              </MenuItem>
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

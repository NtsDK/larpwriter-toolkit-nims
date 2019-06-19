import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ProfileConstructorRow.css';

export default class ProfileConstructorRow extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('ProfileConstructorRow mounted');
  }

  componentDidUpdate = () => {
    console.log('ProfileConstructorRow did update');
  }

  componentWillUnmount = () => {
    console.log('ProfileConstructorRow will unmount');
  }

  render() {
    // const { something } = this.state;

    const { profileStructureItem, i, t } = this.props;

    const selectData = R.keys(Constants.profileFieldTypes).map(type => ({
      value: type,
      displayName: t(`constant.${type}`)
    }));

    selectData.sort(CU.charOrdAObject);

    const playerAccessData = Constants.playerAccessTypes.map(type => ({
      value: type,
      displayName: t(`constant.${type}`)
    }));

    const item2Option = selectedValue => item => (
      <option
        value={item.value}
        selected={selectedValue === item.value}
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
          <select className="item-type form-control">
            {
              selectData.map(item2Option(profileStructureItem.type))
            }
          </select>
        </td>
        <td className="item-default-value-container" />
        <td>
          <select className="player-access form-control">
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
          <button
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
          />
        </td>
      </tr>
    );
  }
}

ProfileConstructorRow.propTypes = {
  // bla: PropTypes.string,
};

ProfileConstructorRow.defaultProps = {
  // bla: 'test',
};

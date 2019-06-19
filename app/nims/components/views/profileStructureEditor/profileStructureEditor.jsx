/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

// import {
//   BrowserRouter as Router, Switch, Route, Redirect
// } from 'react-router-dom';

// const DbmsFactory = require('DbmsFactory');

// import * as makeDBMS from 'DbmsFactory';
// import Button from 'react-bootstrap/Button';
// import ButtonGroup from 'react-bootstrap/ButtonGroup';
// import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
// import { faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
// import Header from '../header';
// import Overview from '../../views2/overview';


// import RandomPlanet from '../random-planet';
// import ErrorBoundry from '../error-boundry';
// import SwapiService from '../../services/swapi-service';
// import DummySwapiService from '../../services/dummy-swapi-service';

// import {
//   PeoplePage,
//   PlanetsPage,
//   StarshipsPage,
//   LoginPage,
//   SecretPage } from '../pages';

// import { SwapiServiceProvider } from '../swapi-service-context';


import './profileStructureEditor.css';

// import DemoBase from 'resources/demoBase';

// const apis = require('apis');
// const logModule = require('front-db/consoleLogModule');
// const CallNotificator = require('front-db/callNotificator');

// console.log(makeDBMS);

// console.log(DemoBase);

// import StarshipDetails from '../sw-components/starship-details';

export default class ProfileStructureEditor extends Component {
  state = {
    profileStructure: null
  };

  componentDidMount() {
    this.getStateInfo();
  }


  // componentDidUpdate() {
  //   this.getStateInfo();
  // }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([dbms.getProfileStructure({ type: 'character' })]).then((results) => {
      const [profileStructure] = results;
      this.setState({
        profileStructure
      });
    });
  }

  render() {
    const { profileStructure } = this.state;
    if (!profileStructure) {
      return null;
    }
    // if()

    const { dbms, t } = this.props;

    // const { dbms } = this.state;

    // var fillItemTypesSel = sel => U.fillSelector(sel, UI.constArr2Select(R.keys(Constants.profileFieldTypes)));

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

    const tableContent = profileStructure.map((profileStructureItem, i) => {
      console.log(123);
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
    });

    return (
      <div className="profile-structure-editor block">
        <div className="panel panel-default max-height-100p overflow-auto">
          <div className="panel-body profile-panel">
            <div className="entity-management">
              <div>
                <button
                  type="button"
                  className="btn btn-default btn-reduced fa-icon create adminOnly"
                  title={t('profiles.create-profile-item')}
                />
              </div>
            </div>
            <div className="alert alert-info">{t('advices.empty-character-profile-structure')}</div>
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
                  tableContent
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* <template class="profile-configurer-row-tmpl">
    <tr>
      <td><span class="item-position adminOnly"></span></td>
      <td><span class="item-name adminOnly"></span></td>
      <td><select class="item-type adminOnly form-control"></select></td>
      <td class="item-default-value-container"></td>
      <td><select class="player-access adminOnly form-control"></select></td>
      <td>
        <button class="btn btn-default btn-reduced fa-icon print flex-0-0-auto adminOnly" l10n-title="profiles-profile-item-do-export"></button>
      </td>
      <td class="hidden"><input type="checkbox" class="show-in-role-grid adminOnly form-control"></td>
      <td>
        <button class="btn btn-default btn-reduced fa-icon move flex-0-0-auto adminOnly" l10n-title="profiles-move-profile-item"></button>
        <button class="btn btn-default btn-reduced fa-icon rename rename-profile-item flex-0-0-auto adminOnly" l10n-title="profiles-rename-profile-item"></button>
        <button class="btn btn-default btn-reduced fa-icon remove flex-0-0-auto adminOnly" l10n-title="profiles-remove-profile-item"></button>
      </td>
    </tr>
  </template>

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
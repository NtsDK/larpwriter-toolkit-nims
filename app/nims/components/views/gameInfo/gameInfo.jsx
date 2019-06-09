/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import dateFormat from 'dateformat';
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


import './gameInfo.css';

export default class GameInfo extends Component {
  state = {
    // meta: {
    name: '',
    description: '',
    saveTime: new Date().toDateString(),
    preGameDate: '',
    date: '',
    // },
    // stats: {

    // }
  };

  // constructor() {
  //   super();
  // }
  // state = {
  //   dbms: makeDBMS(
  //     {
  //       logModule,
  //       projectName: PROJECT_NAME,
  //       proxies: [],
  //       // proxies: [CallNotificator],
  //       apis,
  //       isServer: PRODUCT !== 'STANDALONE'
  //     }
  //   ).preparedDb
  //   // swapiService: new SwapiService(),
  //   // isLoggedIn: false
  // };

  componentDidMount() {
    // // eslint-disable-next-line react/destructuring-assignment
    // this.state.dbms.setDatabase({ database: DemoBase.data });
    this.getStateInfo();
  }


  // componentDidUpdate() {
  //   this.getStateInfo();
  // }

  getStateInfo = () => {
    this.props.dbms.getMetaInfo().then((metaInfo) => {
      this.setState({
        // meta: {
        name: metaInfo.name,
        description: metaInfo.description,
        saveTime: metaInfo.saveTime,
        preGameDate: metaInfo.preGameDate,
        date: metaInfo.date,
        // }
      // .name.value = metaInfo.name;
      // state.date.value = metaInfo.date;
      // state.preDate.value = metaInfo.preGameDate;
      // state.descr.value = metaInfo.description;
      });
    });
  }

  onStateChange = prop => (e) => {
    // this.setState(({ meta }) => ({
    //   meta: {
    //     // ...meta,
    //     [prop]: e.target.value
    //   }
    // }));
    let funcName;
    switch (prop) {
    case 'name': case 'description':
      funcName = 'setMetaInfoString';
      break;
    case 'date': case 'preGameDate':
      funcName = 'setMetaInfoString';
      break;
    default:
      console.error(`unexpected prop ${prop}`);
      funcName = null;
    }
    const { value } = e.target;
    this.props.dbms[funcName]({
      name: prop,
      value
    }).then((res) => {
      this.setState({
        // meta: {
        // ...meta,
        [prop]: value
        // }
      });
    }).catch(console.error);

    //   function updateName(event) {
    //     DBMS.setMetaInfoString({ name: 'name', value: event.target.value }).catch(UI.handleError);
    // }
    // function updateTime(dp, input) {
    //     DBMS.setMetaInfoDate({ name: 'date', value: input.val() }).catch(UI.handleError);
    // }
    // function updatePreGameDate(dp, input) {
    //     DBMS.setMetaInfoDate({ name: 'preGameDate', value: input.val() }).catch(UI.handleError);
    // }
    // function updateDescr(event) {
    //     DBMS.setMetaInfoString({ name: 'description', value: event.target.value }).catch(UI.handleError);
    // }
  }

  //

  //   onLogin = () => {
  //     this.setState({
  //       isLoggedIn: true
  //     });
  //   };

  //   onServiceChange = () => {
  //     this.setState(({ swapiService }) => {
  //       const Service = swapiService instanceof SwapiService ?
  //                         DummySwapiService : SwapiService;
  //       return {
  //         swapiService: new Service()
  //       };
  //     });
  //   };

  render() {
    const {
      name,
      description,
      saveTime,
      preGameDate,
      date
    } = this.state;
    const { dbms } = this.props;

    // const { dbms } = this.state;

    return (
      <div className="game-info-view block">
        <div className="panel panel-default">
          <div className="panel-body">


            <div className="container-fluid">
              <div className="row">
                <div className="col-xs-9">
                  <div className="container-fluid">
                    <div className="row">
                      <div className="col-xs-6">
                        <div className="form-group">
                          <label className=" control-label" l10n-id="overview-name" htmlFor="gameNameInput">Название игры</label>
                          <input id="gameNameInput" className="adminOnly form-control" value={name} onChange={this.onStateChange('name')} />
                        </div>
                        <div className="form-group">
                          <span className=" control-label" l10n-id="overview-last-save-time">Время последнего сохранения</span>
                          <p id="lastSaveTime" className="form-control-static" l10n-id="overview-last-save-time">{dateFormat(new Date(saveTime), 'yyyy/mm/dd HH:MM:ss')}</p>
                        </div>
                      </div>
                      <div className="col-xs-6">
                        <div className="form-group">
                          <label className=" control-label" l10n-id="overview-pre-game-start-date" htmlFor="preGameDatePicker">Дата начала доигровых событий</label>
                          <input id="preGameDatePicker" className="adminOnly form-control" value={preGameDate} onChange={this.onStateChange('preGameDate')} />
                        </div>
                        <div className="form-group">
                          <label className=" control-label" l10n-id="overview-pre-game-end-date" htmlFor="gameDatePicker">Дата окончания доигровых событий</label>
                          <input id="gameDatePicker" className="adminOnly form-control" value={date} onChange={this.onStateChange('date')} />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <div className="form-group">
                          <label l10n-id="overview-descr" htmlFor="game-description-area">Описание игры</label>
                          <textarea id="game-description-area" className="adminOnly game-description-area form-control" value={description} onChange={this.onStateChange('description')} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="col-xs-3">
                  <table className="table table-bordered table-striped stats-table">
                    <thead>
                      <tr>
                        <th colSpan="2" l10n-id="overview-stats">Статистика</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-character-count">      </span></td>
                        <td>
                          <span className="statisticsValue" id="characterNumber" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-player-count">         </span></td>
                        <td>
                          <span className="statisticsValue" id="playerNumber" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-story-count">          </span></td>
                        <td>
                          <span className="statisticsValue" id="storyNumber" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-group-count">          </span></td>
                        <td>
                          <span className="statisticsValue" id="groupNumber" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-event-count">          </span></td>
                        <td>
                          <span className="statisticsValue" id="eventsNumber" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-user-count">           </span></td>
                        <td>
                          <span className="statisticsValue" id="userNumber" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-first-event">          </span></td>
                        <td>
                          <span className="statisticsValue" id="firstEvent" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-last-event">           </span></td>
                        <td>
                          <span className="statisticsValue" id="lastEvent" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-symbol-count">         </span></td>
                        <td><span className="statisticsValue" id="textCharacterNumber" /></td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-story-completeness">   </span></td>
                        <td>
                          <span className="statisticsValue" id="storyCompleteness" />
                          {' '}
                        </td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-general-completeness"> </span></td>
                        <td><span className="statisticsValue" id="generalCompleteness" /></td>
                      </tr>
                      <tr>
                        <td><span className="statisticsLabel" l10n-id="overview-relation-completeness" /></td>
                        <td><span className="statisticsValue" id="relationCompleteness" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
// HelloEs6.propTypes = {
//   name: PropTypes.string.isRequired,
// };

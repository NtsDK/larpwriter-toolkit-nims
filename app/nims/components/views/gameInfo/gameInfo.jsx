/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import dateFormat from 'dateformat';

import './gameInfo.css';

export default class GameInfo extends Component {
  state = {
    name: '',
    description: '',
    saveTime: new Date().toDateString(),
    preGameDate: '',
    date: '',
    statistics: {}
  };

  componentDidMount() {
    this.getStateInfo();
  }


  // componentDidUpdate() {
  //   this.getStateInfo();
  // }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([dbms.getMetaInfo(), dbms.getStatisticsLevel1()]).then((results) => {
      const [metaInfo, statistics] = results;
      this.setState({
        name: metaInfo.name,
        description: metaInfo.description,
        saveTime: metaInfo.saveTime,
        preGameDate: metaInfo.preGameDate,
        date: metaInfo.date,
        statistics
      });
    });
  }

  onStateChange = prop => (e) => {
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
    const { dbms } = this.props;
    dbms[funcName]({
      name: prop,
      value
    }).then((res) => {
      this.setState({
        [prop]: value
      });
    }).catch(console.error);
  }

  render() {
    const {
      name,
      description,
      saveTime,
      preGameDate,
      date,
      statistics
    } = this.state;
    const { dbms, t } = this.props;

    const formatDate = str => (str !== '' ? dateFormat(new Date(str), 'yyyy/mm/dd h:MM') : '');
    const formatI18n = key => obj => t(key, obj);

    const formatValue = (obj, str) => {
      if (str === undefined) {
        return '';
      }
      return obj.format ? obj.format(str) : str;
    };

    const stats = [{
      label: 'character-count',
      value: 'characterNumber'
    }, {
      label: 'player-count',
      value: 'playerNumber'
    }, {
      label: 'story-count',
      value: 'storyNumber'
    }, {
      label: 'group-count',
      value: 'groupNumber'
    }, {
      label: 'event-count',
      value: 'eventsNumber'
    }, {
      label: 'user-count',
      value: 'userNumber'
    }, {
      label: 'first-event',
      value: 'firstEvent',
      format: formatDate
    }, {
      label: 'last-event',
      value: 'lastEvent',
      format: formatDate
    }, {
      label: 'symbol-count',
      value: 'textCharacterNumber'
    }, {
      label: 'story-completeness',
      value: 'storyCompleteness',
      format: formatI18n('overview.story-completeness-value')
    }, {
      label: 'general-completeness',
      value: 'generalCompleteness',
      format: formatI18n('overview.general-completeness-value')
    }, {
      label: 'relation-completeness',
      value: 'relationCompleteness',
      format: formatI18n('overview.relation-completeness-value')
    }];

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
                          <label className=" control-label" htmlFor="gameNameInput">{t('overview.name')}</label>
                          <input id="gameNameInput" className="adminOnly form-control" value={name} onChange={this.onStateChange('name')} />
                        </div>
                        <div className="form-group">
                          <span className=" control-label">{t('overview.last-save-time')}</span>
                          <p id="lastSaveTime" className="form-control-static">{dateFormat(new Date(saveTime), 'yyyy/mm/dd HH:MM:ss')}</p>
                        </div>
                      </div>
                      <div className="col-xs-6">
                        <div className="form-group">
                          <label className=" control-label" htmlFor="preGameDatePicker">{t('overview.pre-game-start-date')}</label>
                          <input id="preGameDatePicker" className="adminOnly form-control" value={preGameDate} onChange={this.onStateChange('preGameDate')} />
                        </div>
                        <div className="form-group">
                          <label className=" control-label" htmlFor="gameDatePicker">{t('overview.pre-game-end-date')}</label>
                          <input id="gameDatePicker" className="adminOnly form-control" value={date} onChange={this.onStateChange('date')} />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <div className="form-group">
                          <label htmlFor="game-description-area">{t('overview.descr')}</label>
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
                        <th colSpan="2">{t('overview.stats')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        stats.map(obj => (
                          <tr key={obj.label}>
                            <td>
                              <span className="statisticsLabel">{t(`overview.${obj.label}`)}</span>
                            </td>
                            <td>
                              <span className="statisticsValue">
                                {formatValue(obj, statistics[obj.value])}
                              </span>
                            </td>
                          </tr>
                        ))
                      }
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
GameInfo.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  dbms: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  t: PropTypes.func.isRequired,
};

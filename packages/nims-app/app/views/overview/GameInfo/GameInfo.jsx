import React, { Component } from 'react';
import dateFormat from 'dateformat';
import { UI, U, L10n } from 'nims-app-core';
import { DateTimePicker } from '../../commons/uiCommon3';
import './GameInfo.css';

export class GameInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      saveTime: new Date().toDateString(),
      preGameDate: '',
      date: '',
      statistics: null
    };
    this.updateName = this.updateName.bind(this);
    this.updateTime = this.updateTime.bind(this);
    this.updatePreGameDate = this.updatePreGameDate.bind(this);
    this.updateDescr = this.updateDescr.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('GameInfo mounted');
  }

  componentDidUpdate() {
    console.log('GameInfo did update');
  }

  componentWillUnmount() {
    console.log('GameInfo will unmount');
  }

  updateName(event) {
    this.setState({
      name: event.target.value
    });
    DBMS.setMetaInfoString({ name: 'name', value: event.target.value }).catch(UI.handleError);
  }

  updateTime({ dateStr }) {
    // this.setState({
    //   name: event.target.value
    // });
    this.setState({
      date: dateStr
    });
    DBMS.setMetaInfoDate({ name: 'date', value: dateStr }).catch(UI.handleError);
  }

  updatePreGameDate({ dateStr }) {
    this.setState({
      preGameDate: dateStr
    });
    DBMS.setMetaInfoDate({ name: 'preGameDate', value: dateStr }).catch(UI.handleError);
  }

  updateDescr(event) {
    this.setState({
      description: event.target.value
    });
    DBMS.setMetaInfoString({ name: 'description', value: event.target.value }).catch(UI.handleError);
  }

  refresh() {
    // const { dbms } = this.props;
    Promise.all([
      DBMS.getMetaInfo(),
      DBMS.getStatisticsLevel1()
    ]).then((results) => {
      const [metaInfo, statistics] = results;
      this.setState({
        name: metaInfo.name,
        description: metaInfo.description,
        saveTime: metaInfo.saveTime,
        preGameDate: metaInfo.preGameDate,
        date: metaInfo.date,
        statistics
      });
    }).catch(UI.handleError);
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

    if (!statistics) {
      return null;
    }

    const formatDate = (str) => (str !== '' ? dateFormat(new Date(str), 'yyyy/mm/dd h:MM') : '');
    const formatI18n = (key) => (obj) => t(key, obj);

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
      format: formatI18n('overview.story-completeness-value2')
    }, {
      label: 'general-completeness',
      value: 'generalCompleteness',
      format: formatI18n('overview.general-completeness-value2')
    }, {
      label: 'relation-completeness',
      value: 'relationCompleteness',
      format: formatI18n('overview.relation-completeness-value2')
    }];

    const statEls = stats.map((obj) => (
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
    ));

    return (
      <div className="GameInfo game-info-view block">
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
                          <input
                            id="gameNameInput"
                            className="adminOnly form-control"
                            value={name}
                            onChange={this.updateName}
                          />
                        </div>
                        <div className="form-group">
                          <span className=" control-label">{t('overview.last-save-time')}</span>
                          <p id="lastSaveTime" className="form-control-static">{dateFormat(new Date(saveTime), 'yyyy/mm/dd HH:MM:ss')}</p>
                        </div>
                      </div>
                      <div className="col-xs-6">
                        <div className="form-group">
                          <label className=" control-label" htmlFor="preGameDatePicker">{t('overview.pre-game-start-date')}</label>
                          <div>
                            <DateTimePicker
                              className="adminOnly time-input form-control"
                              date={new Date(preGameDate)}
                              onChange={this.updatePreGameDate}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className=" control-label" htmlFor="gameDatePicker">{t('overview.pre-game-end-date')}</label>
                          <div>
                            <DateTimePicker
                              className="adminOnly time-input form-control"
                              date={new Date(date)}
                              onChange={this.updateTime}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <div className="form-group">
                          <label htmlFor="game-description-area">{t('overview.descr')}</label>
                          <textarea
                            id="game-description-area"
                            className="adminOnly game-description-area form-control"
                            value={description}
                            onChange={this.updateDescr}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="col-xs-3">
                  <table className="table table-bordered table-striped stats-table">
                    <thead>
                      <tr>
                        <th colSpan={2}>{t('overview.stats')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        statEls
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

  // render() {
  //   const { something } = this.state;
  //   // const { t } = this.props;

  //   if (!something) {
  //     return <div> GameInfo stub </div>;
  //     // return null;
  //   }
  //   return (
  //     <div className="GameInfo">
  //       GameInfo body
  //     </div>
  //   );
  // }
}

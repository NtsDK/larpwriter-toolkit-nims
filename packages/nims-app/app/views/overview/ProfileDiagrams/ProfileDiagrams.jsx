import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import { PieChart } from '../PieChart';
import { HistChart } from '../HistChart';
import { InlineNotification } from '../../commons/uiCommon3';
import { makeBindingStatsPie, makePieData, makeHistData } from '../diagramUtils';
import './ProfileDiagrams.css';

export class ProfileDiagrams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profileData: null
    };
    this.makeChart = this.makeChart.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('ProfileDiagrams mounted');
  }

  componentDidUpdate() {
    console.log('ProfileDiagrams did update');
  }

  componentWillUnmount() {
    console.log('ProfileDiagrams will unmount');
  }

  refresh() {
    const { dbms } = this.props;
    Promise.all([dbms.getProfileStatisticsLevel2()]).then((results) => {
      const [profileData] = results;
      console.log(profileData);
      this.setState({
        profileData
      });
    }).catch(UI.handleError);
  }

  tooltipKey = (data) => (
    <span>
      {data.label}
      <br />
      {data.value}
    </span>
  )

  makeChart(chartData) {
    const { t } = this.props;
    let chart;
    switch (chartData.type) {
    case 'enum':
      chart = <PieChart data={makePieData(chartData.data, R.identity)} />;
      break;
    case 'checkbox':
      chart = <PieChart data={makePieData(chartData.data, (l) => t(`constant.${String(l)}`))} />;
      break;
    case 'number':
      chart = (
        <HistChart
          data={makeHistData(chartData.data)}
          tooltipKey={this.tooltipKey}
          hideXAxis
        />
      );
      break;
    default:
      chart = <div>Unknown type</div>;
    }
    return (
      <div className="col-xs-3">
        <h4>{chartData.name}</h4>
        {chart}
      </div>
    );
  }

  render() {
    const { profileData } = this.state;
    if (!profileData) {
      return null;
    }

    const { t } = this.props;

    const characterCharts = profileData.characterCharts.map(this.makeChart);
    const playerCharts = profileData.playerCharts.map(this.makeChart);

    return (
      <div className="ProfileDiagrams profile-diagrams-view block">
        <div className="panel panel-default">
          <div className="panel-body">

            <h3>{t('overview.character-diagrams')}</h3>
            <InlineNotification type="info" showIf={characterCharts.length === 0}>
              {t('advices.no-character-profile-items-for-diagram')}
            </InlineNotification>
            <div className="container-fluid">
              <div className="profile-diagram-container row characterProfileDiagrams">
                {characterCharts}
              </div>
            </div>

            <h3>{t('overview.player-diagrams')}</h3>
            <InlineNotification type="info" showIf={playerCharts.length === 0}>
              {t('advices.no-player-profile-items-for-diagram')}
            </InlineNotification>
            <div className="container-fluid">
              <div className="profile-diagram-container row playerProfileDiagrams">
                {playerCharts}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

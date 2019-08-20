/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import './ProfileDiagrams.css';

import PieChart from '../../util/pieChart';
import HistChart from '../../util/histChart';

import { makePieData, makeHistData } from '../../../utils/diagramUtils';

export default class ProfileDiagrams extends Component {
  state = {
    profileData: null
  };

  componentDidMount() {
    this.getStateInfo();
  }


  // componentDidUpdate() {
  //   this.getStateInfo();
  // }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([dbms.getProfileStatisticsLevel2()]).then((results) => {
      const [profileData] = results;
      console.log(profileData);
      this.setState({
        profileData
      });
    });
  }

  tooltipKey = data => (
    <span>
      {data.label}
      <br />
      {data.value}
    </span>
  )

  makeChart = (chartData) => {
    const { t } = this.props;
    let chart;
    switch (chartData.type) {
    case 'enum':
      chart = <PieChart data={makePieData(chartData.data, R.identity)} />;
      break;
    case 'checkbox':
      chart = <PieChart data={makePieData(chartData.data, l => t(`constant.${String(l)}`))} />;
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
  };

  render() {
    const { profileData } = this.state;
    if (!profileData) {
      return null;
    }

    const { t } = this.props;

    const characterCharts = profileData.characterCharts.map(this.makeChart);
    const playerCharts = profileData.playerCharts.map(this.makeChart);

    return (
      <div className="profile-diagrams-view block">
        <div className="panel panel-default">
          <div className="panel-body">

            <h3>{t('overview.character-diagrams')}</h3>
            <div className="alert character alert-info margin-bottom-8">{t('advices.no-character-profile-items-for-diagram')}</div>
            <div className="container-fluid">
              <div className="profile-diagram-container row characterProfileDiagrams">
                {characterCharts}
              </div>
            </div>

            <h3>{t('overview.player-diagrams')}</h3>
            <div className="alert player alert-info margin-bottom-8">{t('advices.no-player-profile-items-for-diagram')}</div>
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

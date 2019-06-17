/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import PieChart from '../../util/pieChart';
import HistChart from '../../util/histChart';
import { makeBindingStatsPie, makePieData } from '../../../utils/diagramUtils';

import './statisticDiagrams.css';

export default class StatisticDiagrams extends Component {
  state = {
    statisticData: null
  };

  componentDidMount() {
    this.getStateInfo();
  }


  // componentDidUpdate() {
  //   this.getStateInfo();
  // }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([dbms.getStatisticsLevel2()]).then((results) => {
      const [statisticData] = results;
      this.setState({
        statisticData
      });
    });
  }

  tooltipKey = (key, t) => data => t(key, data);

  render() {
    const { statisticData } = this.state;
    if (!statisticData) {
      return null;
    }

    const { t } = this.props;

    return (
      <div className="statistic-diagrams-view block">
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="container-fluid">
              <div className="row margin-bottom-16">
                <div className="col-xs-4">
                  <h4>{t('overview.event-count-diagram')}</h4>
                  <div className="overviewHist storyEventsHist" />
                  <HistChart
                    data={statisticData.storyEventsHist}
                    tooltipKey={this.tooltipKey('overview.story-events-tooltip', t)}
                  />
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-count-diagram')}</h4>
                  <div className="overviewHist storyCharactersHist" />
                  <HistChart
                    data={statisticData.storyCharactersHist}
                    tooltipKey={this.tooltipKey('overview.story-characters-tooltip', t)}
                  />
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-stories-diagram')}</h4>
                  <div className="overviewHist characterStoriesHist" />
                  <HistChart
                    data={statisticData.characterStoriesHist}
                    tooltipKey={this.tooltipKey('overview.character-stories-tooltip', t)}
                  />
                </div>
              </div>
              <div className="row margin-bottom-16">
                <div className="col-xs-4">
                  <h4>{t('overview.story-completeness-diagram')}</h4>
                  <div className="overviewHist eventCompletenessHist" />
                  <HistChart
                    data={statisticData.eventCompletenessHist}
                    tooltipKey={this.tooltipKey('overview.event-completeness-tooltip', t)}
                    hideXAxis
                  />
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-symbols-diagram')}</h4>
                  <div className="overviewHist characterSymbolsHist" />
                  <HistChart
                    data={statisticData.characterSymbolsHist}
                    tooltipKey={this.tooltipKey('overview.character-symbols-hist', t)}
                    hideXAxis
                  />
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-symbols-doughnut')}</h4>
                  <PieChart
                    data={makePieData(statisticData.textCharactersCount, l => t(`constant.${l}`))}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-8">
                  <h4>{t('overview.object-belonging-diagrams')}</h4>
                  <div className="belonging-diagrams-container">
                    <div>
                      <span>{t('header.characters')}</span>
                      <PieChart data={statisticData.characterChart} />
                    </div>
                    <div>
                      <span>{t('header.players')}</span>
                      <PieChart data={statisticData.playerChart} />
                    </div>
                    <div>
                      <span>{t('header.stories')}</span>
                      <PieChart data={statisticData.storyChart} />
                    </div>
                    <div>
                      <span>{t('header.groups')}</span>
                      <PieChart data={statisticData.groupChart} />
                    </div>
                  </div>
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.binding-doughnut')}</h4>
                  <PieChart data={makeBindingStatsPie(statisticData.bindingStats, t)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie
} from 'recharts';

import './statisticDiagrams.css';

console.log(Constants.colorPalette);

const CustomHistTooltip = ({
  active, payload, label, tooltipKey, t
}) => {
  if (active) {
    if (payload[0].value === 0) {
      return null;
    }
    return (
      <div className="custom-tooltip">
        <p className="intro">
          {t(`overview.${tooltipKey}`, {
            label: payload[0].payload.tooltipLabel || payload[0].payload.label,
            value: payload[0].value
          })}
        </p>
        <p className="desc">{payload[0].payload.tip}</p>
      </div>
    );
  }

  return null;
};

const CustomPieTooltip = ({
  active, payload, label
}) => {
  if (active) {
    if (payload[0].value === 0) {
      return null;
    }
    return (
      <div className="custom-tooltip">
        <p className="intro">
          {payload[0].payload.tooltipLabel || payload[0].payload.label}
        </p>
      </div>
    );
  }

  return null;
};

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

  _makeTextCharactersPie = (counts, t) => {
    const sum = R.sum(R.values(counts));
    const pieData = R.toPairs(counts).map(pair => ({ label: pair[0], value: pair[1] }));
    pieData.forEach((pieCell) => {
      pieCell.tooltipLabel = `${t(`constant.${pieCell.label}`)}`;
      if (sum > 0) {
        pieCell.tooltipLabel += `: ${((pieCell.value / sum) * 100).toFixed(0)}% (${pieCell.value}/${sum})`;
      }
    });
    return pieData;
  }

  _makeBindingStatsPie = (counts, t) => {
    const pieData = R.toPairs(counts).map(pair => ({ label: pair[0], value: pair[1] }));
    pieData.forEach((pieCell) => {
      pieCell.tooltipLabel = `${t(`constant.${pieCell.label}`)}: ${pieCell.value}`;
    });
    return pieData;
  }

  render() {
    const { statisticData } = this.state;
    if (!statisticData) {
      return null;
    }

    const { dbms, t } = this.props;

    // const { dbms } = this.state;
    const getHistogram = (name, tooltipKey, hideXAxis) => (
      <div className="hist-container">
        <ResponsiveContainer>
          <BarChart data={statisticData[name]}>
            <CartesianGrid strokeDasharray="3 3" />
            {!hideXAxis ? <XAxis dataKey="label" /> : ''}
            <YAxis width={30} interval="preserveStartEnd" />
            <Tooltip content={<CustomHistTooltip tooltipKey={tooltipKey} t={t} />} />
            <Bar dataKey="value" fill="#7be141" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );

    const getPie = data => (
      <div className="hist-container">
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={data} innerRadius={30} outerRadius={55}>
              {
                data.map((entry, index) => <Cell fill={Constants.colorPalette[index % Constants.colorPalette.length].color.background} />)
              }
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );

    return (
      <div className="statistic-diagrams-view block">
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="container-fluid">
              <div className="row margin-bottom-16">
                <div className="col-xs-4">
                  <h4>{t('overview.event-count-diagram')}</h4>
                  <div className="overviewHist storyEventsHist" />
                  {getHistogram('storyEventsHist', 'story-events-tooltip')}
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-count-diagram')}</h4>
                  <div className="overviewHist storyCharactersHist" />
                  {getHistogram('storyCharactersHist', 'story-characters-tooltip')}
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-stories-diagram')}</h4>
                  <div className="overviewHist characterStoriesHist" />
                  {getHistogram('characterStoriesHist', 'character-stories-tooltip')}
                </div>
              </div>
              <div className="row margin-bottom-16">
                <div className="col-xs-4">
                  <h4>{t('overview.story-completeness-diagram')}</h4>
                  <div className="overviewHist eventCompletenessHist" />
                  {getHistogram('eventCompletenessHist', 'event-completeness-tooltip', true)}
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-symbols-diagram')}</h4>
                  <div className="overviewHist characterSymbolsHist" />
                  {getHistogram('characterSymbolsHist', 'character-symbols-hist', true)}
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.character-symbols-doughnut')}</h4>
                  {getPie(this._makeTextCharactersPie(statisticData.textCharactersCount, t))}
                </div>
              </div>
              <div className="row">
                <div className="col-xs-8">
                  <h4>{t('overview.object-belonging-diagrams')}</h4>
                  <div className="belonging-diagrams-container">
                    <div>
                      <span>{t('header.characters')}</span>
                      {getPie(statisticData.characterChart)}
                    </div>
                    <div>
                      <span>{t('header.players')}</span>
                      {getPie(statisticData.playerChart)}
                    </div>
                    <div>
                      <span>{t('header.stories')}</span>
                      {getPie(statisticData.storyChart)}
                    </div>
                    <div>
                      <span>{t('header.groups')}</span>
                      {getPie(statisticData.groupChart)}
                    </div>
                  </div>
                </div>
                <div className="col-xs-4">
                  <h4>{t('overview.binding-doughnut')}</h4>
                  {getPie(this._makeBindingStatsPie(statisticData.bindingStats, t))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

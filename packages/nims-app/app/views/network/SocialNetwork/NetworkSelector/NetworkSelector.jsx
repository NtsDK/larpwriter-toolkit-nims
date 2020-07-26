import React, { Component } from 'react';
import './NetworkSelector.css';
import * as Constants from 'nims-dbms/nimsConstants';
import classNames from 'classnames';

const activitiesList = ['active', 'follower', 'defensive', 'passive'];
const relationsList = ['allies', 'directional', 'neutral'];

export class NetworkSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activitySelection: {
        active: true,
        follower: true,
        defensive: true,
        passive: true,
      },
      relationSelection: {
        allies: true,
        directional: true,
        neutral: true,
      }
    };
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onActivityClick = this.onActivityClick.bind(this);
    this.onRelationClick = this.onRelationClick.bind(this);
  }

  componentDidMount() {
    console.log('NetworkSelector mounted');
  }

  componentDidUpdate() {
    console.log('NetworkSelector did update');
  }

  componentWillUnmount() {
    console.log('NetworkSelector will unmount');
  }

  onTypeChange(e) {
    const { onNetworkSettingsChange } = this.props;
    const { activitySelection, relationSelection } = this.state;
    const { value } = e.target;
    const result = { type: value };
    if (value === 'characterActivityInStory') {
      result.activitySelection = { ...activitySelection };
    }
    if (value === 'characterRelations') {
      result.relationSelection = { ...relationSelection };
    }
    onNetworkSettingsChange(result);
  }

  onActivityClick(e) {
    const { value } = e.target.dataset;
    this.setState((prevState) => ({
      activitySelection: {
        ...prevState.activitySelection,
        [value]: !prevState.activitySelection[value]
      }
    }));
  }

  onRelationClick(e) {
    const { value } = e.target.dataset;
    this.setState((prevState) => ({
      relationSelection: {
        ...prevState.relationSelection,
        [value]: !prevState.relationSelection[value]
      }
    }));
  }

  render() {
    const { activitySelection, relationSelection } = this.state;
    const { t, networkSettings } = this.props;

    return (
      <div className="NetworkSelector network-type-area">
        <select
          value={networkSettings.type}
          size={Constants.networks.length}
          id="networkSelector"
          className="form-control"
          onChange={this.onTypeChange}
        >
          {
            Constants.networks.map((networkType) => <option value={networkType}>{t(`constant.${networkType}`)}</option>)
          }
        </select>

        <div id="activityBlock">
          {
            networkSettings.type === 'characterActivityInStory' && activitiesList.map((activity) => (
              <button
                type="button"
                className={classNames('btn btn-default btn-reduced fa-icon flex-0-0-auto', `activity-icon-${activity}`, {
                  'btn-primary': activitySelection[activity]
                })}
                data-value={activity}
                title={t(`constant.${activity}`)}
                onClick={this.onActivityClick}
              />
            ))
          }
        </div>

        <div id="relationsBlock">
          {
            networkSettings.type === 'characterRelations' && relationsList.map((relation) => (
              <button
                type="button"
                className={classNames('btn btn-default btn-reduced fa-icon flex-0-0-auto', relation, {
                  'btn-primary': relationSelection[relation]
                })}
                data-value={relation}
                title={t(`briefings.${relation}`)}
                onClick={this.onRelationClick}
              />
            ))
          }
        </div>
      </div>
    );
  }
}

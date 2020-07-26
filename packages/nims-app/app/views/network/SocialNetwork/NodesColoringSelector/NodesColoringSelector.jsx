import React, { Component } from 'react';
import './NodesColoringSelector.css';
import * as R from 'ramda';
import * as Constants from 'nims-dbms/nimsConstants';
import { UI, U, L10n } from 'nims-app-core';
import { CHAR_PREFIX, PROFILE_GROUP, FILTER_GROUP } from '../SocialNetworkConstants';

export class NodesColoringSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      networkNodeGroups: [],
    };
  }

  componentDidMount() {
    const networkNodeGroups = this.getNetworkNodeGroups();
    this.setState({
      networkNodeGroups
    });
    console.log('NodesColoringSelector mounted');
  }

  componentDidUpdate(prevProps) {
    const { profileStructure, groupCharacterSets } = this.props;
    if (profileStructure !== prevProps.profileStructure
      || groupCharacterSets !== prevProps.groupCharacterSets) {
      const networkNodeGroups = this.getNetworkNodeGroups();
      this.setState({
        networkNodeGroups
      });
    }
    console.log('NodesColoringSelector did update');
  }

  componentWillUnmount() {
    console.log('NodesColoringSelector will unmount');
  }

  initGroupColors() {
    const colorGroups = this.getColorGroups();
    // const groupColors = R.clone(Constants.snFixedColors);
    // const groupLists = {};

    const info = colorGroups.reduce((acc, group) => {
      if (group.type === 'enum') {
        acc.groupLists[PROFILE_GROUP + group.name] = group.value.split(',').map((subGroupName, i) => {
          acc.groupColors[`${PROFILE_GROUP + group.name}.${subGroupName.trim()}`] = Constants.colorPalette[i + 2];
          return `${PROFILE_GROUP + group.name}.${subGroupName.trim()}`;
        });
      } else if (group.type === 'checkbox') {
        const trueName = L10n.const(Constants.true);
        const falseName = L10n.const(Constants.false);
        acc.groupColors[`${PROFILE_GROUP + group.name}.${trueName}`] = Constants.colorPalette[group.value ? 0 + 2 : 1 + 2];
        acc.groupColors[`${PROFILE_GROUP + group.name}.${falseName}`] = Constants.colorPalette[group.value ? 1 + 2 : 0 + 2];
        acc.groupLists[PROFILE_GROUP + group.name] = [`${PROFILE_GROUP + group.name}.${trueName}`, `${PROFILE_GROUP + group.name}.${falseName}`];
      } else {
        throw new Error(`Unexpected profile item type: ${group.type}`);
      }
      return acc;
    }, {
      groupColors: R.clone(Constants.snFixedColors),
      groupLists: {}
    });
    return info;
  }

  getColorGroups() {
    const { profileStructure } = this.props;
    return profileStructure.filter((element) => R.contains(element.type, ['enum', 'checkbox']));
  }

  getNetworkNodeGroups() {
    const { t, groupCharacterSets } = this.props;

    const colorGroups = this.getColorGroups();
    const defaultColorGroup = {
      value: Constants.noGroup,
      name: L10n.const(Constants.noGroup)
    };

    const profileGroups = R.pluck('name', colorGroups).map((name) => ({
      value: PROFILE_GROUP + name,
      name: t('social-network.profile-group2', { name })
    }));
    const filterGroups = R.keys(groupCharacterSets).map((name) => ({
      value: FILTER_GROUP + name,
      name: t('social-network.filter-group2', { name })
    }));
    return [defaultColorGroup].concat(profileGroups).concat(filterGroups);
  }

  render() {
    const { networkNodeGroups } = this.state;
    const { t } = this.props;

    return (
      <div className="NodesColoringSelector network-coloring-area">
        <div className="margin-bottom-16">
          <select id="networkNodeGroupSelector" className="form-control">
            {
              networkNodeGroups.map((group) => <option value={group.value}>{group.name}</option>)
            }
          </select>
        </div>
        <span className="margin-bottom-8 inline-block">{t('social-network.legend')}</span>
        <div id="colorLegend" />
      </div>
    );
  }
}

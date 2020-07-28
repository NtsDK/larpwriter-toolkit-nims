import React, { Component } from 'react';
import './NodesColoringSelector.css';
import * as R from 'ramda';
import * as Constants from 'nims-dbms/nimsConstants';
import { UI, U, L10n } from 'nims-app-core';
import { CHAR_PREFIX, PROFILE_GROUP, FILTER_GROUP } from '../SocialNetworkConstants';

function getColorGroups(profileStructure) {
  return profileStructure.filter((element) => R.contains(element.type, ['enum', 'checkbox']));
}

export function getGroupColors(profileStructure) {
  const colorGroups = getColorGroups(profileStructure);

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

export class NodesColoringSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      networkNodeGroups: [],
      // groupColors: {},
      // groupLists: {},
    };
    this.onNodeGroupChange = this.onNodeGroupChange.bind(this);
  }

  componentDidMount() {
    const { profileStructure } = this.props;
    const networkNodeGroups = this.getNetworkNodeGroups();
    const info = getGroupColors(profileStructure);
    this.setState({
      networkNodeGroups,
      ...info
    });
    console.log('NodesColoringSelector mounted');
  }

  componentDidUpdate(prevProps) {
    const { profileStructure, groupCharacterSets } = this.props;
    if (profileStructure !== prevProps.profileStructure
      || groupCharacterSets !== prevProps.groupCharacterSets) {
      const networkNodeGroups = this.getNetworkNodeGroups();
      // const info = getGroupColors(profileStructure);
      this.setState({
        networkNodeGroups,
        // ...info
      });
    }
    console.log('NodesColoringSelector did update');
  }

  componentWillUnmount() {
    console.log('NodesColoringSelector will unmount');
  }

  getLegendList() {
    const {
      nodesColoring, t, networkSettings, groupColorsInfo
    } = this.props;
    const { groupLists, groupColors } = groupColorsInfo;
    const { selectedGroup } = nodesColoring;
    const els = [];

    if (selectedGroup === 'noGroup') {
      els.push({
        label: t('constant.noGroup'),
        color: Constants.snFixedColors.noGroup.color
      });
    } else if (R.startsWith(PROFILE_GROUP, selectedGroup)) {
      els.push(...groupLists[selectedGroup].map((value) => ({
        label: value.substring(PROFILE_GROUP.length),
        color: groupColors[value].color
      })));
    } else if (R.startsWith(FILTER_GROUP, selectedGroup)) {
      els.push({
        label: t('constant.noGroup'),
        color: Constants.snFixedColors.noGroup.color
      });
      els.push({
        label: t('constant.fromGroup'),
        color: Constants.snFixedColors.fromGroup.color
      });
    } else {
      throw new Error(`Unexpected group name/type: ${selectedGroup}`);
    }

    if (['characterPresenceInStory', 'characterActivityInStory'].includes(networkSettings.type)) {
      els.push({
        label: t('social-network.story'),
        color: Constants.snFixedColors.storyColor.color
      });
    }
    return els;
  }

  getNetworkNodeGroups() {
    const { t, groupCharacterSets, profileStructure } = this.props;

    const colorGroups = getColorGroups(profileStructure);
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

  onNodeGroupChange(e) {
    const { onNodesColoringChange } = this.props;
    onNodesColoringChange({
      selectedGroup: e.target.value
    });
  }

  render() {
    const { networkNodeGroups } = this.state;
    const { t, nodesColoring } = this.props;

    const legendList = this.getLegendList();

    return (
      <div className="NodesColoringSelector network-coloring-area">
        <div className="margin-bottom-16">
          <select
            id="networkNodeGroupSelector"
            className="form-control"
            value={nodesColoring.selectedGroup}
            onChange={this.onNodeGroupChange}
          >
            {
              networkNodeGroups.map((group) => <option value={group.value}>{group.name}</option>)
            }
          </select>
        </div>
        <span className="margin-bottom-8 inline-block">{t('social-network.legend')}</span>
        <div id="colorLegend">
          {
            legendList.map((item) => (
              <div style={{
                backgroundColor: item.color.background,
                border: `2px solid ${item.color.border}`
              }}
              >
                {item.label}
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

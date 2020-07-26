import React, { Component, useState } from 'react';
import './SocialNetwork.css';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import * as Constants from 'nims-dbms/nimsConstants';
import PermissionInformer from 'permissionInformer';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { NodesColoringSelector } from './NodesColoringSelector';
import { NetworkSubsetsSelector } from './NetworkSubsetsSelector';
import { NetworkSelector } from './NetworkSelector';
import { CommonNetworkSettings } from './CommonNetworkSettings';
import { SocialNetworkArea } from './SocialNetworkArea';
import { SocialNetworkWarning } from './SocialNetworkWarning';

const STORY_PREFIX = 'St:';
const CHAR_PREFIX = 'Ch:';
const PROFILE_GROUP = 'prof-';
const FILTER_GROUP = 'filter-';

export class SocialNetwork extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      nodesColoring: {
        filter: 'noFilter'
      },
      networkSettings: {
        type: 'socialConnections'
      },
      showPlayerNames: false,
      focusNode: null
    };
  }

  componentDidMount() {
    this.refresh();
    console.log('SocialNetwork mounted');
  }

  componentDidUpdate() {
    console.log('SocialNetwork did update');
  }

  componentWillUnmount() {
    console.log('SocialNetwork will unmount');
  }

  refresh() {
    // let selector = U.fillSelector(U.clearEl(U.queryEl('#networkSelector')), UI.constArr2Select(Constants.networks));
    // [selector.value] = Constants.networks;
    // onNetworkSelectorChangeDelegate({ target: selector });

    // selector = U.clearEl(U.queryEl('#networkNodeGroupSelector'));

    Promise.all([
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }), // subset selector
      PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }), // subset selector
      DBMS.getAllProfiles({ type: 'character' }), // node coloring
      DBMS.getAllStories(), // contains most part of SN data
      DBMS.getProfileStructure({ type: 'character' }), // node coloring
      DBMS.getProfileBindings(), // node coloring
      DBMS.getGroupCharacterSets(), // node coloring
      DBMS.getMetaInfo(), // timelined network
      DBMS.getRelations() // relations
    ]).then((results) => {
      const [characterNames,
        storyNames,
        profiles,
        stories,
        profileStructure,
        profileBindings,
        groupCharacterSets,
        metaInfo,
        relations] = results;

      // translating yes/no profile items
      const checkboxes = profileStructure.filter((element) => R.equals(element.type, 'checkbox'));
      R.values(profiles).forEach((profile) => {
        checkboxes.map((item) => (profile[item.name] = L10n.const(Constants[profile[item.name]])));
      });

      // console.log(this.getNetworkNodeGroups(profileStructure, groupCharacterSets));

      this.initGroupColors(profileStructure);

      // NetworkSubsetsSelector.refresh({
      //   characterNames,
      //   storyNames,
      //   Stories: stories
      // });

      this.setState({
        Stories: stories,
        Characters: profiles,
        profileBindings,
        profileStructure,
        groupCharacterSets,
        metaInfo,
        relations,
      });
    }).catch(UI.handleError);
  }

  initGroupColors(profileStructure) {
    const colorGroups = this.getColorGroups(profileStructure);
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

  getColorGroups(profileStructure) {
    return profileStructure.filter((element) => R.contains(element.type, ['enum', 'checkbox']));
  }

  getNetworkNodeGroups(profileStructure, groupCharacterSets) {
    const { t } = this.props;

    const colorGroups = this.getColorGroups(profileStructure);
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
    const { profileStructure, groupCharacterSets } = this.state;
    const { t } = this.props;

    if (profileStructure === undefined) {
      return null;
    }

    const networkNodeGroups = this.getNetworkNodeGroups(profileStructure, groupCharacterSets);

    // if (!something) {
    //   return <div> SocialNetwork stub </div>;
    //   // return null;
    // }
    return (
      <div id="socialNetworkDiv" className="SocialNetwork block">
        <SocialNetworkWarning />
        <div>
          <div className="storySelectorContainer sn-navigation-container">
            <div className="panel panel-default">
              <div className="panel-body">
                <CommonNetworkSettings />
              </div>
            </div>
          </div>

          <div className="storySelectorContainer" id="commonSettingsContainer">
            <div id="faq" role="tablist" aria-multiselectable="true">
              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h3 className="panel-title">
                    <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerOne"
                      aria-expanded="false"
                      aria-controls="answerOne"
                      className="collapsed"
                    >
                      {t('social-network.color-nodes')}
                    </a>
                  </h3>
                </div>
                <div id="answerOne" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false" style={{ height: '0px' }}>
                  <div className="panel-body">
                    <NodesColoringSelector />
                  </div>
                </div>
              </div>

              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h3 className="panel-title">
                    <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerTwo"
                      aria-expanded="false"
                      aria-controls="answerTwo"
                      className="collapsed"
                    >
                      {t('social-network.selection')}
                    </a>
                  </h3>
                </div>
                <div id="answerTwo" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false">
                  <div className="panel-body">
                    <NetworkSubsetsSelector />
                  </div>
                </div>
              </div>

              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h3 className="panel-title">
                    <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerThree"
                      aria-expanded="false"
                      aria-controls="answerThree"
                      className="collapsed"
                    >
                      {t('social-network.social-network')}
                    </a>
                  </h3>
                </div>
                <div id="answerThree" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="" aria-expanded="false">
                  <div className="panel-body">
                    <NetworkSelector />
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="drawNetworkButton"
                className="btn btn-default width-100p"
              >
                {t('social-network.draw')}
              </button>
            </div>
          </div>

          <SocialNetworkArea />
        </div>
      </div>
    );
  }
}

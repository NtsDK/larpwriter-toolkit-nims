import React, { Component, useState } from 'react';
import './SocialNetwork.css';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import * as Constants from 'nims-dbms/nimsConstants';
import PermissionInformer from 'permissionInformer';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import { NodesColoringSelector, getGroupColors } from './NodesColoringSelector';
import { NetworkSubsetsSelector } from './NetworkSubsetsSelector';
import { NetworkSelector } from './NetworkSelector';
import { CommonNetworkSettings } from './CommonNetworkSettings';
import { SocialNetworkArea } from './SocialNetworkArea';
import { SocialNetworkWarning } from './SocialNetworkWarning.jsx';
import { CHAR_PREFIX, PROFILE_GROUP, FILTER_GROUP } from './SocialNetworkConstants';
import {
  getActivityEdges, getDetailedEdges, getRelationEdges, getStoryEdges, getStoryNodes
} from '../nodeAndEdgeGenerators';

export class SocialNetwork extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      nodesColoring: {
        selectedGroup: Constants.noGroup,
      },
      subset: {
        type: 'allObjects',
        selectedStoryNames: [],
        selectedCharacterNames: [],
        drawStoryNames: [],
        drawCharacterNames: [],
      },
      networkSettings: {
        type: 'socialRelations',
        extras: {}
      },
      showPlayerNames: false,
      focusNode: null,
      groupColorsInfo: {
        groupColors: {},
        groupLists: {}
      },
      nodes: [],
      edges: []
    };
    this.onNetworkSettingsChange = this.onNetworkSettingsChange.bind(this);
    this.onSubsetChange = this.onSubsetChange.bind(this);
    this.onNodesColoringChange = this.onNodesColoringChange.bind(this);
    this.drawNetwork = this.drawNetwork.bind(this);
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

      // this.initGroupColors(profileStructure);

      // NetworkSubsetsSelector.refresh({
      //   characterNames,
      //   storyNames,
      //   Stories: stories
      // });

      characterNames.sort(CU.charOrdAObject);
      storyNames.sort(CU.charOrdAObject);

      this.setState({
        data: {
          characterNames,
          storyNames,
          Stories: stories,
          Characters: profiles,
          profileBindings,
          profileStructure,
          groupCharacterSets,
          metaInfo,
          relations,
        },
        subset: {
          type: 'allObjects',
          selectedStoryNames: [],
          selectedCharacterNames: [],
          drawStoryNames: R.pluck('value', storyNames),
          drawCharacterNames: R.pluck('value', characterNames)
        },
        groupColorsInfo: getGroupColors(profileStructure)
      });
    }).catch(UI.handleError);
  }

  onNetworkSettingsChange(networkSettings) {
    this.setState({
      networkSettings
    });
  }

  onSubsetChange(subset) {
    // console.log(subset);
    this.setState({
      subset
    });
  }

  onNodesColoringChange(nodesColoring) {
    this.setState({
      nodesColoring
    });
  }

  drawNetwork() {
    // state.selectedNetwork = selectedNetwork;
    let nodes = [];
    let edges = [];

    const {
      subset, networkSettings, nodesColoring, data
    } = this.state;
    const { drawCharacterNames, drawStoryNames } = subset;
    const selectedNetwork = networkSettings.type;

    const showPlayer = false;

    // const selectedRelations = U.queryEls('#relationsBlock button.btn-primary').map(U.getAttr(R.__, 'data-value'));
    // const selectedActivities = U.queryEls('#activityBlock button.btn-primary').map(U.getAttr(R.__, 'data-value'));
    // const storyNames = state.networkSubsetsSelector.getStoryNames();
    // const characterNames = state.networkSubsetsSelector.getCharacterNames();
    // const groupName = U.queryEl('#networkNodeGroupSelector').value;
    // const showPlayer = U.queryEl('#showPlayerNamesCheckbox').checked;

    const characterNodes = this.getCharacterNodes(data.Characters, nodesColoring.selectedGroup, showPlayer, drawCharacterNames);
    const storyNodes = getStoryNodes(data.Stories, drawStoryNames);
    switch (selectedNetwork) {
    case 'socialRelations':
      nodes = characterNodes;
      edges = getDetailedEdges(data.Stories);
      break;
    case 'characterPresenceInStory':
      nodes = [...characterNodes, ...storyNodes];
      edges = getStoryEdges(data.Stories);
      break;
    case 'characterActivityInStory':
      nodes = [...characterNodes, ...storyNodes];
      edges = getActivityEdges(data.Stories, R.invert(networkSettings.activitySelection).true);
      break;
    case 'characterRelations':
      nodes = characterNodes;
      edges = getRelationEdges(data.relations, R.invert(networkSettings.relationSelection).true);
      break;
    default:
      throw new Error(`Unexpected network type: ${selectedNetwork}`);
    }

    this.setState({
      nodes,
      edges
    });

    // refreshLegend(U.queryEl('#networkNodeGroupSelector').value);

    // U.clearEl(U.queryEl('#nodeFocusSelector'));
    // const nodeSort = CU.charOrdAFactory((a) => a.label.toLowerCase());
    // nodes.sort(nodeSort);

    // const data2 = UI.getSelect2DataCommon(UI.remapProps(['id', 'text'], ['id', 'originName']), nodes);
    // $('#nodeFocusSelector').select2(data2);

    // state.networkWrapper.redrawAll(state.groupColors, nodes, edges);
  }

  makeCharacterNodeLabel(showPlayer, characterName) {
    const { data } = this.state;
    const label = characterName.split(' ').join('\n');
    if (showPlayer) {
      const player = data.profileBindings[characterName] || '';
      return `${label}/\n${player}`;
    }
    return label;
  }

  getCharacterNodes(Characters, groupName, showPlayer, characterNames) {
    return characterNames.map((characterName) => {
      const profile = Characters[characterName];
      return {
        id: CHAR_PREFIX + characterName,
        label: this.makeCharacterNodeLabel(showPlayer, characterName),
        type: 'character',
        originName: characterName,
        group: groupName === 'noGroup' ? L10n.const('noGroup') : `${groupName}.${profile[groupName]}`
      };
    });
  }

  render() {
    const {
      data, networkSettings, subset, nodesColoring, groupColorsInfo, nodes, edges
    } = this.state;
    const {
      profileStructure,
      groupCharacterSets,
      characterNames,
      storyNames,
      Stories,
    } = data;
    const { t } = this.props;

    if (profileStructure === undefined) {
      return null;
    }

    // const networkNodeGroups = this.getNetworkNodeGroups(profileStructure, groupCharacterSets);

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
                    <NodesColoringSelector
                      profileStructure={profileStructure}
                      groupCharacterSets={groupCharacterSets}
                      nodesColoring={nodesColoring}
                      networkSettings={networkSettings}
                      onNodesColoringChange={this.onNodesColoringChange}
                      groupColorsInfo={groupColorsInfo}
                    />
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
                    <NetworkSubsetsSelector
                      characterNames={characterNames}
                      storyNames={storyNames}
                      Stories={Stories}
                      subset={subset}
                      onSubsetChange={this.onSubsetChange}
                    />
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
                    <NetworkSelector networkSettings={networkSettings} onNetworkSettingsChange={this.onNetworkSettingsChange} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="drawNetworkButton"
                className="btn btn-default width-100p"
                onClick={this.drawNetwork}
              >
                {t('social-network.draw')}
              </button>
            </div>
          </div>

          <SocialNetworkArea nodes={nodes} edges={edges} />
        </div>
      </div>
    );
  }
}

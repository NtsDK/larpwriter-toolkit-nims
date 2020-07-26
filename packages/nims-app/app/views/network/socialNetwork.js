import vis from 'vis';
import 'vis/dist/vis.min.css';
import PermissionInformer from 'permissionInformer';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { NetworkSubsetsSelector } from './networkSubsetsSelector';
import { getSocialNetworkTemplate } from './SocialNetworkTemplate.jsx';
import {
  NetworkWrapper
} from './networkWrapper';
import {
  getActivityEdges, getDetailedEdges, getRelationEdges, getStoryEdges, getStoryNodes
} from './nodeAndEdgeGenerators';

const state = {};
const data = {};

const STORY_PREFIX = 'St:';
const CHAR_PREFIX = 'Ch:';
const PROFILE_GROUP = 'prof-';
const FILTER_GROUP = 'filter-';

let content;
function getContent() {
  return content;
}
export default {
  init, refresh, getContent
};

function init() {
  content = U.makeEl('div');
  U.addEl(U.qe('.tab-container'), content);
  ReactDOM.render(getSocialNetworkTemplate(), content);
  L10n.localizeStatic(content);

  state.networkWrapper = new NetworkWrapper();
  state.networkSubsetsSelector = new NetworkSubsetsSelector();

  U.listen(U.queryEl('#networkNodeGroupSelector'), 'change', colorNodes);
  U.listen(U.queryEl('#showPlayerNamesCheckbox'), 'change', updateNodeLabels);
  U.listen(U.queryEl('#drawNetworkButton'), 'click', onDrawNetwork);
  $('#nodeFocusSelector').select2().on('change', state.networkWrapper.onNodeFocus);
  U.listen(U.queryEl('#networkSelector'), 'change', onNetworkSelectorChangeDelegate);

  U.queryEls('#activityBlock button').forEach(U.listen(R.__, 'click', (event) => U.toggleClass(event.target, 'btn-primary')));
  U.queryEls('#relationsBlock button').forEach(U.listen(R.__, 'click', (event) => U.toggleClass(event.target, 'btn-primary')));

  initWarning();
  L10n.onL10nChange(initWarning);
  content = U.queryEl('#socialNetworkDiv');
}

function initWarning() {
  const warning = U.clearEl(U.queryEl('#socialNetworkWarning'));
  const button = U.addEl(U.makeEl('button'), U.makeText(L10n.getValue('social-network-remove-resources-warning')));
  U.addEls(warning, [U.makeText(L10n.getValue('social-network-require-resources-warning')), button]);
  U.listen(button, 'click', () => U.addClass(warning, 'hidden'));
}

function refresh() {
  let selector = U.fillSelector(U.clearEl(U.queryEl('#networkSelector')), UI.constArr2Select(Constants.networks));
  [selector.value] = Constants.networks;
  onNetworkSelectorChangeDelegate({ target: selector });

  selector = U.clearEl(U.queryEl('#networkNodeGroupSelector'));

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
    data.Stories = stories;
    data.Characters = profiles;
    data.profileBindings = profileBindings;
    data.groupCharacterSets = groupCharacterSets;
    data.metaInfo = metaInfo;
    data.relations = relations;

    const checkboxes = profileStructure.filter((element) => R.equals(element.type, 'checkbox'));
    R.values(profiles).forEach((profile) => {
      checkboxes.map((item) => (profile[item.name] = L10n.const(Constants[profile[item.name]])));
    });

    const colorGroups = profileStructure.filter((element) => R.contains(element.type, ['enum', 'checkbox']));
    const defaultColorGroup = {
      value: Constants.noGroup,
      name: L10n.const(Constants.noGroup)
    };

    const profileLabel = CU.strFormat(L10n.getValue('social-network-profile-group'));
    const filterLabel = CU.strFormat(L10n.getValue('social-network-filter-group'));

    const profileGroups = colorGroups.map((group) => group.name).map((name) => ({ value: PROFILE_GROUP + name, name: profileLabel([name]) }));
    const filterGroups = R.keys(groupCharacterSets).map((name) => ({ value: FILTER_GROUP + name, name: filterLabel([name]) }));
    U.fillSelector(
      selector,
      [defaultColorGroup].concat(profileGroups).concat(filterGroups)
    );

    initGroupColors(colorGroups);

    state.networkSubsetsSelector.refresh(characterNames, storyNames, stories);
  }).catch(UI.handleError);
}

function initGroupColors(colorGroups) {
  state.groupColors = R.clone(Constants.snFixedColors);
  state.groupLists = {};

  colorGroups.forEach((group) => {
    if (group.type === 'enum') {
      state.groupLists[PROFILE_GROUP + group.name] = group.value.split(',').map((subGroupName, i) => {
        state.groupColors[`${PROFILE_GROUP + group.name}.${subGroupName.trim()}`] = Constants.colorPalette[i + 2];
        return `${PROFILE_GROUP + group.name}.${subGroupName.trim()}`;
      });
    } else if (group.type === 'checkbox') {
      const trueName = L10n.const(Constants.true);
      const falseName = L10n.const(Constants.false);
      state.groupColors[`${PROFILE_GROUP + group.name}.${trueName}`] = Constants.colorPalette[group.value ? 0 + 2 : 1 + 2];
      state.groupColors[`${PROFILE_GROUP + group.name}.${falseName}`] = Constants.colorPalette[group.value ? 1 + 2 : 0 + 2];
      state.groupLists[PROFILE_GROUP + group.name] = [`${PROFILE_GROUP + group.name}.${trueName}`, `${PROFILE_GROUP + group.name}.${falseName}`];
    } else {
      throw new Error(`Unexpected profile item type: ${group.type}`);
    }
  });
}

function refreshLegend(groupName) {
  const colorLegend = U.clearEl(U.queryEl('#colorLegend'));
  let els = [];

  if (groupName === 'noGroup') {
    els.push(makeLegendItem(L10n.const('noGroup'), Constants.snFixedColors.noGroup.color));
  } else if (R.startsWith(PROFILE_GROUP, groupName)) {
    els = els.concat(state.groupLists[groupName].map((value) => makeLegendItem(value.substring(PROFILE_GROUP.length), state.groupColors[value].color)));
  } else if (R.startsWith(FILTER_GROUP, groupName)) {
    els.push(makeLegendItem(L10n.const('noGroup'), Constants.snFixedColors.noGroup.color));
    els.push(makeLegendItem(L10n.const('fromGroup'), Constants.snFixedColors.fromGroup.color));
  } else {
    throw new Error(`Unexpected group name/type: ${groupName}`);
  }

  if (['characterPresenceInStory', 'characterActivityInStory'].indexOf(state.selectedNetwork) !== -1) {
    els.push(makeLegendItem(L10n.getValue('social-network-story'), Constants.snFixedColors.storyColor.color));
  }
  U.addEls(colorLegend, els);
}

// called from refreshLegend
function makeLegendItem(label, color) {
  const colorDiv = U.addEl(U.makeEl('div'), U.makeText(label));
  colorDiv.style.backgroundColor = color.background;
  colorDiv.style.border = `solid 2px ${color.border}`;
  return colorDiv;
}

function colorNodes(event) {
  const groupName = event.target.value;
  refreshLegend(groupName);
  if (state.networkWrapper.isNetworkEmpty()) return;

  state.networkSubsetsSelector.getCharacterNames().forEach((characterName) => {
    state.networkWrapper.getNodesDataset().update({
      id: CHAR_PREFIX + characterName,
      group: getNodeGroup(characterName, groupName)
    });
  });
}

// called from colorNodes
function getNodeGroup(characterName, groupName) {
  if (groupName === 'noGroup') {
    return groupName;
  } if (R.startsWith(PROFILE_GROUP, groupName)) {
    const character = data.Characters[characterName];
    return `${groupName}.${character[groupName.substring(PROFILE_GROUP.length)]}`;
  } if (R.startsWith(FILTER_GROUP, groupName)) {
    return data.groupCharacterSets[groupName.substring(FILTER_GROUP.length)][characterName] ? 'fromGroup' : 'noGroup';
  }
  throw new Error(`Unexpected group name: ${groupName}`);
}

function updateNodeLabels() {
  if (state.networkWrapper.isNetworkEmpty()) return;
  const showPlayer = U.queryEl('#showPlayerNamesCheckbox').checked;
  const allNodes = state.networkWrapper.getNodesDataset().get({
    returnType: 'Object'
  });

  R.values(allNodes).filter((node) => node.type === 'character').forEach((node) => {
    const label = makeCharacterNodeLabel(showPlayer, node.originName);
    if (node.label !== undefined) {
      node.label = label;
    } else if (node.hiddenLabel !== undefined) {
      node.hiddenLabel = label;
    } else {
      console.log(`Suspicious node: ${JSON.stringify(node)}`);
    }
  });

  state.networkWrapper.getNodesDataset().update(R.values(allNodes));
}

function onNetworkSelectorChangeDelegate(event) {
  U.hideEl(U.queryEl('#activityBlock'), event.target.value !== 'characterActivityInStory');
  U.queryEls('#activityBlock button').forEach((el) => U.addClass(el, 'btn-primary'));
  U.hideEl(U.queryEl('#relationsBlock'), event.target.value !== 'characterRelations');
  U.queryEls('#relationsBlock button').forEach((el) => U.addClass(el, 'btn-primary'));
}

function onDrawNetwork() {
  onNetworkSelectorChange(U.queryEl('#networkSelector').value);
}

function onNetworkSelectorChange(selectedNetwork) {
  state.selectedNetwork = selectedNetwork;
  let nodes = [];
  let edges = [];

  const selectedRelations = U.queryEls('#relationsBlock button.btn-primary').map(U.getAttr(R.__, 'data-value'));
  const selectedActivities = U.queryEls('#activityBlock button.btn-primary').map(U.getAttr(R.__, 'data-value'));
  const storyNames = state.networkSubsetsSelector.getStoryNames();
  const characterNames = state.networkSubsetsSelector.getCharacterNames();
  const groupName = U.queryEl('#networkNodeGroupSelector').value;
  const showPlayer = U.queryEl('#showPlayerNamesCheckbox').checked;

  switch (selectedNetwork) {
  case 'socialRelations':
    nodes = getCharacterNodes(data.Characters, groupName, showPlayer, characterNames);
    edges = getDetailedEdges(data.Stories);
    break;
  case 'characterPresenceInStory':
    nodes = getCharacterNodes(data.Characters, groupName, showPlayer, characterNames)
      .concat(getStoryNodes(data.Stories, storyNames));
    edges = getStoryEdges(data.Stories);
    break;
  case 'characterActivityInStory':
    nodes = getCharacterNodes(data.Characters, groupName, showPlayer, characterNames)
      .concat(getStoryNodes(data.Stories, storyNames));
    edges = getActivityEdges(data.Stories, selectedActivities);
    break;
  case 'characterRelations':
    nodes = getCharacterNodes(data.Characters, groupName, showPlayer, characterNames);
    edges = getRelationEdges(data.relations, selectedRelations);
    break;
  default:
    throw new Error(`Unexpected network type: ${selectedNetwork}`);
  }

  refreshLegend(U.queryEl('#networkNodeGroupSelector').value);

  U.clearEl(U.queryEl('#nodeFocusSelector'));
  const nodeSort = CU.charOrdAFactory((a) => a.label.toLowerCase());
  nodes.sort(nodeSort);

  const data2 = UI.getSelect2DataCommon(UI.remapProps(['id', 'text'], ['id', 'originName']), nodes);
  $('#nodeFocusSelector').select2(data2);

  state.networkWrapper.redrawAll(state.groupColors, nodes, edges);
}

function makeCharacterNodeLabel(showPlayer, characterName) {
  const label = characterName.split(' ').join('\n');
  if (showPlayer) {
    const player = data.profileBindings[characterName] || '';
    return `${label}/\n${player}`;
  }
  return label;
}

function getCharacterNodes(Characters, groupName, showPlayer, characterNames) {
  return characterNames.map((characterName) => {
    const profile = Characters[characterName];
    return {
      id: CHAR_PREFIX + characterName,
      label: makeCharacterNodeLabel(showPlayer, characterName),
      type: 'character',
      originName: characterName,
      group: groupName === 'noGroup' ? L10n.const('noGroup') : `${groupName}.${profile[groupName]}`
    };
  });
}

/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/*global
 Utils, DBMS, StoryCharacters
 */

'use strict';

((exports) => {
    const state = {};

    const STORY_PREFIX = 'St:';
    const CHAR_PREFIX = 'Ch:';
    const PROFILE_GROUP = 'prof-';
    const FILTER_GROUP = 'filter-';

    exports.init = () => {
        NetworkSubsetsSelector.init();

        listen(getEl('networkNodeGroupSelector'), 'change', colorNodes);
        listen(getEl('showPlayerNamesCheckbox'), 'change', updateNodeLabels);
        listen(getEl('drawNetworkButton'), 'click', onDrawNetwork);
        $('#nodeFocusSelector').select2().on('change', onNodeFocus);
        listen(getEl('networkSelector'), 'change', onNetworkSelectorChangeDelegate);

        queryEls('#activityBlock button').forEach( listen(R.__, 'click', event => toggleClass(event.target, 'btn-primary')));
        queryEls('#relationsBlock button').forEach( listen(R.__, 'click', event => toggleClass(event.target, 'btn-primary')));

        //        state.network;
        state.highlightActive = false;

        initWarning();
        L10n.onL10nChange(initWarning);

        //    TimelinedNetwork.init();

        exports.content = getEl('socialNetworkDiv');
    };

    function initWarning() {
        const warning = clearEl(getEl('socialNetworkWarning'));
        const button = addEl(makeEl('button'), makeText(getL10n('social-network-remove-resources-warning')));
        addEls(warning, [makeText(getL10n('social-network-require-resources-warning')), button]);
        listen(button, 'click', () => addClass(warning, 'hidden'));
    }

    const nodeSort = CommonUtils.charOrdAFactory(a => a.label.toLowerCase());

    exports.refresh = () => {
        let selector = fillSelector(clearEl(getEl('networkSelector')), constArr2Select(Constants.networks));
        [selector.value] = Constants.networks;
        onNetworkSelectorChangeDelegate({ target: selector });

        selector = clearEl(getEl('networkNodeGroupSelector'));

        PermissionInformer.getEntityNamesArray('character', false, (err1, characterNames) => { // subset selector
            if (err1) { Utils.handleError(err1); return; }
            PermissionInformer.getEntityNamesArray('story', false, (err2, storyNames) => { // subset selector
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getAllProfiles('character', (err3, profiles) => { // node coloring
                    if (err3) { Utils.handleError(err3); return; }
                    DBMS.getAllStories((err4, stories) => { // contains most part of SN data
                        if (err4) { Utils.handleError(err4); return; }
                        DBMS.getProfileStructure('character', (err5, profileStructure) => { // node coloring
                            if (err5) { Utils.handleError(err5); return; }
                            DBMS.getProfileBindings((err6, profileBindings) => { // node coloring
                                if (err6) { Utils.handleError(err6); return; }
                                DBMS.getGroupCharacterSets((err7, groupCharacterSets) => { // node coloring
                                    if (err7) { Utils.handleError(err7); return; }
                                    DBMS.getMetaInfo((err8, metaInfo) => { // timelined network
                                        if (err8) { Utils.handleError(err8); return; }
                                        DBMS.getRelations((err9, relations) => { // relations
                                            if (err9) { Utils.handleError(err9); return; }

                                            state.Stories = stories;
                                            state.Characters = profiles;
                                            state.profileBindings = profileBindings;
                                            state.groupCharacterSets = groupCharacterSets;
                                            state.metaInfo = metaInfo;
                                            state.relations = relations;

                                            const checkboxes = profileStructure.filter(element =>
                                                R.equals(element.type, 'checkbox'));
                                            R.values(profiles).forEach((profile) => {
                                                checkboxes.map(item => (profile[item.name] =
                                                    constL10n(Constants[profile[item.name]])));
                                            });

                                            const colorGroups = profileStructure.filter(element =>
                                                R.contains(element.type, ['enum', 'checkbox']));
                                            const defaultColorGroup = {
                                                value: Constants.noGroup,
                                                name: constL10n(Constants.noGroup)
                                            };

                                            const profileLabel = strFormat(getL10n('social-network-profile-group'));
                                            const filterLabel = strFormat(getL10n('social-network-filter-group'));

                                            const profileGroups = colorGroups.map(group => group.name).map(name =>
                                                ({ value: PROFILE_GROUP + name, name: profileLabel([name]) }));
                                            const filterGroups = R.keys(groupCharacterSets).map(name =>
                                                ({ value: FILTER_GROUP + name, name: filterLabel([name]) }));
                                            fillSelector(
                                                selector,
                                                [defaultColorGroup].concat(profileGroups).concat(filterGroups)
                                            );

                                            initGroupColors(colorGroups);

                                            NetworkSubsetsSelector.refresh({
                                                characterNames,
                                                storyNames,
                                                Stories: stories
                                            });
                                            //                            onDrawNetwork();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    function initGroupColors(colorGroups) {
        state.groupColors = R.clone(Constants.snFixedColors);
        state.groupLists = {};

        colorGroups.forEach((group) => {
            if (group.type === 'enum') {
                state.groupLists[PROFILE_GROUP + group.name] = group.value.split(',').map((subGroupName, i) => {
                    state.groupColors[`${PROFILE_GROUP + group.name}.${subGroupName.trim()}`] =
                        Constants.colorPalette[i];
                    return `${PROFILE_GROUP + group.name}.${subGroupName.trim()}`;
                });
            } else if (group.type === 'checkbox') {
                const trueName = constL10n(Constants.true);
                const falseName = constL10n(Constants.false);
                state.groupColors[`${PROFILE_GROUP + group.name}.${trueName}`] =
                    Constants.colorPalette[group.value ? 0 : 1];
                state.groupColors[`${PROFILE_GROUP + group.name}.${falseName}`] =
                    Constants.colorPalette[group.value ? 1 : 0];
                state.groupLists[PROFILE_GROUP + group.name] =
                    [`${PROFILE_GROUP + group.name}.${trueName}`, `${PROFILE_GROUP + group.name}.${falseName}`];
            } else {
                throw new Error(`Unexpected profile item type: ${group.type}`);
            }
        });
    }

    function makeLegendItem(label, color) {
        const colorDiv = addEl(makeEl('div'), makeText(label));
        colorDiv.style.backgroundColor = color.background;
        colorDiv.style.border = `solid 2px ${color.border}`;
        return colorDiv;
    }

    function refreshLegend(groupName) {
        const colorLegend = clearEl(getEl('colorLegend'));
        let els = [];

        if (groupName === 'noGroup') {
            els.push(makeLegendItem(constL10n('noGroup'), Constants.snFixedColors.noGroup.color));
        } else if (CommonUtils.startsWith(groupName, PROFILE_GROUP)) {
            els = els.concat(state.groupLists[groupName].map(value =>
                makeLegendItem(value.substring(PROFILE_GROUP.length), state.groupColors[value].color)));
        } else if (CommonUtils.startsWith(groupName, FILTER_GROUP)) {
            els.push(makeLegendItem(constL10n('noGroup'), Constants.snFixedColors.noGroup.color));
            els.push(makeLegendItem(constL10n('fromGroup'), Constants.snFixedColors.fromGroup.color));
        } else {
            throw new Error(`Unexpected group name/type: ${groupName}`);
        }

        if (['characterPresenceInStory', 'characterActivityInStory'].indexOf(state.selectedNetwork) !== -1) {
            els.push(makeLegendItem(getL10n('social-network-story'), Constants.snFixedColors.storyColor.color));
        }
        addEls(colorLegend, els);
    }

    function colorNodes(event) {
        const groupName = event.target.value;
        refreshLegend(groupName);
        if (state.nodesDataset === undefined) return;

        NetworkSubsetsSelector.getCharacterNames().forEach((characterName) => {
            state.nodesDataset.update({
                id: CHAR_PREFIX + characterName,
                group: getNodeGroup(characterName, groupName)
            });
        });
    }

    function getNodeGroup(characterName, groupName) {
        if (groupName === 'noGroup') {
            return groupName;
        } else if (CommonUtils.startsWith(groupName, PROFILE_GROUP)) {
            const character = state.Characters[characterName];
            return `${groupName}.${character[groupName.substring(PROFILE_GROUP.length)]}`;
        } else if (CommonUtils.startsWith(groupName, FILTER_GROUP)) {
            return state.groupCharacterSets[groupName.substring(FILTER_GROUP.length)][characterName] ? 'fromGroup' : 'noGroup';
        }
        throw new Error(`Unexpected group name: ${groupName}`);
    }

    function updateNodeLabels() {
        if (state.nodesDataset === undefined) return;
        const showPlayer = getEl('showPlayerNamesCheckbox').checked;
        const allNodes = state.nodesDataset.get({
            returnType: 'Object'
        });

        R.values(allNodes).filter(node => node.type === 'character').forEach((node) => {
            const label = makeCharacterNodeLabel(showPlayer, node.originName);
            if (node.label !== undefined) {
                node.label = label;
            } else if (node.hiddenLabel !== undefined) {
                node.hiddenLabel = label;
            } else {
                console.log(`Suspicious node: ${JSON.stringify(node)}`);
            }
        });

        state.nodesDataset.update(R.values(allNodes));
    }

    function onNetworkSelectorChangeDelegate(event) {
        setClassByCondition(getEl('activityBlock'), 'hidden', event.target.value !== 'characterActivityInStory');
        queryEls('#activityBlock button').forEach(el => addClass(el, 'btn-primary'));
        setClassByCondition(getEl('relationsBlock'), 'hidden', event.target.value !== 'characterRelations');
        queryEls('#relationsBlock button').forEach(el => addClass(el, 'btn-primary'));
    }

    function onNodeFocus(event) {
        state.network.focus(event.target.value, Constants.snFocusOptions);
    }

    function onDrawNetwork() {
        onNetworkSelectorChange(getEl('networkSelector').value);
    //    TimelinedNetwork.refresh(state.network, state.nodesDataset,
    //            state.edgesDataset, getEventDetails(), state.metaInfo);
    }

    function onNetworkSelectorChange(selectedNetwork) {
        state.selectedNetwork = selectedNetwork;
        let nodes = [];
        let edges = [];

        switch (selectedNetwork) {
        case 'socialRelations':
            nodes = getCharacterNodes();
            edges = getDetailedEdges();
            break;
        case 'characterPresenceInStory':
            nodes = getCharacterNodes().concat(getStoryNodes());
            edges = getStoryEdges();
            break;
        case 'characterActivityInStory':
            nodes = getCharacterNodes().concat(getStoryNodes());
            edges = getActivityEdges();
            break;
        case 'characterRelations':
            nodes = getCharacterNodes();
            edges = getRelationEdges();
            break;
        default:
            throw new Error(`Unexpected network type: ${selectedNetwork}`);
        }

        refreshLegend(getEl('networkNodeGroupSelector').value);

        clearEl(getEl('nodeFocusSelector'));
        nodes.sort(nodeSort);

        const data = getSelect2DataCommon(remapProps(['id', 'text'], ['id', 'originName']), nodes);
        $('#nodeFocusSelector').select2(data);

        state.nodesDataset = new vis.DataSet(nodes);
        state.edgesDataset = new vis.DataSet(edges);

        redrawAll();
    }

    function makeCharacterNodeLabel(showPlayer, characterName) {
        const label = characterName.split(' ').join('\n');
        if (showPlayer) {
            const player = state.profileBindings[characterName] || '';
            return `${label}/\n${player}`;
        }
        return label;
    }

    function getCharacterNodes() {
        const groupName = getEl('networkNodeGroupSelector').value;
        const showPlayer = getEl('showPlayerNamesCheckbox').checked;
        return NetworkSubsetsSelector.getCharacterNames().map((characterName) => {
            const profile = state.Characters[characterName];
            return {
                id: CHAR_PREFIX + characterName,
                label: makeCharacterNodeLabel(showPlayer, characterName),
                type: 'character',
                originName: characterName,
                group: groupName === 'noGroup' ? constL10n('noGroup') : `${groupName}.${profile[groupName]}`
            };
        });
    }

    function getStoryNodes() {
        const nodes = NetworkSubsetsSelector.getStoryNames().map(name => ({
            id: STORY_PREFIX + name,
            label: name.split(' ').join('\n'),
            value: Object.keys(state.Stories[name].characters).length,
            title: Object.keys(state.Stories[name].characters).length,
            group: 'storyColor',
            type: 'story',
            originName: name,
        }));
        return nodes;
    }

    function getActivityEdges() {
        const selectedActivities = queryEls('#activityBlock button.btn-primary').map(getAttr(R.__, 'data-value'));
        const stories = state.Stories;
        return R.flatten(R.keys(stories).map(name => R.keys(stories[name].characters)
            .map(char1 => R.keys(stories[name].characters[char1].activity).filter(R.contains(R.__, selectedActivities))
                .map(activity => ({
                    from: STORY_PREFIX + name,
                    to: CHAR_PREFIX + char1,
                    color: Constants.snActivityColors[activity],
                    width: 2,
                    hoverWidth: 4
                })))));
    }

    function getRelationEdges() {
        const selectedRelations = queryEls('#relationsBlock button.btn-primary').map(getAttr(R.__, 'data-value'));
        const relations = state.relations;
        const checked = R.contains(R.__, selectedRelations);
        return R.flatten(relations.map(rel => {
            const arr = [];
            const starter = rel.starter;
            const ender = rel.ender;
            const edgeTmpl = {
                from: CHAR_PREFIX + starter,
                to: CHAR_PREFIX + ender,
                color: Constants.snRelationColors.neutral,
                width: 2,
                hoverWidth: 4
            };
            if(rel.essence.length === 0){
                if(checked('neutral')){
                    arr.push(R.merge(edgeTmpl,{
                        color: Constants.snRelationColors.neutral,
                    }));
                }
            } else {
                if(checked('allies') && R.contains('allies', rel.essence)){
                    arr.push(R.merge(edgeTmpl,{
                        color: Constants.snRelationColors.allies,
                    }));
                }
                if(checked('directional') && R.contains('starterToEnder', rel.essence)){
                    arr.push(R.merge(edgeTmpl,{
                        color: Constants.snRelationColors.starterToEnder,
                        arrows:'to'
                    }));
                }
                if(checked('directional') && R.contains('enderToStarter', rel.essence)){
                    arr.push(R.merge(edgeTmpl,{
                        color: Constants.snRelationColors.enderToStarter,
                        arrows:'from'
                    }));
                }
            }
            return arr;
        }));
    }

    function getStoryEdges() {
        return R.flatten(R.keys(state.Stories).map(name => R.keys(state.Stories[name].characters).map(char1 => ({
            from: STORY_PREFIX + name,
            to: CHAR_PREFIX + char1,
            color: 'grey'
        }))));
    }

    function getEventDetails() {
        return R.flatten(R.values(state.Stories).map(story => story.events.map(event => ({
            eventName: event.name,
            storyName: story.name,
            time: event.time,
            characters: R.keys(event.characters)
        }))));
    }

    function getDetailedEdges() {
        const edgesCheck = {};
        R.values(state.Stories).forEach((story) => {
            story.events.forEach((event) => {
                const charNames = R.keys(event.characters).sort();
                charNames.forEach((char1, i) => {
                    charNames.forEach((char2, j) => {
                        if (i <= j) {
                            return;
                        }
                        const key = char1 + char2;
                        if (!edgesCheck[key]) {
                            edgesCheck[key] = {
                                from: CHAR_PREFIX + char1,
                                to: CHAR_PREFIX + char2,
                                title: {},
                            };
                        }
                        edgesCheck[key].title[story.name] = true;
                    });
                });
            });
        });

        return R.values(edgesCheck).map((edgeInfo) => {
            const title = R.keys(edgeInfo.title).sort().join(', ');
            const value = R.keys(edgeInfo.title).length;
            return {
                from: edgeInfo.from,
                to: edgeInfo.to,
                title: `${value}: ${title}`,
                value,
                color: 'grey'
            };
        });
    }

    function redrawAll() {
        const container = getEl('socialNetworkContainer');

        const data = {
            nodes: state.nodesDataset,
            edges: state.edgesDataset
        }; // Note: data is coming from ./datasources/WorldCup2014.js

        if (state.network) {
            state.network.destroy();
        }

        const opts = CommonUtils.clone(Constants.socialNetworkOpts);
        opts.groups = state.groupColors;

        state.network = new vis.Network(container, data, opts);

        state.network.on('click', neighbourhoodHighlight);
    }

    function hideLabel(node) {
        if (node.hiddenLabel === undefined) {
            node.hiddenLabel = node.label;
            node.label = undefined;
        }
    }
    function showLabel(node) {
        if (node.hiddenLabel !== undefined) {
            node.label = node.hiddenLabel;
            node.hiddenLabel = undefined;
        }
    }

    function highlightNodes(network, allNodes, zeroDegreeNodes, firstDegreeNodes) {
        // get the second degree nodes
        const secondDegreeNodes = R.uniq(R.flatten(firstDegreeNodes.map(id => network.getConnectedNodes(id))));
        // mark all nodes as hard to read.
        R.values(allNodes).forEach((node) => {
            node.color = 'rgba(200,200,200,0.5)';
            hideLabel(node);
        });
        // all second degree nodes get a different color and their label back
        secondDegreeNodes.map(id => allNodes[id]).forEach((node) => {
            node.color = 'rgba(150,150,150,0.75)';
            showLabel(node);
        });
        // all first degree nodes get their own color and their label back
        firstDegreeNodes.map(id => allNodes[id]).forEach((node) => {
            node.color = undefined;
            showLabel(node);
        });
        // the main node gets its own color and its label back.
        zeroDegreeNodes.map(id => allNodes[id]).forEach((node) => {
            node.color = undefined;
            showLabel(node);
        });
    }

    function neighbourhoodHighlight(params) {
        // get a JSON object
        const allNodes = state.nodesDataset.get({
            returnType: 'Object'
        });

        const { network } = state;
        if (params.nodes.length > 0) {
            state.highlightActive = true;
            const selectedNode = params.nodes[0];
            const zeroDegreeNodes = [selectedNode];
            const firstDegreeNodes = network.getConnectedNodes(selectedNode);
            highlightNodes(network, allNodes, zeroDegreeNodes, firstDegreeNodes);
        } else if (params.edges.length > 0) {
            state.highlightActive = true;
            const selectedEdge = params.edges[0];
            const firstDegreeNodes = network.getConnectedNodes(selectedEdge);
            highlightNodes(network, allNodes, [], firstDegreeNodes);
        } else if (state.highlightActive === true) {
            // reset all nodes
            R.values(allNodes).forEach((node) => {
                node.color = undefined;
                showLabel(node);
            });
            state.highlightActive = false;
        }

        // transform the object into an array
        state.nodesDataset.update(R.values(allNodes));
    }
})(this.SocialNetwork = {});

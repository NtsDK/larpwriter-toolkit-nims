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

"use strict";

(function(exports){

    var state = {};

    var STORY_PREFIX = 'St:';
    var CHAR_PREFIX = 'Ch:';
    var PROFILE_GROUP = 'prof-';
    var FILTER_GROUP = 'filter-';

    exports.init = function () {
        NetworkSubsetsSelector.init();

        listen(getEl("networkNodeGroupSelector"), "change", colorNodes);
        listen(getEl('showPlayerNamesCheckbox'), "change", updateNodeLabels);
        listen(getEl("drawNetworkButton"), "click", onDrawNetwork);
        $("#nodeFocusSelector").select2().on("change", onNodeFocus);
        listen(getEl("networkSelector"), "change", onNetworkSelectorChangeDelegate);

        state.network;
        state.highlightActive = false;

        initWarning();
        L10n.onL10nChange(initWarning);

    //    TimelinedNetwork.init();

        exports.content = getEl("socialNetworkDiv");
    };

    var initWarning = function(){
        var warning = clearEl(getEl("socialNetworkWarning"));
        var button = addEl(makeEl("button"), makeText(getL10n("social-network-remove-resources-warning")));
        addEls(warning, [makeText(getL10n("social-network-require-resources-warning")), button]);
        listen(button, "click", () => addClass(warning,"hidden"));
    };

    var nodeSort = CommonUtils.charOrdAFactory((a) => a.label.toLowerCase());

    exports.refresh = function () {

        fillSelector(clearEl(getEl("activitySelector")), constArr2Select(Constants.characterActivityTypes).map(obj => {
            obj.className = obj.value + 'Option';
            return obj;
        }));

        var selector = fillSelector(clearEl(getEl("networkSelector")), constArr2Select(Constants.networks));
        selector.value = Constants.networks[0];
        onNetworkSelectorChangeDelegate({target: selector});

        selector = clearEl(getEl("networkNodeGroupSelector"));

        PermissionInformer.getEntityNamesArray('character', false, function(err, characterNames){ // subset selector
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.getEntityNamesArray('story', false, function(err, storyNames){ // subset selector
                if(err) {Utils.handleError(err); return;}
                DBMS.getAllProfiles('character', function(err, profiles){ // node coloring
                    if(err) {Utils.handleError(err); return;}
                    state.Characters = profiles;

                    DBMS.getAllStories(function(err, stories){ // contains most part of SN data
                        if(err) {Utils.handleError(err); return;}
                        state.Stories = stories;

                        DBMS.getProfileStructure('character', function(err, profileStructure){ // node coloring
                            if(err) {Utils.handleError(err); return;}

                            DBMS.getProfileBindings(function(err, profileBindings){ // node coloring
                                if(err) {Utils.handleError(err); return;}
                                state.profileBindings = profileBindings;

                                DBMS.getGroupCharacterSets(function(err, groupCharacterSets){ // node coloring
                                    if(err) {Utils.handleError(err); return;}
                                    state.groupCharacterSets = groupCharacterSets;

                                    DBMS.getMetaInfo(function(err, metaInfo){ // timelined network
                                        if(err) {Utils.handleError(err); return;}

                                        state.metaInfo = metaInfo;

                                        var checkboxes = profileStructure.filter((element) => R.equals(element.type, 'checkbox'));
                                        R.values(profiles).forEach(profile => {
                                            checkboxes.map(item => profile[item.name] = constL10n(Constants[profile[item.name]]));
                                        });

                                        var colorGroups = profileStructure.filter((element) => R.contains(element.type, ['enum', 'checkbox']));
                                        var defaultColorGroup = {value: Constants.noGroup, name: constL10n(Constants.noGroup)};

                                        var profileLabel = strFormat(getL10n('social-network-profile-group'));
                                        var filterLabel = strFormat(getL10n('social-network-filter-group'));

                                        var profileGroups = colorGroups.map(group => group.name).map(name => {return {value: PROFILE_GROUP + name, name: profileLabel([name])};});
                                        var filterGroups = R.keys(groupCharacterSets).map(name => {return {value: FILTER_GROUP + name, name: filterLabel([name])};});
                                        fillSelector(selector, [defaultColorGroup].concat(profileGroups).concat(filterGroups));

                                        initGroupColors(colorGroups);

                                        NetworkSubsetsSelector.refresh({
                                            characterNames: characterNames,
                                            storyNames: storyNames,
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
    };

    var initGroupColors = function(colorGroups){
        state.groupColors = R.clone(Constants.snFixedColors);
        state.groupLists = {};

        colorGroups.forEach(function (group) {
            if(group.type === "enum"){
                state.groupLists[PROFILE_GROUP + group.name] = group.value.split(",").map(function (subGroupName, i){
                    state.groupColors[PROFILE_GROUP + group.name + "." + subGroupName.trim()] = Constants.colorPalette[i];
                    return PROFILE_GROUP + group.name + "." + subGroupName.trim();
                });
            } else if( group.type === "checkbox"){
                var trueName = constL10n(Constants[true]);
                var falseName = constL10n(Constants[false]);
                state.groupColors[PROFILE_GROUP + group.name + "." + trueName] = Constants.colorPalette[group.value ? 0 : 1];
                state.groupColors[PROFILE_GROUP + group.name + "." + falseName] = Constants.colorPalette[group.value ? 1 : 0];
                state.groupLists[PROFILE_GROUP + group.name] = [PROFILE_GROUP + group.name + "." + trueName, PROFILE_GROUP + group.name + "." + falseName];
            } else {
                throw new Error('Unexpected profile item type: ' + group.type);
            }
        });
    };

    var makeLegendItem = function(label, color){
        var colorDiv = addEl(makeEl("div"), makeText(label));
        colorDiv.style.backgroundColor = color.background;
        colorDiv.style.border = "solid 2px " + color.border;
        return colorDiv;
    };

    var refreshLegend = function (groupName) {
        var colorLegend = clearEl(getEl("colorLegend"));
        var els = [];

        if(groupName === 'noGroup'){
            els.push(makeLegendItem(constL10n('noGroup'), Constants.snFixedColors["noGroup"].color));
        } else if(CommonUtils.startsWith(groupName, PROFILE_GROUP)){
            els = els.concat(state.groupLists[groupName].map(function (value) {
                return makeLegendItem(value.substring(PROFILE_GROUP.length), state.groupColors[value].color);
            }));
        } else if(CommonUtils.startsWith(groupName, FILTER_GROUP)){
            els.push(makeLegendItem(constL10n('noGroup'), Constants.snFixedColors["noGroup"].color));
            els.push(makeLegendItem(constL10n('fromGroup'), Constants.snFixedColors["fromGroup"].color));
        } else {
            throw new Error('Unexpected group name/type: ' + groupName);
        }

        if(["characterPresenceInStory", "characterActivityInStory"].indexOf(state.selectedNetwork) !== -1){
            els.push(makeLegendItem(getL10n("social-network-story"), Constants.snFixedColors["storyColor"].color));
        }
        addEls(colorLegend, els);
    };

    var colorNodes = function (event) {
        var groupName = event.target.value;
        refreshLegend(groupName);
        if(state.nodesDataset == undefined) return;

        NetworkSubsetsSelector.getCharacterNames().forEach(function (characterName) {
            state.nodesDataset.update({
                id : CHAR_PREFIX + characterName,
                group : getNodeGroup(characterName, groupName)
            });
        });
    };

    function getNodeGroup(characterName, groupName){
        if(groupName === "noGroup"){
            return groupName;
        } else if(CommonUtils.startsWith(groupName, PROFILE_GROUP)){
            var character = state.Characters[characterName];
            return groupName + "." + character[groupName.substring(PROFILE_GROUP.length)];
        } else if(CommonUtils.startsWith(groupName, FILTER_GROUP)){
            return state.groupCharacterSets[groupName.substring(FILTER_GROUP.length)][characterName] ? 'fromGroup' : 'noGroup';
        } else {
            throw new Error('Unexpected group name: ' + groupName);
        }
    }

    var updateNodeLabels = function () {
        if(state.nodesDataset === undefined) return;
        var showPlayer = getEl('showPlayerNamesCheckbox').checked;
        var allNodes = state.nodesDataset.get({
            returnType : "Object"
        });

        R.values(allNodes).filter(node => node.type === 'character').forEach(node => {
            var label = makeCharacterNodeLabel(showPlayer, node.originName);
            if(node.label !== undefined){
                node.label = label;
            } else if(node.hiddenLabel !== undefined){
                node.hiddenLabel = label;
            } else {
                console.log('Suspicious node: ' + JSON.stringify(node));
            }
        });

        state.nodesDataset.update(R.values(allNodes));
    };

    var onNetworkSelectorChangeDelegate = function (event) {
        setClassByCondition(getEl("activityBlock"), "hidden", event.target.value !== "characterActivityInStory");
    };

    var onNodeFocus = function (event) {
        state.network.focus(event.target.value, Constants.snFocusOptions);
    };

    var onDrawNetwork = function () {
        onNetworkSelectorChange(getEl("networkSelector").value);
    //    TimelinedNetwork.refresh(state.network, state.nodesDataset,
    //            state.edgesDataset, getEventDetails(), state.metaInfo);
    };

    var onNetworkSelectorChange = function (selectedNetwork) {
        state.selectedNetwork = selectedNetwork;
        let nodes = [];
        let edges = [];

        switch (selectedNetwork) {
        case "socialRelations":
            nodes = getCharacterNodes();
            edges = getDetailedEdges();
            break;
        case "characterPresenceInStory":
            nodes = getCharacterNodes().concat(getStoryNodes());
            edges = getStoryEdges();
            break;
        case "characterActivityInStory":
            nodes = getCharacterNodes().concat(getStoryNodes());
            edges = getActivityEdges();
            break;
        default:
            throw new Error('Unexpected network type: ' + selectedNetwork);
        }

        refreshLegend(getEl("networkNodeGroupSelector").value);

        clearEl(getEl('nodeFocusSelector'));
        nodes.sort(nodeSort);

        var data = getSelect2DataCommon(remapProps(['id','text'], ['id', 'originName']), nodes);
        $("#nodeFocusSelector").select2(data);

        state.nodesDataset = new vis.DataSet(nodes);
        state.edgesDataset = new vis.DataSet(edges);

        redrawAll();
    };

    var makeCharacterNodeLabel = function(showPlayer, characterName){
        var label = characterName.split(" ").join("\n");
        if(showPlayer){
            var player = state.profileBindings[characterName] || '';
            return label +  '/\n' + player;
        } else {
            return label;
        }
    };

    var getCharacterNodes = function () {
        var groupName = getEl("networkNodeGroupSelector").value;
        var showPlayer = getEl('showPlayerNamesCheckbox').checked;
        return NetworkSubsetsSelector.getCharacterNames().map(function (characterName) {
            var profile = state.Characters[characterName];
            return {
                id : CHAR_PREFIX + characterName,
                label : makeCharacterNodeLabel(showPlayer, characterName),
                type : 'character',
                originName : characterName,
                group : groupName === "noGroup" ? constL10n('noGroup'): groupName + "." + profile[groupName]
            };
        });
    };

    var getStoryNodes = function () {
        var nodes = NetworkSubsetsSelector.getStoryNames().map(function (name) {
            return {
                id : STORY_PREFIX + name,
                label : name.split(" ").join("\n"),
                value : Object.keys(state.Stories[name].characters).length,
                title : Object.keys(state.Stories[name].characters).length,
                group : "storyColor",
                type : 'story',
                originName : name,
            };
        });
        return nodes;
    };

    var getActivityEdges = function () {
        var selectedActivities = nl2array(getEl("activitySelector").selectedOptions).map(opt => opt.value);

        var edges = [];
        var edgesCheck = {};
        for ( var name in state.Stories) {
            var story = state.Stories[name];
            for ( var char1 in story.characters) {
                for(var activity in story.characters[char1].activity){
                    if(R.contains(activity, selectedActivities)){
                        edges.push({
                            from : STORY_PREFIX + name,
                            to : CHAR_PREFIX + char1,
                            color : Constants.snActivityColors[activity],
                            width: 2,
                            hoverWidth: 4
                        });
                    }
                }
            }
        }
        return edges;
    };

    var getStoryEdges = function () {
        var edges = [];
        var edgesCheck = {};
        for ( var name in state.Stories) {
            var story = state.Stories[name];
            for ( var char1 in story.characters) {
                edges.push({
                    from : STORY_PREFIX + name,
                    to : CHAR_PREFIX + char1,
                    color : "grey"
                });
            }
        }
        return edges;
    };

    var getEventDetails = function () {
        return R.flatten(R.values(state.Stories).map(function(story){
            return story.events.map(function(event){
                return {
                    eventName: event.name,
                    storyName: story.name,
                    time: event.time,
                    characters: R.keys(event.characters)
                }
            });
        }));
    };

    var getDetailedEdges = function () {
        var edgesCheck = {};
        R.values(state.Stories).forEach(function(story){
            story.events.forEach(function (event) {
                var charNames = R.keys(event.characters).sort();
                charNames.forEach(function(char1, i){
                    charNames.forEach(function(char2, j){
                        if (i<=j) {
                            return;
                        }
                        var key = char1 + char2;
                        if (!edgesCheck[key]) {
                            edgesCheck[key] = {
                                from : CHAR_PREFIX + char1,
                                to : CHAR_PREFIX + char2,
                                title : {},
                            };
                        }
                        edgesCheck[key].title[story.name] = true;
                    });
                });
            });
        });

        return R.values(edgesCheck).map(function (edgeInfo) {
            var title = R.keys(edgeInfo.title).sort().join(", ");
            var value = R.keys(edgeInfo.title).length;
            return {
                from : edgeInfo.from,
                to : edgeInfo.to,
                title : value + ": " + title,
                value : value,
                color : "grey"
            };
        });
    };

    var redrawAll = function () {
        var container = getEl('socialNetworkContainer');

        var data = {
            nodes : state.nodesDataset,
            edges : state.edgesDataset
        } // Note: data is coming from ./datasources/WorldCup2014.js

        if(state.network){
            state.network.destroy();
        }

        var opts = CommonUtils.clone(Constants.socialNetworkOpts);
        opts.groups = state.groupColors;

        state.network = new vis.Network(container, data, opts);

        state.network.on("click", neighbourhoodHighlight);
    };

    var hideLabel = function(node){
        if (node.hiddenLabel === undefined) {
            node.hiddenLabel = node.label;
            node.label = undefined;
        }
    };
    var showLabel = function(node){
        if (node.hiddenLabel !== undefined) {
            node.label = node.hiddenLabel;
            node.hiddenLabel = undefined;
        }
    };

    var highlightNodes = function(network, allNodes, zeroDegreeNodes, firstDegreeNodes){
        // get the second degree nodes
        var secondDegreeNodes = R.uniq(R.flatten(firstDegreeNodes.map(id => network.getConnectedNodes(id))));
        // mark all nodes as hard to read.
        R.values(allNodes).forEach( node => {
            node.color = 'rgba(200,200,200,0.5)';
            hideLabel(node);
        });
        // all second degree nodes get a different color and their label back
        secondDegreeNodes.map( id => allNodes[id]).forEach( node => {
            node.color = 'rgba(150,150,150,0.75)';
            showLabel(node);
        });
        // all first degree nodes get their own color and their label back
        firstDegreeNodes.map( id => allNodes[id]).forEach( node => {
            node.color = undefined;
            showLabel(node);
        });
        // the main node gets its own color and its label back.
        zeroDegreeNodes.map( id => allNodes[id]).forEach( node => {
            node.color = undefined;
            showLabel(node);
        });
    };

    var neighbourhoodHighlight = function (params) {
        // get a JSON object
        var allNodes = state.nodesDataset.get({
            returnType : "Object"
        });

        var network = state.network;
        if (params.nodes.length > 0) {
            state.highlightActive = true;
            var selectedNode = params.nodes[0];
            var zeroDegreeNodes = [selectedNode];
            var firstDegreeNodes = network.getConnectedNodes(selectedNode);
            highlightNodes(network, allNodes, zeroDegreeNodes, firstDegreeNodes);
        } else if (params.edges.length > 0) {
            state.highlightActive = true;
            var selectedEdge = params.edges[0];
            var firstDegreeNodes = network.getConnectedNodes(selectedEdge);
            highlightNodes(network, allNodes, [], firstDegreeNodes);
        } else if (state.highlightActive === true) {
            // reset all nodes
            R.values(allNodes).forEach( node => {
                node.color = undefined;
                showLabel(node);
            });
            state.highlightActive = false;
        }

        // transform the object into an array
        state.nodesDataset.update(R.values(allNodes));
    };

})(this['SocialNetwork']={});

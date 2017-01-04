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
    
    exports.init = function () {
        NetworkSubsetsSelector.init();
        
        listen(getEl("networkNodeGroupSelector"), "change", function (event) {
            updateNodes(event.target.value);
        });
        
        listen(getEl("drawNetworkButton"), "click", onDrawNetwork);
        
        $("#nodeFocusSelector").select2().on("change", onNodeFocus);
    
        var selector = getEl("networkSelector");
        selector.addEventListener("change", onNetworkSelectorChangeDelegate);
        
        selector = getEl("activitySelector");
        
        var st, option;
        Constants.characterActivityTypes.forEach(function (activity) {
            option = makeEl("option");
            option.appendChild(makeText(constL10n(activity)));
            st = option.style;
            st.color = Constants.snActivityColors[activity];
            option.activity = activity;
            selector.appendChild(option);
        });
        
        state.network;
        state.highlightActive = false;
        
        var initWarning = function(){
            var warning = clearEl(getEl("socialNetworkWarning"));
            addEl(warning, makeText(getL10n("social-network-require-resources-warning")));
            var button = makeEl("button");
            addEl(button, makeText(getL10n("social-network-remove-resources-warning")));
            addEl(warning, button);
            
            button.addEventListener("click", function(){
                addClass(warning,"hidden");
            });
        };
        initWarning();
        
        L10n.onL10nChange(initWarning);
        
    //    TimelinedNetwork.init();
    
        exports.content = getEl("socialNetworkDiv");
    };
    
    var nodeSort = CommonUtils.charOrdAFactory((a) => a.label.toLowerCase());
    
    exports.refresh = function () {
        var selector = clearEl(getEl("networkSelector"));
    
        var option;
        Constants.networks.forEach(function (network) {
            option = makeEl("option");
            option.appendChild(makeText(constL10n(network)));
            option.value = network;
            selector.appendChild(option);
        });
        selector.value = Constants.networks[0];
        
        selector = clearEl(getEl("networkNodeGroupSelector"));
        
        PermissionInformer.getEntityNamesArray('character', false, function(err, characterNames){
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.getEntityNamesArray('story', false, function(err, storyNames){
                if(err) {Utils.handleError(err); return;}
            
                DBMS.getAllProfiles('character', function(err, profiles){
                    if(err) {Utils.handleError(err); return;}
                    state.Characters = profiles;
                    
                    characterNames.forEach(function(elem){
                        profiles[elem.value].displayName = elem.displayName;
                    });
                    
                    DBMS.getAllStories(function(err, stories){
                        if(err) {Utils.handleError(err); return;}
                        state.Stories = stories;
                        
                        storyNames.forEach(function(elem){
                            stories[elem.value].displayName = elem.displayName;
                        });
                        
                        DBMS.getCharacterProfileStructure(function(err, profileSettings){
                            if(err) {Utils.handleError(err); return;}
                            
                            DBMS.getMetaInfo(function(err, metaInfo){
                                if(err) {Utils.handleError(err); return;}
                                
                                state.metaInfo = metaInfo;
                            
                                var groups = profileSettings.filter(function (element) {
                                    return element.type === "enum" || element.type === "checkbox";
                                });
                                
                                var groupNames = [ {name: Constants.noGroup, displayName: constL10n(Constants.noGroup)} ].concat(groups.map(function (elem) {
                                    return {
                                        name: elem.name,
                                        displayName: elem.name,
                                    }
                                }));
                                
                                groupNames.forEach(function (group) {
                                    var option = makeEl("option");
                                    option.appendChild(makeText(group.displayName));
                                    option.value = group.name;
                                    selector.appendChild(option);
                                });
                                
                                state.groupColors = {};
                                state.groupLists = {'noGroup':['noGroup']};
                                
                                for ( var groupName in Constants.snFixedColors) {
                                    state.groupColors[groupName] = Constants.snFixedColors[groupName];
                                }
                                
                                groups.forEach(function (group) {
                                    if(group.type === "enum"){
                                        var list = [];
                                        group.value.split(",").forEach(function (subGroupName, i){
                                            state.groupColors[group.name + "." + subGroupName.trim()] = Constants.colorPalette[i];
                                            list.push(group.name + "." + subGroupName.trim());
                                        });
                                        state.groupLists[group.name] = list;
                                    } else if( group.type === "checkbox"){
                                        if(group.value){
                                            state.groupColors[group.name + ".true"] = Constants.colorPalette[0];
                                            state.groupColors[group.name + ".false"] = Constants.colorPalette[1];
                                        } else {
                                            state.groupColors[group.name + ".true"] = Constants.colorPalette[1];
                                            state.groupColors[group.name + ".false"] = Constants.colorPalette[0];
                                        }
                                        state.groupLists[group.name] = [group.name + ".true", group.name + ".false"];
                                    }
                                });
                                
                                NetworkSubsetsSelector.refresh(state);
    //                            onDrawNetwork();
                            });
                        });
                    });
                });
            });
        });
    };
    
    var refreshLegend = function (groupName) {
        var colorLegend = getEl("colorLegend");
        clearEl(colorLegend);
        var colorDiv;
        
        state.groupLists[groupName].forEach(function (value) {
            colorDiv = makeEl("div");
            colorDiv.appendChild(makeText(value === "noGroup" ? constL10n('noGroup') : value));
            colorDiv.style.backgroundColor = state.groupColors[value].color.background;
            colorDiv.style.border = "solid 2px " + state.groupColors[value].color.border;
            colorLegend.appendChild(colorDiv);
        });
        
        if(["characterPresenceInStory", "characterActivityInStory"].indexOf(state.selectedNetwork) !== -1){
            colorDiv = makeEl("div");
            colorDiv.appendChild(makeText(getL10n("social-network-story")));
            colorDiv.style.backgroundColor = Constants.snFixedColors["storyColor"].color.background;
            colorDiv.style.border = "solid 2px " + Constants.snFixedColors["storyColor"].color.border;
            colorLegend.appendChild(colorDiv);
        }
    };
    
    var updateNodes = function (groupName) {
        refreshLegend(groupName);
        
        var group;
        NetworkSubsetsSelector.getCharacterNames().forEach(function (characterName) {
            var character = state.Characters[characterName];
            group = groupName === "noGroup" ? groupName : groupName + "." + character[groupName];
            state.nodesDataset.update({
                id : character.name,
                group : group
            });
        });
    };
    
    var onNetworkSelectorChangeDelegate = function (event) {
        var selectedNetwork = event.target.value;
        var activityBlock = getEl("activityBlock");
        setClassByCondition(activityBlock, "hidden", selectedNetwork !== "characterActivityInStory");
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
        case "simpleNetwork":
            nodes = getCharacterNodes();
            edges = getSimpleEdges();
            break;
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
        
        var data = getSelect2DataCommon(remapProps(['id','text'], ['id', 'label']), nodes);
        $("#nodeFocusSelector").select2(data);
    
        state.nodesDataset = new vis.DataSet(nodes);
        state.edgesDataset = new vis.DataSet(edges);
        
        redrawAll();
    };
    
    var getCharacterNodes = function () {
        var groupName = getEl("networkNodeGroupSelector").value;
    
        var nodes = [];
        NetworkSubsetsSelector.getCharacterNames().forEach(
                function (characterName) {
                    var character = state.Characters[characterName];
                    nodes.push({
                        id : character.name,
                        label : character.name.split(" ").join("\n"),
                        group : groupName === "noGroup" ? constL10n('noGroup'): groupName
                                + "." + character[groupName]
                    });
                });
    
        return nodes;
    };
    
    var getStoryNodes = function () {
        var nodes = NetworkSubsetsSelector.getStoryNames().map(function (name) {
            return {
                id : "St:" + name,
                label : name.split(" ").join("\n"),
                value : Object.keys(state.Stories[name].characters).length,
                title : Object.keys(state.Stories[name].characters).length,
                group : "storyColor"
            };
        });
        return nodes;
    };
    
    var getActivityEdges = function () {
        var selectedActivities = nl2array(getEl("activitySelector").selectedOptions).map(opt => opt.activity);
        
        var edges = [];
        var edgesCheck = {};
        for ( var name in state.Stories) {
            var story = state.Stories[name];
            for ( var char1 in story.characters) {
                for(var activity in story.characters[char1].activity){
                    if(R.contains(activity, selectedActivities)){
                        edges.push({
                            from : "St:" + name,
                            to : char1,
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
                    from : "St:" + name,
                    to : char1,
                    color : "grey"
                });
            }
        }
        return edges;
    };
    
    var getSimpleEdges = function () {
        var edges = [];
        var edgesCheck = {};
        for ( var name in state.Stories) {
            var story = state.Stories[name];
            
            story.events.forEach(function (event) {
                for ( var char1 in event.characters) {
                    for ( var char2 in event.characters) {
                        if (char1 !== char2 && !edgesCheck[name + char1 + char2] && !edgesCheck[name + char2 + char1]) {
                            edgesCheck[name + char1 + char2] = true;
                            edges.push({
                                from : char1,
                                to : char2,
                                color : "grey"
                            });
                        }
                    }
                }
            });
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
                                from : char1,
                                to : char2,
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
    
    var neighbourhoodHighlight = function (params) {
        // get a JSON object
        var allNodes = state.nodesDataset.get({
            returnType : "Object"
        });
    
        var network = state.network;
        var nodesDataset = state.nodesDataset;
        if (params.nodes.length > 0) {
            state.highlightActive = true;
            var i, j;
            var selectedNode = params.nodes[0];
            var degrees = 2;
            
            // mark all nodes as hard to read.
            for ( var nodeId in allNodes) {
                allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
                if (allNodes[nodeId].hiddenLabel === undefined) {
                    allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
                    allNodes[nodeId].label = undefined;
                }
            }
            var firstDegreeNodes = network.getConnectedNodes(selectedNode);
            var secondDegreeNodes = [];
    
            // get the second degree nodes
            for (i = 1; i < degrees; i++) {
                for (j = 0; j < firstDegreeNodes.length; j++) {
                    secondDegreeNodes = secondDegreeNodes.concat(network
                            .getConnectedNodes(firstDegreeNodes[j]));
                }
            }
    
            // all second degree nodes get a different color and their label back
            for (i = 0; i < secondDegreeNodes.length; i++) {
                allNodes[secondDegreeNodes[i]].color = 'rgba(150,150,150,0.75)';
                if (allNodes[secondDegreeNodes[i]].hiddenLabel !== undefined) {
                    allNodes[secondDegreeNodes[i]].label = allNodes[secondDegreeNodes[i]].hiddenLabel;
                    allNodes[secondDegreeNodes[i]].hiddenLabel = undefined;
                }
            }
    
            // all first degree nodes get their own color and their label back
            for (i = 0; i < firstDegreeNodes.length; i++) {
                allNodes[firstDegreeNodes[i]].color = undefined;
                if (allNodes[firstDegreeNodes[i]].hiddenLabel !== undefined) {
                    allNodes[firstDegreeNodes[i]].label = allNodes[firstDegreeNodes[i]].hiddenLabel;
                    allNodes[firstDegreeNodes[i]].hiddenLabel = undefined;
                }
            }
    
            // the main node gets its own color and its label back.
            allNodes[selectedNode].color = undefined;
            if (allNodes[selectedNode].hiddenLabel !== undefined) {
                allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
                allNodes[selectedNode].hiddenLabel = undefined;
            }
    
        } else if (params.edges.length > 0) {
            state.highlightActive = true;
            var i, j;
            // var selectedNode = params.nodes[0];
            var selectedEdge = params.edges[0];
            var degrees = 2;
    
            // mark all nodes as hard to read.
            for ( var nodeId in allNodes) {
                allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
                if (allNodes[nodeId].hiddenLabel === undefined) {
                    allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
                    allNodes[nodeId].label = undefined;
                }
            }
            var connectedNodes = network.getConnectedNodes(selectedEdge);
            var allConnectedNodes = [];
    
            // get the second degree nodes
            for (i = 1; i < degrees; i++) {
                for (j = 0; j < connectedNodes.length; j++) {
                    allConnectedNodes = allConnectedNodes.concat(network
                            .getConnectedNodes(connectedNodes[j]));
                }
            }
    
            // all second degree nodes get a different color and their label back
            for (i = 0; i < allConnectedNodes.length; i++) {
                allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.75)';
                if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
                    allNodes[allConnectedNodes[i]].label = allNodes[allConnectedNodes[i]].hiddenLabel;
                    allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
                }
            }
    
            // all first degree nodes get their own color and their label back
            for (i = 0; i < connectedNodes.length; i++) {
                allNodes[connectedNodes[i]].color = undefined;
                if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
                    allNodes[connectedNodes[i]].label = allNodes[connectedNodes[i]].hiddenLabel;
                    allNodes[connectedNodes[i]].hiddenLabel = undefined;
                }
            }
    
        } else if (state.highlightActive === true) {
            // reset all nodes
            for ( var nodeId in allNodes) {
                allNodes[nodeId].color = undefined;
                if (allNodes[nodeId].hiddenLabel !== undefined) {
                    allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
                    allNodes[nodeId].hiddenLabel = undefined;
                }
            }
            state.highlightActive = false;
        }
    
        // transform the object into an array
        var updateArray = [];
        for (nodeId in allNodes) {
            if (allNodes.hasOwnProperty(nodeId)) {
                updateArray.push(allNodes[nodeId]);
            }
        }
        nodesDataset.update(updateArray);
    };

})(this['SocialNetwork']={});
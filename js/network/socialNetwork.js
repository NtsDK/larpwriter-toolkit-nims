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

var SocialNetwork = {};

SocialNetwork.colorMap = {};

SocialNetwork.networks = [ {
	displayName: "Социальные связи",
	value : "socialRelations"
},{
	displayName: "Персонаж-участие-история",
	value: "characterPresenceInStory"
},{
	displayName: "Персонаж-активность-история" ,
	value: "characterActivityInStory"
}];

SocialNetwork.activityColors = {
        "active": "red", 
        "follower": "blue", 
        "defensive": "green", 
        "passive": "grey"
};

SocialNetwork.generatedColors = [];

SocialNetwork.focusOptions = {
    scale : 1.2,
    offset : {
        x : 0,
        y : 0
    },
    animation : {
        duration : 1000,
        easingFunction : "easeInOutQuad"
    }
};

SocialNetwork.fixedColors = {
    "storyColor" : {
        color : {
            background : 'rgb(255,255,0)',
            border : 'rgb(255,168,3)'
        }
    },
    "Без групп" : {
        color : {
            background : 'rgb(151,194,252)',
            border : 'rgb(43,124,233)'
        }
    },
    "thirdDegreeNode" : {
        color : {
            background : 'rgba(200,200,200,0.5)',
            border : 'rgba(200,200,200,0.5)'
        }
    },
    "secondDegreeNode" : {
        color : {
            background : 'rgba(150,150,150,0.75)',
            border : 'rgba(150,150,150,0.75)'
        }
    },
    "firstDegreeNode" : {
        color : {
            background : 'rgb(151,194,252)',
            border : 'rgb(43,124,233)'
        }
    }
};

SocialNetwork.init = function () {
    "use strict";

    SocialNetwork.highlightActive = true;
    
    NetworkSubsetsSelector.init();
    
    listen(getEl("networkNodeGroupSelector"), "change", function (event) {
        SocialNetwork.updateNodes(event.target.value);
    });
    
    listen(getEl("drawNetworkButton"), "click", SocialNetwork.onDrawNetwork);
    listen(getEl("nodeFocusSelector"), "change", SocialNetwork.onNodeFocus);

    var selector = document.getElementById("networkSelector");
    selector.addEventListener("change", SocialNetwork.onNetworkSelectorChangeDelegate);
    
    var option;
    SocialNetwork.networks.forEach(function (network) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(network.displayName));
        option.value = network.value;
        selector.appendChild(option);
    });
    
    selector = document.getElementById("activitySelector");
    selector.addEventListener("change", SocialNetwork.onActivitySelectorChangeDelegate);
    
    var st;
    StoryCharacters.characterActivityTypes.forEach(function (activity, i) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(StoryCharacters.characterActivityDisplayNames[i]));
        st = option.style;
        st.color = SocialNetwork.activityColors[StoryCharacters.characterActivityTypes[i] ];
        option.activity = activity;
        selector.appendChild(option);
    });
    
    SocialNetwork.selectedActivities = {};

    SocialNetwork.network;
    SocialNetwork.highlightActive = false;
    
    document.getElementById("hideNetworkSettingsButton").addEventListener("click", SocialNetwork.togglePanel);
    document.getElementById("showNetworkSettingsButton").addEventListener("click", SocialNetwork.togglePanel);
    
    var warning = document.getElementById("socialNetworkWarning");
    warning.appendChild(document.createTextNode("Внимание! Отрисовка социальной сети требует большого количества ресурсов. Рекомендуем сохранить данные перед отрисовкой."));
    var button = document.createElement("button");
    button.appendChild(document.createTextNode("Убрать предупреждение"));
    warning.appendChild(button);
    button.addEventListener("click", function(){
        addClass(warning,"hidden");
    });
    
    SocialNetwork.nodeSort = CommonUtils.charOrdAFactory(function(a){
        return a.label.toLowerCase();
    });

    SocialNetwork.content = document.getElementById("socialNetworkDiv");
};

//SocialNetwork.fillColorPalette = function(){
//    "use strict";
//    SocialNetwork.generatedColors.forEach(function(genColor){
//        SocialNetwork.colorPalette.push({
//            color : { 
//                background : genColor,
//                border : genColor
//            }
//        });  
//    });
//};

SocialNetwork.refresh = function () {
    "use strict";
    
    var selector = document.getElementById("networkSelector");
    selector.value = SocialNetwork.networks[0].value;
    
    selector = document.getElementById("networkNodeGroupSelector");
    Utils.removeChildren(selector);
    
    PermissionInformer.getCharacterNamesArray(false, function(err, characterNames){
    	if(err) {Utils.handleError(err); return;}
    	PermissionInformer.getStoryNamesArray(false, function(err, storyNames){
    		if(err) {Utils.handleError(err); return;}
    	
		    DBMS.getAllProfiles(function(err, profiles){
		    	if(err) {Utils.handleError(err); return;}
		        SocialNetwork.Characters = profiles;
		        
		        characterNames.forEach(function(elem){
		        	profiles[elem.value].displayName = elem.displayName;
		        });
		        
		        DBMS.getAllStories(function(err, stories){
		        	if(err) {Utils.handleError(err); return;}
		            SocialNetwork.Stories = stories;
		            
		            storyNames.forEach(function(elem){
		            	stories[elem.value].displayName = elem.displayName;
			        });
		            
		            DBMS.getAllProfileSettings(function(err, profileSettings){
		            	if(err) {Utils.handleError(err); return;}
		                
		                var groups = profileSettings.filter(function (element) {
		                    return element.type === "enum" || element.type === "checkbox";
		                });
		                
		                var groupNames = [ "Без групп" ].concat(groups.map(function (elem) {
		                    return elem.name;
		                }));
		                
		                groupNames.forEach(function (group) {
		                    var option = document.createElement("option");
		                    option.appendChild(document.createTextNode(group));
		                    selector.appendChild(option);
		                });
		                
		                SocialNetwork.groupColors = {};
		                
		                for ( var groupName in SocialNetwork.fixedColors) {
		                    SocialNetwork.groupColors[groupName] = SocialNetwork.fixedColors[groupName];
		                }
		                
		                groups.forEach(function (group) {
		                    if(group.type === "enum"){
		                        group.value.split(",").forEach(function (subGroupName, i){
		                            SocialNetwork.groupColors[group.name + "." + subGroupName.trim()] = Constants.colorPalette[i];
		                        });
		                    } else if( group.type === "checkbox"){
		                        if(group.value){
		                            SocialNetwork.groupColors[group.name + ".true"] = Constants.colorPalette[0];
		                            SocialNetwork.groupColors[group.name + ".false"] = Constants.colorPalette[1];
		                        } else {
		                            SocialNetwork.groupColors[group.name + ".true"] = Constants.colorPalette[1];
		                            SocialNetwork.groupColors[group.name + ".false"] = Constants.colorPalette[0];
		                        }
		                    }
		                });
		                
		                NetworkSubsetsSelector.refresh(SocialNetwork);
		            });
		        });
		    });
	    });
    });
    
    
};

SocialNetwork.refreshLegend = function (groupName) {
    "use strict";
    var colorLegend = document.getElementById("colorLegend");
    Utils.removeChildren(colorLegend);
    var colorDiv;
    
    Object.keys(SocialNetwork.groupColors).filter(function (value){
        return value.substring(0, groupName.length) === groupName;
    }).forEach(function (value) {
        colorDiv = document.createElement("div");
        colorDiv.appendChild(document.createTextNode(value));
        colorDiv.style.backgroundColor = SocialNetwork.groupColors[value].color.background;
        colorDiv.style.border = "solid 2px " + SocialNetwork.groupColors[value].color.border;
        colorLegend.appendChild(colorDiv);
    });
    
    if(SocialNetwork.selectedNetwork === "Человек-история"){
        colorDiv = document.createElement("div");
        colorDiv.appendChild(document.createTextNode("История"));
        colorDiv.style.backgroundColor = SocialNetwork.fixedColors["storyColor"].color.background;
        colorDiv.style.border = "solid 2px " + SocialNetwork.fixedColors["storyColor"].color.border;
        colorLegend.appendChild(colorDiv);
    }
};

SocialNetwork.updateNodes = function (groupName) {
    "use strict";
    SocialNetwork.refreshLegend(groupName);
    
    var group;
    NetworkSubsetsSelector.getCharacterNames().forEach(function (characterName) {
        var character = SocialNetwork.Characters[characterName];
        group = groupName === "Без групп" ? groupName : groupName + "." + character[groupName];
        SocialNetwork.nodesDataset.update({
            id : character.name,
            group : group
        });
    });
};

SocialNetwork.onActivitySelectorChangeDelegate = function (event) {
    "use strict";
    SocialNetwork.selectedActivities = {};

    var i;
    for (i = 0; i < event.target.selectedOptions.length; i +=1) {
        SocialNetwork.selectedActivities[event.target.selectedOptions[i].activity] = true;
    }
};

SocialNetwork.onNetworkSelectorChangeDelegate = function (event) {
    "use strict";
    var selectedNetwork = event.target.value;
    var activityBlock = document.getElementById("activityBlock");
    setClassByCondition(activityBlock, "hidden", selectedNetwork !== "characterActivityInStory");
};

SocialNetwork.onNodeFocus = function (event) {
    "use strict";
    SocialNetwork.network.focus(event.target.value, SocialNetwork.focusOptions);
};

SocialNetwork.onDrawNetwork = function () {
    "use strict";
    SocialNetwork.onNetworkSelectorChange(getEl("networkSelector").value);
};

SocialNetwork.onNetworkSelectorChange = function (selectedNetwork) {
    "use strict";
    SocialNetwork.selectedNetwork = selectedNetwork;
    SocialNetwork.nodes = [];
    SocialNetwork.edges = [];
    
    switch (selectedNetwork) {
    case "Простая сеть":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes();
        SocialNetwork.edges = SocialNetwork.getSimpleEdges();
        break;
    case "socialRelations":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes();
        SocialNetwork.edges = SocialNetwork.getDetailedEdges();
        break;
    case "characterPresenceInStory":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes().concat(SocialNetwork.getStoryNodes());
        SocialNetwork.edges = SocialNetwork.getStoryEdges();
        break;
    case "characterActivityInStory":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes().concat(SocialNetwork.getStoryNodes());
        SocialNetwork.edges = SocialNetwork.getActivityEdges();
        break;
    }
    
    SocialNetwork.refreshLegend(document.getElementById("networkNodeGroupSelector").value);
    
    var focusSelector = clearEl(getEl('nodeFocusSelector'));
    var opt;
    SocialNetwork.nodes.sort(SocialNetwork.nodeSort);
    SocialNetwork.nodes.forEach(function(node){
        opt = makeEl('option')
        setProp(addEl(opt, makeText(node.label)), 'value', node.id)
        addEl(focusSelector, opt);
    });

    SocialNetwork.nodesDataset = new vis.DataSet(SocialNetwork.nodes);
    SocialNetwork.edgesDataset = new vis.DataSet(SocialNetwork.edges);
    SocialNetwork.redrawAll();
};

SocialNetwork.getCharacterNodes = function () {
    "use strict";
    var groupName = document.getElementById("networkNodeGroupSelector").value;

    var nodes = [];
    NetworkSubsetsSelector.getCharacterNames().forEach(
            function (characterName) {
                var character = SocialNetwork.Characters[characterName];
                nodes.push({
                    id : character.name,
                    label : character.name.split(" ").join("\n"),
                    group : groupName === "Без групп" ? groupName : groupName
                            + "." + character[groupName]
                });
            });

    return nodes;
};

SocialNetwork.getStoryNodes = function () {
    "use strict";
    var nodes = NetworkSubsetsSelector.getStoryNames().map(function (name) {
        return {
            id : "St:" + name,
            label : name.split(" ").join("\n"),
            value : Object.keys(SocialNetwork.Stories[name].characters).length,
            title : Object.keys(SocialNetwork.Stories[name].characters).length,
            group : "storyColor"
        };
    });
    return nodes;
};



SocialNetwork.getActivityEdges = function () {
    "use strict";
    var edges = [];
    var edgesCheck = {};
    for ( var name in SocialNetwork.Stories) {
        var story = SocialNetwork.Stories[name];
        for ( var char1 in story.characters) {
            for(var activity in story.characters[char1].activity){
                if(SocialNetwork.selectedActivities[activity]){
                    edges.push({
                        from : "St:" + name,
                        to : char1,
                        color : SocialNetwork.activityColors[activity],
                        width: 2,
                        hoverWidth: 4
                    });
                }
                
            }
        }
    }
    return edges;
};

SocialNetwork.getStoryEdges = function () {
    "use strict";
    var edges = [];
    var edgesCheck = {};
    for ( var name in SocialNetwork.Stories) {
        var story = SocialNetwork.Stories[name];
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

SocialNetwork.getSimpleEdges = function () {
    "use strict";
    var edges = [];
    var edgesCheck = {};
    for ( var name in SocialNetwork.Stories) {
        var story = SocialNetwork.Stories[name];
        
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

SocialNetwork.getDetailedEdges = function () {
    "use strict";
    
    var edgesCheck = {};
    for ( var name in SocialNetwork.Stories) {
        var story = SocialNetwork.Stories[name];
        story.events.forEach(function (event) {
            for ( var char1 in event.characters) {
                for ( var char2 in event.characters) {
                    
                    if (char1 !== char2) {
                        if (!edgesCheck[char1 + char2] && !edgesCheck[char2 + char1]) {
                            var obj = {};
                            obj[name] = true;
                            edgesCheck[char1 + char2] = {
                                    value : 1,
                                    from : char1,
                                    to : char2,
                                    title : obj
                            };
                        } else if (edgesCheck[char1 + char2] || edgesCheck[char2 + char1]) {
                            var value = edgesCheck[char1 + char2] ? edgesCheck[char1 + char2] : edgesCheck[char2 + char1];
                            if (!value.title[name]) {
                                value.title[name] = true;
                                value.value++;
                            }
                        }
                    }
                }
            }
        });
    }

    var edges = Object.keys(edgesCheck).map(function (name) {
        var edgeInfo = edgesCheck[name];
        var title = "";
        // var title = edgeInfo.title.join(",");
        var isFirst = true;
        for ( var storyName in edgeInfo.title) {
            title += (isFirst ? "" : ",") + storyName;
            isFirst = false;
        }
        
        return {
            from : edgeInfo.from,
            to : edgeInfo.to,
            title : edgeInfo.value + ":" + title,
            value : edgeInfo.value,
            color : "grey"
        };
    });
    
    return edges;
};

SocialNetwork.redrawAll = function () {
    "use strict";
    var container = document.getElementById('socialNetworkContainer');
    var options = {
        nodes : {
            shape : 'dot',
            scaling : {
                min : 10,
                max : 30,
                label : {
                    min : 8,
                    // min : 4,
                    max : 30,
                    // max : 50,
                    // drawThreshold : 12,
                    drawThreshold : 5,
                    maxVisible : 30
                // maxVisible : 20
                }
            },
            font : {
                // size : 12,
                size : 20,
                face : 'Tahoma'
            }
        },
        edges : {
            width : 0.15,
            color : {
                inherit : 'from'
            },
            smooth : {
//                type : 'continuous'
                type : 'dynamic'
            }
        },
        physics : {
            barnesHut : {
//                gravitationalConstant : -15000
                gravitationalConstant : -30000,
//             gravitationalConstant : -60000
//                springLength: 20,
                springConstant: 0.1
            },
            stabilization : {
//                iterations : 2500
                iterations : 50
            }
        },
        // physics : false,
        // layout : true,
        layout : {
            randomSeed : 1200
        },
        interaction : {
            tooltipDelay : 200,
        // hideEdgesOnDrag : true
        },
        groups : SocialNetwork.groupColors
    };
    var data = {
        nodes : SocialNetwork.nodesDataset,
        edges : SocialNetwork.edgesDataset
    } // Note: data is coming from ./datasources/WorldCup2014.js

    SocialNetwork.network = new vis.Network(container, data, options);
    
    SocialNetwork.network.on("click", SocialNetwork.neighbourhoodHighlight);
};

SocialNetwork.neighbourhoodHighlight = function (params) {
    "use strict";

    // get a JSON object
    var allNodes = SocialNetwork.nodesDataset.get({
        returnType : "Object"
    });

    var network = SocialNetwork.network;
    var nodesDataset = SocialNetwork.nodesDataset;
    if (params.nodes.length > 0) {
        SocialNetwork.highlightActive = true;
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
        SocialNetwork.highlightActive = true;
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

    } else if (SocialNetwork.highlightActive === true) {
        // reset all nodes
        for ( var nodeId in allNodes) {
            allNodes[nodeId].color = undefined;
            if (allNodes[nodeId].hiddenLabel !== undefined) {
                allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
                allNodes[nodeId].hiddenLabel = undefined;
            }
        }
        SocialNetwork.highlightActive = false;
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

SocialNetwork.togglePanel = function () {
    toggleClass(document.getElementById("commonSettingsContainer"), "hidden");
    toggleClass(document.getElementById("privateSettingsContainer"), "hidden");
    toggleClass(document.getElementById("showSettingsButtonContainer"), "hidden");
};

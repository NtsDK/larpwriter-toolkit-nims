/*global
 Utils, DBMS, Database
 */

"use strict";

var SocialNetwork = {};

SocialNetwork.colorMap = {};

SocialNetwork.colorPalette = [ {
    color : { // aquamarine-blue
        background : 'rgb(151,194,252)',
        border : 'rgb(43,124,233)'
    }
}, { // rose-red
    color : {
        background : 'rgb(251,126,129)',
        border : 'rgb(250,10,16)'
    }
}, { // green-deep green
    color : { 
        background : 'rgb(123,225,65)',
        border : 'rgb(65,169,6)'
    }
} ];

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
    }
};

SocialNetwork.init = function () {
    "use strict";

    SocialNetwork.highlightActive = true;

    var selector = document.getElementById("networkNodeGroupSelector");
    selector.addEventListener("change", function (event) {
        SocialNetwork.updateNodes(event.target.value);
    });

    var groups = Database.ProfileSettings.filter(function (element) {
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
                SocialNetwork.groupColors[group.name + "." + subGroupName] = SocialNetwork.colorPalette[i];
            });
        } else if( group.type === "checkbox"){
            if(group.value){
                SocialNetwork.groupColors[group.name + ".true"] = SocialNetwork.colorPalette[0];
                SocialNetwork.groupColors[group.name + ".false"] = SocialNetwork.colorPalette[1];
            } else {
                SocialNetwork.groupColors[group.name + ".true"] = SocialNetwork.colorPalette[1];
                SocialNetwork.groupColors[group.name + ".false"] = SocialNetwork.colorPalette[0];
            }
        }
    });
    
    // "name" : "Участие в тендере",
    // "type" : "checkbox",
    // "value" : false
    // }, {
    // "name" : "Пол",
    // "type" : "enum",
    // "value" : "не важно,М,Ж"
    //	
    // SocialNetwork.colorMap["storyColor"] = {background:'rgb(255,255,0)',
    // border:'rgb(255,168,3)'}; // yellow-orange
    // SocialNetwork.colorMap["Без групп"] = {background:'rgb(151,194,252)',
    // border:'rgb(43,124,233)'}; // aquamarine-blue
    // SocialNetwork.colorMap["Пол.не важно"] = {background:'rgb(151,194,252)',
    // border:'rgb(43,124,233)'}; // aquamarine-blue
    // SocialNetwork.colorMap["Пол.M"] = {background:'rgb(123,225,65)',
    // border:'rgb(65,169,6)'}; // green-deep green
    // SocialNetwork.colorMap["Пол.Ж"] = {background:'rgb(251,126,129)',
    // border:'rgb(250,10,16)'}; // rose-red
    // SocialNetwork.colorMap["Участие в тендере.false"] =
    // {background:'rgb(151,194,252)', border:'rgb(43,124,233)'}; //
    // aquamarine-blue
    // SocialNetwork.colorMap["Участие в тендере.true"] =
    // {background:'rgb(251,126,129)', border:'rgb(250,10,16)'}; // rose-red

    selector = document.getElementById("networkSelector");
    selector.addEventListener("change", SocialNetwork.onNetworkSelectorChangeDelegate);

    var networks = [ "Простая сеть", "Детальная сеть", "Человек-история" ];

    var option;
    networks.forEach(function (network) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(network));
        selector.appendChild(option);
    });

    selector.value = networks[0];

    SocialNetwork.network;
    SocialNetwork.allNodes;
    SocialNetwork.highlightActive = false;

    SocialNetwork.onNetworkSelectorChange(networks[0]);

    SocialNetwork.content = document.getElementById("socialNetworkDiv");
};

SocialNetwork.refresh = function () {
    "use strict";
    SocialNetwork.nodesDataset = new vis.DataSet(SocialNetwork.nodes);
    SocialNetwork.edgesDataset = new vis.DataSet(SocialNetwork.edges);
    SocialNetwork.redrawAll();
};

SocialNetwork.updateNodes = function (groupName) {
    "use strict";
    Object.keys(Database.Characters).forEach(function (characterName) {
        var character = Database.Characters[characterName];
        SocialNetwork.nodesDataset.update({
            id : character.name,
            // label : name,
            label : character.name.split(" ").join("\n"),
            // group: character[groupName]+""
            // color: SocialNetwork.colorMap[groupName + "." +
            // character[groupName]]
            // group: groupName + "." + character[groupName]
            group : groupName === "Без групп" ? groupName : groupName
                    + "." + character[groupName]
        // group: character[groupName]+""
        // group: 0
        });
    });
};

SocialNetwork.onNetworkSelectorChangeDelegate = function (event) {
    "use strict";
    SocialNetwork.onNetworkSelectorChange(event.target.value);
};

SocialNetwork.onNetworkSelectorChange = function (selectedNetwork) {
    "use strict";
    SocialNetwork.nodes = [];
    SocialNetwork.edges = [];

    switch (selectedNetwork) {
    case "Простая сеть":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes();
        SocialNetwork.edges = SocialNetwork.getSimpleEdges();
        break;
    case "Детальная сеть":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes();
        SocialNetwork.edges = SocialNetwork.getDetailedEdges();
        break;
    case "Человек-история":
        SocialNetwork.nodes = SocialNetwork.getCharacterNodes().concat(SocialNetwork.getStoryNodes());
        SocialNetwork.edges = SocialNetwork.getStoryEdges();
        break;
    }

    SocialNetwork.refresh();
};

SocialNetwork.getCharacterNodes = function () {
    "use strict";
    var groupName = document.getElementById("networkNodeGroupSelector").value;

    var nodes = [];
    Object.keys(Database.Characters).forEach(
            function (characterName) {
                var character = Database.Characters[characterName];
                nodes.push({
                    id : character.name,
                    // label : name,
                    label : character.name.split(" ").join("\n"),
                    // group: character[groupName]+""
                    group : groupName === "Без групп" ? groupName : groupName
                            + "." + character[groupName]
                // color: SocialNetwork.colorMap[groupName + "." +
                // character[groupName]]
                // group: 0
                });
            });

    // for ( var name in Database.Characters) {
    // nodes.push({
    // id : name,
    // // label : name,
    // label : name.split(" ").join("\n"),
    // group: 0
    // });
    // }
    return nodes;
};

SocialNetwork.getStoryNodes = function () {
    "use strict";
    var nodes = Object.keys(Database.Stories).map(function (name) {
        return {
            id : "St:" + name,
            // label : name,
            label : name.split(" ").join("\n"),
            value : Object.keys(Database.Stories[name].characters).length,
            title : Object.keys(Database.Stories[name].characters).length,
            // color : SocialNetwork.colorMap["storyColor"]
            group : "storyColor"
        // color : SocialNetwork.colorMap["storyColor"]
        // group: 1
        };
    });
    return nodes;
};

SocialNetwork.getStoryEdges = function () {
    "use strict";
    var edges = [];
    var edgesCheck = {};
    for ( var name in Database.Stories) {
        var story = Database.Stories[name];
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
    for ( var name in Database.Stories) {
        var story = Database.Stories[name];
        
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
    for ( var name in Database.Stories) {
        var story = Database.Stories[name];
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
                type : 'continuous'
            }
        },
        physics : {
            barnesHut : {
                gravitationalConstant : -30000
            // gravitationalConstant : -60000
            },
            stabilization : {
                iterations : 2500
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

    // get a JSON object
    SocialNetwork.allNodes = SocialNetwork.nodesDataset.get({
        returnType : "Object"
    });

    SocialNetwork.network.on("click", SocialNetwork.neighbourhoodHighlight);
};

SocialNetwork.neighbourhoodHighlight = function (params) {
    "use strict";
    // if something is selected:

    var allNodes = SocialNetwork.allNodes;
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
        var connectedNodes = network.getConnectedNodes(selectedNode);
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

        // // the main node gets its own color and its label back.
        // allNodes[selectedNode].color = undefined;
        // if (allNodes[selectedNode].hiddenLabel !== undefined) {
        // allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
        // allNodes[selectedNode].hiddenLabel = undefined;
        // }

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

SocialNetwork = {};

SocialNetwork.init = function() {
	SocialNetwork.content = document.getElementById("socialNetworkDiv");

	SocialNetwork.network;
	SocialNetwork.allNodes;
	SocialNetwork.highlightActive = false;

};

SocialNetwork.refresh = function() {
	// SocialNetwork.nodesDataset = new vis.DataSet(nodes); // these come from
	// // WorldCup2014.js
	// SocialNetwork.edgesDataset = new vis.DataSet(edges); // these come from
	// // WorldCup2014.js

	// var nodes =
	var nodes = [];
	for ( var name in Database.Characters) {
		nodes.push({
			id : name,
			label : name
		});
	}

	SocialNetwork.nodesDataset = new vis.DataSet(nodes); // these come from
	// WorldCup2014.js
	edges = [];

	var edgesCheck = {};
	for ( var name in Database.Stories) {
		var story = Database.Stories[name];
		for (var i = 0; i < story.events.length; ++i) {
			var event = story.events[i];
			for ( var char1 in event.characters) {
				for ( var char2 in event.characters) {
					if (char1 != char2 && !edgesCheck[char1 + char2]
							&& !edgesCheck[char2 + char1]) {
						edgesCheck[char1 + char2] = true;
						edges.push({
							from : char1,
							to : char2
						});
					}
				}
			}
		}
	}

	SocialNetwork.edgesDataset = new vis.DataSet(edges); // these come from
	// WorldCup2014.js
	SocialNetwork.redrawAll();
};

SocialNetwork.redrawAll = function() {
	var container = document.getElementById('socialNetworkContainer');
	var options = {
		nodes : {
			shape : 'dot',
			scaling : {
				min : 10,
				max : 30,
				label : {
					min : 8,
//					min : 4,
					max : 30,
//					max : 50,
//					drawThreshold : 12,
					drawThreshold : 5,
					maxVisible : 30
//					maxVisible : 20
				}
			},
			font : {
//				size : 12,
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
			},
			stabilization : {
				iterations : 2500
			}
		},
		// physics : false,
//		 layout : true,
		interaction : {
			tooltipDelay : 200,
			hideEdgesOnDrag : true
		}
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
}

SocialNetwork.neighbourhoodHighlight = function(params) {
	// if something is selected:

	var allNodes = SocialNetwork.allNodes;
	var network = SocialNetwork.network;
	var nodesDataset = SocialNetwork.nodesDataset;
	if (params.nodes.length > 0) {
		highlightActive = true;
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
	} else if (highlightActive === true) {
		// reset all nodes
		for ( var nodeId in allNodes) {
			allNodes[nodeId].color = undefined;
			if (allNodes[nodeId].hiddenLabel !== undefined) {
				allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
				allNodes[nodeId].hiddenLabel = undefined;
			}
		}
		highlightActive = false
	}

	// transform the object into an array
	var updateArray = [];
	for (nodeId in allNodes) {
		if (allNodes.hasOwnProperty(nodeId)) {
			updateArray.push(allNodes[nodeId]);
		}
	}
	nodesDataset.update(updateArray);
}

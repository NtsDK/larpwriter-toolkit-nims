import vis from 'vis';
import 'vis/dist/vis.min.css';
import PermissionInformer from 'permissionInformer';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';
import { Constants } from 'nims-dbms';
import * as NetworkSubsetsSelector from './networkSubsetsSelector';

export class NetworkWrapper {
  constructor() {
    this.highlightActive = false;
    this.neighbourhoodHighlight = this.neighbourhoodHighlight.bind(this);
    this.onNodeFocus = this.onNodeFocus.bind(this);
  }

  isNetworkEmpty() {
    return this.nodesDataset === undefined;
  }

  onNodeFocus(event) {
    this.network.focus(event.target.value, Constants.snFocusOptions);
  }

  getNodesDataset() {
    return this.nodesDataset;
  }

  redrawAll(groupColors, nodes, edges) {
    this.nodesDataset = new vis.DataSet(nodes);
    this.edgesDataset = new vis.DataSet(edges);
    const container = U.queryEl('#socialNetworkContainer');

    const data = {
      nodes: this.nodesDataset,
      edges: this.edgesDataset
    }; // Note: data is coming from ./datasources/WorldCup2014.js

    if (this.network) {
      this.network.destroy();
    }

    const opts = R.clone(Constants.socialNetworkOpts);
    opts.groups = groupColors;

    this.network = new vis.Network(container, data, opts);

    this.network.on('click', this.neighbourhoodHighlight);
  }

  // called from redrawAll
  neighbourhoodHighlight(params) {
    // get a JSON object
    const allNodes = this.nodesDataset.get({
      returnType: 'Object'
    });

    const { network } = this;
    if (params.nodes.length > 0) {
      this.highlightActive = true;
      const selectedNode = params.nodes[0];
      const zeroDegreeNodes = [selectedNode];
      const firstDegreeNodes = network.getConnectedNodes(selectedNode);
      highlightNodes(network, allNodes, zeroDegreeNodes, firstDegreeNodes);
    } else if (params.edges.length > 0) {
      this.highlightActive = true;
      const selectedEdge = params.edges[0];
      const firstDegreeNodes = network.getConnectedNodes(selectedEdge);
      highlightNodes(network, allNodes, [], firstDegreeNodes);
    } else if (this.highlightActive === true) {
      // reset all nodes
      R.values(allNodes).forEach((node) => {
        node.color = undefined;
        showLabel(node);
      });
      this.highlightActive = false;
    }

    // transform the object into an array
    this.nodesDataset.update(R.values(allNodes));
  }
}

// called from neighbourhoodHighlight
function highlightNodes(network, allNodes, zeroDegreeNodes, firstDegreeNodes) {
  // get the second degree nodes
  const secondDegreeNodes = R.uniq(R.flatten(firstDegreeNodes.map((id) => network.getConnectedNodes(id))));
  // mark all nodes as hard to read.
  R.values(allNodes).forEach((node) => {
    node.color = 'rgba(200,200,200,0.5)';
    hideLabel(node);
  });
  // all second degree nodes get a different color and their label back
  secondDegreeNodes.map((id) => allNodes[id]).forEach((node) => {
    node.color = 'rgba(150,150,150,0.75)';
    showLabel(node);
  });
  // all first degree nodes get their own color and their label back
  firstDegreeNodes.map((id) => allNodes[id]).forEach((node) => {
    node.color = undefined;
    showLabel(node);
  });
  // the main node gets its own color and its label back.
  zeroDegreeNodes.map((id) => allNodes[id]).forEach((node) => {
    node.color = undefined;
    showLabel(node);
  });
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

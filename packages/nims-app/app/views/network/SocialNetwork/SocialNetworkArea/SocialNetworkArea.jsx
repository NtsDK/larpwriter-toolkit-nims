import React, { Component } from 'react';
import vis from 'vis';
import 'vis/dist/vis.min.css';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';
import { Constants } from 'nims-dbms';
import './SocialNetworkArea.css';

export class SocialNetworkArea extends Component {
  nodesDataset = new vis.DataSet();

  edgesDataset = new vis.DataSet();

  constructor(props) {
    super(props);
    this.state = {
    };
    this.networkContainer = React.createRef();
    this.neighbourhoodHighlight = this.neighbourhoodHighlight.bind(this);
  }

  componentDidMount() {
    this.initNetwork();
    const { nodes, edges } = this.props;

    this.nodesDataset.add(nodes);
    this.edgesDataset.add(edges);
    console.log('SocialNetworkArea mounted');
  }

  componentDidUpdate(prevProps) {
    const {
      nodes, edges, groupColors, getNodeColorsUpdate, selectedGroup, focusNode
    } = this.props;
    if (nodes !== prevProps.nodes
      || edges !== prevProps.edges) {
      this.nodesDataset.clear();
      this.edgesDataset.clear();
      this.nodesDataset.add(nodes);
      this.edgesDataset.add(edges);
      this.nodesDataset.update(getNodeColorsUpdate());

      // this.network.destroy();

      // this.nodesDataset = new vis.DataSet(nodes);

      // this.edgesDataset = new vis.DataSet(edges);

      // const data = {
      //   nodes: this.nodesDataset,
      //   edges: this.edgesDataset
      // }; // Note: data is coming from ./datasources/WorldCup2014.js
      // const opts = R.clone(Constants.socialNetworkOpts);
      // // opts.groups = groupColors;

      // this.network = new vis.Network(this.networkContainer.current, data, opts);
    }
    if (groupColors !== prevProps.groupColors) {
      const opts = R.clone(Constants.socialNetworkOpts);
      opts.groups = groupColors;
      this.network.setOptions(opts);
    }
    if (selectedGroup !== prevProps.selectedGroup) {
      this.nodesDataset.update(getNodeColorsUpdate());
    }
    if (focusNode !== prevProps.focusNode) {
      // this.nodesDataset.update(getNodeColorsUpdate());
      this.network.focus(focusNode, Constants.snFocusOptions);
    }

    console.log('SocialNetworkArea did update');
  }

  componentWillUnmount() {
    console.log('SocialNetworkArea will unmount');
  }

  initNetwork() {
    if (this.network === undefined) {
      const { groupColors } = this.props;
      // const timeline = new vis.Timeline(this.networkContainer.current, null, options);
      // timeline.setGroups(this.tagDataset);
      // timeline.setItems(this.timelineDataset);
      // this.timeline = timeline;
      const data = {
        nodes: this.nodesDataset,
        edges: this.edgesDataset
      }; // Note: data is coming from ./datasources/WorldCup2014.js
      const opts = R.clone(Constants.socialNetworkOpts);
      opts.groups = groupColors;

      this.network = new vis.Network(this.networkContainer.current, data, opts);

      this.network.on('click', this.neighbourhoodHighlight);
    }
  }

  // called from redrawAll
  neighbourhoodHighlight(params) {
    // if()
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

  // redrawAll(groupColors, nodes, edges) {
  //   this.nodesDataset = new vis.DataSet(nodes);
  //   this.edgesDataset = new vis.DataSet(edges);
  //   const container = U.queryEl('#socialNetworkContainer');

  //   if (this.network) {
  //     this.network.destroy();
  //   }

  //   this.network.on('click', this.neighbourhoodHighlight);
  // }

  render() {
    if (this.network !== undefined) {
      // const { something } = this.state;
    }
    // const { t } = this.props;

    // if (!something) {
    //   return <div> SocialNetworkArea stub </div>;
    //   // return null;
    // }
    return (
      <div
        ref={this.networkContainer}
        className="SocialNetworkArea visualObjectContainer full-screen-elem"
        id="socialNetworkContainer"
      />
    );
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

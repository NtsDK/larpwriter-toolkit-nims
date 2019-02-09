/*Copyright 2016-2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
 Utils, DBMS
 */

const { d3, klay } = require('core/libs/klay-adapter');
const R = require('ramda');

'use strict';

// const d3 = require('d3');

// ((exports) => {
const state = {};
const rootTab = '.group-schema-tab';

exports.init = () => {
    exports.content = U.queryEl(rootTab);
};

exports.refresh = () => {
    DBMS.getGroupSchemas().then((schemas) => {
        redrawSchema2(schemas.theory, 'theory');
        redrawSchema2(schemas.practice, 'practice');
    }).catch(UI.handleError);
};

function redrawSchema(graph) {
    const container = U.queryEl(`${rootTab} .schema-container`);

    if (state.network) {
        state.network.destroy();
    }
    graph.edges = graph.edges.map(edge => R.merge(edge, {
        physics: false,
    }));

    state.network = new vis.Network(container, graph, Constants.groupSchemaOpts);
}

function redrawSchema2(graphData, className) {
    U.clearEl(U.queryEl(`${rootTab} svg.${className}`));
    const svg = d3.select(`${rootTab} svg.${className}`);
    const svgGroup = svg.append('g');
    const root = svgGroup.append('g');

    // define an arrow head
    svg.append('svg:defs')
        .append('svg:marker')
        .attr('id', 'end')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 3) // marker settings
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .style('fill', '#999')
        .style('stroke-opacity', 0.6) // arrowhead color
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    const nodeDict = graphData.nodes.reduce((dict, node, i) => {
        dict[node.id] = i;
        return dict;
    }, {});

    const nodeWidth = 170;
    const nodeHeight = 20;

    const name2Node = obj => ({
        id: nodeDict[obj.id],
        name: obj.id,
        title: obj.title,
        label: obj.label,
        width: nodeWidth,
        height: nodeHeight
    });

    const pair2Edge = (obj, i) => ({
        id: i + graphData.nodes.length,
        source: nodeDict[obj.to],
        target: nodeDict[obj.from]
    });

    const graph = {
        nodes: graphData.nodes.map(name2Node),
        links: graphData.edges.map(pair2Edge)
    };

    const layouter = klay.d3adapter();
    const width = 960;
    const height = 400;

    layouter
        .nodes(graph.nodes)
        .links(graph.links)
        .size([width, height])
        .transformGroup(root)
        .options({
            edgeRouting: 'ORTHOGONAL',
            direction: 'RIGHT',
            intCoordinates: false
        })
        .defaultPortSize([2, 2])
        .start();

    const link = root.selectAll('.link')
        .data(graph.links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', 'M0 0')
        .attr('marker-end', 'url(#end)');

    // we group nodes along with their ports
    const node = root.selectAll('.node')
        .data(graph.nodes)
        .enter()
        .append('g');

    node.append('rect')
        .attr('class', d => 'node valid'
            //                const details = checkRes.details[d.name];
            //                if (details === undefined || details.length === 0) {
            //                    return 'node valid';
            //                }
            //                return 'node invalid';
        )
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('title', 'link')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('x', 0)
        .attr('y', 0);

    node.append('title').text(d => d.title);

    node.append('text')
        .attr('x', nodeWidth / 2)
        .attr('y', nodeHeight / 2)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
    //            .text(d => d.name)
        .text(d => d.label)
        .attr('font-size', '4px');

    // ports
    const port = node.selectAll('.port')
        .data(d => d.ports)
        .enter()
        .append('rect')
        .attr('class', 'port')
        .attr('width', 2)
        .attr('height', 2)
        .attr('x', 0)
        .attr('y', 0);

    // apply layout
    layouter.on('finish', (d2) => {
        // apply edge routes
        link.transition().attr('d', (d) => {
            let path = '';
            path += `M${d.sourcePoint.x} ${d.sourcePoint.y} `;
            d.bendPoints.forEach((bp, i) => {
                path += `L${bp.x} ${bp.y} `;
            });
            path += `L${d.targetPoint.x} ${d.targetPoint.y} `;
            return path;
        });

        // apply node positions
        node.transition()
            .attr('transform', d => `translate(${d.x} ${d.y})`);

        // apply port positions
        port.transition()
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });

    layouter.start();
}
// })(window.GroupSchema = {});

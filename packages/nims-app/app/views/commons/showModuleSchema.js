import ReactDOM from 'react-dom';
import {
    getModuleSchemaDialog
} from "./ModuleSchemaDialog.jsx";
import { U, L10n } from 'nims-app-core';
import { d3, klay } from 'nims-app-core/libs/klay-adapter';

export const showModuleSchema = (checkRes) => {
    let dialog = U.queryEl('.consistency-check-result-dialog');
    if (dialog == null) {
        const content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), content);
        ReactDOM.render(getModuleSchemaDialog(), content);
        L10n.localizeStatic(content);
        const newDialog = U.qee(content, '.consistency-check-result-dialog');
        // U.addEl(U.queryEl('body'), U.queryEl('.show-diff-dialog'));
        U.addEl(U.queryEl('body'), newDialog);
        dialog = newDialog;
    }
    $(dialog).modal('show');

    // U.addEl(U.queryEl('body'), U.queryEl('.consistency-check-result-dialog'));
    // $(U.queryEl('.consistency-check-result-dialog')).modal('show');

    const svg = d3.select('.image-place svg');
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

    const nodeDict = checkRes.nodes.reduce((dict, name, i) => {
        dict[name] = i;
        return dict;
    }, {});

    const nodeWidth = 170;
    const nodeHeight = 30;

    const name2Node = (name) => ({
        id: nodeDict[name],
        name,
        width: nodeWidth,
        height: nodeHeight
    });

    const pair2Edge = (pair, i) => ({
        id: i + checkRes.nodes.length,
        source: nodeDict[pair[0]],
        target: nodeDict[pair[1]]
    });

    const graph = {
        nodes: checkRes.nodes.map(name2Node),
        links: checkRes.edges.map(pair2Edge)
    };

    const layouter = klay.d3adapter();
    const width = 960;
    const height = 600;

    layouter
        .nodes(graph.nodes)
        .links(graph.links)
        .size([width, height])
        .transformGroup(root)
        .options({
            edgeRouting: 'ORTHOGONAL',
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
        .attr('class', (d) => {
            const details = checkRes.details[d.name];
            if (details === undefined || details.length === 0) {
                return 'node valid';
            }
            return 'node invalid';
        })
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('x', 0)
        .attr('y', 0);

    node.append('text')
        .attr('x', nodeWidth / 2)
        .attr('y', nodeHeight / 2)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text((d) => d.name)
        .attr('font-size', '4px');

    // ports
    const port = node.selectAll('.port')
        .data((d) => d.ports)
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
            .attr('transform', (d) => `translate(${d.x} ${d.y})`);

        // apply port positions
        port.transition()
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y);
    });

    layouter.start();
};

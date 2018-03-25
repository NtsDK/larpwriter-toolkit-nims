/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

((exports) => {
    exports.runTests = () => window.RunTests();
    
    exports.showConsistencyCheckAlert = (checkRes) => {
        if (checkRes === undefined || checkRes.errors.length === 0) {
            Utils.alert(getL10n('overview-consistency-is-ok'));
        } else {
            Utils.alert(getL10n('overview-consistency-problem-detected'));
        }
    };
    
    exports.clickThroughtHeaders = () => {
        let tabs = queryEls('#navigation .navigation-button');

        let index = 0;
        let subTabsNum = 0;
        function runClicker() {
            if (index <= tabs.length - 1) {
                tabs[index].click();
                if (subTabsNum === 0) {
                    const subTabs = queryEls('#contentArea .navigation-button');
                    tabs = R.insertAll(index + 1, subTabs, tabs);
                    subTabsNum = subTabs.length;
                } else {
                    subTabsNum--;
                }
                index++;
                setTimeout(runClicker, 500);
            }
        }
        runClicker();
    }
    
    exports.showModuleSchema = (checkRes) => {
        addEl(queryEl('body'), queryEl(`.consistency-check-result-dialog`));
        $(queryEl(`.consistency-check-result-dialog`)).modal('show');
        
        const svg = d3.select(".image-place svg");
        const svgGroup = svg.append("g");
        const root = svgGroup.append("g");
        
        // define an arrow head
        svg.append("svg:defs")
             .append("svg:marker")
              .attr("id", "end")
              .attr("viewBox", "0 -5 10 10")
              .attr("refX", 10)
              .attr("refY", 0)
              .attr("markerWidth", 3)        // marker settings
              .attr("markerHeight", 5)
              .attr("orient", "auto")
              .style("fill", "#999")
              .style("stroke-opacity", 0.6)  // arrowhead color
             .append("svg:path")
              .attr("d", "M0,-5L10,0L0,5");

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
        }) ;
        
        const graph = {
          nodes: checkRes.nodes.map(name2Node),
          links: checkRes.edges.map(pair2Edge)
        }
    
        const layouter = klay.d3adapter();
        const width = 960;
        const height = 600;
        
        layouter
            .nodes(graph.nodes)
            .links(graph.links)
            .size([width, height])
            .transformGroup(root)
            .options({
              edgeRouting: "ORTHOGONAL",
              intCoordinates: false
            })
            .defaultPortSize([2, 2])
            .start();
            
        const link = root.selectAll(".link")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", "M0 0")
            .attr("marker-end", "url(#end)");
    
        // we group nodes along with their ports
        const node = root.selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g");
            
        node.append("rect")
            .attr("class", (d)=> {
                const details = checkRes.details[d.name]; 
                if(details === undefined || details.length === 0){
                    return "node valid";
                }
                return "node invalid";
            })
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("x", 0)
            .attr("y", 0);
        
        node.append("text")
            .attr("x", nodeWidth/2)
            .attr("y", nodeHeight/2)
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.name; })
            .attr("font-size", "4px");
        
        // ports
        const port = node.selectAll(".port")
          .data(function(d) { return d.ports; })
          .enter()
          .append("rect")
          .attr("class", "port")
          .attr("width", 2)
          .attr("height", 2)
          .attr("x", 0)
          .attr("y", 0);
    
        // apply layout
        layouter.on("finish", function(d) {
        
          // apply edge routes
          link.transition().attr("d", function(d) {
            let path = "";
            path += "M" + d.sourcePoint.x + " " + d.sourcePoint.y + " ";
            d.bendPoints.forEach(function(bp, i) {
              path += "L" + bp.x + " " + bp.y + " ";
            });
            path += "L" + d.targetPoint.x + " " + d.targetPoint.y + " ";
            return path;
          });
        
          // apply node positions
          node.transition()
            .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"});
    
          // apply port positions  
          port.transition()
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
          
        });
        
        layouter.start();
    }
})(this.TestUtils = {});

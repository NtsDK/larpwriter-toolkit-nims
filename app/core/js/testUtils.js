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
    exports.runTests = () => {
        queryEl('body').style.overflow = 'auto';
        window.RunTests();
    };

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
    };

    exports.showModuleSchema = (checkRes) => {
        addEl(queryEl('body'), queryEl('.consistency-check-result-dialog'));
        $(queryEl('.consistency-check-result-dialog')).modal('show');

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

        const name2Node = name => ({
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
            .text(d => d.name)
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
    };

    exports.showDiffExample = () => {
        addEl(queryEl('body'), queryEl('.show-diff-dialog'));
        $(queryEl('.show-diff-dialog')).modal('show');

        DBMS.getLog({
            pageNumber: 0,
            filter: {
                action:"setMetaInfo",
                date:"",
                params:"",
                status:"OK",
                user:""
            }
        }).then((data) => {
            const el = clearEl(queryEl('.show-diff-dialog .container-fluid'));

            addEls(el, R.aperture(2, data.requestedLog).map(pair => {
                const row = qmte('.diff-row-tmpl');
                addEl(qee(row, '.first .user'), makeText(pair[0][1]));
                addEl(qee(row, '.first .time'), makeText(new Date(pair[0][2]).format('yyyy/mm/dd h:MM')));
                const firstText = JSON.parse(pair[0][4])[1];
                addEl(qee(row, '.first .text'), makeText(firstText));

                addEl(qee(row, '.last .user'), makeText(pair[1][1]));
                addEl(qee(row, '.last .time'), makeText(new Date(pair[1][2]).format('yyyy/mm/dd h:MM')));
                const lastText = JSON.parse(pair[1][4])[1];
                addEl(qee(row, '.last .text'), makeText(lastText));

                ////        const diff = JsDiff.diffChars(prevData[4] || '', rowData[4]);
                ////        const diff = JsDiff.diffWords(prevData[4] || '', rowData[4]);
    //                const diff = JsDiff.diffWordsWithSpace(firstText, lastText);
                const diff = JsDiff.diffWordsWithSpace(lastText, firstText);
                const els = diff.map( part =>
                    [part.value, (part.added ? 'added' : (part.removed ? 'removed' : 'same'))]).map(pair => {
                    return addClasses(addEl(makeEl('span'), makeText(pair[0])), ['log-diff', pair[1]]);
                });
                addEls(qee(row, '.diff .text'), els);

                return row;
            }));
        }).catch(Utils.handleError);

    };

    const getAllSubsets = theArray => theArray.reduce((subsets, value) =>
        subsets.concat(subsets.map(set => [value,...set])),[[]]);

    exports.addGroupTestingData = () => {
        DBMS.createProfileItem({type: 'character', name: 'text', itemType: 'text', selectedIndex:0});
        DBMS.createProfileItem({type: 'character', name: 'string', itemType: 'string', selectedIndex:0});
        DBMS.createProfileItem({type: 'character', name: 'checkbox', itemType: 'checkbox', selectedIndex:0});
        DBMS.createProfileItem({type: 'character', name: 'number', itemType: 'number', selectedIndex:0});
        DBMS.createProfileItem({type: 'character', name: 'enum', itemType: 'enum', selectedIndex:0});
        DBMS.createProfileItem({type: 'character', name: 'multiEnum', itemType: 'multiEnum', selectedIndex:0});

        DBMS.updateDefaultValue({type: "character", profileItemName:"enum", value: "1,2,3"});
        DBMS.updateDefaultValue({type: "character", profileItemName:"multiEnum", value: "1,2,3,4"});


        const makeChar = (name, profileItem, value) => {
            DBMS.createProfile({type: "character", characterName: name});
            DBMS.updateProfileField({type: "character", characterName: name, fieldName: profileItem, itemType: profileItem, value});
        }

        const makeGroup = (name, profileItem, obj) => {
            DBMS.createGroup({groupName: name});
            DBMS.saveFilterToGroup({groupName: name, filterModel: [R.merge(obj, {"type":profileItem,"name":"profile-" + profileItem})]});
        }
//
//
//        const enumValues = [1,2,3];
//        enumValues.map(value => makeChar('char enum ' + value, 'enum', String(value)));
//        getAllSubsets(enumValues).map( arr => {
//            const obj = arr.reduce( (acc, val) => {
//                acc[String(val)] = true;
//                return acc;
//            }, {});
//            makeGroup('group enum ' + arr.join(','), 'enum', {selectedOptions: obj});
//        });
//
//        const multiEnumConditions = ['every','equal','some'];
        // bug in condition combination
//        ['every']
//        ['every','equal']
//        ['every','some'] ...
        const multiEnumValues = [1,2,3];
        const multiEnumValues2 = [1,2,3,4];
        const multiEnumConditions = ['every','equal'];
        getAllSubsets(multiEnumValues2).map(value => makeChar('char multiEnum ' + value.join(','), 'multiEnum', String(value.join(','))));

        multiEnumConditions.map(condition => {
            getAllSubsets(multiEnumValues).map( arr => {
                const obj = arr.reduce( (acc, val) => {
                    acc[String(val)] = true;
                    return acc;
                }, {});
                makeGroup('group multiEnum ' + condition + ' ' + arr.join(','), 'multiEnum', {selectedOptions: obj, condition});
            });
        });
//
//
//        const numbers = [0,1,2,3,4];
//        const subNumbers = [1,2,3];
//        const numberConditions = ['greater','equal','lesser'];
//        numbers.map(value => makeChar('char number ' + value, 'number', (value)));
//        numberConditions.map(condition => {
//            subNumbers.map( num => {
//                makeGroup('group number ' + condition + ' ' + num, 'number', {num, condition});
//            });
//        });
//
//        const checkboxes = [true, false];
//        checkboxes.map(value => makeChar('char checkbox ' + value, 'checkbox', value));
//        getAllSubsets(checkboxes).map( arr => {
//            const obj = arr.reduce( (acc, val) => {
//                acc[String(val)] = true;
//                return acc;
//            }, {});
//            makeGroup('group checkbox ' + arr.join(','), 'checkbox', {selectedOptions: obj});
//        });
//
//        const chars = ['a','b','c','d'];
//        const subChars = ['a','b','c'];
//        getAllSubsets(chars).map(value => makeChar('char string ' + value.join(''), 'string', String(value.join(''))));
//        getAllSubsets(chars).map(value => makeChar('char text ' + value.join(''), 'text', String(value.join(''))));
//
//        getAllSubsets(subChars).map( arr => {
//            makeGroup('group string ' + arr.join(''), 'string', {regexString: arr.join('')});
//        });
//        getAllSubsets(subChars).map( arr => {
//            makeGroup('group text ' + arr.join(''), 'text', {regexString: arr.join('')});
//        });
    }
})(this.TestUtils = {});

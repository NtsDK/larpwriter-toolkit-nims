/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

'use strict';

((exports) => {
    const state = {};

    const root = '.investigation-board-tab ';

    exports.init = () => {
        listen(queryEl(`${root}.group-add-button`), 'click', addGroup);
        listen(queryEl(`${root}.group-switch-button`), 'click', switchGroup);
        listen(queryEl(`${root}.group-save-notes-button`), 'click', setGroupNotes);

        listen(queryEl(`${root}.create-entity-button`), 'click', createResource);
        listen(queryEl(`${root}.rename-entity-button`), 'click', renameResource);

        listen(queryEl(`${root}.save-edge-button`), 'click', updateEdge);

        listen(queryEl(`${root}.cancel-node-adding-button`), 'click', cancel('.board-add-node-popup'));
        listen(queryEl(`${root}.cancel-resource-editing-button`), 'click', cancel('.board-edit-resource-popup'));
        listen(queryEl(`${root}.cancel-group-editing-button`), 'click', cancel('.board-edit-group-popup'));
        listen(queryEl(`${root}.cancel-add-edge-button`), 'click', cancel('.board-add-edge-popup'));

        state.nodesDataset = new vis.DataSet();
        state.edgesDataset = new vis.DataSet();

        const data = {
            nodes: state.nodesDataset,
            edges: state.edgesDataset
        };

        const container = queryEl(`${root}.schema-container`);
        state.network = new vis.Network(container, data, Constants.investigationBoardOpts);
        state.network.on('selectEdge', showEdgeLabelEditor);
        state.network.on('deselectEdge', hideEdgeLabelEditor);

        exports.content = queryEl(root);
    };

    exports.refresh = (softRefresh) => {
        PermissionInformer.getEntityNamesArray('group', false, Utils.processError((groupNames) => {
            DBMS.getInvestigationBoardData((err, ibData) => {
                const allGroupNames = groupNames.map(R.prop('value'));
                const ibGroupNames = R.keys(ibData.groups);
                const freeGroupNames = R.difference(allGroupNames, ibGroupNames);

                clearEl(queryEl(`${root}.group-add-select`));
                $(`${root}.group-add-select`).select2(arr2Select2(freeGroupNames));

                clearEl(queryEl(`${root}.group-switch-select`));
                $(`${root}.group-switch-select`).select2(arr2Select2(freeGroupNames));

                if (!softRefresh) {
                    redrawBoard(ibData);
                }
            });
        }));
    };

    function addNode(node, callback) {
        showPopup('.board-add-node-popup', true);
        state.modifyArgs = {
            newNode: node,
            callback
        };
    }

    function addGroup() {
        const name = queryEl(`${root}.group-add-select`).value.trim();
        DBMS.addBoardGroup(name, (err) => {
            if (err) { Utils.handleError(err); return; }
            setNode(name, 'groups');
        });
    }

    function createResource() {
        const input = queryEl(`${root}.create-entity-input`);
        const name = input.value.trim();
        DBMS.createResource(name, (err) => {
            if (err) { Utils.handleError(err); return; }
            input.value = '';
            setNode(name, 'resources');
        });
    }

    function setNode(nodeName, group) {
        const node = state.modifyArgs.newNode;
        if (group === 'groups') {
            node.originalLabel = nodeName;
            node.originalNotes = '';
            node.label = makeDisplayLabel(node.originalLabel, node.originalNotes);
        } else {
            node.label = nodeName;
        }
        node.id = _makeRelNodeId(nodeName, group);
        node.group = group;
        showPopup('.board-add-node-popup', false);
        exports.refresh(true);
        state.modifyArgs.callback(node);
    }

    function editNodeFun(node, callback) {
        state.modifyArgs = {
            editNode: node,
            callback
        };

        if (node.group === 'groups') {
            editGroup();
        } else {
            showPopup('.board-edit-resource-popup', true);
        }
    }

    function editGroup() {
        showPopup('.board-edit-group-popup', true);
        queryEl(`${root}.group-notes-editor`).value = state.modifyArgs.editNode.originalNotes;
    }

    function switchGroup() {
        const node = state.modifyArgs.editNode;
        const fromName = node.originalLabel;
        const toName = queryEl(`${root}.group-switch-select`).value.trim();
        const { callback } = state.modifyArgs;

        DBMS.switchGroups(fromName, toName, (err) => {
            if (err) { Utils.handleError(err); return; }
            node.originalLabel = toName;
            node.label = makeDisplayLabel(node.originalLabel, node.originalNotes);
            showPopup('.board-edit-group-popup', false);
            callback(node);
            exports.refresh(true);
        });
    }

    function setGroupNotes() {
        const node = state.modifyArgs.editNode;
        const notes = queryEl(`${root}.group-notes-editor`).value.trim();
        const { callback } = state.modifyArgs;

        DBMS.setGroupNotes(node.originalLabel, notes, (err) => {
            if (err) { Utils.handleError(err); return; }
            node.originalNotes = notes;
            node.label = makeDisplayLabel(node.originalLabel, node.originalNotes);
            showPopup('.board-edit-group-popup', false);
            callback(node);
            exports.refresh(true);
        });
    }

    function renameResource() {
        const node = state.modifyArgs.editNode;
        const fromName = node.label;
        const toName = queryEl(`${root}.rename-entity-input`).value.trim();
        const { callback } = state.modifyArgs;

        DBMS.renameResource(fromName, toName, (err) => {
            if (err) { Utils.handleError(err); return; }

            node.label = toName;
            showPopup('.board-edit-resource-popup', false);
            callback(node);
        });
    }

    function deleteNode(data, callback) {
        const node = state.nodesDataset.get(data.nodes[0]);
        const funcName = node.group === 'groups' ? 'removeBoardGroup' : 'removeResource';
        const msg = node.group === 'groups' ? getL10n('investigation-board-confirm-group-node-removing') :
            getL10n('investigation-board-confirm-resource-node-removing');

        const label = node.group === 'groups' ? node.originalLabel : node.label;
        Utils.confirm(strFormat(msg, [label]), () => {
            DBMS[funcName](label, (err) => {
                if (err) { Utils.handleError(err); callback(); return; }
                exports.refresh(true);
                callback(data);
            });
        }, callback);
    }

    function prepareStr(str) {
        return str.split('\n').map(R.splitEvery(20)).map(R.join('\n')).join('\n');
    }

    function makeDisplayLabel(label, notes) {
        return prepareStr(label) + (notes.trim() === '' ? '' : (`\n\n${prepareStr(notes)}`));
    }

    function _makeRelNodeId(name, type) {
        return (type === 'groups' ? 'group-' : 'resource-') + name;
    }

    function redrawBoard(ibData) {
        let nodes = [];
        function makeResourceNode(name) {
            return {
                label: name,
                id: _makeRelNodeId(name, 'resources')
            };
        }
        function makeGroupNode(node) {
            return {
                originalLabel: node.name,
                originalNotes: node.notes,
                label: makeDisplayLabel(node.name, node.notes),
                id: _makeRelNodeId(node.name, 'groups')
            };
        }

        nodes = nodes.concat(R.values(ibData.groups).map(makeGroupNode).map(R.merge({ group: 'groups' })));
        nodes = nodes.concat(R.keys(ibData.resources).map(makeResourceNode).map(R.merge({ group: 'resources' })));

        state.nodesDataset.clear();
        state.nodesDataset.add(nodes);

        const edges = R.flatten(R.keys(ibData.relations).map(rel1 => R.keys(ibData.relations[rel1]).map(rel2 => ({
            from: rel1,
            to: rel2,
            label: ibData.relations[rel1][rel2],
            //                id: rel1 + '-' + rel2
        }))));

        state.edgesDataset.clear();
        state.edgesDataset.add(edges);

        let opts = CommonUtils.clone(Constants.investigationBoardOpts);
        opts = R.merge(opts, {
            locale: L10n.getLang(),
            locales: Constants.visLocales,
            manipulation: {
                addNode,
                deleteNode,
                editNode: editNodeFun,
                addEdge: createEdge,
                editEdge: false,
                deleteEdge,
            },
            //        configure: true
        });

        state.network.setOptions(opts);
    }

    function showEdgeLabelEditor(params) {
        if (params.edges.length !== 0 && params.nodes.length === 0) {
            const edge = state.edgesDataset.get(params.edges[0]);
            state.modifyArgs = {
                edge,
                callback(edge2) {
                    if (edge2) {
                        state.edgesDataset.update(edge2);
                    }
                },
                editEdge: true
            };
            queryEl(`${root}.add-edge-label-input`).value = edge.label;
            showPopup('.board-add-edge-popup', true);
        }
    }
    function hideEdgeLabelEditor(params) {
        showPopup('.board-add-edge-popup', false);
    }

    function createEdge(data, callback) {
        const fromNode = state.nodesDataset.get(data.from);
        const toNode = state.nodesDataset.get(data.to);

        DBMS.addEdge(fromNode.id, toNode.id, (err) => {
            if (err) { callback(); Utils.handleError(err); return; }

            const edge = {
                from: fromNode.id,
                to: toNode.id,
                label: '',
            };
            callback(edge);

            const items = state.edgesDataset.get({
                filter(item) {
                    return item.from === fromNode.id && item.to === toNode.id;
                }
            });

            showEdgeLabelEditor({ edges: [items[0].id], nodes: [] });
        });
    }

    function updateEdge() {
        const input = queryEl(`${root}.add-edge-label-input`);
        const label = input.value.trim();
        const { edge } = state.modifyArgs;
        DBMS.setEdgeLabel(edge.from, edge.to, label, (err) => {
            if (err) { Utils.handleError(err); return; }

            edge.label = label;
            showPopup('.board-add-edge-popup', false);
            input.value = '';
            state.modifyArgs.callback(edge);
        });
    }

    function deleteEdge(data, callback) {
        const edge = state.edgesDataset.get(data.edges[0]);
        DBMS.removeEdge(edge.from, edge.to, (err) => {
            if (err) { Utils.handleError(err); callback(); return; }
            callback(data);
        });
    }

    function cancel(selector) {
        return () => {
            showPopup(selector, false);
            state.modifyArgs.callback();
        };
    }

    function showPopup(selector, show) {
        hideEl(queryEl(root + selector), !show);
    }
})(this.InvestigationBoard = {});

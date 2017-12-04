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

"use strict";

(function(exports){

    var state = {};

    const root = '.investigation-board-tab ';

    exports.init = function () {

        listen(queryEl(root + ".group-add-button"), "click", addGroup);
        listen(queryEl(root + ".group-switch-button"), "click", switchGroup);
        listen(queryEl(root + ".group-save-notes-button"), "click", setGroupNotes);

        listen(queryEl(root + ".create-entity-button"), "click", createResource);
        listen(queryEl(root + ".rename-entity-button"), "click", renameResource);

        listen(queryEl(root + ".save-edge-button"), "click", updateEdge);

        listen(queryEl(root + ".cancel-node-adding-button"), "click", cancel('.board-add-node-popup'));
        listen(queryEl(root + ".cancel-resource-editing-button"), "click", cancel('.board-edit-resource-popup'));
        listen(queryEl(root + ".cancel-group-editing-button"), "click", cancel('.board-edit-group-popup'));
        listen(queryEl(root + ".cancel-add-edge-button"), "click", cancel('.board-add-edge-popup'));

        state.nodesDataset = new vis.DataSet();
        state.edgesDataset = new vis.DataSet();

        var data = {
            nodes : state.nodesDataset,
            edges : state.edgesDataset
        };

        var container = queryEl(root + '.schema-container');
        state.network = new vis.Network(container, data, Constants.investigationBoardOpts);
        state.network.on("selectEdge", showEdgeLabelEditor);
        state.network.on("deselectEdge", hideEdgeLabelEditor);

        exports.content = queryEl(root);
    };

    exports.refresh = function (softRefresh) {
        PermissionInformer.getEntityNamesArray('group', false, Utils.processError(function(groupNames){
            DBMS.getInvestigationBoardData(function(err, ibData){
                var allGroupNames = groupNames.map(R.prop('value'));
                var ibGroupNames = R.keys(ibData.groups);
                var freeGroupNames = R.difference(allGroupNames,ibGroupNames);

                clearEl(queryEl(root + ".group-add-select"));
                $(root + ".group-add-select").select2(arr2Select2(freeGroupNames));

                clearEl(queryEl(root + ".group-switch-select"));
                $(root + ".group-switch-select").select2(arr2Select2(freeGroupNames));

                if(!softRefresh){
                    redrawBoard(ibData);
                }
            });
        }));
    };

    var addNode = function(node, callback){
        showPopup('.board-add-node-popup', true);
        state.modifyArgs = {
            newNode: node,
            callback: callback
        };
    };

    var addGroup = function () {
        var name = queryEl(root + ".group-add-select").value.trim();
        DBMS.addBoardGroup(name, function(err){
            if(err) {Utils.handleError(err); return;}
            setNode(name, 'groups');
        });
    };

    var createResource = function () {
        var input = queryEl(root + ".create-entity-input");
        var name = input.value.trim();
        DBMS.createResource(name, function(err){
            if(err) {Utils.handleError(err); return;}
            input.value = '';
            setNode(name, 'resources');
        });
    };

    var setNode = function(nodeName, group){
        var node = state.modifyArgs.newNode;
        if(group === 'groups'){
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
    };

    var editNodeFun = function(node, callback){
        state.modifyArgs = {
            editNode: node,
            callback: callback
        };

        if(node.group === 'groups'){
            editGroup();
        } else {
            showPopup('.board-edit-resource-popup', true);
        }
    };

    var editGroup = function () {
        showPopup('.board-edit-group-popup', true);
        queryEl(root + ".group-notes-editor").value = state.modifyArgs.editNode.originalNotes;
    };

    var switchGroup = function () {
        var node = state.modifyArgs.editNode;
        var fromName = node.originalLabel;
        var toName = queryEl(root + ".group-switch-select").value.trim();
        var callback = state.modifyArgs.callback;

        DBMS.switchGroups(fromName, toName, function(err){
            if(err) {Utils.handleError(err); return;}
            node.originalLabel = toName;
            node.label = makeDisplayLabel(node.originalLabel, node.originalNotes);
            showPopup('.board-edit-group-popup', false);
            callback(node);
            exports.refresh(true);
        });
    };

    var setGroupNotes = function () {
        var node = state.modifyArgs.editNode;
        var notes = queryEl(root + ".group-notes-editor").value.trim();
        var callback = state.modifyArgs.callback;

        DBMS.setGroupNotes(node.originalLabel, notes, function(err){
            if(err) {Utils.handleError(err); return;}
            node.originalNotes = notes;
            node.label = makeDisplayLabel(node.originalLabel, node.originalNotes);
            showPopup('.board-edit-group-popup', false);
            callback(node);
            exports.refresh(true);
        });
    };

    var renameResource = function () {
        var node = state.modifyArgs.editNode;
        var fromName = node.label;
        var toName = queryEl(root + ".rename-entity-input").value.trim();
        var callback = state.modifyArgs.callback;

        DBMS.renameResource(fromName, toName, function(err){
            if(err) {Utils.handleError(err); return;}

            node.label = toName;
            showPopup('.board-edit-resource-popup', false);
            callback(node);
        });
    };

    var deleteNode = function(data, callback){
        var node = state.nodesDataset.get(data.nodes[0]);
        var funcName = node.group === 'groups' ? 'removeBoardGroup' : 'removeResource';
        var msg = node.group === 'groups' ? getL10n('investigation-board-confirm-group-node-removing') :
            getL10n('investigation-board-confirm-resource-node-removing');

        var label = node.group === 'groups' ? node.originalLabel : node.label;
        Utils.confirm(strFormat(msg, [label]), () => {
            DBMS[funcName](label, function(err){
                if(err) {Utils.handleError(err); callback(); return;}
                exports.refresh(true);
                callback(data);
            });
        }, callback);
    };

    function prepareStr(str){
        return str.split('\n').map(R.splitEvery(20)).map(R.join('\n')).join('\n');
    }

    var makeDisplayLabel = function(label, notes){
        return prepareStr(label) + (notes.trim() === '' ? '' : ("\n\n" + prepareStr(notes)));
    };

    var _makeRelNodeId = function(name, type){
        return (type === 'groups' ? 'group-' : 'resource-') + name;
    };

    var redrawBoard = function (ibData) {

        var nodes = [];
        function makeResourceNode(name){
            return {
                label: name,
                id: _makeRelNodeId(name, 'resources')
            };
        };
        function makeGroupNode(node){
            return {
                originalLabel: node.name,
                originalNotes: node.notes,
                label: makeDisplayLabel(node.name, node.notes),
                id: _makeRelNodeId(node.name, 'groups')
            };
        };

        nodes = nodes.concat(R.values(ibData.groups).map(makeGroupNode).map(R.merge({group: 'groups'})));
        nodes = nodes.concat(R.keys(ibData.resources).map(makeResourceNode).map(R.merge({group: 'resources'})));

        state.nodesDataset.clear();
        state.nodesDataset.add(nodes);

        var edges = [];

        var edges = R.flatten(R.keys(ibData.relations).map(function(rel1){
            return R.keys(ibData.relations[rel1]).map(function(rel2){
                return {
                    from: rel1,
                    to: rel2,
                    label: ibData.relations[rel1][rel2],
    //                id: rel1 + '-' + rel2
                }
            });
        }));

        state.edgesDataset.clear();
        state.edgesDataset.add(edges);

        var opts = CommonUtils.clone(Constants.investigationBoardOpts);
        opts = R.merge(opts,{
            locale : L10n.getLang(),
            locales : Constants.visLocales,
            manipulation: {
                addNode : addNode,
                deleteNode : deleteNode,
                editNode: editNodeFun,
                addEdge: createEdge,
                editEdge: false,
                deleteEdge: deleteEdge,
            },
    //        configure: true
        });

        state.network.setOptions(opts);
    };

    var showEdgeLabelEditor = function(params){
        if(params.edges.length !== 0 && params.nodes.length === 0){
            var edge = state.edgesDataset.get(params.edges[0]);
            state.modifyArgs = {
                edge : edge,
                callback : function(edge){
                    if(edge){
                        state.edgesDataset.update(edge);
                    }
                },
                editEdge: true
            };
            queryEl(root + '.add-edge-label-input').value = edge.label;
            showPopup('.board-add-edge-popup', true);
        }
    };
    var hideEdgeLabelEditor = function(params){
        showPopup('.board-add-edge-popup', false);
    };

    var createEdge = function(data, callback){
        var fromNode = state.nodesDataset.get(data.from);
        var toNode = state.nodesDataset.get(data.to);

        DBMS.addEdge(fromNode.id, toNode.id, function(err) {
            if (err) { callback(); Utils.handleError(err); return; }

            var edge = {
                from: fromNode.id,
                to: toNode.id,
                label: '',
            };
            callback(edge);

            var items = state.edgesDataset.get({
                filter: function (item) {
                    return item.from === fromNode.id && item.to === toNode.id;
                }
            });

            showEdgeLabelEditor({edges: [items[0].id], nodes:[]});
        });
    };

    var updateEdge = function(){
        var input = queryEl(root + '.add-edge-label-input');
        var label = input.value.trim();
        var edge = state.modifyArgs.edge;
        DBMS.setEdgeLabel(edge.from, edge.to, label, function(err) {
            if (err) { Utils.handleError(err); return; }

            edge.label = label;
            showPopup('.board-add-edge-popup', false);
            input.value = '';
            state.modifyArgs.callback(edge);
        });
    };

    var deleteEdge = function(data, callback){
        var edge = state.edgesDataset.get(data.edges[0]);
        DBMS.removeEdge(edge.from, edge.to, function(err) {
            if (err) { Utils.handleError(err); callback(); return; }
            callback(data);
        });
    };

    var cancel = function(selector){
        return function(){
            showPopup(selector, false);
            state.modifyArgs.callback();
        };
    };

    var showPopup = R.curry(function(selector, show){
        setClassByCondition(queryEl(root + selector), 'hidden', !show);
    });

})(this['InvestigationBoard']={});

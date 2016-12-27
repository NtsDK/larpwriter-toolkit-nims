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

var InvestigationBoard = {};

InvestigationBoard.init = function () {
    
    listen(queryEl(".investigation-board-tab .group-add-button"), "click", InvestigationBoard.addGroup);
    listen(queryEl(".investigation-board-tab .group-switch-button"), "click", InvestigationBoard.switchGroup);
    listen(queryEl(".investigation-board-tab .group-save-notes-button"), "click", InvestigationBoard.setGroupNotes);
    
    listen(queryEl(".investigation-board-tab .create-entity-button"), "click", InvestigationBoard.createResource);
    listen(queryEl(".investigation-board-tab .rename-entity-button"), "click", InvestigationBoard.renameResource);
    
    listen(queryEl(".investigation-board-tab .save-edge-button"), "click", InvestigationBoard.saveEdge);
    
    listen(queryEl(".investigation-board-tab .cancel-node-adding-button"), "click", InvestigationBoard.cancel('.board-add-node-popup')); 
    listen(queryEl(".investigation-board-tab .cancel-resource-editing-button"), "click", InvestigationBoard.cancel('.board-edit-resource-popup'));
    listen(queryEl(".investigation-board-tab .cancel-group-editing-button"), "click", InvestigationBoard.cancel('.board-edit-group-popup'));
    listen(queryEl(".investigation-board-tab .cancel-add-edge-button"), "click", InvestigationBoard.cancel('.board-add-edge-popup'));
    
    InvestigationBoard.nodesDataset = new vis.DataSet();
    InvestigationBoard.edgesDataset = new vis.DataSet();
    
    var data = {
        nodes : InvestigationBoard.nodesDataset,
        edges : InvestigationBoard.edgesDataset
    };
    
    var container = queryEl('.investigation-board-tab .schema-container');
    InvestigationBoard.network = new vis.Network(container, data, Constants.investigationBoardOpts);
    InvestigationBoard.network.on("selectEdge", InvestigationBoard.showEdgeLabelEditor);
    InvestigationBoard.network.on("deselectEdge", InvestigationBoard.hideEdgeLabelEditor);
    
    InvestigationBoard.content = queryEl(".investigation-board-tab");
};

InvestigationBoard.refresh = function (softRefresh) {
    PermissionInformer.getEntityNamesArray('group', false, Utils.processError(function(groupNames){
        DBMS.getInvestigationBoardData(function(err, ibData){
            var allGroupNames = groupNames.map(R.prop('value'));
            var ibGroupNames = R.keys(ibData.groups);
            var freeGroupNames = R.difference(allGroupNames,ibGroupNames);
            
            clearEl(queryEl(".investigation-board-tab .group-add-select"));
            $(".investigation-board-tab .group-add-select").select2(arr2Select2(freeGroupNames));
            
            clearEl(queryEl(".investigation-board-tab .group-switch-select"));
            $(".investigation-board-tab .group-switch-select").select2(arr2Select2(freeGroupNames));
            
            if(!softRefresh){
                InvestigationBoard.redrawBoard(ibData);
            }
        });
    }));
};

InvestigationBoard.addNode = function(node, callback){
    InvestigationBoard.showPopup('.board-add-node-popup', true);
    InvestigationBoard.modifyArgs = {
        newNode: node,
        callback: callback
    };
};

InvestigationBoard.addGroup = function () {
    var name = queryEl(".investigation-board-tab .group-add-select").value.trim();
    DBMS.addBoardGroup(name, function(err){
        if(err) {Utils.handleError(err); return;}
        InvestigationBoard.setNode(name, 'groups');
    });
};

InvestigationBoard.createResource = function () {
    var name = queryEl(".investigation-board-tab .create-entity-input").value.trim();
    DBMS.createResource(name, function(err){
        if(err) {Utils.handleError(err); return;}
        InvestigationBoard.setNode(name, 'resources');
    });
};

InvestigationBoard.setNode = function(nodeName, group){
    var node = InvestigationBoard.modifyArgs.newNode;
    if(group === 'groups'){
        node.originalLabel = nodeName;
        node.originalNotes = '';
        node.label = InvestigationBoard.makeDisplayLabel(node.originalLabel, node.originalNotes);
    } else {
        node.label = nodeName;
    }
    node.id = InvestigationBoard._makeRelNodeId(nodeName, group);
    node.group = group;
    InvestigationBoard.showPopup('.board-add-node-popup', false);
    InvestigationBoard.refresh(true);
    InvestigationBoard.modifyArgs.callback(node);
};

InvestigationBoard.editNodeFun = function(node, callback){
    InvestigationBoard.modifyArgs = {
        editNode: node,
        callback: callback
    };
    
    if(node.group === 'groups'){
        InvestigationBoard.editGroup();
    } else {
        InvestigationBoard.editResource();
    }
};

InvestigationBoard.editGroup = function () {
    InvestigationBoard.showPopup('.board-edit-group-popup', true);
    queryEl(".investigation-board-tab .group-notes-editor").value = InvestigationBoard.modifyArgs.editNode.originalNotes;
};

InvestigationBoard.switchGroup = function () {
    var node = InvestigationBoard.modifyArgs.editNode;
    var fromName = node.originalLabel;
    var toName = queryEl(".investigation-board-tab .group-switch-select").value.trim();
    var callback = InvestigationBoard.modifyArgs.callback;
    
    DBMS.switchGroups(fromName, toName, function(err){
        if(err) {Utils.handleError(err); return;}
        node.originalLabel = toName;
        node.label = InvestigationBoard.makeDisplayLabel(node.originalLabel, node.originalNotes);
        InvestigationBoard.showPopup('.board-edit-group-popup', false);
        callback(node);
        InvestigationBoard.refresh(true);
    });
};

InvestigationBoard.setGroupNotes = function () {
    var node = InvestigationBoard.modifyArgs.editNode;
    var notes = queryEl(".investigation-board-tab .group-notes-editor").value.trim();
    var callback = InvestigationBoard.modifyArgs.callback;
    
    DBMS.setGroupNotes(node.originalLabel, notes, function(err){
        if(err) {Utils.handleError(err); return;}
        node.originalNotes = notes;
        node.label = InvestigationBoard.makeDisplayLabel(node.originalLabel, node.originalNotes);
        InvestigationBoard.showPopup('.board-edit-group-popup', false);
        callback(node);
        InvestigationBoard.refresh(true);
    });
};

InvestigationBoard.editResource = function () {
    InvestigationBoard.showPopup('.board-edit-resource-popup', true);
};

InvestigationBoard.renameResource = function () {
    var node = InvestigationBoard.modifyArgs.editNode;
    var fromName = node.label;
    var toName = queryEl(".investigation-board-tab .rename-entity-input").value.trim();
    var callback = InvestigationBoard.modifyArgs.callback;
    
    DBMS.renameResource(fromName, toName, function(err){
        if(err) {Utils.handleError(err); return;}
        
        node.label = toName;
        InvestigationBoard.showPopup('.board-edit-resource-popup', false);
        callback(node);
    });
};

InvestigationBoard.deleteNode = function(data, callback){
    var node = InvestigationBoard.nodesDataset.get(data.nodes[0]);
    var funcName = node.group === 'groups' ? 'removeBoardGroup' : 'removeResource';
    var msg = node.group === 'groups' ? getL10n('investigation-board-confirm-group-node-removing') :
        getL10n('investigation-board-confirm-resource-node-removing');
    
    var label = node.group === 'groups' ? node.originalLabel : node.label;
    if (Utils.confirm(strFormat(msg, [label]))) {
        DBMS[funcName](label, function(err){
            if(err) {Utils.handleError(err); callback(); return;}
            InvestigationBoard.refresh(true);
            callback(data); 
        });
    } else {
        callback();
    }
};

InvestigationBoard.makeDisplayLabel = function(label, notes){
    function prepareStr(str){
        return str.split('\n').map(R.splitEvery(20)).map(R.join('\n')).join('\n');
    }
    return prepareStr(label) + (notes.trim() === '' ? '' : ("\n\n" + prepareStr(notes)));
};

InvestigationBoard._makeRelNodeId = function(name, type){
    return (type === 'groups' ? 'group-' : 'resource-') + name;
};

InvestigationBoard.redrawBoard = function (ibData) {
    
    var nodes = [];
    function makeResourceNode(name){
        return {
            label: name,
            id: InvestigationBoard._makeRelNodeId(name, 'resources')
        };
    };
    function makeGroupNode(node){
        return {
            originalLabel: node.name,
            originalNotes: node.notes,
            label: InvestigationBoard.makeDisplayLabel(node.name, node.notes),
            id: InvestigationBoard._makeRelNodeId(node.name, 'groups')
        };
    };
    
    nodes = nodes.concat(R.values(ibData.groups).map(makeGroupNode).map(R.merge({group: 'groups'})));
    nodes = nodes.concat(R.keys(ibData.resources).map(makeResourceNode).map(R.merge({group: 'resources'})));
            
    InvestigationBoard.nodesDataset.clear();
    InvestigationBoard.nodesDataset.add(nodes);
    
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
    
    InvestigationBoard.edgesDataset.clear();
    InvestigationBoard.edgesDataset.add(edges);
    
    var opts = CommonUtils.clone(Constants.investigationBoardOpts);
    opts = R.merge(opts,{
        locale : L10n.getLang(),
        locales : Constants.visLocales,
        manipulation: {
            addNode : InvestigationBoard.addNode,
            deleteNode : InvestigationBoard.deleteNode,
            editNode: InvestigationBoard.editNodeFun,
            addEdge: InvestigationBoard.addEdge,
            editEdge: false,
            deleteEdge: InvestigationBoard.deleteEdge,
        },
//        configure: true
    });
    
    InvestigationBoard.network.setOptions(opts);
};

InvestigationBoard.showEdgeLabelEditor = function(params){
    if(params.edges.length !== 0 && params.nodes.length === 0){
        var edge = InvestigationBoard.edgesDataset.get(params.edges[0]);
        InvestigationBoard.modifyArgs = {
            edge : edge,
            callback : function(edge){
                if(edge){
                    InvestigationBoard.edgesDataset.update(edge);
                }
            },
            editEdge: true
        };
        queryEl('.investigation-board-tab .add-edge-label-input').value = edge.label;
        InvestigationBoard.showPopup('.board-add-edge-popup', true);
    } 
};
InvestigationBoard.hideEdgeLabelEditor = function(params){
    InvestigationBoard.showPopup('.board-add-edge-popup', false);
};

InvestigationBoard.addEdge = function(data, callback){
    var fromNode = InvestigationBoard.nodesDataset.get(data.from);
    if(fromNode.group === 'resources'){
        Utils.alert(getL10n('investigation-board-resource-node-cant-be-first'));
        callback();
        return;
    }
    
//    if(InvestigationBoard.edgesDataset.get(data.from + '-' + data.to)){
//        Utils.alert(getL10n('investigation-board-such-relation-already-exists'));
//        callback();
//        return;
//    }
    
    InvestigationBoard.modifyArgs = {
        fromNode : InvestigationBoard.nodesDataset.get(data.from),
        toNode : InvestigationBoard.nodesDataset.get(data.to),
        callback : callback
    };
    InvestigationBoard.showPopup('.board-add-edge-popup', true);
};

InvestigationBoard.saveEdge = function(){
    if(InvestigationBoard.modifyArgs.editEdge){
        InvestigationBoard.updateEdge();
    } else {
        InvestigationBoard.createEdge();
    }
};

InvestigationBoard.updateEdge = function(){
    var label = queryEl('.investigation-board-tab .add-edge-label-input').value.trim();
    var edge = InvestigationBoard.modifyArgs.edge;
    DBMS.setEdgeLabel(edge.from, edge.to, label, function(err) {
        if (err) { Utils.handleError(err); return; }
        
        edge.label = label;
        InvestigationBoard.showPopup('.board-add-edge-popup', false);
        InvestigationBoard.modifyArgs.callback(edge);
    });
};

InvestigationBoard.createEdge = function(){
    var fromNode = InvestigationBoard.modifyArgs.fromNode;
    var toNode = InvestigationBoard.modifyArgs.toNode;
    var label = queryEl('.investigation-board-tab .add-edge-label-input').value.trim();
    
    DBMS.addEdge(fromNode.id, toNode.id, label, function(err) {
        if (err) { Utils.handleError(err); return; }
        
        InvestigationBoard.showPopup('.board-add-edge-popup', false);
        InvestigationBoard.modifyArgs.callback({
            from: fromNode.id,
            to: toNode.id,
            label: label,
//            id: fromNode.id + '-' + toNode.id
        });
    });
};

InvestigationBoard.deleteEdge = function(data, callback){
    var edge = InvestigationBoard.edgesDataset.get(data.edges[0]);
    DBMS.removeEdge(edge.from, edge.to, function(err) {
        if (err) { Utils.handleError(err); callback(); return; }
        callback(data);
    });
};

InvestigationBoard.cancel = function(selector){
    return function(){
        InvestigationBoard.showPopup(selector, false);
        InvestigationBoard.modifyArgs.callback();
    };
};

InvestigationBoard.showPopup = R.curry(function(selector, show){
    setClassByCondition(queryEl('.investigation-board-tab ' + selector), 'hidden', !show);
});
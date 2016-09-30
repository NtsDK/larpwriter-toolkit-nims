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
    
    listen(queryEl(".investigation-board-tab .cancel-node-adding-button"), "click", function(){
        InvestigationBoard.showPopup('.board-add-node-popup', false);
        InvestigationBoard.newCallback();
    });
    listen(queryEl(".investigation-board-tab .cancel-resource-editing-button"), "click", function(){
        InvestigationBoard.showPopup('.board-edit-resource-popup', false);
        InvestigationBoard.editCallback();
    });
    listen(queryEl(".investigation-board-tab .cancel-group-editing-button"), "click", function(){
        InvestigationBoard.showPopup('.board-edit-group-popup', false);
        InvestigationBoard.editCallback();
    });
    
    InvestigationBoard.content = queryEl(".investigation-board-tab");
};

InvestigationBoard.refresh = function (softRefresh) {
    PermissionInformer.getGroupNamesArray(true, Utils.processError(function(groupNames){
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
    InvestigationBoard.newNode = node;
    InvestigationBoard.newCallback = callback;
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
    var node = InvestigationBoard.newNode;
    if(group === 'groups'){
        node.originalLabel = nodeName;
        node.originalNotes = '';
        node.label = InvestigationBoard.makeDisplayLabel(node.originalLabel, node.originalNotes);
    } else {
        node.label = nodeName;
    }
    node.group = group;
    InvestigationBoard.showPopup('.board-add-node-popup', false);
    InvestigationBoard.refresh(true);
    InvestigationBoard.newCallback(node);
};

InvestigationBoard.editNodeFun = function(node, callback){
    InvestigationBoard.editNode = node;
    InvestigationBoard.editCallback = callback;
    
    if(node.group === 'groups'){
        InvestigationBoard.editGroup();
    } else {
        InvestigationBoard.editResource();
    }
};

InvestigationBoard.editGroup = function () {
    InvestigationBoard.showPopup('.board-edit-group-popup', true);
    queryEl(".investigation-board-tab .group-notes-editor").value = InvestigationBoard.editNode.originalNotes;
};

InvestigationBoard.switchGroup = function () {
    var node = InvestigationBoard.editNode;
    var fromName = node.originalLabel;
    var toName = queryEl(".investigation-board-tab .group-switch-select").value.trim();
    
    DBMS.switchGroups(fromName, toName, function(err){
        if(err) {Utils.handleError(err); return;}
        node.originalLabel = toName;
        node.label = InvestigationBoard.makeDisplayLabel(node.originalLabel, node.originalNotes);
        InvestigationBoard.showPopup('.board-edit-group-popup', false);
        InvestigationBoard.editCallback(node);
        InvestigationBoard.refresh(true);
    });
};

InvestigationBoard.setGroupNotes = function () {
    var node = InvestigationBoard.editNode;
    var notes = queryEl(".investigation-board-tab .group-notes-editor").value.trim();
    
    DBMS.setGroupNotes(node.originalLabel, notes, function(err){
        if(err) {Utils.handleError(err); return;}
        node.originalNotes = notes;
        node.label = InvestigationBoard.makeDisplayLabel(node.originalLabel, node.originalNotes);
        InvestigationBoard.showPopup('.board-edit-group-popup', false);
        InvestigationBoard.editCallback(node);
        InvestigationBoard.refresh(true);
    });
};

InvestigationBoard.editResource = function () {
    InvestigationBoard.showPopup('.board-edit-resource-popup', true);
};

InvestigationBoard.renameResource = function () {
    var node = InvestigationBoard.editNode;
    var fromName = node.label;
    var toName = queryEl(".investigation-board-tab .rename-entity-input").value.trim();
    
    DBMS.renameResource(fromName, toName, function(err){
        if(err) {Utils.handleError(err); return;}
        
        node.label = toName;
        InvestigationBoard.showPopup('.board-edit-resource-popup', false);
        InvestigationBoard.editCallback(node);
    });
};


InvestigationBoard.deleteNode = function(data, callback){
    var node = InvestigationBoard.nodesDataset.get(data.nodes[0]);
//    Utils.alert(JSON.stringify(node));
    var funcName = node.group === 'groups' ? 'removeBoardGroup' : 'removeResource';
    var msg = node.group === 'groups' ? 'Вы уверены, что хотите удалить группу со схемы...?' : 'Про ресурс';
    var label = node.group === 'groups' ? node.originalLabel : node.label;
    if (Utils.confirm(msg)) {
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

InvestigationBoard.redrawBoard = function (ibData) {
    var container = queryEl('.investigation-board-tab .schema-container');
    
    if(InvestigationBoard.network){
        InvestigationBoard.network.destroy();
    }
//    graph.edges = graph.edges.map(function(edge){
//        return R.merge(edge, {
//            'physics' : false,
//        });
//    });
    
    var nodes = [];
//    var makeNode = R.compose(R.zipObj(['id', 'label']),R.repeat(R.__, 2));
    var makeResourceNode = R.compose(R.zipObj(['label']),R.repeat(R.__, 1));
    function makeGroupNode(node){
        return {
            originalLabel: node.name,
            originalNotes: node.notes,
            label: InvestigationBoard.makeDisplayLabel(node.name, node.notes)
        };
    };
    
    nodes = nodes.concat(R.values(ibData.groups).map(makeGroupNode).map(R.merge({group: 'groups'})));
    nodes = nodes.concat(R.keys(ibData.resources).map(makeResourceNode).map(R.merge({group: 'resources'})));
            
    InvestigationBoard.nodesDataset = new vis.DataSet(nodes);
    InvestigationBoard.edgesDataset = new vis.DataSet([]);
    
    var data = {
        nodes : InvestigationBoard.nodesDataset,
        edges : InvestigationBoard.edgesDataset
    };
    
    var opts = CommonUtils.clone(Constants.investigationBoardOpts);
    opts = R.merge(opts,{
        locale : L10n.getLang(),
        locales : Constants.visLocales,
        manipulation: {
            addNode : InvestigationBoard.addNode,
            deleteNode : InvestigationBoard.deleteNode,
            editNode: InvestigationBoard.editNodeFun,
        }
    });
    
    InvestigationBoard.network = new vis.Network(container, data, opts);
};

InvestigationBoard.showPopup = R.curry(function(selector, show){
    setClassByCondition(queryEl('.investigation-board-tab ' + selector), 'hidden', !show);
});
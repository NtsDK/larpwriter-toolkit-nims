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
//    listen(queryEl(".investigation-board-tab .group-remove-button"), "click", InvestigationBoard.removeGroup);
    
    listen(queryEl(".investigation-board-tab .create-entity-button"), "click", InvestigationBoard.createResource);
    listen(queryEl(".investigation-board-tab .rename-entity-button"), "click", InvestigationBoard.renameResource);
//    listen(queryEl(".investigation-board-tab .remove-entity-button"), "click", InvestigationBoard.removeResource);
    
    listen(queryEl(".investigation-board-tab .cancel-node-adding-button"), "click", function(){
        addClass(queryEl('.investigation-board-tab .board-add-node-popup'), 'hidden');
        InvestigationBoard.newCallback();
    });
    listen(queryEl(".investigation-board-tab .cancel-resource-editing-button"), "click", function(){
        addClass(queryEl('.investigation-board-tab .board-edit-resource-popup'), 'hidden');
        InvestigationBoard.editCallback();
    });
    listen(queryEl(".investigation-board-tab .cancel-group-editing-button"), "click", function(){
        addClass(queryEl('.investigation-board-tab .board-edit-group-popup'), 'hidden');
        InvestigationBoard.editCallback();
    });
    
    InvestigationBoard.content = queryEl(".investigation-board-tab");
};

InvestigationBoard.refresh = function () {
    PermissionInformer.getGroupNamesArray(true, Utils.processError(function(groupNames){
        DBMS.getInvestigationBoardData(function(err, ibData){
            var allGroupNames = groupNames.map(R.prop('value'));
            var ibGroupNames = R.keys(ibData.groups);
            var freeGroupNames = R.difference(allGroupNames,ibGroupNames);
            
            clearEl(queryEl(".investigation-board-tab .group-add-select"));
            $(".investigation-board-tab .group-add-select").select2(arr2Select2(freeGroupNames));

//            clearEl(queryEl(".investigation-board-tab .group-remove-select"));
//            $(".investigation-board-tab .group-remove-select").select2(arr2Select2(ibGroupNames));
            
//            var resourceNames = R.keys(ibData.resources);
            
//            clearEl(queryEl(".investigation-board-tab .rename-entity-select"));
//            $(".investigation-board-tab .rename-entity-select").select2(arr2Select2(resourceNames));

//            clearEl(queryEl(".investigation-board-tab .remove-entity-select"));
//            $(".investigation-board-tab .remove-entity-select").select2(arr2Select2(resourceNames));
            
            InvestigationBoard.redrawBoard(ibData);
        });
    }));
    
    
//    DBMS.getGroupSchemas(function(err, schemas){
//        InvestigationBoard.redrawSchema(schemas.theory);
//    });
};

InvestigationBoard.softRefresh = function () {
    PermissionInformer.getGroupNamesArray(true, Utils.processError(function(groupNames){
        DBMS.getInvestigationBoardData(function(err, ibData){
            var allGroupNames = groupNames.map(R.prop('value'));
            var ibGroupNames = R.keys(ibData.groups);
            var freeGroupNames = R.difference(allGroupNames,ibGroupNames);
            
            clearEl(queryEl(".investigation-board-tab .group-add-select"));
            $(".investigation-board-tab .group-add-select").select2(arr2Select2(freeGroupNames));
            
//            clearEl(queryEl(".investigation-board-tab .group-remove-select"));
//            $(".investigation-board-tab .group-remove-select").select2(arr2Select2(ibGroupNames));
            
            var resourceNames = R.keys(ibData.resources);
            
            clearEl(queryEl(".investigation-board-tab .rename-entity-select"));
            $(".investigation-board-tab .rename-entity-select").select2(arr2Select2(resourceNames));
            
//            clearEl(queryEl(".investigation-board-tab .remove-entity-select"));
//            $(".investigation-board-tab .remove-entity-select").select2(arr2Select2(resourceNames));
            
//            InvestigationBoard.redrawBoard(ibData);
        });
    }));
    
    
//    DBMS.getGroupSchemas(function(err, schemas){
//        InvestigationBoard.redrawSchema(schemas.theory);
//    });
};



//InvestigationBoard.removeGroup = function () {
//    var name = queryEl(".investigation-board-tab .group-remove-select").value.trim();
//    
//    if (Utils.confirm('Вы уверены, что хотите удалить группу со схемы...?')) {
//        DBMS.removeBoardGroup(name, function(err){
//            if(err) {Utils.handleError(err); return;}
//            InvestigationBoard.refresh();
//        });
//    }
//};





//InvestigationBoard.removeResource = function () {
//    var name = queryEl(".investigation-board-tab .remove-entity-select").value.trim();
//    
//    if (Utils.confirm(strFormat(getL10n("groups-are-you-sure-about-group-removing"),[name]))) {
//        DBMS.removeResource(name, function(err){
//            if(err) {Utils.handleError(err); return;}
//            InvestigationBoard.refresh();
//        });
//    }
//};

InvestigationBoard.addNode = function(node, callback){
    removeClass(queryEl('.investigation-board-tab .board-add-node-popup'), 'hidden');
    InvestigationBoard.newNode = node;
    InvestigationBoard.newCallback = callback;
};

InvestigationBoard.setNode = function(nodeName, group){
   var node = InvestigationBoard.newNode;
//   node.id = 
       node.label = nodeName;
   node.group = group;
   addClass(queryEl('.investigation-board-tab .board-add-node-popup'), 'hidden');
   InvestigationBoard.softRefresh();
   InvestigationBoard.newCallback(node);
};

InvestigationBoard.renameResource = function () {
    var node = InvestigationBoard.editNode;
    var fromName = node.label;
//    var fromName = queryEl(".investigation-board-tab .rename-entity-select").value.trim();
    var toName = queryEl(".investigation-board-tab .rename-entity-input").value.trim();
    
    DBMS.renameResource(fromName, toName, function(err){
        if(err) {Utils.handleError(err); return;}
        
        node.label = toName;
        addClass(queryEl('.investigation-board-tab .board-edit-resource-popup'), 'hidden');
        InvestigationBoard.editCallback(node);
//        InvestigationBoard.refresh();
    });
};

InvestigationBoard.addGroup = function () {
    var name = queryEl(".investigation-board-tab .group-add-select").value.trim();
    
    DBMS.addBoardGroup(name, function(err){
        if(err) {Utils.handleError(err); return;}
        InvestigationBoard.setNode(name, 'groups');
    });
};

InvestigationBoard.createResource = function () {
    "use strict";
    var name = queryEl(".investigation-board-tab .create-entity-input").value.trim();
    
    DBMS.createResource(name, function(err){
        if(err) {Utils.handleError(err); return;}
        InvestigationBoard.setNode(name, 'resources');
    });
};

InvestigationBoard.editNodeFun = function(node, callback){
//    var node = InvestigationBoard.nodesDataset.get(data.nodes[0]);
    InvestigationBoard.editNode = node;
    InvestigationBoard.editCallback = callback;
    
    if(node.group === 'groups'){
        InvestigationBoard.editGroup();
    } else {
        InvestigationBoard.editResource();
    }
};

InvestigationBoard.editGroup = function () {
    removeClass(queryEl('.investigation-board-tab .board-edit-group-popup'), 'hidden');
};

InvestigationBoard.editResource = function () {
    removeClass(queryEl('.investigation-board-tab .board-edit-resource-popup'), 'hidden');
};



InvestigationBoard.deleteNode = function(data, callback){
    var node = InvestigationBoard.nodesDataset.get(data.nodes[0]);
//    Utils.alert(JSON.stringify(node));
    var funcName = node.group === 'groups' ? 'removeBoardGroup' : 'removeResource';
    var msg = node.group === 'groups' ? 'Вы уверены, что хотите удалить группу со схемы...?' : 'Про ресурс';
    if (Utils.confirm(msg)) {
        DBMS[funcName](node.label, function(err){
            if(err) {Utils.handleError(err); callback(); return;}
            callback(data); 
        });
    } else {
        callback();
    }
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
    var makeNode = R.compose(R.zipObj(['label']),R.repeat(R.__, 1));
    
    nodes = nodes.concat(R.keys(ibData.groups).map(makeNode).map(R.merge({group: 'groups'})));
    nodes = nodes.concat(R.keys(ibData.resources).map(makeNode).map(R.merge({group: 'resources'})));
            
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
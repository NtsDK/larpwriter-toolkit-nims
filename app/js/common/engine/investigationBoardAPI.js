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

"use strict";

(function(callback){

    function investigationBoardAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners) {
        
        var resourcesPath = ['InvestigationBoard', 'resources'];
        var groupsPath = ['InvestigationBoard', 'groups'];
        var relationsPath = ['InvestigationBoard', 'relations'];
        var context = 'investigation-board';
        
        LocalDBMS.prototype.isResourceNameUsed = function(resourceName, callback) {
            "use strict";
            callback(null, this.database.InvestigationBoard.resources[resourceName] !== undefined);
        };
        
        LocalDBMS.prototype.getInvestigationBoardData = function(callback) {
            callback(null, CommonUtils.clone(this.database.InvestigationBoard));
        };
        
        LocalDBMS.prototype.addBoardGroup = function(groupName, callback) {
            if(groupName === ""){
                callback(new Errors.ValidationError(context + "-group-name-is-not-specified"));
                return;
            }
            var ibData = this.database.InvestigationBoard;
                
            if(ibData.groups[groupName]){
                callback(new Errors.ValidationError(context + "-group-already-used-on-board"));
                return;
            }
            
            ibData.groups[groupName] = {
                    name:groupName,
                    notes: ""
            };
            this.ee.trigger("nodeAdded", [groupName, 'groups']);
            if(callback) callback();
        };
        
        LocalDBMS.prototype.switchGroups = function(fromName, toName, callback) {
            var err = this._renameEntityPrecondition(fromName, toName, groupsPath, context);
            if (err) {
                callback(err);
            } else {
                var container = R.path(groupsPath, this.database);
                var data = container[fromName];
                data.name = toName;
                container[toName] = data;
                delete container[fromName];
                this.ee.trigger("nodeRenamed", [fromName, toName, 'groups']);
                if (callback) callback();
            }
        };

        LocalDBMS.prototype.setGroupNotes = function(groupName, notes, callback) {
            var container = R.path(groupsPath, this.database);
            var data = container[groupName];
            data.notes = notes;
            if (callback) callback();
        };
        
        LocalDBMS.prototype.removeBoardGroup = function(groupName, callback) {
            if(groupName === ""){
                callback(new Errors.ValidationError(context + "-group-name-is-not-specified"));
                return;
            }
            var ibData = this.database.InvestigationBoard;
            
            if(!ibData.groups[groupName]){
                callback(new Errors.ValidationError(context + "-group-is-not-used-on-board"));
                return;
            }
            
            delete ibData.groups[groupName];
            this.ee.trigger("nodeRemoved", [groupName, 'groups']);
            if(callback) callback();
        };
        
        LocalDBMS.prototype._createEntityPrecondition = function(entityName, containerPath, context){
            if(entityName === ""){
                return new Errors.ValidationError(context + "-new-name-is-not-specified");
            }
            if(R.path(containerPath, this.database)[entityName] !== undefined){
                return new Errors.ValidationError(context + "-name-already-used", [entityName])
            }
        };
        
        LocalDBMS.prototype._renameEntityPrecondition = function(fromEntityName, toEntityName, containerPath, context){
            if(toEntityName === ""){
                return new Errors.ValidationError(context + "-rename-name-is-not-specified");
            }
            if(toEntityName === fromEntityName){
                return new Errors.ValidationError(context + "-names-are-the-same");
            }
            if(R.path(containerPath, this.database)[toEntityName]){
                return new Errors.ValidationError(context + "-name-already-used", [toEntityName])
            }
        };
        
        LocalDBMS.prototype.createResource = function(resourceName, callback) {
            var err = this._createEntityPrecondition(resourceName, resourcesPath, context);
            if(err){
                callback(err);
            } else {
                R.path(resourcesPath, this.database)[resourceName] = {
                    name : resourceName
                };
                this.ee.trigger("nodeAdded", [resourceName, 'resources']);
                if (callback) callback();
            }
        };

        LocalDBMS.prototype.renameResource = function(fromName, toName, callback) {
            var err = this._renameEntityPrecondition(fromName, toName, resourcesPath, context);
            if(err){
                callback(err);
            } else {
                var container = R.path(resourcesPath, this.database);
                var data = container[fromName];
                data.name = toName;
                container[toName] = data;
                delete container[fromName];
                this.ee.trigger("nodeRenamed", [fromName, toName, 'resources']);
                if (callback) callback();
            }
        };
        
        LocalDBMS.prototype.removeResource = function(resourceName, callback) {
            delete R.path(resourcesPath, this.database)[resourceName];
            this.ee.trigger("nodeRemoved", [resourceName, 'resources']);
            if (callback) callback();
        };
        
        LocalDBMS.prototype._addEdgePrecondition = function(fromId, toId, label, context){
            if(CommonUtils.startsWith(fromId , 'resource-')){
                return new Errors.ValidationError(context + "-resource-node-cant-be-first");
            }
            if(R.path(relationsPath, this.database)[fromId][toId] !== undefined){
                return new Errors.ValidationError(context + "-such-relation-already-exists");
            }
        };
        
        LocalDBMS.prototype.addEdge = function(fromId, toId, label, callback) {
            var err = this._addEdgePrecondition(fromId, toId, label, context);
            if(err){
                callback(err);
            } else {
                R.path(relationsPath, this.database)[fromId][toId] = label;
                if (callback) callback();
            }
        };
        
        LocalDBMS.prototype._setEdgeLabelPrecondition = function(fromId, toId, label, context){
            if(CommonUtils.startsWith(fromId , 'resource-')){
                return new Errors.ValidationError(context + "-resource-node-cant-be-first");
            }
            if(R.path(relationsPath, this.database)[fromId][toId] === undefined){
                return new Errors.ValidationError(context + "-relation-is-not-exist");
            }
        };
        
        LocalDBMS.prototype.setEdgeLabel = function(fromId, toId, label, callback) {
            var err = this._setEdgeLabelPrecondition(fromId, toId, label, context);
            if(err){
                callback(err);
            } else {
                R.path(relationsPath, this.database)[fromId][toId] = label;
                if (callback) callback();
            }
        };
        
        LocalDBMS.prototype.removeEdge = function(fromId, toId, callback) {
            delete R.path(relationsPath, this.database)[fromId][toId];
            if (callback) callback();
        };
        
        var _makeRelNodeId = function(name, type){
            return (type === 'groups' ? 'group-' : 'resource-') + name;
        }
        
        function _nodeAdded(nodeName, type){
            if(type === 'resources') return;
            R.path(relationsPath, this.database)[_makeRelNodeId(nodeName, type)] = {};
        };
        
        listeners.nodeAdded = listeners.nodeAdded || [];
        listeners.nodeAdded.push(_nodeAdded);

        function _nodeRemoved(nodeName, type){
            var relNodeName = _makeRelNodeId(nodeName, type);
            var data = R.path(relationsPath, this.database);
            delete data[relNodeName];
            R.values(data).forEach(function(item){
                delete item[relNodeName];
            });
        };
        
        listeners.nodeRemoved = listeners.nodeRemoved || [];
        listeners.nodeRemoved.push(_nodeRemoved);
        
        function _nodeRenamed(fromName, toName, group){
          
            var container = R.path(relationsPath, this.database);
            var toId = _makeRelNodeId(toName, group);
            var fromId  = _makeRelNodeId(fromName, group);
            if(group === 'groups'){
                container[toId] = container[fromId];
                delete container[fromId];
            }
            R.values(container).forEach(function(item){
                if(item[fromId] !== undefined){
                    item[toId] = item[fromId];
                    delete item[fromId];
                }
            });
        };
        
        listeners.nodeRenamed = listeners.nodeRenamed || [];
        listeners.nodeRenamed.push(_nodeRenamed);
        
        function _renameGroup(fromName, toName){
            var container = R.path(groupsPath, this.database);
            if(container[fromName] !== undefined){
                var data = container[fromName];
                data.name = toName;
                container[toName] = data;
                delete container[fromName];
                
                _nodeRenamed.apply(this, [fromName, toName, 'groups']);
            }
        };
        
        listeners.renameGroup = listeners.renameGroup || [];
        listeners.renameGroup.push(_renameGroup);
        
        function _removeGroup(groupName){
            var container = R.path(groupsPath, this.database);
            if(container[groupName] !== undefined){
                delete container[groupName];
                
                container = R.path(relationsPath, this.database);
                var nodeId = _makeRelNodeId(groupName, 'groups');
                delete container[nodeId];
                R.values(container).forEach(function(item){
                    if(item[nodeId] !== undefined){
                        delete item[nodeId];
                    }
                });
            }
        };
        
        listeners.removeGroup = listeners.removeGroup || [];
        listeners.removeGroup.push(_removeGroup);
    };
    
    callback(investigationBoardAPI);

})(function(api){
    typeof exports === 'undefined'? this['investigationBoardAPI'] = api: module.exports = api;
}.bind(this));
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
//                callback(new Errors.ValidationError("groups-group-name-is-not-specified"));
                callback({message: "Имя группы не может быть пустым"});
                return;
            }
            var ibData = this.database.InvestigationBoard;
                
            if(ibData.groups[groupName]){
                callback({message: 'Эта группа уже добавлена на схему'});
                return;
            }
            
            ibData.groups[groupName] = {
                    name:groupName,
                    notes: ""
            };
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
                callback({message: "Имя группы не может быть пустым"});
                return;
            }
            var ibData = this.database.InvestigationBoard;
            
            if(!ibData.groups[groupName]){
                callback({message: 'Этой группы нет на схеме'});
                return;
            }
            
            delete ibData.groups[groupName];
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
                if (callback) callback();
            }
        };
        

        
        LocalDBMS.prototype.removeResource = function(resourceName, callback) {
            delete R.path(resourcesPath, this.database)[resourceName];
            if (callback) callback();
        };
        
    };
    
    callback(investigationBoardAPI);

})(function(api){
    typeof exports === 'undefined'? this['investigationBoardAPI'] = api: module.exports = api;
}.bind(this));
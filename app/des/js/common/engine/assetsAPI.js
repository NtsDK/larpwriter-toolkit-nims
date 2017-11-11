/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

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

    function api(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        var listeners     = opts.listeners   ;
        
        var containerPath = ['Assets'];
        
        LocalDBMS.prototype.getAssetNamesArray = function(callback) {
            callback(null, Object.keys(R.path(containerPath, this.database)).sort(CU.charOrdA));
        };
        
        LocalDBMS.prototype.getGlobalAssetDisplayNames = function(callback) {
            callback(null, R.map(R.pick(['displayString']), R.path(containerPath, this.database)));
        };
        
        LocalDBMS.prototype.getAsset = function(name, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.entityExistsCheck(name, R.keys(container)), callback, () => {
                callback(null, CU.clone(container[name]));
            });
        };
        
        LocalDBMS.prototype.createAsset = function(name, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.createEntityCheck(name, R.keys(container)), callback, () => {
                var entity = {
                        name : name,
                        displayString : "",
                        isPhysical : false,
                        resourceCost : 0,
                        apiKey : "",
                        description : "",
//                        enabled: false,
//                        entities: []
                };
                
                R.path(containerPath, this.database)[name] = entity;
                this.ee.trigger("createAsset", arguments);
                if(callback) callback();
            });
        };

        LocalDBMS.prototype.renameAsset = function(fromName, toName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container)), callback, () => {
                var data = container[fromName];
                data.name = toName;
                container[toName] = data;
                delete container[fromName];
                
                this.ee.trigger("renameAsset", arguments);
                
                if(callback) callback();
            });
        };
    
        // profiles
        LocalDBMS.prototype.removeAsset = function(name, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(name, R.keys(container)), callback, () => {
                delete container[name];
                this.ee.trigger("removeAsset", arguments);
                if(callback) callback();
            });
        };
        
        var getTypeCheck = (fieldName, value) => {
            switch(fieldName){
            case 'displayString':
            case 'description':
            case 'apiKey':
                return PC.isString(value);
            case 'isPhysical':
                return PC.isBoolean(value);
            default: // resourceCost
                return PC.chainCheck([PC.isNumber(value), PC.isNonNegative(value)]);
            }
        };
        
        LocalDBMS.prototype.updateAssetField = function(assetName, fieldName, value, callback) {
            var container = R.path(containerPath, this.database);
            var chain = PC.chainCheck([PC.entityExistsCheck(assetName, R.keys(container)), 
                                       PC.isString(fieldName), PC.elementFromEnum(fieldName, Constants.assetEditableItems),
                                       getTypeCheck(fieldName, value)]);
            PC.precondition(chain, callback, () => {
                var data = container[assetName];
                data[fieldName] = value;
                if(callback) callback();
            });
        };
        
    };
    
    callback(api);

})(function(api){
    typeof exports === 'undefined'? this['assetsAPI'] = api: module.exports = api;
}.bind(this));
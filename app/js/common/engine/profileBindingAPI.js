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

    function profileBindingAPI(LocalDBMS, opts) {

        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        var listeners     = opts.listeners   ;
        
        var path = ['ProfileBindings'];
        var charPath = ['Characters'];
        var playerPath = ['Players'];
                    
        LocalDBMS.prototype.getProfileBindings = function(callback) {
            callback(null, CU.clone(R.path(path, this.database)));
        };
        
        LocalDBMS.prototype.getExtendedProfileBindings = function(callback) {
            var characters = R.keys(R.path(charPath, this.database));
            var players = R.keys(R.path(playerPath, this.database));
            var bindings = CU.clone(R.path(path, this.database));
            characters = R.difference(characters, R.keys(bindings));
            players = R.difference(players, R.values(bindings));
            
            var bindingData = R.reduce(R.concat, [], [R.toPairs(bindings), 
                                           R.zip(characters, R.repeat('', characters.length)), 
                                           R.zip(R.repeat('', players.length), players)]);
            callback(null, bindingData);
        };
        
        LocalDBMS.prototype.getProfileBinding = function(type, name, callback) {
            var conditions = [CU.isString(type), CU.elementFromEnum(type, Constants.profileTypes), 
                              CU.isString(name), CU.entityExists(name, R.keys(this.database[type === 'character' ? 'Characters' : 'Players']))];
            CU.precondition(CU.chainCheck(conditions), callback, () => {
                var arr;
                if(type === 'character'){
                    let bindings = R.path(path, this.database); 
                    arr = [name, bindings[name] || ''];
                } else {
                    let bindings = R.invertObj(R.path(path, this.database)); 
                    arr = [bindings[name] || '', name];
                }
                callback(null, arr);
            });
        };
        
        LocalDBMS.prototype.createBinding = function(characterName, playerName, callback) {
            var bindings = R.path(path, this.database);
            var conditions = [CU.isString(characterName), CU.entityExists(characterName, R.keys(this.database.Characters)),
                              CU.isString(playerName), CU.entityExists(playerName, R.keys(this.database.Players)),
                              CU.entityIsNotUsed(characterName, R.keys(bindings)), CU.entityIsNotUsed(playerName, R.keys(R.invertObj(bindings)))];
            CU.precondition(CU.chainCheck(conditions), callback, () => {
                bindings[characterName] = playerName;
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.removeBinding = function(characterName, playerName, callback) {
            var bindingArr = R.toPairs(R.path(path, this.database)).map(pair => pair[0] + '/' + pair[1]);
            var conditions = [CU.isString(characterName), CU.entityExists(characterName, R.keys(this.database.Characters)),
                              CU.isString(playerName), CU.entityExists(playerName, R.keys(this.database.Players)),
                              CU.entityExists(characterName + '/' + playerName, bindingArr)];
            CU.precondition(CU.chainCheck(conditions), callback, () => {
                delete R.path(path, this.database)[characterName];
                if(callback) callback();
            });
        };
        
        var _renameProfile = function(type, fromName, toName){
            var bindings = R.path(path, this.database);
            if(type === 'character'){
                var playerName = bindings[fromName];
                if(playerName !== undefined){
                    bindings[toName] = playerName;
                    delete bindings[fromName];
                }
            } else if(type === 'player'){
                var invertedBindings = R.invertObj(bindings);
                var characterName = invertedBindings[fromName];
                if(characterName !== undefined){
                    bindings[characterName] = toName;
                }
            } else {
                console.log('binding._renameProfile: Unexpected type ' + type);
            }
        };
        
        listeners.renameProfile = listeners.renameProfile || [];
        listeners.renameProfile.push(_renameProfile);
        
        var _removeProfile = function(type, profileName){
            var bindings = R.path(path, this.database);
            if(type === 'character'){
                delete bindings[profileName];
            } else if(type === 'player'){
                var invertedBindings = R.invertObj(bindings);
                var characterName = invertedBindings[profileName];
                if(characterName !== undefined){
                    delete bindings[characterName];
                }
            } else {
                console.log('binding._removeProfile: Unexpected type ' + type);
            }
        };
        
        listeners.removeProfile = listeners.removeProfile || [];
        listeners.removeProfile.push(_removeProfile);
        
    };
    
    callback(profileBindingAPI);

})(function(api){
    typeof exports === 'undefined'? this['profileBindingAPI'] = api: module.exports = api;
}.bind(this));
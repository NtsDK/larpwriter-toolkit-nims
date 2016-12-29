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

    function profileBindingAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners) {
        
        var path = ['ProfileBindings'];
        var charPath = ['Characters'];
        var playerPath = ['Players'];
                    
        LocalDBMS.prototype.getProfileBindings = function(callback) {
            callback(null, CommonUtils.clone(R.path(path, this.database)));
        };
        
        LocalDBMS.prototype._createBindingPrecondition = function(characterName, playerName){
            var bindings = R.path(path, this.database);
            var invertedBindings = R.invertObj(bindings);
            if (this.database.Characters[characterName] === undefined) {
                return [null, 'binding-character-not-exists', [ characterName ] ];
            } else if (this.database.Players[playerName] === undefined) {
                return [null, 'binding-player-not-exists', [ playerName ] ];
            } else if (bindings[characterName] !== undefined) {
                return [null, 'binding-character-is-used-in-binding', [ characterName, characterName + '/' + bindings[characterName] ] ];
            } else if (invertedBindings[playerName] !== undefined) {
                return [null, 'binding-player-is-used-in-binding', [ playerName, invertedBindings[playerName] + '/' + playerName ] ];
            }
        };
        
        LocalDBMS.prototype.createBinding = function(characterName, playerName, callback) {
            var err = this._createBindingPrecondition(characterName, playerName);
            if(err){callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
            R.path(path, this.database)[characterName] = playerName;
            if(callback) callback();
        };
        
        LocalDBMS.prototype._removeBindingPrecondition = function(characterName, playerName){
            var bindings = R.path(path, this.database);
            if (this.database.Characters[characterName] === undefined) {
                return [null, 'binding-character-not-exists', [ characterName ] ];
            } else if (this.database.Players[playerName] === undefined) {
                return [null, 'binding-player-not-exists', [ playerName ] ];
            } else if (bindings[characterName] !== playerName) {
                return [null, 'binding-binding-not-exists', [ characterName + '/' + playerName ] ];
            }
        };
        
        LocalDBMS.prototype.removeBinding = function(characterName, playerName, callback) {
            var err = this._removeBindingPrecondition(characterName, playerName);
            if(err){callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
            delete R.path(path, this.database)[characterName];
            if(callback) callback();
        };
        
        var _renameProfile = function(type, fromName, toName){
            var bindings = R.path(path, this.database);
            if(type === 'character'){
                bindings[toName] = bindings[fromName];
                delete bindings[fromName];
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
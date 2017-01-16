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

    function relationsAPI(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        var listeners     = opts.listeners   ;
        var dbmsUtils     = opts.dbmsUtils   ;
        
        var relationsPath = ['Relations'];
        
        dbmsUtils._getKnownCharacters = function(database, characterName){
            var stories = database.Stories;
            var knownCharacters = {};
            R.values(stories).forEach(function(story){
                var filter = R.compose(R.not, R.isNil, R.prop(characterName), R.prop('characters'));
                story.events.filter(filter).forEach(function(event){
                    R.keys(event.characters).forEach(function(charName){
                        knownCharacters[charName] = knownCharacters[charName] || {};
                        knownCharacters[charName][story.name] = true;
                    });
                });
            });
            delete knownCharacters[characterName];
            return knownCharacters;
        };
        
        var characterCheck = function(characterName, database){
            return CU.chainCheck([CU.isString(characterName), CU.entityExists(characterName, R.keys(database.Characters))]);
        };
        
        LocalDBMS.prototype.getRelationsSummary = function(characterName, callback){
            CU.precondition(characterCheck(characterName, this.database), callback, () => {
                var relData = R.path(relationsPath, this.database);
                var reverseRelations = {};
                R.keys(relData).forEach(function(revCharName){
                    var rels = relData[revCharName];
                    if(rels[characterName]){
                        reverseRelations[revCharName] = rels[characterName];
                    }
                });
                
                callback(null, {
                    directRelations: relData[characterName] || {},
                    reverseRelations: reverseRelations,
                    knownCharacters: dbmsUtils._getKnownCharacters(this.database, characterName)
                });
            });
        };
        
        LocalDBMS.prototype.setCharacterRelation = function(fromCharacter, toCharacter, text, callback){
            var chain = CU.chainCheck([characterCheck(fromCharacter, this.database), characterCheck(toCharacter, this.database), CU.isString(text)]);
            CU.precondition(chain, callback, () => {
                text = text.trim();
                if(text === ''){
                    if(relData[fromCharacter] !== undefined){
                        delete relData[fromCharacter][toCharacter];
                    }
                } else {
                    relData[fromCharacter] = relData[fromCharacter]  || {};
                    relData[fromCharacter][toCharacter] = text;
                }
                if (callback) callback();
            });
        };
        
        var _renameCharacter = function(type, fromName, toName){
            if(type === 'player') return;
            var relData = R.path(relationsPath, this.database);
            if(relData[fromName] !== undefined){
                relData[toName] = relData[fromName];
                delete relData[fromName];
            }
            R.values(relData).forEach(function(rels){
                if(rels[fromName] !== undefined){
                    rels[toName] = rels[fromName];
                    delete rels[fromName];
                }
            });
        };
        
        listeners.renameProfile = listeners.renameProfile || [];
        listeners.renameProfile.push(_renameCharacter);
        
        var _removeCharacter = function(type, characterName){
            if(type === 'player') return;
            var relData = R.path(relationsPath, this.database);
            if(relData[characterName] !== undefined){
                delete relData[characterName];
            }
            R.values(relData).forEach(function(rels){
                if(rels[characterName] !== undefined){
                    delete rels[characterName];
                }
            });
        };
        
        listeners.removeProfile = listeners.removeProfile || [];
        listeners.removeProfile.push(_removeCharacter);
        
    };
    
    callback(relationsAPI);

})(function(api){
    typeof exports === 'undefined'? this['relationsAPI'] = api: module.exports = api;
}.bind(this));
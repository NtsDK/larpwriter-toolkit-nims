/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
    
    function consistencyCheckAPI(LocalDBMS, opts) {
        var R             = opts.R           ;
        var CommonUtils   = opts.CommonUtils ;
        var validatorLib  = opts.Ajv         ;
        var schemaBuilder = opts.Schema      ;
        
        LocalDBMS.prototype.getConsistencyCheckResult = function(callback) {
            var errors = [];
            var pushError = function(str){
                errors.push(str);
            }
            
            checkProfileStructureConsistency(this.database, 'character', 'CharacterProfileStructure', pushError);
            checkProfileStructureConsistency(this.database, 'player', 'PlayerProfileStructure', pushError);
            checkProfileConsistency(this.database, 'Characters', 'CharacterProfileStructure', pushError);
            checkProfileConsistency(this.database, 'Players', 'PlayerProfileStructure', pushError);
            checkProfileValueConsistency(this.database, 'Characters', 'CharacterProfileStructure', pushError);
            checkProfileValueConsistency(this.database, 'Players', 'PlayerProfileStructure', pushError);
            checkStoryCharactersConsistency(this.database, pushError);
            checkEventsCharactersConsistency(this.database, pushError);
            checkBindingsConsistency(this.database, pushError);
            if(this.database.ManagementInfo){
                checkObjectRightsConsistency(this.database, pushError);
                checkPlayerLoginConsistency(this.database, pushError);
            }
            
            var schema = schemaBuilder.getSchema(this.database);
            var validator = validatorLib({allErrors: true}); // options can be passed, e.g. {allErrors: true}
            var validate = validator.compile(schema);
            var valid = validate(this.database);
            if (!valid) {
                errors = errors.concat(validate.errors);
            }
            
            callback(null, errors);
        };
        
        var getErrorProcessor = function(callback){
            return R.curry(R.compose(callback, CommonUtils.strFormat));
        }
        
        var checkObjectRightsConsistency = function(data, callback){
            var entities = {
                characters : R.keys(data.Characters),
                stories : R.keys(data.Stories),
                groups : R.keys(data.Groups),
                players : R.keys(data.Players)
            };
            var types = R.keys(entities);
            var processError = getErrorProcessor(callback);
            
            R.values(data.ManagementInfo.UsersInfo).forEach(function(user){
                types.forEach(type => {
                    var difference = R.difference(user[type], entities[type]);
                    if(difference.length != 0){
                        processError("Object rights inconsistent, user entity is not exist: user {0}, entity {1}, type {2}", [user.name, difference, type]);
                    }
                })
            })
        };
        
        var checkPlayerLoginConsistency = function(data, callback){
            var playerNames = R.values(data.Players).map(R.prop('name'));
            var loginNames = R.keys(data.ManagementInfo.PlayersInfo);
            var processError = getErrorProcessor(callback);
            
            var difference = R.difference(loginNames, playerNames);
            if(difference.length != 0){
                processError("Player logins inconsistent, logins which have no player: logins {0}", [difference]);
            }
        };
        
        var checkEventsCharactersConsistency = function(data, callback){
            var processError = getErrorProcessor(callback);
            R.values(data.Stories).forEach(function(story){
                var storyCharacters = R.values(story.characters).map(R.prop('name'));
                story.events.forEach(function(event, i){
                    var eventCharacters = R.keys(event.characters);
                    var difference = R.difference(eventCharacters, storyCharacters);
                    if(difference.length != 0){
                        processError("Event characters inconsistent, some character is not exist: story {0}, character {1}", [story.name + ":" + i, difference]);
                    }
                });
            });
        };
        
        var checkBindingsConsistency = function(data, callback){
            var processError = getErrorProcessor(callback);
            R.toPairs(R.invert(data.ProfileBindings)).filter(function(pair){
                return pair[1].length > 1;
            }).map(function(pair){
                processError("Profile bindings inconsistent, player has multiple characters: player {0}, characters {1}", [pair[0], JSON.stringify(pair[1])]);
            });
        };
            
        var checkStoryCharactersConsistency = function(data, callback){
            var charNames = R.values(data.Characters).map(R.prop('name'));
            var processError = getErrorProcessor(callback);
            
            R.values(data.Stories).forEach(function(story){
               var storyCharactersInner = R.values(story.characters).map(R.prop('name'));
               var differenceInner = R.difference(storyCharactersInner, charNames);
               if(differenceInner.length != 0){
                   processError("Story characters inconsistent, some character is not exist: story {0}, character {1}", [story.name, differenceInner]);
               }
               var storyCharactersOuter = R.keys(story.characters);
               var differenceOuter = R.symmetricDifference(storyCharactersInner, storyCharactersOuter);
               if(differenceOuter.length != 0){
                   processError("Story characters inconsistent, inner and outer character name are inconsistent: story {0}, character {1}", [story.name, differenceOuter]);
               }
            });
        };
        
        var isInconsistent = function(charValue, type, profileItemValue){
            switch(type){
            case "text":
            case "string":
                return !R.is(String, charValue);
            case "enum":
                if(!R.is(String, charValue)){
                    return true;
                } else {
                    var values = profileItemValue.split(',').map(R.trim);
                    return !R.contains(charValue.trim(), values);
                }
            case "multiEnum":
                if(!R.is(String, charValue)){
                    return true;
                } else {
                    var values = profileItemValue === '' ? [] : profileItemValue.split(',').map(R.trim);
                    var charValues = charValue === '' ? [] : charValue.split(',').map(R.trim);
                    return R.difference(charValues, values).length != 0;
                }
            case "number":
                return !R.is(Number, charValue);
            case "checkbox":
                return !R.is(Boolean, charValue);
            default:
                return true;
            }
        };
        
        var checkProfileValueConsistency = function(data, profiles, structure, callback){
            var processError = getErrorProcessor(callback)('Profile value inconsistency, item type is inconsistent: char {0}, item {1}, value {2}');
            
            R.values(data[profiles]).forEach(function(character){
                data[structure].forEach(function(profileItem){
                    if(isInconsistent(character[profileItem.name], profileItem.type, profileItem.value)){
                        processError([character.name, profileItem.name, character[profileItem.name]]);
                    }
                })
            });
        };
        
        var checkProfileConsistency = function(data, profiles, structure, callback){
            var profileItems = data[structure].map(R.prop('name'));
            var processError = getErrorProcessor(callback);
            
            R.values(data[profiles]).forEach(function(profile){
                var charItems = R.keys(profile).filter(R.compose(R.not, R.equals('name')));
                var difference = R.symmetricDifference(charItems,profileItems);
                if(difference.length != 0){
                    var processCharacterError = processError(R.__, [profile.name,difference]);
                    if(charItems.length !== profileItems.length){
                        return processCharacterError("Character profile inconsistent, lengths are different: char {0}, difference [{1}]");
                    }
                    if(!R.all(R.contains(R.__, profileItems))(charItems)){
                        return processCharacterError("Character profile inconsistent, item name inconsistency: char {0}, difference [{1}]");
                    }
                }
            });
        };
        
        var checkProfileStructureConsistency = function(data, type, structure, callback){
            var profileItems = data[structure].map(R.prop('name'));
            var processError = getErrorProcessor(callback);
            if(profileItems.length !== R.uniq(profileItems).length){
                var diff = R.toPairs(R.groupBy((name) => name, profileItems)).filter(pair => pair[1].length > 1).map(pair => pair[0]);
                processError("Profile structure inconsistent, item names are repeated: type {0}, values {1}", [type, diff]);
            }
        };
    };
    
    callback(consistencyCheckAPI);

})(function(api){
    typeof exports === 'undefined'? this['consistencyCheckAPI'] = api: module.exports = api;
}.bind(this));
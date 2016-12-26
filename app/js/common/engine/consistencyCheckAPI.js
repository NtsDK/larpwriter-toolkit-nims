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

(function(callback){
    
    function consistencyCheckAPI(LocalDBMS, R, CommonUtils, validatorLib, schemaBuilder) {
        
        LocalDBMS.prototype.getConsistencyCheckResult = function(callback) {
            "use strict";
            
            var errors = [];
            var pushError = function(str){
                errors.push(str);
            }
            
            checkCharacterProfileConsistency(this.database, pushError);
            checkProfileValueConsistency(this.database, pushError);
            checkStoryCharactersConsistency(this.database, pushError);
            checkEventsCharactersConsistency(this.database, pushError);
            if(this.database.ManagementInfo){
                checkObjectRightsConsistency(this.database, pushError);
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
            "use strict";
            var storyNames = R.values(data.Stories).map(R.prop('name'));
            var characterNames = R.values(data.Characters).map(R.prop('name'));
            var processError = getErrorProcessor(callback);
            
            R.values(data.ManagementInfo.UsersInfo).forEach(function(user){
                var difference = R.difference(user.characters, characterNames);
                if(difference.length != 0){
                    processError("Object rights inconsistent, user character is not exist: user {0}, character {1}", [user.name, difference]);
                }
                difference = R.difference(user.stories, storyNames);
                if(difference.length != 0){
                    processError("Object rights inconsistent, user story is not exist: user {0}, story {1}", [user.name, difference]);
                }
            })
        };
        
        var checkEventsCharactersConsistency = function(data, callback){
            "use strict";
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
            
        var checkStoryCharactersConsistency = function(data, callback){
            "use strict";
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
        
        var checkProfileValueConsistency = function(data, callback){
            "use strict";
            var profileItems = data.CharacterProfileStructure;
            var processError = getErrorProcessor(callback)('Profile value inconsistency, item type is inconsistent: char {0}, item {1}, value {2}');
            
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
            
            R.values(data.Characters).forEach(function(character){
                profileItems.forEach(function(profileItem){
                    if(isInconsistent(character[profileItem.name], profileItem.type, profileItem.value)){
                        processError([character.name, profileItem.name, character[profileItem.name]]);
                    }
                })
            });
        };
        
        var checkCharacterProfileConsistency = function(data, callback){
            "use strict";
            var profileItems = data.CharacterProfileStructure.map(R.prop('name'));
            var processError = getErrorProcessor(callback);
            
            R.values(data.Characters).forEach(function(character){
                var charItems = R.keys(character).filter(R.compose(R.not, R.equals('name')));
                var difference = R.symmetricDifference(charItems,profileItems);
                if(difference.length != 0){
                    var processCharacterError = processError(R.__, [character.name,difference]);
                    if(charItems.length !== profileItems.length){
                        return processCharacterError("Character profile inconsistent, lengths are different: char {0}, difference [{1}]");
                    }
                    if(!R.all(R.contains(R.__, profileItems))(charItems)){
                        return processCharacterError("Character profile inconsistent, item name inconsistency: char {0}, difference [{1}]");
                    }
                }
            });
        };
    };
    
    callback(consistencyCheckAPI);

})(function(api){
    typeof exports === 'undefined'? this['consistencyCheckAPI'] = api: module.exports = api;
}.bind(this));
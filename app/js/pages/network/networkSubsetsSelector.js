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

/*global
 Utils, StoryCharacters
 */

"use strict";

(function(exports){

    var state = {};
    
    exports.init = function () {
        listen(getEl("networkSubsetsSelector"), "change", onNetworkSubsetsChange);
    };
    
    exports.refresh = function (parent) {
        state.parent = parent;
        
        var selector = clearEl(getEl("networkSubsetsSelector"));
        
        var firstEl = true;
        
        var option;
        Constants.objectSubsets.forEach(function (objectSubset) {
            option = makeEl("option");
            option.appendChild(makeText(constL10n(objectSubset)));
            option.value = objectSubset;
            if(firstEl){
                option.selected = true;
                firstEl = false;
            }
            selector.appendChild(option);
        });
        
        onNetworkSubsetsChange({target: selector});
        
        selector = clearEl(getEl("networkCharacterSelector"));
        
        Object.keys(state.parent.Characters).map(function(name){
            return state.parent.Characters[name];
        }).sort(Utils.charOrdAObject).forEach(function (nameInfo) {
            option = makeEl("option");
            option.appendChild(makeText(nameInfo.displayName));
            option.value = nameInfo.name;
            selector.appendChild(option);
        });
        
        selector = clearEl(getEl("networkStorySelector"));
        
        Object.keys(state.parent.Stories).map(function(name){
            return state.parent.Stories[name];
        }).sort(Utils.charOrdAObject).forEach(function (nameInfo) {
            option = makeEl("option");
            option.appendChild(makeText(nameInfo.displayName));
            option.value = nameInfo.name;
            selector.appendChild(option);
        });
    };
    
    exports.getStoryNames = function () {
        var value = getEl("networkSubsetsSelector").value;
        
        var selector;
        if(Constants.objectSubsets[0] === value){ // all objects
            return Object.keys(state.parent.Stories);
        } else if (Constants.objectSubsets[1] === value) { // "selected characters"
            selector = getEl("networkCharacterSelector");
            
            var primaryCharacters = {};
            var i;
            for (i = 0; i < selector.selectedOptions.length; i +=1) {
                primaryCharacters[selector.selectedOptions[i].value] = true;
            }
            
            var stories = [];
            var story, storyCharacters;
            var character;
            var isPrimaryCharacter = function(name){
                return primaryCharacters[name];
            }
            
            Object.keys(state.parent.Stories).forEach(function(storyName){
                story = state.parent.Stories[storyName];
                storyCharacters = Object.keys(story.characters);
                
                if(storyCharacters.some(isPrimaryCharacter)){
                    stories.push(storyName);
                }
            });
            
            return stories;
        } else { //"selected stories"
            selector = getEl("networkStorySelector");
            var stories = [];
            
            var i;
            for (i = 0; i < selector.selectedOptions.length; i +=1) {
                stories.push(selector.selectedOptions[i].value);
            }
            return stories;
        }
    };
    
    exports.getCharacterNames = function () {
        var value = getEl("networkSubsetsSelector").value;
        
        var selector;
        if(Constants.objectSubsets[0] === value){ // all objects
            return Object.keys(state.parent.Characters);
        } else if (Constants.objectSubsets[1] === value) { // "selected characters"
            // returns character and his neighbours
            selector = getEl("networkCharacterSelector");
            
            var primaryCharacters = {};
            var secondaryCharacters = {};
            var i;
            for (i = 0; i < selector.selectedOptions.length; i +=1) {
                primaryCharacters[selector.selectedOptions[i].value] = true;
            }
            
            var story, storyCharacters, eventCharacters;
            var character;
            var isPrimaryCharacter = function(name){
                return primaryCharacters[name];
            }
            
            var event;
            Object.keys(state.parent.Stories).forEach(function(storyName){
                story = state.parent.Stories[storyName];
                storyCharacters = Object.keys(story.characters);
                
                
                if(storyCharacters.some(isPrimaryCharacter)){
                    story.events.forEach(function(event){
                        eventCharacters = Object.keys(event.characters);
                        if(eventCharacters.some(isPrimaryCharacter)){
                            eventCharacters.forEach(function(name){
                                if(!isPrimaryCharacter(name)){
                                    secondaryCharacters[name] = true;
                                }
                            });
                        }
                    })
                }
            });
            
            var result = Object.keys(primaryCharacters).concat(Object.keys(secondaryCharacters));
            return result;
        } else { //"selected stories"
            selector = getEl("networkStorySelector");
            
            var stories = [];
            var characters = {};
            
            var i;
            for (i = 0; i < selector.selectedOptions.length; i +=1) {
                stories.push(selector.selectedOptions[i].value);
            }
            
            var story;
            stories.forEach(function(storyName){
                story = state.parent.Stories[storyName];
                for(character in story.characters){
                    characters[character] = true;
                }
            });
            
            return Object.keys(characters);
        }
    };
    
    var onNetworkSubsetsChange = function (event) {
        var selectedSubset = event.target.value;
        
        var selector1 = getEl("networkCharacterDiv");
        var selector2 = getEl("networkStoryDiv");
        setClassByCondition(selector1, "hidden", selectedSubset !== Constants.objectSubsets[1]);
        setClassByCondition(selector2, "hidden", selectedSubset !== Constants.objectSubsets[2]);
    };

})(this['NetworkSubsetsSelector']={});
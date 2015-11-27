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
 Utils, DBMS, Database, StoryCharacters
 */

"use strict";

var NetworkSubsetsSelector = {};

NetworkSubsetsSelector.objectSubsets = ["Все объекты", "Избранные персонажи", "Избранные истории"];


NetworkSubsetsSelector.init = function () {
    "use strict";
    
    var selector = document.getElementById("networkSubsetsSelector");
    selector.addEventListener("change", NetworkSubsetsSelector.onNetworkSubsetsChange);
};

NetworkSubsetsSelector.refresh = function () {
    var selector = document.getElementById("networkSubsetsSelector");
    Utils.removeChildren(selector);
    
    var firstEl = true;
    
    var option;
    NetworkSubsetsSelector.objectSubsets.forEach(function (objectSubset) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(objectSubset));
        if(firstEl){
            option.selected = true;
            firstEl = false;
        }
        selector.appendChild(option);
    });
    
    selector = document.getElementById("networkCharacterSelector");
    Utils.removeChildren(selector);
    
    DBMS.getCharacterNamesArray().forEach(function (name) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(name));
        selector.appendChild(option);
    });
    
    selector = document.getElementById("networkStorySelector");
    Utils.removeChildren(selector);
    
    DBMS.getStoryNamesArray().forEach(function (story) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(story));
        selector.appendChild(option);
    });
};

NetworkSubsetsSelector.getStoryNames = function () {
    var value = document.getElementById("networkSubsetsSelector").value;
    
    var selector;
    if(NetworkSubsetsSelector.objectSubsets[0] === value){ // все объекты
        return Object.keys(Database.Stories);
    } else if (NetworkSubsetsSelector.objectSubsets[1] === value) { // "Избранные персонажи"
        selector = document.getElementById("networkCharacterSelector");
        
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
        
        Object.keys(Database.Stories).forEach(function(storyName){
            story = Database.Stories[storyName];
            storyCharacters = Object.keys(story.characters);
            
            if(storyCharacters.some(isPrimaryCharacter)){
                stories.push(storyName);
            }
        });
        
        return stories;
    } else { //"Избранные истории"
        selector = document.getElementById("networkStorySelector");
        var stories = [];
        
        var i;
        for (i = 0; i < selector.selectedOptions.length; i +=1) {
            stories.push(selector.selectedOptions[i].value);
        }
        return stories;
    }
};

NetworkSubsetsSelector.getCharacterNames = function () {
    var value = document.getElementById("networkSubsetsSelector").value;
    
    var selector;
    if(NetworkSubsetsSelector.objectSubsets[0] === value){ // все объекты
        return Object.keys(Database.Characters);
    } else if (NetworkSubsetsSelector.objectSubsets[1] === value) { // "Избранные персонажи"
        // возвращает персонажа и его окружение из историй
        selector = document.getElementById("networkCharacterSelector");
        
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
        Object.keys(Database.Stories).forEach(function(storyName){
            story = Database.Stories[storyName];
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
    } else { //"Избранные истории"
        selector = document.getElementById("networkStorySelector");
        
        var stories = [];
        var characters = {};
        
        var i;
        for (i = 0; i < selector.selectedOptions.length; i +=1) {
            stories.push(selector.selectedOptions[i].value);
        }
        
        var story;
        stories.forEach(function(storyName){
            story = Database.Stories[storyName];
            for(character in story.characters){
                characters[character] = true;
            }
        });
        
        return Object.keys(characters);
    }
};

NetworkSubsetsSelector.onNetworkSubsetsChange = function (event) {
    var selectedSubset = event.target.value;
    
    var selector1 = document.getElementById("networkCharacterDiv");
    var selector2 = document.getElementById("networkStoryDiv");
    selector1.className = selectedSubset === NetworkSubsetsSelector.objectSubsets[1] ? "" : "hidden";
    selector2.className = selectedSubset === NetworkSubsetsSelector.objectSubsets[2] ? "" : "hidden";
    
};
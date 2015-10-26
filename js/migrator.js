/*global
// Utils
 */

"use strict";

var Migrator = {};

Migrator.migrate = function(data){
    if(!data.Version){
        
        data.Settings = {};
        
        var story, storyCharacters;
        Object.keys(data.Stories).forEach(function(storyName){
            story = data.Stories[storyName];
            storyCharacters = Object.keys(story.characters);
            storyCharacters.forEach(function(character){
                story.characters[character].activity = {};
            });
            
        });
        
        data.Version = "0.0.4";
    }
    return data;
};
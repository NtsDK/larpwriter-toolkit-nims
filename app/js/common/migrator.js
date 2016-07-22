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
 // Utils
 */

"use strict";

(function(exports) {
    
    var exists = function(data, prefix, key){
        console.log(prefix + '.' + key + ': ' + (data[key] !== undefined ? "OK" : "undefined"));
    };
    
    exports.migrate = function(data) {
        exists(data, 'base', 'Stories');
        
        if (!data.Version) {

            data.Settings = {};

            var story, storyCharacters;
            Object.keys(data.Stories).forEach(function(storyName) {
                story = data.Stories[storyName];
                storyCharacters = Object.keys(story.characters);
                storyCharacters.forEach(function(character) {
                    story.characters[character].activity = {};
                });
            });

            data.Version = "0.0.4";
        }
        if (data.Version === "0.0.4") { // new versioning rule
            data.Version = "0.4.1";
        }
        if(data.Version === "0.4.1"){ // new 
            delete data.Settings["Events"];
            data.Version = "0.4.3";
        }
        if(data.Version === "0.4.3"){
            data.Log = [];
            data.Version = "0.4.4";
            data.Meta.saveTime = new Date();
        }
        if(data.Version === "0.4.4"){
            // see #3
            var char, story;
            Object.keys(data.Characters).forEach(function(charName) {
                char = data.Characters[charName];
                delete char.displayName;
            });
            Object.keys(data.Stories).forEach(function(storyName) {
                story = data.Stories[storyName];
                delete story.displayName;
            });
            data.Version = "0.4.4u1";
        }
        if(data.Version === "0.4.4u1"){
            // see #12
            data.ProfileSettings.forEach(function(item){
                item.doExport = true;
            });
            data.Meta.saveTime = new Date().toString();
            // see #13
            for(var storyName in data.Stories){
                var story = data.Stories[storyName];
                story.events.forEach(function(event){
                    delete event.index;
                    delete event.storyName;
                });
            }
            // see #17
            for(var storyName in data.Stories){
                var story = data.Stories[storyName];
                story.events.forEach(function(event){
                    for(var character in event.characters){
                        delete event.characters[character].name;
                        event.characters[character].time = "";
                    }
                });
            }
            data.Version = "0.4.4u2";
        }
        if(data.Version === "0.4.4u2"){
            // see #17 - reopened
            for(var storyName in data.Stories){
                var story = data.Stories[storyName];
                story.events.forEach(function(event){
                    for(var character in event.characters){
                        delete event.characters[character].name;
                    }
                });
            }
            data.Version = "0.4.4u3";
        }
        
        exists(data, 'base', 'Characters');
        exists(data, 'base', 'ProfileSettings');
        exists(data, 'base', 'Meta');
        exists(data, 'base', 'Log');
        exists(data.Meta, 'base.Meta', 'name');
        exists(data.Meta, 'base.Meta', 'date');
        exists(data.Meta, 'base.Meta', 'preGameDate');
        exists(data.Meta, 'base.Meta', 'description');
        exists(data.Meta, 'base.Meta', 'saveTime');
        
        return data;
    };
    
})(typeof exports === 'undefined' ? this['Migrator'] = {} : exports);

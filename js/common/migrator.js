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
    
    var checkCharacterProfileConsistency = function(data){
        var profileItems = data.ProfileSettings.map(R.prop('name'));
        
        R.values(data.Characters).forEach(function(character){
            var charItems = R.keys(character).filter(R.compose(R.not, R.equals('name')));
            if(charItems.length !== profileItems.length){
                console.log("Character profile inconsistent, lengths are different: char " + character.name + ", charItems [" + charItems + "], profileItems [" + profileItems + "]");
                return;
            }
            
            if(!charItems.every(R.contains(R.__, profileItems))){
                console.log("Character profile inconsistent, item name inconsistency: char " + character.name + ", charItems [" + charItems + "], profileItems [" + profileItems + "]");
                return;
            }
        });
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
		
		exists(data, 'base', 'Characters');
		exists(data, 'base', 'ProfileSettings');
		exists(data, 'base', 'Meta');
		exists(data.Meta, 'base.Meta', 'name');
		exists(data.Meta, 'base.Meta', 'date');
		exists(data.Meta, 'base.Meta', 'preGameDate');
		exists(data.Meta, 'base.Meta', 'description');
		
		checkCharacterProfileConsistency(data);
		
		return data;
	};
})(typeof exports === 'undefined' ? this['Migrator'] = {} : exports);
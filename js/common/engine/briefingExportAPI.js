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

	function briefingExportAPI(LocalDBMS, CommonUtils) {
	
		LocalDBMS.prototype.getBriefingData = function(groupingByStory, selectedCharacters, callback) {
			"use strict";
			var data = {};
	
			var charArray = [];
	
			for ( var charName in this.database.Characters) {
			  if(selectedCharacters && !selectedCharacters[charName]){
			    continue;
			  }
			  
				var inventory = [];
				for ( var storyName in this.database.Stories) {
					var story = this.database.Stories[storyName];
					if (story.characters[charName] && 
							story.characters[charName].inventory && 
							story.characters[charName].inventory !== "") {
						inventory = inventory.concat(story.characters[charName].inventory);
					}
				}
				inventory = inventory.join(", ");
	
				var profileInfo = _getProfileInfoObject(this.database, charName);
				var profileInfoArray = _getProfileInfoArray(this.database, charName);
	
				if (groupingByStory) {
					var storiesInfo = _getStoriesInfo(this.database, charName);
				} else {
					var eventsInfo = _getEventsInfo(this.database, charName);
				}
				var dataObject = {
					"name" : charName,
					"inventory" : inventory,
					"storiesInfo" : storiesInfo,
					"eventsInfo" : eventsInfo,
					"profileInfoArray" : profileInfoArray
				};
	
				for ( var element in profileInfo) {
					dataObject["profileInfo." + element] = profileInfo[element];
				}
	
				charArray.push(dataObject);
			}
	
			data.briefings = charArray;
			callback(null, data);
		};
	
		var _getProfileInfoObject = function(database, charName) {
			"use strict";
			var character = database.Characters[charName];
			var profileInfo = {};
	
			database.ProfileSettings.forEach(function(element) {
				switch (element.type) {
				case "text":
				case "string":
				case "enum":
				case "number":
					profileInfo[element.name] = character[element.name];
					break;
				case "checkbox":
					profileInfo[element.name] = character[element.name] ? "Да" : "Нет";
					break;
				}
			});
			return profileInfo;
		};
	
		var _getProfileInfoArray = function(database, charName) {
			"use strict";
			var character = database.Characters[charName];
			var profileInfoArray = [];
	
			var value;
			database.ProfileSettings.forEach(function(element) {
				switch (element.type) {
				case "text":
				case "string":
				case "enum":
				case "number":
					value = character[element.name];
					break;
				case "checkbox":
					value = character[element.name] ? "Да" : "Нет";
					break;
				}
				profileInfoArray.push({
					name : element.name,
					value : value
				});
			});
			return profileInfoArray;
		};
	
		var _getEventsInfo = function(database, charName) {
			"use strict";
			var eventsInfo = [];
			for ( var storyName in database.Stories) {
				var storyInfo = {};
	
				var story = database.Stories[storyName];
				if (!story.characters[charName]) {
					continue;
				}
	
				storyInfo.name = storyName;
	
				var eventInfo;
				story.events.filter(function(event) {
					return event.characters[charName];
				}).forEach(function(event) {
					eventInfo = {};
					if (event.characters[charName].text !== "") {
						eventInfo.text = event.characters[charName].text;
					} else {
						eventInfo.text = event.text;
					}
					eventInfo.time = event.time;
					eventsInfo.push(eventInfo);
				});
			}
			eventsInfo.sort(CommonUtils.eventsByTime);
	
			return eventsInfo;
		};
	
		var _getStoriesInfo = function(database, charName) {
			"use strict";
			var storiesInfo = [];
			for ( var storyName in database.Stories) {
				var storyInfo = {};
	
				var story = database.Stories[storyName];
				if (!story.characters[charName]) {
					continue;
				}
	
				storyInfo.name = storyName;
				var eventsInfo = [];
	
				story.events.filter(function(event) {
					return event.characters[charName];
				}).forEach(function(event) {
					var eventInfo = {};
					if (event.characters[charName].text !== "") {
						eventInfo.text = event.characters[charName].text;
					} else {
						eventInfo.text = event.text;
					}
					eventInfo.time = event.time;
					eventsInfo.push(eventInfo);
				});
				storyInfo.eventsInfo = eventsInfo;
	
				storiesInfo.push(storyInfo);
			}
			return storiesInfo;
		};
	};
	callback(briefingExportAPI);

})(function(api){
	typeof exports === 'undefined'? this['briefingExportAPI'] = api: module.exports = api;
});

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

	function extrasAPI(LocalDBMS, CommonUtils, dateFormat) {
		// preview
		LocalDBMS.prototype.getAllInventoryLists = function(characterName, callback) {
			"use strict";
			var array = [];
	
			for ( var storyName in this.database.Stories) {
				var story = this.database.Stories[storyName];
				if (story.characters[characterName]
						&& story.characters[characterName].inventory
						&& story.characters[characterName].inventory !== "") {
					array.push({
						storyName : storyName,
						inventory : story.characters[characterName].inventory
					});
				}
			}
			callback(null, array);
		};
	
		// preview
		LocalDBMS.prototype.getCharacterEventGroupsByStory = function(characterName, callback) {
			"use strict";
			var eventGroups = [];
	
			var events;
	
			var that = this;
			Object.keys(this.database.Stories).filter(function(storyName) {
				return that.database.Stories[storyName].characters[characterName];
			}).forEach(function(storyName) {
				events = [];
	
				var tmpEvents = CommonUtils.clone(that.database.Stories[storyName].events);
				tmpEvents.map(function(elem, i) {
					elem.index = i;
					elem.storyName = storyName;
					return elem;
				}).filter(function(event) {
					return event.characters[characterName];
				}).forEach(function(event) {
					events.push(event);
				});
	
				eventGroups.push({
					storyName : storyName,
					events : events
				})
			});
			callback(null, eventGroups);
		};
	
		// preview
		LocalDBMS.prototype.getCharacterEventsByTime = function(characterName, callback) {
			"use strict";
			var allEvents = [];
	
			var that = this;
			Object.keys(this.database.Stories).filter(function(storyName) {
				return that.database.Stories[storyName].characters[characterName];
			}).forEach(function(storyName) {
				var events = CommonUtils.clone(that.database.Stories[storyName].events);
				allEvents = allEvents.concat(events.map(function(elem, i) {
					elem.index = i;
					elem.storyName = storyName;
					return elem;
				}).filter(function(event) {
					return event.characters[characterName];
				}));
			});
	
			allEvents.sort(CommonUtils.eventsByTime);
			callback(null, allEvents);
		};
	
		// profile, preview
		LocalDBMS.prototype.getProfile = function(name, callback) {
			"use strict";
			callback(null, CommonUtils.clone(this.database.Characters[name]));
		};
		// social network, character filter
		LocalDBMS.prototype.getAllProfiles = function(callback) {
			"use strict";
			callback(null, CommonUtils.clone(this.database.Characters));
		};
		// social network
		LocalDBMS.prototype.getAllStories = function(callback) {
			"use strict";
			callback(null, CommonUtils.clone(this.database.Stories));
		};
	
		// timeline
		LocalDBMS.prototype.getEventGroupsForStories = function(storyNames, callback) {
			"use strict";
			var eventGroups = [];
	
			var events;
	
			var that = this;
			Object.keys(this.database.Stories).filter(function(storyName) {
				return storyNames.indexOf(storyName) !== -1;
			}).forEach(function(storyName) {
				events = [];
	
				var tmpEvents = CommonUtils.clone(that.database.Stories[storyName].events);
				tmpEvents.map(function(elem, i) {
					elem.index = i;
					elem.storyName = storyName;
					return elem;
				}).forEach(function(event) {
					events.push(event);
				});
	
				eventGroups.push({
					storyName : storyName,
					events : events
				})
			});
			callback(null, eventGroups);
		};
	
		// timeline
		// disabled for this moment
		LocalDBMS.prototype.setEventTime = function(storyName, eventIndex, time, callback) {
			"use strict";
	
			var event = this.database.Stories[storyName].events[eventIndex];
			event.time = dateFormat(time, "yyyy/mm/dd h:MM");
			callback();
		};
	
	};
	callback(extrasAPI);

})(function(api){
	typeof exports === 'undefined'? this['extrasAPI'] = api: module.exports = api;
});

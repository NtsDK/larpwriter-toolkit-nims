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
	
	function commonAPI(LocalDBMS, Migrator, CommonUtils) {
	
		LocalDBMS.prototype.getDatabase = function(callback){
		    "use strict";
		    callback(null, this.database);
		};
	
		LocalDBMS.prototype.setDatabase = function(database, callback){
		    "use strict";
		    this.database = Migrator.migrate(database);
		    if(callback) callback();
		};
	
		LocalDBMS.prototype.getMetaInfo = function(callback){
		    "use strict";
		    callback(null, this.database.Meta);
		};
	
		// overview
		LocalDBMS.prototype.setMetaInfo = function(name, value, callback){
		    "use strict";
		    this.database.Meta[name] = value;
		    if(callback) callback();
		};
	
		LocalDBMS.prototype.getCharacterNamesArray = function(callback) {
		    "use strict";
		    callback(null, Object.keys(this.database.Characters).sort(CommonUtils.charOrdA));
		};
	
		// stories, timeline
		LocalDBMS.prototype.getStoryNamesArray = function (callback) {
		    "use strict";
		    callback(null, Object.keys(this.database.Stories).sort(CommonUtils.charOrdA));
		};
	
		LocalDBMS.prototype.getAllProfileSettings = function(callback){
		    "use strict";
		    callback(null, this.database.ProfileSettings);
		};
		
    LocalDBMS.prototype.getStatistics = function(callback){
      "use strict";
      var statistics = {};
      statistics.storyNumber = Object.keys(this.database.Stories).length;
      statistics.characterNumber = Object.keys(this.database.Characters).length;
      
      statistics.eventsNumber = 0;
      for ( var storyName in this.database.Stories) {
        statistics.eventsNumber += this.database.Stories[storyName].events.length;
      }
      
      statistics.userNumber = 1;
      if(this.database.ManagementInfo && this.database.ManagementInfo.UsersInfo){
        statistics.userNumber = Object.keys(this.database.ManagementInfo.UsersInfo).length;
      }
      
      statistics.textCharacterNumber = _countTextCharacters(this.database);
      
      var firstLastEventTime = _getFirstLastEventTime(this.database);
      
      statistics.firstEvent = firstLastEventTime[0] ? firstLastEventTime[0] : "";
      statistics.lastEvent = firstLastEventTime[1] ? firstLastEventTime[1] : "";
      
      statistics.storyEventsHist = _getHistogram(this.database, function(story){
        return story.events.length;
      });
      
      statistics.storyCharactersHist = _getHistogram(this.database, function(story){
        return Object.keys(story.characters).length;
      });
      
      statistics.eventCompletenessHist = _getEventCompletenessHist(this.database);
      
      statistics.generalCompleteness = _getGeneralCompleteness(this.database);
      statistics.storyCompleteness = _getStoryCompleteness(this.database);
      
      statistics.characterChartData = _getChartData(this.database, "characters", "Characters");
      statistics.storyChartData = _getChartData(this.database, "stories", "Stories");
      
      callback(null, statistics);
    };
  };
  
  var _getChartData = function(database, objectKey, totalKey){
    "use strict";
    var characterChartData = [];
    var total = Object.keys(database[totalKey]).length;
    var sum = 0;
    if(database.ManagementInfo && database.ManagementInfo.UsersInfo){
      for(var key in database.ManagementInfo.UsersInfo){
        var userInfo = database.ManagementInfo.UsersInfo[key];
        characterChartData.push({
          value: userInfo[objectKey].length,
          label: key,
        });
        sum += userInfo[objectKey].length;
      }
      if(sum !== total){
        characterChartData.push({
          value: total-sum,
          label: "unknown",
        });
      }
    } else {
      characterChartData.push({
        value: total,
        label: "user",
      });
    }
    return characterChartData;
  };
  
  var _calcStoryCompleteness = function(story){
    "use strict";
    var finishedAdaptations = 0;
    var allAdaptations = 0;
    story.events.forEach(function(event){
      allAdaptations+=Object.keys(event.characters).length;
      for(var character in event.characters){
        if(event.characters[character].ready){
          finishedAdaptations++;
        }
      }
    });
    return finishedAdaptations/allAdaptations;
  }
  
  var _getEventCompletenessHist = function(database){
    "use strict";
    var story, hist = [], storyCompleteness;
    for ( var storyName in database.Stories) {
      story = database.Stories[storyName];
      storyCompleteness = _calcStoryCompleteness(story);
      
      var keyParam = Math.floor(10*storyCompleteness);
      if(hist[keyParam]){
        hist[keyParam].value++;
        hist[keyParam].tip = hist[keyParam].tip + ", " + story.name + " (" + (100*storyCompleteness).toFixed(0) + "%)";
      } else {
        hist[keyParam] = {
          value: 1,
          label: keyParam,
          tip: story.name + " (" + (100*storyCompleteness).toFixed(0) + "%)"
        }
      }
    }
    for (var i = 0; i < 11; i++) {
      if(!hist[i]){
        hist[i] = null;
      }
    }
    return hist;
  };
  
  var _getStoryCompleteness = function(database){
    "use strict";
    var story, generalCompletness, finishedAdaptations, allAdaptations, 
        finishedStories = 0, allStories = Object.keys(database.Stories).length;
    for ( var storyName in database.Stories) {
      story = database.Stories[storyName];
      finishedAdaptations = 0;
      allAdaptations = 0;
      story.events.forEach(function(event){
        allAdaptations+=Object.keys(event.characters).length;
        for(var character in event.characters){
          if(event.characters[character].ready){
            finishedAdaptations++;
          }
        }
      });
      if(allAdaptations === finishedAdaptations){
        finishedStories++;
      }
    }
    return (finishedStories/allStories*100).toFixed(1) + '%' + ' (' + finishedStories + " из " + allStories +' историй)';
  };
  
  var _getGeneralCompleteness = function(database){
    "use strict";
    var story, generalCompletness, finishedAdaptations = 0, allAdaptations = 0;
    for ( var storyName in database.Stories) {
      story = database.Stories[storyName];
      story.events.forEach(function(event){
        allAdaptations+=Object.keys(event.characters).length;
        for(var character in event.characters){
          if(event.characters[character].ready){
            finishedAdaptations++;
          }
        }
      });
    }
    return (finishedAdaptations/allAdaptations*100).toFixed(1) + '%' + ' (' + finishedAdaptations + " из " + allAdaptations +' адаптаций)';
  };
  
  var _countTextCharacters = function(database){
    "use strict";
    var noWhiteSpaceLength = function (str){
      return str.replace(/\s/g, "").length;
    };
    var story, textCharacterNumber = 0, character, storyName;
    for (storyName in database.Stories) {
      story = database.Stories[storyName];
      textCharacterNumber += noWhiteSpaceLength(story.story);
      story.events.forEach(function(event){
        textCharacterNumber += noWhiteSpaceLength(event.text);
        for(character in event.characters){
          textCharacterNumber += noWhiteSpaceLength(event.characters[character].text);
        }
      });
    }
    return textCharacterNumber;
  };
  
  var _getFirstLastEventTime = function(database){
    "use strict";
    var story, lastEvent = null, firstEvent = null, date;
    for ( var storyName in database.Stories) {
      story = database.Stories[storyName];
      story.events.forEach(function(event){
        if(event.time != ""){
          date = new Date(event.time);
          if(lastEvent === null || date > lastEvent){
            lastEvent = date;
          }
          if(firstEvent === null || date < firstEvent){
            firstEvent = date;
          }
        }
      });
    }
    return [firstEvent, lastEvent];
  };

  var _getHistogram = function(database, keyParamDelegate){
    "use strict";
    var story, storyCharactersHist = [];
    for ( var storyName in database.Stories) {
      story = database.Stories[storyName];
      var keyParam = keyParamDelegate(story);
      if(storyCharactersHist[keyParam]){
        storyCharactersHist[keyParam].value++;
        storyCharactersHist[keyParam].tip = storyCharactersHist[keyParam].tip + ", " + story.name;
      } else {
        storyCharactersHist[keyParam] = {
          value: 1,
          label: keyParam,
          tip: keyParam + ": " + story.name
        }
      }
    }
    for (var i = 0; i < storyCharactersHist.length; i++) {
      if(!storyCharactersHist[i]){
        storyCharactersHist[i] = null;
      }
    }
    return storyCharactersHist;
  };

	callback(commonAPI);

})(function(api){
	typeof exports === 'undefined'? this['commonAPI'] = api: module.exports = api;
});
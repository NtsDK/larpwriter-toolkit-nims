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
    
    function statisticsAPI(LocalDBMS, R, CommonUtils) {
        
        LocalDBMS.prototype.getStatistics = function(callback) {
            "use strict";
            var statistics = {};
            statistics.storyNumber = Object.keys(this.database.Stories).length;
            statistics.characterNumber = Object.keys(this.database.Characters).length;

            statistics.eventsNumber = R.sum(R.values(this.database.Stories).map(R.compose(R.length, R.prop('events'))));

            statistics.userNumber = 1;
            if (this.database.ManagementInfo && this.database.ManagementInfo.UsersInfo) {
                statistics.userNumber = Object.keys(this.database.ManagementInfo.UsersInfo).length;
            }

            statistics.textCharacterNumber = _countTextCharacters(this.database);

            var firstLastEventTime = _getFirstLastEventTime(this.database);

            statistics.firstEvent = firstLastEventTime[0] ? firstLastEventTime[0] : "";
            statistics.lastEvent = firstLastEventTime[1] ? firstLastEventTime[1] : "";

            statistics.storyEventsHist = _getHistogram(this.database, function(story) {
                return story.events.length;
            });

            statistics.storyCharactersHist = _getHistogram(this.database, function(story) {
                return Object.keys(story.characters).length;
            });

            statistics.eventCompletenessHist = _getEventCompletenessHist(this.database);

            statistics.generalCompleteness = _getGeneralCompleteness(this.database);
            statistics.storyCompleteness = _getStoryCompleteness(this.database);

            statistics.characterChartData = _getChartData(this.database, "characters", "Characters");
            statistics.storyChartData = _getChartData(this.database, "stories", "Stories");

            statistics.profileCharts = _getProfileChartData(this.database);

            callback(null, statistics);
        };
        
        var _getProfileChartData = function(database) {
            "use strict";
            
            var profileItems = database.ProfileSettings.filter(function(value) {
                return value.type !== 'string' && value.type !== 'text';
            }).map(R.pick(['name', 'type']));
            
            var groupCharacters = R.groupBy(R.__, R.values(database.Characters));
            var groupReduce = function(group){
                return R.fromPairs(R.toPairs(group).map(function(elem){
                    elem[1] = elem[1].length;
                    return elem;
                }));
            };
            var groupedValues = profileItems.map(function(profileItem) {
                if (profileItem.type === "enum" || profileItem.type === "checkbox") {
                    return groupReduce(groupCharacters(R.prop(profileItem.name)));
                } else {
                    var array = R.ap([R.prop(profileItem.name)],R.values(database.Characters));
                    var max = array.reduce(function(max, cur){
                        return cur > max ? cur : max;
                    }, array[0]);
                    var min = array.reduce(function(min, cur){
                        return cur < min ? cur : min;
                    }, array[0]);
                    var step = Math.ceil((max - min) / 20);
                    step = step === 0 ? 1 : step;
                    return {
                        groups: groupReduce(groupCharacters(function(character){
                            return Math.floor(character[profileItem.name] / step)
                        })),
                        step: step
                    }
                }
            });
                    
            return R.transpose([profileItems, groupedValues]).map(function(arr){
                return R.assoc('data', arr[1], arr[0])
            });
        };
        
        var _makeChartLabel = function(key, value, total) {
            return [ key, ": ", (value / total * 100).toFixed(0), "% (", value, "/", total, ")" ].join("");
        };
        
        var _getChartData = function(database, objectKey, totalKey) {
            "use strict";
            var characterChartData = [];
            var total = Object.keys(database[totalKey]).length;
            var sum = 0;
            if (database.ManagementInfo && database.ManagementInfo.UsersInfo) {
                var userInfo, value;
                for ( var key in database.ManagementInfo.UsersInfo) {
                    userInfo = database.ManagementInfo.UsersInfo[key];
                    value = userInfo[objectKey].length;
                    characterChartData.push({
                        value : value,
                        label : _makeChartLabel(key, value, total),
                    });
                    sum += value;
                }
                if (sum !== total) {
                    characterChartData.push({
                        value : total - sum,
                        label : _makeChartLabel("unknown", total - sum, total),
                    });
                }
            } else {
                characterChartData.push({
                    value : total,
                    label : _makeChartLabel("user", total, total),
                });
            }
            return characterChartData;
        };
        
        var _getEventCompletenessHist = function(database) {
            "use strict";
            var story, hist = [], storyCompleteness;
            for ( var storyName in database.Stories) {
                story = database.Stories[storyName];
                storyCompleteness = _calcStoryCompleteness(story);
                
                var keyParam = Math.floor(10 * storyCompleteness);
                if (hist[keyParam]) {
                    hist[keyParam].value++;
                    hist[keyParam].tip = hist[keyParam].tip + ", " + story.name + " (" + (100 * storyCompleteness).toFixed(0) + "%)";
                } else {
                    hist[keyParam] = {
                            value : 1,
                            label : keyParam,
                            tip : story.name + " (" + (100 * storyCompleteness).toFixed(0) + "%)"
                    }
                }
            }
            for (var i = 0; i < 11; i++) {
                if (!hist[i]) {
                    hist[i] = null;
                }
            }
            return hist;
        };
        
        var _getStoryAdaptationStats = function(story) {
            "use strict";
            var finishedAdaptations = 0;
            var allAdaptations = 0;
            story.events.forEach(function(event) {
                allAdaptations += Object.keys(event.characters).length;
                for ( var character in event.characters) {
                    if (event.characters[character].ready) {
                        finishedAdaptations++;
                    }
                }
            });
            return {
                finishedAdaptations : finishedAdaptations, 
                allAdaptations : allAdaptations
            };
        }
        
        var _calcStoryCompleteness = function(story) {
            "use strict";
            var stats = _getStoryAdaptationStats(story);
            return stats.allAdaptations !== 0 ? stats.finishedAdaptations / stats.allAdaptations : 0;
        }
        
        var _getStoryCompleteness = function(database) {
            "use strict";
            var finishedStories = 0, allStories = Object.keys(database.Stories).length;
            
            R.values(database.Stories).map(_getStoryAdaptationStats).forEach(function(stats){
                if (stats.allAdaptations === stats.finishedAdaptations && stats.allAdaptations != 0) {
                    finishedStories++;
                }
            });
            return [(finishedStories / (allStories === 0 ? 1 : allStories) * 100).toFixed(1), finishedStories, allStories];
        };
        
        var _getGeneralCompleteness = function(database) {
            "use strict";
            var finishedAdaptations = 0, allAdaptations = 0;
            
            R.values(database.Stories).map(_getStoryAdaptationStats).forEach(function(stats){
                finishedAdaptations += stats.finishedAdaptations;
                allAdaptations += stats.allAdaptations;
            });
            return [(finishedAdaptations / (allAdaptations === 0 ? 1 : allAdaptations) * 100).toFixed(1), finishedAdaptations, allAdaptations];
        };
        
        var _countTextCharacters = function(database) {
            "use strict";
            var noWhiteSpaceLength = function(str) {
                return str.replace(/\s/g, "").length;
            };
            var story, textCharacterNumber = 0, character, storyName;
            for (storyName in database.Stories) {
                story = database.Stories[storyName];
                textCharacterNumber += noWhiteSpaceLength(story.story);
                story.events.forEach(function(event) {
                    textCharacterNumber += noWhiteSpaceLength(event.text);
                    for (character in event.characters) {
                        textCharacterNumber += noWhiteSpaceLength(event.characters[character].text);
                    }
                });
            }
            return textCharacterNumber;
        };
        
        var _getFirstLastEventTime = function(database) {
            "use strict";
            var story, lastEvent = null, firstEvent = null, date;
            for ( var storyName in database.Stories) {
                story = database.Stories[storyName];
                story.events.forEach(function(event) {
                    if (event.time != "") {
                        date = new Date(event.time);
                        if (lastEvent === null || date > lastEvent) {
                            lastEvent = date;
                        }
                        if (firstEvent === null || date < firstEvent) {
                            firstEvent = date;
                        }
                    }
                });
            }
            return [ firstEvent, lastEvent ];
        };
        
        var _getHistogram = function(database, keyParamDelegate) {
            "use strict";
            var story, hist = [];
            for ( var storyName in database.Stories) {
                story = database.Stories[storyName];
                var keyParam = keyParamDelegate(story);
                if (hist[keyParam]) {
                    hist[keyParam].value++;
                    hist[keyParam].tip = hist[keyParam].tip + ", " + story.name;
                } else {
                    hist[keyParam] = {
                            value : 1,
                            label : keyParam,
                            tip : keyParam + ": " + story.name
                    }
                }
            }
            for (var i = 0; i < hist.length; i++) {
                if (!hist[i]) {
                    hist[i] = null;
                }
            }
            return hist;
        };
    };
    
    callback(statisticsAPI);

})(function(api){
    typeof exports === 'undefined'? this['statisticsAPI'] = api: module.exports = api;
});
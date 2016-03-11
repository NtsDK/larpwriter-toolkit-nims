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
    
    function statisticsAPI(LocalDBMS, R, Constants, CommonUtils) {
        
        LocalDBMS.prototype.getStatistics = function(callback) {
            "use strict";
            var statistics = {};
            statistics.storyNumber = Object.keys(this.database.Stories).length;
            statistics.characterNumber = Object.keys(this.database.Characters).length;

            statistics.eventsNumber = 0;
            for ( var storyName in this.database.Stories) {
                statistics.eventsNumber += this.database.Stories[storyName].events.length;
            }

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
            
//            var data = {};
            
            
//            var initBarData = R.cond([
//                [R.compose(R.equals('enum'), R.prop('type')), function(profileItem){
//                    var values = profileItem.value.split(",");
//                    return {
//                        chart : R.zipObj(values, R.repeat(0, values.length))
//                    };
//                }],
//                [R.compose(R.equals('checkbox'), R.prop('type')), R.always({
//                    chart : R.zipObj([Constants[true].name, Constants[false].name], [0,0])
//                })],
//                [R.T, R.always({
//                    "hist" : []
//                })],
//            ]);
//            
//            var data = R.zipObj(profileItems.map(R.prop('name')), profileItems.map(initBarData));
            
//            profileItems.forEach(function(profileItem) {
//                R.values(database.Characters).map(R.prop(profileItem.name))
//            }
            
//            var characters = R.values(database.Characters);
            var groupCharacters = R.groupBy(R.__, R.values(database.Characters));
            var groupedValues = profileItems.map(function(profileItem) {
                if (profileItem.type === "enum" || profileItem.type === "checkbox") {
                    return groupCharacters(R.prop(profileItem.name));
                } else {
                    return groupCharacters(function(character){
                        return Math.floor(character[profileItem.name] / 5)
                    });
                }
            });
            
            groupedValues = groupedValues.map(function(group){
                return R.fromPairs(R.toPairs(group).map(function(elem){
                    elem[1] = elem[1].length;
                    return elem;
                }));
            });
                    
//            var baseInfo = profileItems.map(R.pick(['name', 'type']));
            
            var res = R.transpose([profileItems, groupedValues]).map(function(arr){
                return R.assoc('data', arr[1], arr[0])
            });
            
//            R.values(database.Characters).forEach(function(character) {
//                profileItems.forEach(function(profileItem) {
//                    var dataObj = data[profileItem.name];
//                    if (profileItem.type === "enum") {
//                        dataObj.chart[character[profileItem.name]]++;
//                    }
//                    if (profileItem.type === "checkbox") {
////                        var type = Constants[character[profileItem.name]].displayName();
//                        var type = Constants[character[profileItem.name]].name;
//                        dataObj.chart[type]++;
//                    }
//                    if (profileItem.type === "number") {
//                        var pos = Math.floor(character[profileItem.name] / 5);
//                        dataObj.hist[pos] = dataObj.hist[pos] ? (dataObj.hist[pos] + 1) : 1;
//                    }
//                });
//            });
//            
//            profileItems.forEach(function(value) {
//                if (value.type === "number") {
//                    data[value.name].hist = _toHist(data[value.name].hist);
//                } else {
//                    data[value.name].chart = _toChart(data[value.name].chart);
//                }
//            });
//            return data;
            return res;
        };
        

//        var _toHist = function(array) {
//
//        };
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
        
        var _calcStoryCompleteness = function(story) {
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
            return finishedAdaptations / allAdaptations;
        }
        
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
        
        var _getStoryCompleteness = function(database) {
            "use strict";
            var story, generalCompletness, finishedAdaptations, allAdaptations, finishedStories = 0, allStories = Object.keys(database.Stories).length;
            
            for ( var storyName in database.Stories) {
                story = database.Stories[storyName];
                finishedAdaptations = 0;
                allAdaptations = 0;
                story.events.forEach(function(event) {
                    allAdaptations += Object.keys(event.characters).length;
                    for ( var character in event.characters) {
                        if (event.characters[character].ready) {
                            finishedAdaptations++;
                        }
                    }
                });
                if (allAdaptations === finishedAdaptations) {
                    finishedStories++;
                }
            }
            return [(finishedStories / (allStories === 0 ? 1 : allStories) * 100).toFixed(1), finishedStories, allStories];
        };
        
        var _getGeneralCompleteness = function(database) {
            "use strict";
            var story, generalCompletness, finishedAdaptations = 0, allAdaptations = 0;
            for ( var storyName in database.Stories) {
                story = database.Stories[storyName];
                story.events.forEach(function(event) {
                    allAdaptations += Object.keys(event.characters).length;
                    for ( var character in event.characters) {
                        if (event.characters[character].ready) {
                            finishedAdaptations++;
                        }
                    }
                });
            }
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
            var story, storyCharactersHist = [];
            for ( var storyName in database.Stories) {
                story = database.Stories[storyName];
                var keyParam = keyParamDelegate(story);
                if (storyCharactersHist[keyParam]) {
                    storyCharactersHist[keyParam].value++;
                    storyCharactersHist[keyParam].tip = storyCharactersHist[keyParam].tip + ", " + story.name;
                } else {
                    storyCharactersHist[keyParam] = {
                            value : 1,
                            label : keyParam,
                            tip : keyParam + ": " + story.name
                    }
                }
            }
            for (var i = 0; i < storyCharactersHist.length; i++) {
                if (!storyCharactersHist[i]) {
                    storyCharactersHist[i] = null;
                }
            }
            return storyCharactersHist;
        };
    };
    
    callback(statisticsAPI);

})(function(api){
    typeof exports === 'undefined'? this['statisticsAPI'] = api: module.exports = api;
});
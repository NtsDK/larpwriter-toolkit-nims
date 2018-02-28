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

'use strict';

/* eslint-disable func-names */

((callback2) => {
    function statisticsAPI(LocalDBMS, opts) {
        const { R, CommonUtils } = opts;

        let _countCharacterSymbols;

        LocalDBMS.prototype.getStatistics = function (callback) {
            const that = this;
            this.getAllCharacterGroupTexts((err, groupTexts) => {
                if (err) { callback(err); return; }
                _getStatistics(that.database, groupTexts, callback);
            });
        };

        function _getStatistics(database, groupTexts, callback) {
            const statistics = {};
            statistics.storyNumber = Object.keys(database.Stories).length;
            statistics.characterNumber = Object.keys(database.Characters).length;
            statistics.groupNumber = Object.keys(database.Groups).length;
            statistics.playerNumber = Object.keys(database.Players).length;

            statistics.eventsNumber = R.sum(R.values(database.Stories).map(R.compose(R.length, R.prop('events'))));

            statistics.userNumber = 1;
            if (database.ManagementInfo && database.ManagementInfo.UsersInfo) {
                statistics.userNumber = Object.keys(database.ManagementInfo.UsersInfo).length;
            }

            statistics.textCharactersCount = _countTextCharacters(database);
            statistics.textCharacterNumber = R.sum(R.values(statistics.textCharactersCount));
            statistics.bindingStats = _countBindingStats(database);

            const firstLastEventTime = _getFirstLastEventTime(database);

            statistics.firstEvent = firstLastEventTime[0] ? firstLastEventTime[0] : '';
            statistics.lastEvent = firstLastEventTime[1] ? firstLastEventTime[1] : '';

            statistics.storyEventsHist = _getHistogram(database, story => story.events.length);

            statistics.storyCharactersHist = _getHistogram(database, story => Object.keys(story.characters).length);

            statistics.eventCompletenessHist = _getEventCompletenessHist(database);
            statistics.characterStoriesHist = _getCharacterHist(database, _countCharactersInStories);
            statistics.characterSymbolsHist = _getCharacterHist(database, _countCharacterSymbols(groupTexts));

            statistics.generalCompleteness = _getGeneralCompleteness(database);
            statistics.storyCompleteness = _getStoryCompleteness(database);

            statistics.characterChart = _getChartData(database, 'characters', 'Characters');
            statistics.storyChart = _getChartData(database, 'stories', 'Stories');
            statistics.groupChart = _getChartData(database, 'groups', 'Groups');
            statistics.playerChart = _getChartData(database, 'players', 'Players');

            statistics.profileCharts = _getProfileChartData(database);

            callback(null, statistics);
        }

        function _makeNumberStep(array) {
            const max = array.reduce((max2, cur) => (cur > max2 ? cur : max2), array[0]);
            const min = array.reduce((min3, cur) => (cur < min3 ? cur : min3), array[0]);
            let step = Math.ceil((max - min) / 20);
            step = step === 0 ? 1 : step;
            let base = 1;
            while (step > base * 10) {
                base *= 10;
            }
            const arr = [1, 2, 5, 10, 12];
            for (let i = 0; i < arr.length - 1; i++) {
                if (base * arr[i] < step && step < base * arr[i + 1]) {
                    step = base * arr[i];
                    break;
                }
            }
            return step;
        }

        const filter = R.compose(R.contains(R.__, ['enum', 'number', 'checkbox']), R.prop('type'));

        function _getProfileChartData(database) {
            const characterCharts = _getProfileChartArray(database, 'Characters', 'CharacterProfileStructure');
            const playerCharts = _getProfileChartArray(database, 'Players', 'PlayerProfileStructure');
            const postProcess = R.curry((prefix, el) => {
                el.id = prefix + el.name;
                return el;
            });
            return {
                characterCharts: characterCharts.map(postProcess('character-')),
                playerCharts: playerCharts.map(postProcess('player-'))
            };
        }

        function _getProfileChartArray(database, profileType, profileStructureType) {
            const profileItems = database[profileStructureType].filter(filter).map(R.pick(['name', 'type']));

            const groupProfiles = R.groupBy(R.__, R.values(database[profileType]));
            const groupReduce = group => R.fromPairs(R.toPairs(group).map((elem) => {
                elem[1] = elem[1].length;
                return elem;
            }));
            const groupedValues = profileItems.map((profileItem) => {
                if (profileItem.type === 'enum' || profileItem.type === 'checkbox') {
                    return groupReduce(groupProfiles(R.prop(profileItem.name)));
                } else if (profileItem.type === 'number') {
                    const array = R.ap([R.prop(profileItem.name)], R.values(database[profileType]));
                    const step = _makeNumberStep(array);
                    return {
                        groups: groupReduce(groupProfiles(profile => Math.floor(profile[profileItem.name] / step))),
                        step
                    };
                }
                throw new Error(`Unexpected profile item type: ${profileItem.type}`);
            });

            return R.transpose([profileItems, groupedValues]).map(arr => R.assoc('data', arr[1], arr[0]));
        }

        function _makeChartLabel(key, value, total) {
            return [key, ': ', ((value / total) * 100).toFixed(0), '% (', value, '/', total, ')'].join('');
        }

        function _getChartData(database, objectKey, totalKey) {
            const characterChartData = [];
            const total = Object.keys(database[totalKey]).length;
            let sum = 0;
            if (database.ManagementInfo && database.ManagementInfo.UsersInfo) {
                let userInfo, value;
                R.keys(database.ManagementInfo.UsersInfo).forEach((key) => {
                    userInfo = database.ManagementInfo.UsersInfo[key];
                    value = userInfo[objectKey].length;
                    characterChartData.push({
                        value,
                        label: _makeChartLabel(key, value, total),
                    });
                    sum += value;
                });
                if (sum !== total) {
                    characterChartData.push({
                        value: total - sum,
                        label: _makeChartLabel('unknown', total - sum, total),
                    });
                }
            } else {
                characterChartData.push({
                    value: total,
                    label: _makeChartLabel('user', total, total),
                });
            }
            return characterChartData;
        }

        function _addToHist(hist, value, keyParam, label, startValue, mergeValues) {
            if (hist[keyParam]) {
                hist[keyParam].value = mergeValues(hist[keyParam].value, value);
                hist[keyParam].tip.push(label);
            } else {
                hist[keyParam] = {
                    value: startValue(value),
                    label: keyParam,
                    tip: [label]
                };
            }
        }

        function _countCharactersInStories(database, stats) {
            R.values(database.Stories).forEach((story) => {
                R.keys(story.characters).forEach((characterName) => {
                    stats[characterName]++;
                });
            });
        }

        _countCharacterSymbols = R.curry((groupTexts, database, stats) => {
            R.values(database.Stories).forEach((story) => {
                story.events.forEach((event) => {
                    R.keys(event.characters).forEach((characterName) => {
                        if (event.characters[characterName].text.length !== 0) {
                            stats[characterName] += _noWhiteSpaceLength(event.characters[characterName].text);
                        } else {
                            stats[characterName] += _noWhiteSpaceLength(event.text);
                        }
                    });
                });
            });
            R.keys(groupTexts).forEach((characterName) => {
                stats[characterName] += R.sum(groupTexts[characterName].map(R.pipe(R.prop('text'), _noWhiteSpaceLength)));
            });
        });

        function _makeLabel(characterName, stat) {
            return `${characterName} (${stat})`;
        }

        function _makeTip(keyParam, step, tipData) {
            return `${keyParam * step}-${((keyParam + 1) * step) - 1}: ${tipData.join(', ')}`;
        }

        function _getCharacterHist(database, statsCollector) {
            const characterList = R.keys(database.Characters);
            const stats = R.zipObj(characterList, R.repeat(0, characterList.length));

            statsCollector(database, stats);

            const array = R.values(stats);
            const step = _makeNumberStep(array);

            const hist = R.keys(stats).reduce((hist2, characterName) => {
                const keyParam = Math.floor(stats[characterName] / step);
                _addToHist(hist2, 1, keyParam, _makeLabel(characterName, stats[characterName]), R.always(1), R.add);
                return hist2;
            }, []);

            for (let i = 0; i < R.max(hist.length, 10); i++) {
                if (!hist[i]) {
                    hist[i] = null;
                } else {
                    hist[i].tip = _makeTip(i, step, hist[i].tip);
                }
            }
            return hist;
        }

        function _getEventCompletenessHist(database) {
            const hist = [];
            R.values(database.Stories).forEach((story) => {
                const storyCompleteness = _calcStoryCompleteness(story);
                const keyParam = Math.floor(10 * storyCompleteness);
                const label = `${story.name} (${(100 * storyCompleteness).toFixed(0)}%)`;
                _addToHist(hist, 1, keyParam, label, R.always(1), R.add);
            });
            for (let i = 0; i < 11; i++) {
                if (!hist[i]) {
                    hist[i] = null;
                } else {
                    hist[i].tip = hist[i].tip.join(', ');
                }
            }
            return hist;
        }

        function _getStoryAdaptationStats(story) {
            let finishedAdaptations = 0;
            let allAdaptations = 0;
            story.events.forEach((event) => {
                allAdaptations += Object.keys(event.characters).length;
                finishedAdaptations += R.values(event.characters).filter(R.prop('ready')).length;
            });
            return {
                finishedAdaptations,
                allAdaptations
            };
        }

        function _calcStoryCompleteness(story) {
            const stats = _getStoryAdaptationStats(story);
            return stats.allAdaptations !== 0 ? stats.finishedAdaptations / stats.allAdaptations : 0;
        }

        const calcPercent = (part, all) => ((part / (all === 0 ? 1 : all)) * 100).toFixed(1);

        function _getStoryCompleteness(database) {
            const allStories = Object.keys(database.Stories).length;
            const finishedStories = R.values(database.Stories).map(_getStoryAdaptationStats)
                .filter(stats => stats.allAdaptations === stats.finishedAdaptations && stats.allAdaptations !== 0)
                .length;
            return [calcPercent(finishedStories, allStories), finishedStories, allStories];
        }

        function _getGeneralCompleteness(database) {
            let finishedAdaptations = 0, allAdaptations = 0;

            R.values(database.Stories).map(_getStoryAdaptationStats).forEach((stats) => {
                finishedAdaptations += stats.finishedAdaptations;
                allAdaptations += stats.allAdaptations;
            });
            return [calcPercent(finishedAdaptations, allAdaptations), finishedAdaptations, allAdaptations];
        }

        function _noWhiteSpaceLength(str) {
            return str.replace(/\s/g, '').length;
        }

        function _countTextCharacters(database) {
            const counts = {
                masterStories: 0,
                eventOrigins: 0,
                eventAdaptations: 0,
                groups: 0,
                relations: 0,
            };
            R.values(database.Stories).forEach((story) => {
                counts.masterStories += _noWhiteSpaceLength(story.story);
                story.events.forEach((event) => {
                    counts.eventOrigins += _noWhiteSpaceLength(event.text);
                    R.keys(event.characters).forEach((character) => {
                        counts.eventAdaptations += _noWhiteSpaceLength(event.characters[character].text);
                    });
                });
            });
            counts.groups = R.sum(R.values(database.Groups).map(R.compose(_noWhiteSpaceLength, R.prop('characterDescription'))));
            counts.relations = R.sum(R.flatten(database.Relations.map(R.pipe(R.omit(['essence', 'ready']), R.values))).map(_noWhiteSpaceLength));
            return counts;
        }

        function _countBindingStats(database) {
            const charNum = R.keys(database.Characters).length;
            const playerNum = R.keys(database.Players).length;
            const bindingNum = R.keys(database.ProfileBindings).length;

            return {
                freeCharacters: charNum - bindingNum,
                freePlayers: playerNum - bindingNum,
                bindingNum,
            };
        }

        function _getFirstLastEventTime(database) {
            let lastEvent = null, firstEvent = null;
            R.values(database.Stories).forEach((story) => {
                story.events.filter(event => event.time !== '').forEach((event) => {
                    const date = new Date(event.time);
                    if (lastEvent === null || date > lastEvent) {
                        lastEvent = date;
                    }
                    if (firstEvent === null || date < firstEvent) {
                        firstEvent = date;
                    }
                });
            });
            return [firstEvent, lastEvent];
        }

        function _getHistogram(database, keyParamDelegate) {
            const hist = [];
            R.values(database.Stories).forEach((story) => {
                const keyParam = keyParamDelegate(story);
                _addToHist(hist, 1, keyParam, story.name, R.always(1), R.add);
            });
            for (let i = 0; i < hist.length; i++) {
                if (!hist[i]) {
                    hist[i] = null;
                } else {
                    hist[i].tip = `${i}: ${hist[i].tip.join(', ')}`;
                }
            }
            return hist;
        }
    }

    callback2(statisticsAPI);
})(api => (typeof exports === 'undefined' ? (this.statisticsAPI = api) : (module.exports = api)));

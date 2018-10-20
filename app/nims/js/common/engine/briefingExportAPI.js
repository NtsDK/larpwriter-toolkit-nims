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
    function briefingExportAPI(LocalDBMS, opts) {
        const {
            R, Constants, dbmsUtils, CU, PC
        } = opts;

        const check = (selChars, selStories, exportOnlyFinishedStories, database) => {
            const charsCheck = PC.eitherCheck(PC.chainCheck([PC.isArray(selChars),
                PC.entitiesExist(selChars, R.keys(database.Characters))]), PC.isNil(selChars));
            const storiesCheck = PC.eitherCheck(PC.chainCheck([PC.isArray(selStories),
                PC.entitiesExist(selStories, R.keys(database.Stories))]), PC.isNil(selStories));
            return PC.chainCheck([charsCheck, storiesCheck, PC.isBoolean(exportOnlyFinishedStories)]);
        };

        let _getBriefingData, _makeProfileInfo, _makeRelationsInfo, _makeCharInventory,
            _getProfileInfoNotEmpty, _getSimpleProfileInfoObject, _getSplittedProfileInfoObject, _getProfileInfoArray,
            _getStoriesInfo, _getEventsInfo, _getStoryEventsInfo, _makeEventInfo, _splitText;

//  [
//      {
//          name: 'selCharacters',
//          check: [{
//              type: 'either',
//              or: [{
//                  type: 'isNil'
//              }, [{
//                      type: 'isArray',
//                      subType: 'string'
//                  }, {
//                      type: 'entitiesExist',
//                      arr: (db) => R.keys(db.Characters)
//                  }]
//              ]
//          }]
//      },
//      {
//          name: 'selStories',
//          check: [{
//              type: 'either',
//              or: [{
//                  type: 'isNil'
//              }, [{
//                  type: 'isArray',
//                  subType: 'string'
//              }, {
//                  type: 'entitiesExist',
//                  arr: (db) => R.keys(db.Stories)
//              }]
//              ]
//          }]
//      },
//      {
//          name: 'exportOnlyFinishedStories',
//          check:
//              type: 'isBoolean'
//          }]
//      }
//  ]

        // DBMS.briefings.get()
        LocalDBMS.prototype.getBriefingData = function (
            {selCharacters, selStories, exportOnlyFinishedStories}={}
        ) {
            return new Promise((resolve, reject) => {
                PC.precondition(
                    check(selCharacters, selStories, exportOnlyFinishedStories, this.database), reject,
                    () => {
                        const that = this;
                        selCharacters = selCharacters || R.keys(this.database.Characters);
                        selStories = selStories || R.keys(this.database.Stories);
                        that.getAllCharacterGroupTexts().then((groupTexts) => {
                            _getBriefingData(
                                that.database, selCharacters, selStories, groupTexts, exportOnlyFinishedStories,
                                (err, res) => {
                                    if(err) {
                                        reject(err)
                                    } else {
                                        resolve(res);
                                    }
                                }
                            );
                        }).catch(reject);
                    }
                );
            });
        };

        _getBriefingData = (
            database, selectedCharacters, selectedStories, groupTexts, exportOnlyFinishedStories,
            callback
        ) => {
            const charArray = selectedCharacters.map((charName) => {
                groupTexts[charName].forEach((groupText) => {
                    groupText.splittedText = _splitText(groupText.text);
                });
                let dataObject = {
                    gameName: database.Meta.name,
                    charName,
                    inventory: _makeCharInventory(database, charName),
                    storiesInfo: _getStoriesInfo(database, charName, selectedStories, exportOnlyFinishedStories),
                    eventsInfo: _getEventsInfo(database, charName, selectedStories, exportOnlyFinishedStories),
                    groupTexts: groupTexts[charName],
                    relations: _makeRelationsInfo(dbmsUtils._getKnownCharacters(database, charName), database, charName)
                };

                dataObject = R.merge(dataObject, _makeProfileInfo(charName, 'character', database));

                const playerName = database.ProfileBindings[charName];
                if (playerName !== undefined) {
                    dataObject = R.merge(dataObject, _makeProfileInfo(playerName, 'player', database));
                    dataObject.playerName = playerName;
                }

                return dataObject;
            });

            charArray.sort(CU.charOrdAFactory(R.prop('charName')));
            callback(null, {
                briefings: charArray,
                gameName: database.Meta.name
            });
        };

        _makeProfileInfo = (profileName, profileType, database) => {
            let profileStructure, prefix, profile;
            if (profileType === 'character') {
                profileStructure = database.CharacterProfileStructure;
                prefix = 'profileInfo';
                profile = database.Characters[profileName];
            } else if (profileType === 'player') {
                profileStructure = database.PlayerProfileStructure;
                prefix = 'playerInfo';
                profile = database.Players[profileName];
            } else {
                throw new Error(`Unexpected profile type ${profileType}`);
            }
            let dataObject = {};
            dataObject[`${prefix}Array`] = _getProfileInfoArray(profile, profileStructure);
            dataObject = R.merge(dataObject, _getSimpleProfileInfoObject(`${prefix}-`, profile, profileStructure));
            dataObject = R.merge(dataObject, _getSplittedProfileInfoObject(
                `${prefix}-splitted-`, profile,
                profileStructure
            ));
            dataObject = R.merge(dataObject, _getProfileInfoNotEmpty(`${prefix}-notEmpty-`, profile, profileStructure));
            return dataObject;
        };

        _makeRelationsInfo = (knownCharacters, database, charName) => {
            const relations = database.Relations.filter(R.has(charName));
            const exportInfo = relations.map( relation => {
                const charIsStarter = relation.starter === charName;
                const toCharacter = charIsStarter ? relation.ender: relation.starter;
                let obj = {
                    toCharacter,
                    text: relation[charName],
                    splittedText: _splitText(relation[charName]),
                    stories: R.keys(knownCharacters[charName] || {}).join(', ')
                };
                obj = R.merge(obj, _makeProfileInfo(toCharacter, 'character', database));
                return obj;
            });
            exportInfo.sort(CU.charOrdAFactory(R.prop('toCharacter')));
            return exportInfo;
        };

        _makeCharInventory = (database, charName) => R.values(database.Stories)
            .filter(story => !R.isNil(story.characters[charName]) && !R.isEmpty(story.characters[charName].inventory))
            .map(story => story.characters[charName].inventory).join(', ');

        const _processProfileInfo = R.curry((processor, prefix, profile, profileStructure) =>
            R.fromPairs(profileStructure.map(element => [prefix + element.name, processor(profile[element.name])])));

        _getProfileInfoNotEmpty = _processProfileInfo(el => String(el).length !== 0);
        _getSimpleProfileInfoObject = _processProfileInfo(el => (el));
        _getSplittedProfileInfoObject = _processProfileInfo(el => (_splitText(String(el))));

        _getProfileInfoArray = (profile, profileStructure) => {
            let value, splittedText;
            const filter = R.compose(R.equals(true), R.prop('doExport'));
            return profileStructure.filter(filter).map((element) => {
                value = profile[element.name];
                return {
                    itemName: element.name,
                    value,
                    splittedText: _splitText(String(value)),
                    notEmpty: String(value).length !== 0
                };
            });
        };

        _getStoriesInfo = (database, charName, selectedStories, exportOnlyFinishedStories) =>
            R.values(database.Stories).filter((story) => {
                if (!R.contains(story.name, selectedStories)) return false;
                if (exportOnlyFinishedStories) {
                    if (!dbmsUtils._isStoryFinished(database, story.name) ||
                        dbmsUtils._isStoryEmpty(database, story.name)) {
                        return false;
                    }
                }
                return story.characters[charName];
            }).map(story => ({
                storyName: story.name,
                eventsInfo: _getStoryEventsInfo(story, charName, database.Meta.date)
            })).sort(CU.charOrdAFactory(a => a.storyName.toLowerCase()));

        _getEventsInfo = (database, charName, selectedStories, exportOnlyFinishedStories) => {
            let eventsInfo = R.values(database.Stories).filter((story) => {
                if (!R.contains(story.name, selectedStories)) return false;
                if (exportOnlyFinishedStories) {
                    if (!dbmsUtils._isStoryFinished(database, story.name) ||
                            dbmsUtils._isStoryEmpty(database, story.name)) {
                        return false;
                    }
                }
                return story.characters[charName];
            }).map(story => _getStoryEventsInfo(story, charName, database.Meta.date));

            eventsInfo = eventsInfo.reduce((result, array) => result.concat(array), []);

            eventsInfo.sort(CU.eventsByTime);

            return eventsInfo;
        };

        _getStoryEventsInfo = (story, charName, defaultTime) =>
            story.events.filter(event => event.characters[charName])
                .map(_makeEventInfo(charName, story.name, defaultTime));

        _makeEventInfo = R.curry((charName, storyName, defaultTime, event) => {
            const eventInfo = {};
            if (event.characters[charName].text !== '') {
                eventInfo.text = event.characters[charName].text;
            } else {
                eventInfo.text = event.text;
            }
            eventInfo.splittedText = _splitText(eventInfo.text);
            eventInfo.time = event.time === '' ? defaultTime : event.time;
            if (event.characters[charName].time !== '') {
                eventInfo.displayTime = event.characters[charName].time;
            } else {
                eventInfo.displayTime = eventInfo.time;
            }
            eventInfo.eventName = event.name;
            eventInfo.storyName = storyName;
            return eventInfo;
        });

        _splitText = text => text.split('\n').map(string => ({ string }));
    }
    callback2(briefingExportAPI);
})(api => (typeof exports === 'undefined' ? (this.briefingExportAPI = api) : (module.exports = api)));

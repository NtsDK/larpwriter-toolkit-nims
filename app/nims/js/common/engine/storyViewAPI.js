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

/* eslint-disable func-names */

((callback2) => {
    function storyViewAPI(LocalDBMS, opts) {
        const {
            R, dateFormat, CU, PC
        } = opts;

        const characterCheck = (characterName, database) => PC.chainCheck([PC.isString(characterName),
            PC.entityExists(characterName, R.keys(database.Characters))]);

        // preview
        LocalDBMS.prototype.getAllInventoryLists = function (characterName, callback) {
            PC.precondition(characterCheck(characterName, this.database), callback, () => {
                const array = R.values(this.database.Stories)
                    .filter(story => story.characters[characterName] !== undefined &&
                        story.characters[characterName].inventory !== '')
                    .map(story => ({
                        storyName: story.name,
                        inventory: story.characters[characterName].inventory
                    }));
                callback(null, array);
            });
        };

        // preview
        LocalDBMS.prototype.getCharacterEventGroupsByStory = function (characterName, callback) {
            PC.precondition(characterCheck(characterName, this.database), callback, () => {
                const eventGroups = [];

                let events;

                const that = this;
                Object.keys(this.database.Stories).filter(storyName =>
                    that.database.Stories[storyName].characters[characterName]).forEach((storyName) => {
                    events = [];

                    const tmpEvents = CU.clone(that.database.Stories[storyName].events);
                    tmpEvents.map((elem, i) => {
                        elem.index = i;
                        elem.storyName = storyName;
                        elem.isTimeEmpty = elem.time === '';
                        elem.time = elem.isTimeEmpty ? that.database.Meta.date : elem.time;
                        return elem;
                    }).filter(event => event.characters[characterName]).forEach((event) => {
                        events.push(event);
                    });

                    eventGroups.push({
                        storyName,
                        events
                    });
                });
                eventGroups.sort(CU.charOrdAFactory(R.prop('storyName')));
                callback(null, eventGroups);
            });
        };

        // preview
        LocalDBMS.prototype.getCharacterEventsByTime = function (characterName, callback) {
            PC.precondition(characterCheck(characterName, this.database), callback, () => {
                let allEvents = [];

                const that = this;
                Object.keys(this.database.Stories).filter(storyName =>
                    that.database.Stories[storyName].characters[characterName]).forEach((storyName) => {
                    const events = CU.clone(that.database.Stories[storyName].events);
                    allEvents = allEvents.concat(events.map((elem, i) => {
                        elem.index = i;
                        elem.storyName = storyName;
                        elem.isTimeEmpty = elem.time === '';
                        elem.time = elem.isTimeEmpty ? that.database.Meta.date : elem.time;
                        return elem;
                    }).filter(event => event.characters[characterName]));
                });

                allEvents.sort(CU.eventsByTime);
                callback(null, allEvents);
            });
        };

        // timeline
        LocalDBMS.prototype.getEventsTimeInfo = function (callback) {
            const result = R.flatten(R.values(CU.clone(this.database.Stories)).map(story => story.events.map((event, index) => R.merge(R.pick(['name', 'time'], event), {
                characters: R.keys(event.characters),
                storyName: story.name,
                index
            }))));

            callback(null, result);
        };

        // character filter
        LocalDBMS.prototype.getCharactersSummary = function (callback) {
            const characters = R.keys(this.database.Characters);
            const charactersInfo = {};
            characters.forEach((character) => {
                charactersInfo[character] = {
                    active: 0,
                    follower: 0,
                    defensive: 0,
                    passive: 0,
                    totalAdaptations: 0,
                    finishedAdaptations: 0,
                    totalStories: 0
                };
            });

            R.values(this.database.Stories).forEach((story) => {
                R.values(story.characters).forEach((storyCharacter) => {
                    const characterInfo = charactersInfo[storyCharacter.name];
                    characterInfo.totalStories++;
                    R.toPairs(storyCharacter.activity).forEach((activity) => {
                        if (activity[1] === true) {
                            characterInfo[activity[0]]++;
                        }
                    });
                });
                story.events.forEach((event) => {
                    R.toPairs(event.characters).forEach((eventCharacter) => {
                        const characterInfo = charactersInfo[eventCharacter[0]];
                        characterInfo.totalAdaptations++;
                        if (eventCharacter[1].ready) {
                            characterInfo.finishedAdaptations++;
                        }
                    });
                });
            });
            R.values(charactersInfo).forEach((characterInfo) => {
                characterInfo.completeness = Math.round((characterInfo.finishedAdaptations * 100) /
                    (characterInfo.totalAdaptations !== 0 ? characterInfo.totalAdaptations : 1));
            });
            callback(null, charactersInfo);
        };

        // character profile
        LocalDBMS.prototype.getCharacterReport = function (characterName, callback) {
            PC.precondition(characterCheck(characterName, this.database), callback, () => {
                const characterReport = R.values(this.database.Stories)
                    .filter(story => story.characters[characterName] !== undefined)
                    .map((story) => {
                        const charEvents = story.events.filter(event => event.characters[characterName] !== undefined);

                        const finishedAdaptations = charEvents
                            .filter(event => event.characters[characterName].ready === true).length;

                        let meets = {};
                        charEvents.forEach((event) => {
                            const chars = R.keys(event.characters);
                            meets = R.merge(meets, R.zipObj(chars, R.repeat(true, chars.length)));
                        });

                        delete meets[characterName];
                        meets = R.keys(meets).sort(CU.charOrdA);


                        return {
                            storyName: story.name,
                            inventory: story.characters[characterName].inventory,
                            activity: story.characters[characterName].activity,
                            meets,
                            totalAdaptations: charEvents.length,
                            finishedAdaptations
                        };
                    });
                characterReport.sort(CU.charOrdAFactory(R.prop('storyName')));

                callback(null, characterReport);
            });
        };
    }
    callback2(storyViewAPI);
})(api => (typeof exports === 'undefined' ? (this.storyViewAPI = api) : (module.exports = api)));

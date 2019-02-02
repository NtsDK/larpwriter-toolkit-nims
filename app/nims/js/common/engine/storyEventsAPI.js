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
    function storyEventsAPI(LocalDBMS, opts) {
        const {
            R, Errors, Constants, CU, PC
        } = opts;

        //story events, event presence
        LocalDBMS.prototype.getStoryEvents = function ({storyName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
                    resolve(R.clone(this.database.Stories[storyName].events));
                });
            });
        };

        //story events
        LocalDBMS.prototype.createEvent = function ({storyName, eventName, selectedIndex}={}) {
            return new Promise((resolve, reject) => {
                const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(selectedIndex),
                    PC.isString(eventName), PC.isNotEmptyString(eventName)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const story = this.database.Stories[storyName];
                    PC.precondition(PC.isInRange(selectedIndex, 0, story.events.length), reject, () => {
                        const event = {
                            name: eventName,
                            text: '',
                            time: '',
                            characters: {}
                        };
                        story.events.splice(selectedIndex, 0, event);
                        resolve();
                    });
                });
            });
        };

        //story events
        LocalDBMS.prototype.moveEvent = function ({storyName, index, newIndex}={}) {
            return new Promise((resolve, reject) => {
                let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(index),
                    PC.isNumber(newIndex)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const { events } = this.database.Stories[storyName];
                    chain = [PC.isInRange(index, 0, events.length - 1), PC.isInRange(newIndex, 0, events.length)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        if (newIndex > index) {
                            newIndex--;
                        }
                        const tmp = events[index];
                        events.splice(index, 1);
                        events.splice(newIndex, 0, tmp);
                        resolve();
                    });
                });
            });
        };

        //story events
        LocalDBMS.prototype.cloneEvent = function ({storyName, index}={}) {
            return new Promise((resolve, reject) => {
                let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(index)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const { events } = this.database.Stories[storyName];
                    chain = [PC.isInRange(index, 0, events.length - 1)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        events.splice(index, 0, R.clone(events[index]));
                        resolve();
                    });
                });
            });
        };

        //story events
        LocalDBMS.prototype.mergeEvents = function ({storyName, index}={}) {
            return new Promise((resolve, reject) => {
                let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(index)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const { events } = this.database.Stories[storyName];
                    chain = [PC.isInRange(index, 0, events.length - 2)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        const event1 = events[index];
                        const event2 = events[index + 1];

                        event1.name += `/${event2.name}`;
                        event1.text += `\n\n${event2.text}`;
                        R.keys(event2.characters).forEach((characterName) => {
                            if (event1.characters[characterName]) {
                                event1.characters[characterName].text += `\n\n${event2.characters[characterName].text}`;
                                event1.characters[characterName].time += `/${event2.characters[characterName].time}`;
                                event1.characters[characterName].ready = false;
                            } else {
                                event1.characters[characterName] = event2.characters[characterName];
                            }
                        });
                        CU.removeFromArrayByIndex(events, index + 1);

                        resolve();
                    });
                });
            });
        };

        //story events
        LocalDBMS.prototype.removeEvent = function ({storyName, index}={}) {
            return new Promise((resolve, reject) => {
                let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(index)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const { events } = this.database.Stories[storyName];
                    chain = [PC.isInRange(index, 0, events.length - 1)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        CU.removeFromArrayByIndex(events, index);
                        resolve();
                    });
                });
            });
        };

        // story events, preview, adaptations
        LocalDBMS.prototype.setEventOriginProperty = function ({storyName, index, property, value}={}) {
            return new Promise((resolve, reject) => {
                let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(index),
                    PC.isString(property), PC.elementFromEnum(property, Constants.originProperties), PC.isString(value)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const story = this.database.Stories[storyName];
                    chain = [PC.isInRange(index, 0, story.events.length - 1)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        story.events[index][property] = value;
                        resolve();
                    });
                });
            });
        };
    }
    callback2(storyEventsAPI);
})(api => (typeof exports === 'undefined' ? (this.storyEventsAPI = api) : (module.exports = api)));

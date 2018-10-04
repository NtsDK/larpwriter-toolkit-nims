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
    function storyCharactersAPI(LocalDBMS, opts) {
        const {
            R, Errors, addListener, Constants, CU, PC
        } = opts;

        //event presence
        LocalDBMS.prototype.getStoryCharacterNamesArray = function (storyName, callback) {
            this.getStoryCharacterNamesArrayNew({storyName}).then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getStoryCharacterNamesArrayNew = function ({storyName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
                    const localCharacters = this.database.Stories[storyName].characters;
                    resolve(Object.keys(localCharacters).sort(CU.charOrdA));
                });
            });
        };

        //story characters
        LocalDBMS.prototype.getStoryCharacters = function (storyName, callback) {
            this.getStoryCharactersNew({storyName}).then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getStoryCharactersNew = function ({storyName}={}, callback) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
                    resolve(CU.clone(this.database.Stories[storyName].characters));
                });
            });
        };

        //story characters
        LocalDBMS.prototype.addStoryCharacter = function (storyName, characterName, callback) {
            this.addStoryCharacterNew({storyName, characterName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.addStoryCharacterNew = function ({storyName, characterName}={}) {
            return new Promise((resolve, reject) => {
                const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)),
                    PC.entityExistsCheck(characterName, R.keys(this.database.Characters))];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const story = this.database.Stories[storyName];
                    PC.precondition(PC.entityIsNotUsed(characterName, R.keys(story.characters)), reject, () => {
                        story.characters[characterName] = {
                            name: characterName,
                            inventory: '',
                            activity: {}
                        };

                        resolve();
                    });
                });
            });
        };

        //story characters
        LocalDBMS.prototype.switchStoryCharacters = function (storyName, fromName, toName, callback) {
            this.switchStoryCharactersNew({storyName, fromName, toName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.switchStoryCharactersNew = function ({storyName, fromName, toName}={}) {
            return new Promise((resolve, reject) => {
                let cond = PC.entityExistsCheck(storyName, R.keys(this.database.Stories));
                PC.precondition(cond, reject, () => {
                    const story = this.database.Stories[storyName];
                    cond = PC.switchEntityCheck(
                        fromName, toName, R.keys(this.database.Characters),
                        R.keys(story.characters)
                    );
                    PC.precondition(cond, reject, () => {
                        story.characters[toName] = story.characters[fromName];
                        story.characters[toName].name = toName;
                        delete story.characters[fromName];

                        story.events.forEach((event) => {
                            if (event.characters[fromName]) {
                                event.characters[toName] = event.characters[fromName];
                                delete event.characters[fromName];
                            }
                        });

                        resolve();
                    });
                });
            });
        };

        //story characters
        LocalDBMS.prototype.removeStoryCharacter = function (storyName, characterName, callback) {
            this.removeStoryCharacterNew({storyName, characterName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.removeStoryCharacterNew = function ({storyName, characterName}={}) {
            return new Promise((resolve, reject) => {
                const cond = PC.entityExistsCheck(storyName, R.keys(this.database.Stories));
                PC.precondition(cond, reject, () => {
                    const story = this.database.Stories[storyName];
                    PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), reject, () => {
                        delete story.characters[characterName];
                        story.events.forEach((event) => {
                            delete event.characters[characterName];
                        });
                        resolve();
                    });
                });
            });
        };

        // story characters
        LocalDBMS.prototype.updateCharacterInventory = function (storyName, characterName, inventory, callback) {
            this.updateCharacterInventoryNew({storyName, characterName, inventory}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.updateCharacterInventoryNew = function ({storyName, characterName, inventory}={}) {
            return new Promise((resolve, reject) => {
                const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(inventory)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const story = this.database.Stories[storyName];
                    PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), reject, () => {
                        story.characters[characterName].inventory = inventory;
                        resolve();
                    });
                });
            });
        };

        //story characters
        LocalDBMS.prototype.onChangeCharacterActivity = function (
            storyName, characterName, activityType, checked,
            callback
        ) {
            this.onChangeCharacterActivityNew({storyName, characterName, activityType, checked}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.onChangeCharacterActivityNew = function (
            {storyName, characterName, activityType, checked}={}
        ) {
            return new Promise((resolve, reject) => {
                const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(activityType),
                    PC.elementFromEnum(activityType, Constants.characterActivityTypes), PC.isBoolean(checked)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const story = this.database.Stories[storyName];
                    PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), reject, () => {
                        const character = story.characters[characterName];
                        if (checked) {
                            character.activity[activityType] = true;
                        } else {
                            delete character.activity[activityType];
                        }
                        resolve();
                    });
                });
            });
        };

        //event presence
        LocalDBMS.prototype.addCharacterToEvent = function (storyName, eventIndex, characterName, callback) {
            this.addCharacterToEventNew({storyName, eventIndex, characterName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.addCharacterToEventNew = function ({storyName, eventIndex, characterName}={}) {
            return new Promise((resolve, reject) => {
                let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(eventIndex)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const story = this.database.Stories[storyName];
                    chain = [PC.entityExistsCheck(characterName, R.keys(story.characters)),
                        PC.isInRange(eventIndex, 0, story.events.length - 1)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        const event = story.events[eventIndex];
                        PC.precondition(PC.entityIsNotUsed(characterName, R.keys(event.characters)), reject, () => {
                            event.characters[characterName] = {
                                text: '',
                                time: ''
                            };
                            resolve();
                        });
                    });
                });
            });
        };

        // event presence
        LocalDBMS.prototype.removeCharacterFromEvent = function (storyName, eventIndex, characterName, callback) {
            this.removeCharacterFromEventNew({storyName, eventIndex, characterName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.removeCharacterFromEventNew = function ({storyName, eventIndex, characterName}={}) {
            return new Promise((resolve, reject) => {
                let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(eventIndex)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const story = this.database.Stories[storyName];
                    chain = [PC.entityExistsCheck(characterName, R.keys(story.characters)),
                        PC.isInRange(eventIndex, 0, story.events.length - 1)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        const event = story.events[eventIndex];
                        PC.precondition(PC.entityExists(characterName, R.keys(event.characters)), reject, () => {
                            delete this.database.Stories[storyName].events[eventIndex].characters[characterName];
                            resolve();
                        });
                    });
                });
            });
        };

        function _renameCharacterInStories({type, fromName, toName}={}) {
            if (type === 'player') return;
            const renameEventCharacter = (event) => {
                if (event.characters[fromName]) {
                    const data = event.characters[fromName];
                    event.characters[toName] = data;
                    delete event.characters[fromName];
                }
            };

            R.values(this.database.Stories).filter(story => story.characters[fromName] !== undefined)
                .forEach((story) => {
                    const data = story.characters[fromName];
                    data.name = toName;
                    story.characters[toName] = data;
                    delete story.characters[fromName];
                    story.events.forEach(renameEventCharacter);
                });
        }

        addListener('renameProfile', _renameCharacterInStories);

        function _removeCharacterFromStories({type, characterName}={}) {
            if (type === 'player') return;
            const cleanEvent = (event) => {
                if (event.characters[characterName]) {
                    delete event.characters[characterName];
                }
            };

            R.values(this.database.Stories).forEach((story) => {
                if (story.characters[characterName]) {
                    delete story.characters[characterName];
                    story.events.forEach(cleanEvent);
                }
            });
        }

        addListener('removeProfile', _removeCharacterFromStories);
    }
    callback2(storyCharactersAPI);
})(api => (typeof exports === 'undefined' ? (this.storyCharactersAPI = api) : (module.exports = api)));

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

/* eslint-disable func-names,prefer-rest-params */

((callback2) => {
    function storyBaseAPI(LocalDBMS, opts) {
        const {
            R, Errors, CU, PC
        } = opts;

        // stories, timeline
        LocalDBMS.prototype.getStoryNamesArray = function (callback) {
            this.getStoryNamesArrayNew().then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getStoryNamesArrayNew = function () {
            return Promise.resolve(Object.keys(this.database.Stories).sort(CU.charOrdA));
        };
        // social network
        LocalDBMS.prototype.getAllStories = function (callback) {
            this.getAllStoriesNew().then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getAllStoriesNew = function () {
            return Promise.resolve(CU.clone(this.database.Stories));
        };

        //stories
        LocalDBMS.prototype.getWriterStory = function (storyName, callback) {
            this.getWriterStoryNew({storyName}).then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getWriterStoryNew = function ({storyName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
                    resolve(this.database.Stories[storyName].story);
                });
            });
        };
        //stories
        LocalDBMS.prototype.setWriterStory = function (storyName, value, callback) {
            this.setWriterStoryNew({storyName, value}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.setWriterStoryNew = function ({storyName, value}={}) {
            return new Promise((resolve, reject) => {
                const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(value)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    this.database.Stories[storyName].story = value;
                    resolve();
                });
            });
        };

        // stories
        LocalDBMS.prototype.createStory = function (storyName, callback) {
            this.createStoryNew({storyName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.createStoryNew = function ({storyName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.createEntityCheck2(storyName, R.keys(this.database.Stories), 'entity-lifeless-name', 'entity-of-story'), reject, () => {
                    this.database.Stories[storyName] = {
                        name: storyName,
                        story: '',
                        characters: {},
                        events: []
                    };
                    this.ee.trigger('createStory', [storyName]);
                    resolve();
                });
            });
        };
        // stories
        LocalDBMS.prototype.renameStory = function (fromName, toName, callback) {
            this.renameStoryNew({fromName, toName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.renameStoryNew = function ({fromName, toName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(this.database.Stories)), reject, () => {
                    const data = this.database.Stories[fromName];
                    data.name = toName;
                    this.database.Stories[toName] = data;
                    delete this.database.Stories[fromName];
                    this.ee.trigger('renameStory', [fromName, toName]);
                    resolve();
                });
            });
        };

        // stories
        LocalDBMS.prototype.removeStory = function (storyName, callback) {
            this.removeStoryNew({storyName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.removeStoryNew = function ({storyName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(PC.removeEntityCheck(storyName, R.keys(this.database.Stories)), reject, () => {
                    delete this.database.Stories[storyName];
                    this.ee.trigger('removeStory', [storyName]);
                    resolve();
                });
            });
        };
    }
    callback2(storyBaseAPI);
})(api => (typeof exports === 'undefined' ? (this.storyBaseAPI = api) : (module.exports = api)));

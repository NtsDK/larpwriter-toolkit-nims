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

"use strict";

(function(callback){

    function storyBaseAPI(LocalDBMS, R, CommonUtils, Errors) {
        
        // stories, timeline
        LocalDBMS.prototype.getStoryNamesArray = function (callback) {
            "use strict";
            callback(null, Object.keys(this.database.Stories).sort(CommonUtils.charOrdA));
        };
        // social network
        LocalDBMS.prototype.getAllStories = function(callback) {
            "use strict";
            callback(null, CommonUtils.clone(this.database.Stories));
        };
        //stories
        LocalDBMS.prototype.getMasterStory = function(storyName, callback){
            "use strict";
            callback(null, this.database.Stories[storyName].story);
        };
        //stories
        LocalDBMS.prototype.updateMasterStory = function(storyName, value, callback){
            "use strict";
            this.database.Stories[storyName].story = value;
            callback();
        };
    
        //stories
        LocalDBMS.prototype.isStoryExist = function(storyName, callback){
            "use strict";
            callback(null,  this.database.Stories[storyName] !== undefined);
        };
        // stories
        LocalDBMS.prototype.createStory = function(storyName, callback){
            "use strict";
            if (storyName === "") {
                callback(new Errors.ValidationError("stories-story-name-is-not-specified"));
                return;
            }
            
            if(this.database.Stories[storyName]){
                callback(new Errors.ValidationError("stories-story-name-already-used", [storyName]));
                return;
            }
            
            this.database.Stories[storyName] = {
                    name : storyName,
                    story : "",
                    characters : {},
                    events : []
            };
            callback();
        };
        // stories
        LocalDBMS.prototype.renameStory = function(fromName, toName, callback){
            "use strict";
            if (toName === "") {
                callback(new Errors.ValidationError("stories-story-name-is-not-specified"));
                return;
            }

            if (fromName === toName) {
                callback(new Errors.ValidationError("stories-names-are-the-same"));
                return;
            }
            
            if(this.database.Stories[toName]){
                callback(new Errors.ValidationError("stories-story-name-already-used", [toName]));
                return;
            }
            
            var data = this.database.Stories[fromName];
            data.name = toName;
            this.database.Stories[toName] = data;
            delete this.database.Stories[fromName];
            callback();
        };
    
        // stories
        LocalDBMS.prototype.removeStory = function(storyName, callback){
            "use strict";
            delete this.database.Stories[storyName];
            callback();
        };
    
    };
    callback(storyBaseAPI);

})(function(api){
    typeof exports === 'undefined'? this['storyBaseAPI'] = api: module.exports = api;
}.bind(this));


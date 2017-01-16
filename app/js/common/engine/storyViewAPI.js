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

    function storyViewAPI(LocalDBMS, opts) {

        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var dateFormat    = opts.dateFormat  ;
        
        // preview
        LocalDBMS.prototype.getAllInventoryLists = function(characterName, callback) {
            CU.precondition([CU.isString(characterName), CU.entityExists(characterName, R.keys(this.database.Characters))], callback, () => {
                var array = R.values(this.database.Stories).filter( story => story.characters[characterName] !== undefined &&
                        story.characters[characterName].inventory !== "")
                        .map(story => {
                    return {
                        storyName : story.name,
                        inventory : story.characters[characterName].inventory
                    }
                });
                callback(null, array);
            });
        };
    
        // preview
        LocalDBMS.prototype.getCharacterEventGroupsByStory = function(characterName, callback) {
            CU.precondition([CU.isString(characterName), CU.entityExists(characterName, R.keys(this.database.Characters))], callback, () => {
                var eventGroups = [];
        
                var events;
        
                var that = this;
                Object.keys(this.database.Stories).filter(function(storyName) {
                    return that.database.Stories[storyName].characters[characterName];
                }).forEach(function(storyName) {
                    events = [];
        
                    var tmpEvents = CU.clone(that.database.Stories[storyName].events);
                    tmpEvents.map(function(elem, i) {
                        elem.index = i;
                        elem.storyName = storyName;
                        elem.isTimeEmpty = elem.time === ''; 
                        elem.time = elem.isTimeEmpty ? that.database.Meta.date : elem.time;
                        return elem;
                    }).filter(function(event) {
                        return event.characters[characterName];
                    }).forEach(function(event) {
                        events.push(event);
                    });
        
                    eventGroups.push({
                        storyName : storyName,
                        events : events
                    });
                });
                eventGroups.sort(CU.charOrdAFactory(R.prop('storyName')));
                callback(null, eventGroups);
            });
        };
    
        // preview
        LocalDBMS.prototype.getCharacterEventsByTime = function(characterName, callback) {
            CU.precondition([CU.isString(characterName), CU.entityExists(characterName, R.keys(this.database.Characters))], callback, () => {
                var allEvents = [];
        
                var that = this;
                Object.keys(this.database.Stories).filter(function(storyName) {
                    return that.database.Stories[storyName].characters[characterName];
                }).forEach(function(storyName) {
                    var events = CU.clone(that.database.Stories[storyName].events);
                    allEvents = allEvents.concat(events.map(function(elem, i) {
                        elem.index = i;
                        elem.storyName = storyName;
                        elem.isTimeEmpty = elem.time === ''; 
                        elem.time = elem.isTimeEmpty ? that.database.Meta.date : elem.time;
                        return elem;
                    }).filter(function(event) {
                        return event.characters[characterName];
                    }));
                });
        
                allEvents.sort(CU.eventsByTime);
                callback(null, allEvents);
            });
        };
    
        // timeline
        LocalDBMS.prototype.getEventsTimeInfo = function(callback) {
            var result = R.flatten(R.values(CU.clone(this.database.Stories)).map(story => {
                return story.events.map((event, index) => {
                    return R.merge(R.pick(['name', 'time'], event), {
                        characters: R.keys(event.characters),
                        storyName: story.name,
                        index: index
                    });
                });
            }));
            
            callback(null, result);
        };
        
        // character filter
        LocalDBMS.prototype.getCharactersSummary = function(callback){
            
            var characters = R.keys(this.database.Characters);
            var charactersInfo = {};
            characters.forEach(function(character){
                charactersInfo[character] = {
                    'active':0,
                    'follower':0,
                    'defensive':0,
                    'passive':0,
                    'totalAdaptations':0,
                    'finishedAdaptations':0,
                    'totalStories':0
                }
            });
            
            R.values(this.database.Stories).forEach(function(story){
                R.values(story.characters).forEach(function(storyCharacter){
                    var characterInfo = charactersInfo[storyCharacter.name];
                    characterInfo.totalStories++;
                    R.toPairs(storyCharacter.activity).forEach(function(activity){
                        if(activity[1] === true){
                            characterInfo[activity[0]]++;
                        }
                    });
                });
                story.events.forEach(function(event){
                    R.toPairs(event.characters).forEach(function(eventCharacter){
                        var characterInfo = charactersInfo[eventCharacter[0]];
                        characterInfo.totalAdaptations++;
                        if(eventCharacter[1].ready){
                            characterInfo.finishedAdaptations++;
                        }
                    });
                });
            });
            R.values(charactersInfo).forEach(function(characterInfo){
                characterInfo.completeness = Math.round(characterInfo.finishedAdaptations * 100 / 
                    (characterInfo.totalAdaptations != 0 ? characterInfo.totalAdaptations : 1));
            });
            callback(null, charactersInfo);
        };
        
        // character profile
        LocalDBMS.prototype.getCharacterReport = function(characterName, callback){
            CU.precondition([CU.isString(characterName), CU.entityExists(characterName, R.keys(this.database.Characters))], callback, () => {
                var characterReport = R.values(this.database.Stories).filter(function(story){
                    return story.characters[characterName] !== undefined;
                }).map(function(story){
                    var charEvents = story.events.filter(function(event){
                        return event.characters[characterName] !== undefined;
                    });
                    
                    var finishedAdaptations = charEvents.filter(function(event){
                        return event.characters[characterName].ready === true;
                    }).length;
                    
                    var meets = {};
                    charEvents.forEach(function(event){
                        var chars = R.keys(event.characters);
                        meets = R.merge(meets, R.zipObj(chars, R.repeat(true, chars.length)));
                    });
                    
                    delete meets[characterName];
                    meets = R.keys(meets).sort();
                    
                    
                    return {
                        storyName: story.name,
                        inventory: story.characters[characterName].inventory, 
                        activity: story.characters[characterName].activity, 
                        meets: meets,
                        totalAdaptations: charEvents.length,
                        finishedAdaptations: finishedAdaptations
                    }
                });
                characterReport.sort(CU.charOrdAFactory(R.prop('storyName')));
                
                callback(null, characterReport);
            });
        };
    
    };
    callback(storyViewAPI);

})(function(api){
    typeof exports === 'undefined'? this['storyViewAPI'] = api: module.exports = api;
}.bind(this));

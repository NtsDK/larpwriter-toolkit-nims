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

/*global
 Utils, DBMS
 */

"use strict";

(function(exports){

    var state = {};
    
    exports.init = function () {
        listen(getEl("timelineStorySelector"), "change", onStorySelectorChangeDelegate);
    
        state.TimelineDataset = new vis.DataSet();
        state.TagDataset = new vis.DataSet();
        
        queryEls("#timelineDiv input[name=timelineFilter]").map(listen(R.__, "change", refreshTimeline));
        getEl("timelineFilterByStory").checked = true;
    
        // specify options
        var options = {
            orientation : 'top',
            showCurrentTime : false,
    //        editable : {
    //            updateTime : true
    //        },
    //        onMove : function (item, callback) {
    //            if (item.storyName) {
    //                DBMS.setEventTime(item.storyName, item.eventIndex, item.start, function(err){
    //                    if(err) {Utils.handleError(err); return;}
    //                    callback(item);
    //                });
    //            }
    //        },
    //        multiselect : true
        };
    
        var timeline = new vis.Timeline(getEl('timelineContainer'), null, options);
        timeline.setGroups(state.TagDataset);
        timeline.setItems(state.TimelineDataset);
        state.timelineComponent = timeline;
    
        exports.content = getEl("timelineDiv");
    };
    
    exports.refresh = function () {
        DBMS.getMetaInfo(function(err, metaInfo){
            if(err) {Utils.handleError(err); return;}
            
            state.postDate = metaInfo.date;
            state.preDate = metaInfo.preGameDate;
            
            var endDate = new Date(state.postDate);
            var startDate = new Date(state.preDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            startDate.setFullYear(startDate.getFullYear() - 1)
            
            state.timelineComponent.setOptions({
                end : endDate,
                start : startDate,
            });
            
            DBMS.getEventsTimeInfo( function(err, eventsTimeInfo){
                if(err) {Utils.handleError(err); return;}
                state.eventsTimeInfo = eventsTimeInfo;
                state.eventsByStories = R.groupBy(R.prop('storyName'), eventsTimeInfo);
                state.eventsByCharacters = R.uniq(R.flatten(eventsTimeInfo.map(event => event.characters)));
                state.eventsByCharacters = R.zipObj(state.eventsByCharacters, R.ap([R.clone], R.repeat([], state.eventsByCharacters.length)));
                eventsTimeInfo.forEach(event => event.characters.forEach( character => state.eventsByCharacters[character].push(event)));
                
                console.log(JSON.stringify(state.eventsByCharacters));
                
                PermissionInformer.getEntityNamesArray('story', false, function(err, allStoryNames){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.getEntityNamesArray('character', false, function(err, allCharacterNames){
                        if(err) {Utils.handleError(err); return;}
                        suffixy(allStoryNames, state.eventsByStories);
                        state.allStoryNames = allStoryNames;
                        suffixy(allCharacterNames, state.eventsByCharacters);
                        state.allCharacterNames = allCharacterNames;
                        refreshTimeline();
                    });
                });
            });
        });
    };
    
    function suffixy(entityNames, data){
        var emptySuffix = constL10n(Constants.emptySuffix);
        entityNames.forEach(nameInfo => {
            if(data[nameInfo.value] === undefined){
                nameInfo.displayName += emptySuffix;
            } 
        });
    }
    
    var refreshTimeline = function(){
        var selectorValues = getEl("timelineFilterByStory").checked ? state.allStoryNames : state.allCharacterNames;
        
        var selector = clearEl(getEl("timelineStorySelector"));
        fillSelector(selector, selectorValues.map(remapProps4Select));
        setAttr(selector, 'size', selectorValues.length > 15 ? 15 : selectorValues.length);
        
        if(selectorValues.length != 0){
            selector.options[0].selected = true;
            onStorySelectorChange([ selectorValues[0].value ]);
        }
    };
    
    var onStorySelectorChangeDelegate =  (event) => onStorySelectorChange(nl2array(event.target.selectedOptions).map(opt => opt.value));
    
    var prepareLabel = label => R.splitEvery(20, label).join('<br>');
    
    var onStorySelectorChange = function (entityNames) {
        state.TagDataset.clear();
        state.TimelineDataset.clear();
        
        state.TagDataset.add(entityNames.map(entityName => R.always({id : entityName, content : entityName})()));
        
        function fillTimelines(entityNames, data){
            entityNames = R.intersection(entityNames, R.keys(data));
            state.TimelineDataset.add(R.flatten(R.toPairs(R.pick(entityNames, data)).map(pair => {
                var entityName = pair[0];
                return pair[1].map(event => {
                    return {
                        content : prepareLabel(event.name),
                        start : event.time !== '' ? event.time : state.postDate,
                        group : entityName
                    }
                });
            })));
        }
        
        var byStory = getEl("timelineFilterByStory").checked
        fillTimelines(entityNames, byStory ? state.eventsByStories : state.eventsByCharacters);
        
        if(entityNames[0]){
            state.TimelineDataset.add({
                content : prepareLabel(L10n.getValue("overview-pre-game-end-date")),
                start : new Date(state.postDate),
                group : entityNames[0],
                className : "importantItem",
                editable : false
            });
            state.TimelineDataset.add({
                content : prepareLabel(L10n.getValue("overview-pre-game-start-date")),
                start : new Date(state.preDate),
                group : entityNames[0],
                className : "importantItem",
                editable : false
            });
        }
    };

})(this['Timeline']={});
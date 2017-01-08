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
        var selector = getEl("timelineStorySelector");
        selector.addEventListener("change", onStorySelectorChangeDelegate);
    
        var container = getEl('timelineContainer');
    
        state.TimelineDataset = new vis.DataSet();
    
        state.TagDataset = new vis.DataSet();
    
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
    
        var timeline = new vis.Timeline(container, null, options);
        timeline.setGroups(state.TagDataset);
        timeline.setItems(state.TimelineDataset);
        state.timelineComponent = timeline;
    
        exports.content = getEl("timelineDiv");
    };
    
    exports.refresh = function () {
        var selector = getEl("timelineStorySelector");
        clearEl(selector);
    
        var option;
            
        DBMS.getMetaInfo(function(err, metaInfo){
            if(err) {Utils.handleError(err); return;}
            
            state.postDate = metaInfo.date;
            state.preDate = metaInfo.preGameDate;
            
            var timeExtra = 24*60*60*30*12*1000;
            var endDate = new Date(state.postDate);
            var startDate = new Date(state.preDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            startDate.setFullYear(startDate.getFullYear() - 1)
            
            state.timelineComponent.setOptions({
                end : endDate,
                start : startDate,
            });
            
            PermissionInformer.getEntityNamesArray('story', false, function(err, allStoryNames){
                if(err) {Utils.handleError(err); return;}
                allStoryNames.forEach(function(nameInfo){
                    option = makeEl("option");
                    option.appendChild(makeText(nameInfo.displayName));
                    option.value = nameInfo.value;
                    selector.appendChild(option);
                });
                
                if(allStoryNames.length != 0){
                    onStorySelectorChange([ allStoryNames[0].value ]);
                }
            });
        });
    };
    
    var onStorySelectorChangeDelegate = function (event) {
        var selOptions = event.target.selectedOptions;
        var storyNames = [];
        for (var i = 0; i < selOptions.length; i++) {
            storyNames.push(selOptions[i].value);
        }
        onStorySelectorChange(storyNames);
    };
    
    var onStorySelectorChange = function (storyNames) {
        state.TagDataset.clear();
        state.TimelineDataset.clear();
        
        var storyName;
        DBMS.getEventGroupsForStories(storyNames, function(err, eventGroups){
            if(err) {Utils.handleError(err); return;}
            
            eventGroups.forEach(function (elem) {
                storyName = elem.storyName;
                state.TagDataset.add({
                    id : storyName,
                    content : storyName
                });
                var events = elem.events;
                
                events.forEach(function (event) {
                    var date = state.postDate;
                    if (event.time) {
                        date = event.time;
                    }
                    
                    state.TimelineDataset.add({
                        content : event.name,
                        start : date,
                        group : storyName,
                        storyName : storyName,
                        eventIndex : event.index
                    });
                });
            });
            
            if(storyNames[0]){
                state.TimelineDataset.add({
                    content : L10n.getValue("overview-pre-game-end-date"),
                    start : new Date(state.postDate),
                    group : storyNames[0],
                    className : "importantItem",
                    editable : false
                });
                state.TimelineDataset.add({
                    content : L10n.getValue("overview-pre-game-start-date"),
                    start : new Date(state.preDate),
                    group : storyNames[0],
                    className : "importantItem",
                    editable : false
                });
            }
        });
    };

})(this['Timeline']={});
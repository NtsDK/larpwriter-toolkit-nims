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

var Timeline = {};

Timeline.init = function () {
    "use strict";
    var selector = document.getElementById("timelineStorySelector");
    selector.addEventListener("change", Timeline.onStorySelectorChangeDelegate);

    var container = document.getElementById('timelineContainer');

    Timeline.TimelineDataset = new vis.DataSet();

    Timeline.TagDataset = new vis.DataSet();

    // specify options
    var options = {
        orientation : 'top',
        showCurrentTime : false,
        editable : {
            updateTime : true
        },
        onMove : function (item, callback) {
            if (item.storyName) {
                DBMS.setEventTime(item.storyName, item.eventIndex, item.start, function(err){
                	if(err) {Utils.handleError(err); return;}
                    callback(item);
                });
            }
        },
        multiselect : true
    };

    // Create a Timeline
    var timeline = new vis.Timeline(container, null, options);
    timeline.setGroups(Timeline.TagDataset);
    timeline.setItems(Timeline.TimelineDataset);
    Timeline.timelineComponent = timeline;

    Timeline.content = document.getElementById("timelineDiv");
};

Timeline.refresh = function () {
    "use strict";
    var selector = document.getElementById("timelineStorySelector");
    Utils.removeChildren(selector);

    var option;
        
    DBMS.getMetaInfo(function(err, metaInfo){
    	if(err) {Utils.handleError(err); return;}
        
        Timeline.postDate = metaInfo.date;
        Timeline.preDate = metaInfo.preGameDate;
        
        var timeExtra = 24*60*60*30*12*1000;
        var endDate = new Date(Timeline.postDate);
        var startDate = new Date(Timeline.preDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        startDate.setFullYear(startDate.getFullYear() - 1)
        
        Timeline.timelineComponent.setOptions({
            end : endDate,
            start : startDate,
        });
        
        DBMS.getStoryNamesArray(function(err, storyNames){
        	if(err) {Utils.handleError(err); return;}
            storyNames.forEach(function(name){
                option = document.createElement("option");
                option.appendChild(document.createTextNode(name));
                selector.appendChild(option);
            });
            
            if(storyNames.length != 0){
                Timeline.onStorySelectorChange([ storyNames[0] ]);
            }
        });
    });
};

Timeline.onStorySelectorChangeDelegate = function (event) {
    "use strict";
    var selOptions = event.target.selectedOptions;
    var storyNames = [];
    for (var i = 0; i < selOptions.length; i++) {
        storyNames.push(selOptions[i].text);
    }
    Timeline.onStorySelectorChange(storyNames);
};

Timeline.onStorySelectorChange = function (storyNames) {
    "use strict";
    Timeline.TagDataset.clear();
    Timeline.TimelineDataset.clear();
    
    var storyName;
    DBMS.getEventGroupsForStories(storyNames, function(err, eventGroups){
    	if(err) {Utils.handleError(err); return;}
        
        eventGroups.forEach(function (elem) {
            storyName = elem.storyName;
            Timeline.TagDataset.add({
                id : storyName,
                content : storyName
            });
            var events = elem.events;
            
            events.forEach(function (event) {
                var date = Timeline.postDate;
                if (event.time) {
                    date = event.time;
                }
                
                Timeline.TimelineDataset.add({
                    content : event.name,
                    start : date,
                    group : storyName,
                    storyName : storyName,
                    eventIndex : event.index
                });
            });
        });
        
        if(storyNames[0]){
            Timeline.TimelineDataset.add({
                content : "Начало игры",
                start : new Date(Timeline.postDate),
                group : storyNames[0],
                className : "importantItem",
                editable : false
            });
            Timeline.TimelineDataset.add({
                content : "Начало доигровых событий",
                start : new Date(Timeline.preDate),
                group : storyNames[0],
                className : "importantItem",
                editable : false
            });
        }
    });

};

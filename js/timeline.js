/*global
 Utils, DBMS, Database
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
        end : new Date(Database.Meta.date),
        start : new Date(Database.Meta.preGameDate),
        editable : {
            updateTime : true
        },
        onMove : function (item, callback) {
            if (item.extra) {
                item.extra.time = dateFormat(item.start, "yyyy/mm/dd h:MM");
                callback(item);
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
    for ( name in Database.Stories) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(name));
        selector.appendChild(option);
    }

    for ( name in Database.Stories) {
        Timeline.onStorySelectorChange([ name ]);
        break;
    }
    
    var timeExtra = 24*60*60*30*12*1000;
    var endDate = new Date(Database.Meta.date);
    var startDate = new Date(Database.Meta.preGameDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    startDate.setFullYear(startDate.getFullYear() - 1)
    
    Timeline.timelineComponent.setOptions({
        end : endDate,
        start : startDate,
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

    storyNames.forEach(function (storyName) {
        Timeline.TagDataset.add({
            id : storyName,
            content : storyName
        });
        var events = Database.Stories[storyName].events;
        
        events.forEach(function (event) {
            var date = Database.Meta.date;
            if (event.time) {
                date = event.time;
            }
            
            Timeline.TimelineDataset.add({
                content : event.name,
                start : date,
                group : storyName,
                extra : event
            });
        });
    });

    if(storyNames[0]){
        Timeline.TimelineDataset.add({
            content : "Начало игры",
            start : new Date(Database.Meta.date),
            group : storyNames[0],
            className : "importantItem",
            editable : false
        });
        Timeline.TimelineDataset.add({
            content : "Начало доигровых событий",
            start : new Date(Database.Meta.preGameDate),
            group : storyNames[0],
            className : "importantItem",
            editable : false
        });
    }
};

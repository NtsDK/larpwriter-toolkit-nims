"use strict";

var Timeline = {};

Timeline.init = function () {
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
    // var timeline = new vis.Timeline(container, items, options);
    var timeline = new vis.Timeline(container, null, options);
    timeline.setGroups(Timeline.TagDataset);
    timeline.setItems(Timeline.TimelineDataset);

    Timeline.content = document.getElementById("timelineDiv");
};

Timeline.refresh = function () {
    var selector = document.getElementById("timelineStorySelector");
    Utils.removeChildren(selector);

    for ( var name in Database.Stories) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(name));
        selector.appendChild(option);
    }

    for ( var name in Database.Stories) {
        Timeline.onStorySelectorChange([ name ]);
        break;
    }
};

Timeline.onStorySelectorChangeDelegate = function (event) {
    var selOptions = event.target.selectedOptions;
    var storyNames = [];
    for (var i = 0; i < selOptions.length; i++) {
        storyNames.push(selOptions[i].text);
    }
    Timeline.onStorySelectorChange(storyNames);
};

Timeline.onStorySelectorChange = function (storyNames) {
    Timeline.TagDataset.clear();
    Timeline.TimelineDataset.clear();

    for (var i = 0; i < storyNames.length; i++) {
        var storyName = storyNames[i];

        Timeline.TagDataset.add({
            id : storyName,
            content : storyName
        });
        var story = Database.Stories[storyName];
        var events = story.events;

        for (var j = 0; j < events.length; j++) {
            var event = events[j];
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
        }
    }

    Timeline.TimelineDataset.add({
        content : "Начало игры",
        start : new Date(Database.Meta.date),
        group : storyName,
        className : "importantItem",
        editable : false
    });
    Timeline.TimelineDataset.add({
        content : "Начало доигровых событий",
        start : new Date(Database.Meta.preGameDate),
        group : storyName,
        className : "importantItem",
        editable : false
    });

};

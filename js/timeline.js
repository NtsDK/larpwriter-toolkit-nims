Timeline = {};

Timeline.init = function(){
	var selector = document.getElementById("timelineStorySelector");
	selector.addEventListener("change", Timeline.onStorySelectorChangeDelegate);
	
	var container = document.getElementById('timelineContainer');
	
	Timeline.TimelineDataset = new vis.DataSet();

	Timeline.TagDataset = new vis.DataSet();
	
	// specify options
	var options = {
		orientation : 'top',
		showCurrentTime : false,
		end: new Date(Database.Meta.date),
		start: new Date(Database.Meta.preGameDate)
	};
	
	// Create a Timeline
	// var timeline = new vis.Timeline(container, items, options);
	var timeline = new vis.Timeline(container, null, options);
	timeline.setGroups(Timeline.TagDataset);
	timeline.setItems(Timeline.TimelineDataset);
	
	
	
	Timeline.content = document.getElementById("timelineDiv");
};

Timeline.refresh = function(){
	var selector = document.getElementById("timelineStorySelector");
	removeChildren(selector);
	
	for ( var name in Database.Stories) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(name));
		selector.appendChild(option);
	}
	
	for ( var name in Database.Stories) {
		Timeline.onStorySelectorChange([name]);
		break;
	}
};


Timeline.onStorySelectorChangeDelegate = function(event){
//	var storyName = event.target.value;
	var selOptions = event.target.selectedOptions;
	var storyNames = [];
	for (var i = 0; i < selOptions.length; i++) {
		storyNames.push(selOptions[i].text);
	}
	Timeline.onStorySelectorChange(storyNames);
};

Timeline.onStorySelectorChange = function(storyNames){
	Timeline.TagDataset.clear();
	Timeline.TimelineDataset.clear();
	
//	for(var storyName in Database.Stories){
	for (var i = 0; i < storyNames.length; i++) {
		var storyName = storyNames[i];
		
		Timeline.TagDataset.add({
			id : storyName,
			content : storyName
		});
		var story = Database.Stories[storyName];
		var events = story.events;
		
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			var date = Database.Meta.date;
			if(event.time){
				date = event.time;
			}
			
			Timeline.TimelineDataset.add({
				content : event.name,
				start : date,
				group : storyName
			});
		}
	}
	
	Timeline.TimelineDataset.add({
		content : "Начало игры",
		start : new Date(Database.Meta.date),
		group : storyName,
		className : "importantItem"
	});
	Timeline.TimelineDataset.add({
		content : "Начало доигровых событий",
		start : new Date(Database.Meta.preGameDate),
		group : storyName,
		className : "importantItem"
	});
	
//	Stories.CurrentStory = Database.Stories[storyName];
//	
//	var storyArea = document.getElementById("masterStoryArea");
//	storyArea.value = Stories.CurrentStory.story;
	
//	Stories.currentView.refresh();
	
};


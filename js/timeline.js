Timeline = {};

Timeline.init = function(){
	var container = document.getElementById('timelineContainer');
	
	Timeline.TimelineDataset = new vis.DataSet();

	Timeline.TagDataset = new vis.DataSet();
	
	// specify options
	var options = {
		orientation : 'top',
		showCurrentTime : true,
		end: new Date(Database.Meta.date),
		start: new Date(Database.Meta.preGameDate)
//		start : new Date(),
//		// end: new Date(1000*60*60*24 + (new Date()).valueOf()),
//		end : new Date(1000 * 60 * 5 + (new Date()).valueOf()),
	};
	
	// Create a Timeline
	// var timeline = new vis.Timeline(container, items, options);
	var timeline = new vis.Timeline(container, null, options);
	timeline.setGroups(Timeline.TagDataset);
	timeline.setItems(Timeline.TimelineDataset);
	
	for(var storyName in Database.Stories){
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
	
	Timeline.content = document.getElementById("timelineDiv");
};

Timeline.refresh = function(){
	
};



//Log.initTimeline = function() {
//	var container = document.getElementById('visualization');
//
//	// specify options
//	var options = {
//		orientation : 'top',
////		showCurrentTime : true,
//		start : new Date(),
//		// end: new Date(1000*60*60*24 + (new Date()).valueOf()),
//		end : new Date(1000 * 60 * 5 + (new Date()).valueOf()),
//	};
//	
//	// Create a Timeline
//	// var timeline = new vis.Timeline(container, items, options);
//	var timeline = new vis.Timeline(container, null, options);
//	timeline.setGroups(TagDataset);
//	timeline.setItems(TimelineDataset);
//	
////	TagDataset.add({
////		id : "future",
////		content : "future"
////	});
////	
////	for(var playerName in Database.Profiles){
////		TagDataset.add({
////			id : playerName,
////			content : playerName
////		});
////	}
//
//	// TagDataset.add({
//	// // id:1,
//	// id:"test",
//	// content: "test"
//	// });
//
//}
StoryEvents = {};

StoryEvents.init = function(){
	var button = document.getElementById("createEventButton");
	button.addEventListener("click", StoryEvents.createEvent);
	
	var button = document.getElementById("swapEventsButton");
	button.addEventListener("click", StoryEvents.swapEvents);

	var button = document.getElementById("removeEventButton");
	button.addEventListener("click", StoryEvents.removeEvent);
	
	StoryEvents.content = document.getElementById("storyEventsDiv");
}

StoryEvents.refresh = function(){
	
	// event part
	var table = document.getElementById("eventBlock");
	removeChildren(table);

	StoryEvents.appendEventHeader(table);

	for (var i = 0; i < Stories.CurrentStory.events.length; ++i) {
		StoryEvents.appendEventInput(table, Stories.CurrentStory.events[i], i + 1);
	}
	
	// refresh position selector
	var positionSelector = document.getElementById("positionSelector");
	removeChildren(positionSelector);
	
	for (var i = 0; i < Stories.CurrentStory.events.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode("Перед " + (i+1)));
		positionSelector.appendChild(option);
	}
	
	var option = document.createElement("option");
	option.appendChild(document.createTextNode("В конец"));
	positionSelector.appendChild(option);
	
	positionSelector.selectedIndex = Stories.CurrentStory.events.length;
	
	// refresh swap selector
	var selector1 = document.getElementById("firstEvent");
	var selector2 = document.getElementById("secondEvent");
	var selector3 = document.getElementById("removeEventSelector");
	
	removeChildren(selector1);
	removeChildren(selector2);
	removeChildren(selector3);
	
	for (var i = 0; i < Stories.CurrentStory.events.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode((i+1)));
		selector1.appendChild(option);
		var option = document.createElement("option");
		option.appendChild(document.createTextNode((i+1)));
		selector2.appendChild(option);
		var option = document.createElement("option");
		option.appendChild(document.createTextNode((i+1)));
		selector3.appendChild(option);
	}
	
}

StoryEvents.createEvent = function() {
	var eventName = document.getElementById("eventNameInput").value.trim();
	var input = document.getElementById("eventInput");
	var eventText = input.value.trim();

	if (eventName == "") {
		alert("Название события не указано");
		return;
	}
	if (eventText == "") {
		alert("Событие пусто");
		return;
	}
	
	var event = {
		name : eventName,
		text : eventText,
		time : "",
		characters : {}
	}
	
	var positionSelector = document.getElementById("positionSelector");
	
	var position = positionSelector.value;
	if(position == "В конец"){
		Stories.CurrentStory.events.push(event);
	} else {
		Stories.CurrentStory.events.splice(positionSelector.selectedIndex, 0, event);
	}

	StoryEvents.refresh();
}

StoryEvents.swapEvents = function(){
	var index1 = document.getElementById("firstEvent").selectedIndex;
	var index2 = document.getElementById("secondEvent").selectedIndex;
	if(index1 == index2){
		alert("Позиции событий совпадают");
		return;
	}
	
	var tmp = Stories.CurrentStory.events[index1];
	Stories.CurrentStory.events[index1] = Stories.CurrentStory.events[index2];
	Stories.CurrentStory.events[index2] = tmp;
	
	StoryEvents.refresh();
};

StoryEvents.removeEvent = function(){
	var index = document.getElementById("removeEventSelector").selectedIndex;
	
	if (confirm("Вы уверены, что хотите удалить событие " + name + "? Все данные связанные с событием будут удалены безвозвратно.")) {
		Stories.CurrentStory.events.remove(index);
		StoryEvents.refresh();
	}
};


StoryEvents.appendEventHeader = function(table) {
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var td = document.createElement("th");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("№"));	
	var td = document.createElement("th");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("Событие"));

//	for ( var name in CurrentStory.characters) {
//		var td = document.createElement("td");
//		tr.appendChild(td);
//		td.appendChild(document.createTextNode(name));
//	}
	var td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("Время"));
}

StoryEvents.appendEventInput = function(table, event, index) {
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var td = document.createElement("td");
	tr.appendChild(td);
	var span=document.createElement("span");
	span.appendChild(document.createTextNode(index));
	td.appendChild(span);
	var td = document.createElement("td");
	tr.appendChild(td);
	var input = document.createElement("input");
	input.value = event.name;
	input.eventInfo = event;
	input.addEventListener("change", StoryEvents.updateEventName);
	td.appendChild(input);
	
	td.appendChild(document.createElement("br"));
	
	var input = document.createElement("textarea");
	input.className = "eventText";
	input.value = event.text;
	input.eventInfo = event;
	input.addEventListener("change", StoryEvents.updateEventText);
	td.appendChild(input);

//	// for(var i=0;i<Database.characters.length;++i){
//	for ( var name in CurrentStory.characters) {
//		var td = document.createElement("td");
//		tr.appendChild(td);
//		var input = document.createElement("input");
//		input.type = "checkbox";
//		if(event.characters[name]){
//			input.checked = true;
//		}
//		input.addEventListener("change", characterCheckboxDelegateCreator(name, event));
//		td.appendChild(input);
//	}
	var td = document.createElement("td");
	tr.appendChild(td);
	var input = document.createElement("input");
	input.value = event.time;
	input.className = "eventTime";
	
	input.eventInfo = event;
	
//	input.addEventListener("change", myAlert);
	input.addEventListener("change", StoryEvents.updateTime);
	// input.type = "checkbox";
	td.appendChild(input);
};

StoryEvents.updateEventName = function(event){
	event.target.eventInfo.name = event.target.value;
};

StoryEvents.updateEventText = function(event){
	event.target.eventInfo.text = event.target.value;
};

StoryEvents.updateTime = function(event){
	event.target.eventInfo.time = event.target.value;
};
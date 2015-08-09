Stories = {};

Stories.init = function(){
	var root = Stories;
	root.views = {};
	var nav = "storiesNavigation";
	var content = "storiesContent";
	Utils.addView(root, "StoryEvents", StoryEvents, "События", nav, content);
	Utils.addView(root, "StoryCharacters", StoryCharacters, "Персонажи", nav, content);
	Utils.addView(root, "EventPresence", EventPresence, "Присутствие", nav, content, true);
	
	var selector = document.getElementById("storySelector");
	selector.addEventListener("change", Stories.onStorySelectorChangeDelegate);
	
	var button = document.getElementById("createStoryButton");
	button.addEventListener("click", Stories.createStory);
	
	var button = document.getElementById("renameStoryButton");
	button.addEventListener("click", Stories.renameStory);

	var button = document.getElementById("removeStoryButton");
	button.addEventListener("click", Stories.removeStory);
	
	var button = document.getElementById("masterStoryArea");
	button.addEventListener("change", Stories.updateMasterStory);
	
//	var button = document.getElementById("createEventButton");
//	button.addEventListener("click", Stories.createEvent);
	
	for ( var name in Database.Stories) {
		Stories.CurrentStory = Database.Stories[name];
		break;
	}
	
	Stories.content = document.getElementById("storiesDiv");
};

Stories.refresh = function(){
	var selector = document.getElementById("storySelector");
	removeChildren(selector);
	
	for ( var name in Database.Stories) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(name));
		selector.appendChild(option);
	}
	var selector = document.getElementById("fromStory");
	removeChildren(selector);
	
	for ( var name in Database.Stories) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(name));
		selector.appendChild(option);
	}
	var selector = document.getElementById("storyRemoveSelector");
	removeChildren(selector);
	
	for ( var name in Database.Stories) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(name));
		selector.appendChild(option);
	}
	
	for ( var name in Database.Stories) {
		Stories.onStorySelectorChange(name);
		break;
	}
	
	Stories.currentView.refresh();
};

Stories.createStory = function(){
	var storyName = document.getElementById("createStoryName").value.trim();
	if(storyName == ""){
		alert("Название истории пусто.");
		return;
	}
	
	if(Database.Stories[storyName]){
		alert("История с таким именем уже существует.")
		return;
	}
	
	Database.Stories[storyName] = {
			name:storyName,
			story:"",
			characters:{},
			events:[]
	};
	
	Stories.CurrentStory = Database.Stories[storyName];
	Stories.refresh();
	
};

Stories.renameStory = function(){
	var fromName = document.getElementById("fromStory").value.trim();
	var toName = document.getElementById("toStory").value.trim();
	
	if(toName == ""){
		alert("Новое имя не указано.");
		return;
	}
	
	if(fromName ==  toName){
		alert("Имена совпадают.");
		return;
	}
	
	if(Database.Stories[toName]){
		alert("Имя " + toName + " уже используется.");
		return;
	}
	
	var data = Database.Stories[fromName];
	data.name = toName;
	Database.Stories[toName] = data;
	delete Database.Stories[fromName];
	Stories.refresh();
	
};

Stories.removeStory = function(){
	var name = document.getElementById("storyRemoveSelector").value.trim();
	
	if (confirm("Вы уверены, что хотите удалить историю " + name + "? Все данные связанные с историей будут удалены безвозвратно.")) {
		delete Database.Stories[name];
		Stories.refresh();
	}
};


Stories.onStorySelectorChangeDelegate = function(event){
	var storyName = event.target.value;
	Stories.onStorySelectorChange(storyName);
};

Stories.onStorySelectorChange = function(storyName){
	Stories.CurrentStory = Database.Stories[storyName];
	
	var storyArea = document.getElementById("masterStoryArea");
	storyArea.value = Stories.CurrentStory.story;
	
	Stories.currentView.refresh();
	
//	// event part
//	var table = document.getElementById("eventBlock");
//	removeChildren(table);
//
//	Stories.appendEventHeader(table);
//
//	for (var i = 0; i < Stories.CurrentStory.events.length; ++i) {
//		Stories.appendEventInput(table, Stories.CurrentStory.events[i], i + 1);
//	}
};

Stories.updateMasterStory = function(event){
	var storyArea = document.getElementById("masterStoryArea");
	Stories.CurrentStory.story = storyArea.value;
};


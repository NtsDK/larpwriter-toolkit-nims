

PageManager = {};

PageManager.onLoad = function(){
	PageManager.views = {};
	PageManager.addView("Overview", Overview, "Обзор");
	PageManager.addView("Characters", Characters, "Персонажи", true);
	PageManager.addView("Stories", Overview, "Истории");
	PageManager.addView("Events", Overview, "События");
	PageManager.addView("Briefings", Overview, "Вводные");
	
	var navigation = document.getElementById("navigation");
	var button = document.createElement("input");
	button.type = "file";
	button.id = "dataLoadButton";
	navigation.appendChild(button);

	button = document.createElement("button");
	button.appendChild(document.createTextNode("Сохранить"));
	button.id = "dataSaveButton";
	navigation.appendChild(button);
	
	FileUtils.init();
}

PageManager.addView = function(name, view, displayName, mainPage){
	view.init();
//	var viewContent = initializer();
	PageManager.views[name] = view;
	var navigation = document.getElementById("navigation");
	var button = document.createElement("button");
	button.appendChild(document.createTextNode(displayName));
	navigation.appendChild(button)
	
	var onClickDelegate = function(view){
		return function(){
			var contentArea = document.getElementById("contentArea");
			removeChildren(contentArea);
			contentArea.appendChild(view.content);
			PageManager.currentView = view;
			view.refresh();
		};
	}
	
	button.addEventListener("click", onClickDelegate(view));
	if(mainPage){
		contentArea.appendChild(view.content);
		PageManager.currentView = view;
		view.refresh();
	}
}
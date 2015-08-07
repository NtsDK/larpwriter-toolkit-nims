

PageManager = {};

PageManager.onLoad = function(){
	var root = PageManager;
	root.views = {};
	var nav = "navigation";
	var content = "contentArea";
	Utils.addView(root, "Overview", Overview, "Обзор", nav, content);
	Utils.addView(root, "Characters", Characters, "Персонажи", nav, content);
	Utils.addView(root, "Stories", Stories, "Истории", nav, content, true);
	Utils.addView(root, "Events", Overview, "События", nav, content);
	Utils.addView(root, "Briefings", Overview, "Вводные", nav, content);
	
	var navigation = document.getElementById(nav);
	var button = document.createElement("input");
	button.type = "file";
	button.id = "dataLoadButton";
	navigation.appendChild(button);

	button = document.createElement("button");
	button.appendChild(document.createTextNode("Сохранить"));
	button.id = "dataSaveButton";
	navigation.appendChild(button);
	
	FileUtils.init();
	
	PageManager.currentView.refresh();
}


//PageManager.addView = function(rootObject, name, view, displayName, navigationId, contentAreaId, mainPage){
//	view.init();
////	var viewContent = initializer();
//	PageManager.views[name] = view;
//	var navigation = document.getElementById("navigation");
//	var button = document.createElement("button");
//	button.appendChild(document.createTextNode(displayName));
//	navigation.appendChild(button)
//	
//	var onClickDelegate = function(view){
//		return function(){
//			var contentArea = document.getElementById("contentArea");
//			removeChildren(contentArea);
//			contentArea.appendChild(view.content);
//			PageManager.currentView = view;
//			view.refresh();
//		};
//	}
//	
//	button.addEventListener("click", onClickDelegate(view));
//	if(mainPage){
//		contentArea.appendChild(view.content);
//		PageManager.currentView = view;
//		view.refresh();
//	}
//}
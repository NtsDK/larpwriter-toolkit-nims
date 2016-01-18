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
PageManager, Utils, Overview, Characters, Stories, Events, Briefings, Timeline, SocialNetwork, FileUtils
 */

"use strict";

var PageManager = {};

var DBMS;

PageManager.onLoad = function () {
	if(MODE === "Standalone"){
		DBMS = new LocalDBMS();
		DBMS.setDatabase(BaseExample.data, Utils.processError(PageManager.onDatabaseLoad));
	} else if(MODE === "NIMS_Server") {
		DBMS = new RemoteDBMS();
		PageManager.onDatabaseLoad();
	}
};

PageManager.onDatabaseLoad = function () {
    "use strict";
    
//  PageManager.enableFullScreenElements();
	PermissionInformer.refresh(function(err){
    	if(err) {Utils.handleError(err); return;}
    	
    	PermissionInformer.isAdmin(function(err, isAdmin){
    		if(err) {Utils.handleError(err); return;}
    		
    		var root = PageManager;
    		root.views = {};
    		var nav = "navigation";
    		var content = "contentArea";
    		var button;
    		var navigation = document.getElementById(nav);
    		var containers = {
    				root: root,
    				navigation: navigation,
    				content: document.getElementById(content)
    		};
    		Utils.addView(containers, "Overview", Overview, "Обзор", {mainPage:true});
    		Utils.addView(containers, "Characters", Characters, "Персонажи");
    		Utils.addView(containers, "Stories", Stories, "Истории");
    		Utils.addView(containers, "Events", Events, "Адаптации");
    		Utils.addView(containers, "Briefings", Briefings, "Вводные");
    		
    		button = document.createElement("div");
    		addClass(button, "nav-separator");
    		navigation.appendChild(button);
    		
    		Utils.addView(containers, "Timeline", Timeline, "", {id:"timelineButton", tooltip:"Хронология"});
    		Utils.addView(containers, "SocialNetwork", SocialNetwork, "", {id:"socialNetworkButton", tooltip:"Социальная сеть"});
    		Utils.addView(containers, "CharacterFilter", CharacterFilter, "", {id:"filterButton", tooltip:"Фильтр"});
    		
    		
    		button = document.createElement("div");
    		addClass(button, "nav-separator");
    		navigation.appendChild(button);
    		
    		if(isAdmin){
    			button = document.createElement("div");
    			button.id = "dataLoadButton";
    			$(button).tooltip({
    				title : "Загрузить базу из файла",
    				placement : "bottom"
    			});
    			addClass(button, "action-button");
    			var input = document.createElement("input");
    			input.type = "file";
    			button.appendChild(input);
    			navigation.appendChild(button);
    			button.addEventListener('change', FileUtils.readSingleFile, false);
    		}
    		PageManager.addButton("dataSaveButton", navigation, FileUtils.saveFile, {tooltip:"Сохранить базу на диск"});
    		if(MODE === "Standalone"){
    			PageManager.addButton("newBaseButton", navigation, FileUtils.makeNewBase, {tooltip:"Создать новую базу"});
    		}
    		PageManager.addButton("mainHelpButton", navigation, FileUtils.openHelp, {tooltip:"Документация"});
    		
//    var button = document.createElement("div");
//    button.id = "logoutButton";
//    addClass(button, "action-button");
//    button.appendChild(document.getElementById("logoutForm"));
//    navigation.appendChild(button);
    		
    		if(MODE === "NIMS_Server"){
    			Utils.addView(containers, "AccessManager", AccessManager, "", {id:"accessManagerButton", tooltip:"Администрирование"});
    			Utils.addView(containers, "Chat", Chat, "", {id:"chatButton", tooltip:"Чат"});
    		}
    		
    		FileUtils.init(function(err){
    			if(err) {Utils.handleError(err); return;}
    			PageManager.currentView.refresh();
    		});
    		
    		PageManager.currentView.refresh();
    	});
	});
    
};

PageManager.addButton = function(id, navigation, callback, opts){
	"use strict";
    var button = document.createElement("div");
    button.id = id;
    if(opts.tooltip){
		$(button).tooltip({
			title : opts.tooltip,
			placement : "bottom"
		});
    }
    addClass(button, "action-button");
    navigation.appendChild(button);
    button.addEventListener('click', callback);
};

//PageManager.enableFullScreenElements = function(){
//    "use strict";
//    var elems = document.getElementsByClassName("full-screen-elem");
//    var i, elem, button;
//    for (i = 0; i < elems.length; i++) {
//        elem = elems[i];
//        button = document.createElement("button");
//        button.appendChild(document.createTextNode("%"));
//        addClass(button, "fullScreenButton");
//        button.addEventListener("click", PageManager.fullScreenToggler(elem));
//        elem.appendChild(button);
//    }
//};
//
//PageManager.fullScreenToggler = function(elem){
//    "use strict";
//    return function(){
//        toggleClass(elem, "full-screen");
//    };
//};

window.onbeforeunload = function (evt) {
    var message = "Убедитесь, что сохранили данные. После закрытия страницы все несохраненные изменения будут потеряны.";
    if (typeof evt == "undefined") {
        evt = window.event;
    }
    if (evt) {
        evt.returnValue = message;
    }
    return message;
};

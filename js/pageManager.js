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
    L10n.localizeStatic();
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
    		var navigation = getEl(nav);
    		var containers = {
    				root: root,
    				navigation: navigation,
    				content: getEl(content)
    		};
    		Utils.addView(containers, "overview", Overview, {mainPage:true});
    		Utils.addView(containers, "characters", Characters);
    		Utils.addView(containers, "stories", Stories);
    		Utils.addView(containers, "adaptations", Events);
    		Utils.addView(containers, "briefings", Briefings);
    		
    		button = makeEl("div");
    		addClass(button, "nav-separator");
    		navigation.appendChild(button);
    		
    		Utils.addView(containers, "timeline", Timeline, {id:"timelineButton", tooltip:true});
    		Utils.addView(containers, "social-network", SocialNetwork, {id:"socialNetworkButton", tooltip:true});
    		Utils.addView(containers, "character-filter", CharacterFilter, {id:"filterButton", tooltip:true});
    		
    		
    		button = makeEl("div");
    		addClass(button, "nav-separator");
    		navigation.appendChild(button);
    		
    		if(isAdmin){
    			button = makeEl("div");
    			button.id = "dataLoadButton";
    			$(button).tooltip({
    				title : L10n.getValue("header-open-database"),
    				placement : "bottom"
    			});
    			addClass(button, "action-button");
//    			setAttr(button, "l10n-id", "header-open-database");
    			var input = makeEl("input");
    			input.type = "file";
    			button.appendChild(input);
    			navigation.appendChild(button);
    			button.addEventListener('change', FileUtils.readSingleFile, false);
    		}
    		PageManager.addButton("dataSaveButton", "save-database", navigation, FileUtils.saveFile, {tooltip:true});
    		if(MODE === "Standalone"){
    			PageManager.addButton("newBaseButton", "create-database", navigation, FileUtils.makeNewBase, {tooltip:true});
    		}
    		PageManager.addButton("mainHelpButton", "docs", navigation, FileUtils.openHelp, {tooltip:true});
    		PageManager.addButton("toggleL10nButton", "l10n", navigation, L10n.toggleL10n, {tooltip:true});
    		
//    var button = makeEl("div");
//    button.id = "logoutButton";
//    addClass(button, "action-button");
//    button.appendChild(getEl("logoutForm"));
//    navigation.appendChild(button);
    		
    		if(MODE === "NIMS_Server"){
    			Utils.addView(containers, "admins", AccessManager, {id:"accessManagerButton", tooltip:true});
    			Utils.addView(containers, "chat", Chat, {id:"chatButton", tooltip:true});
    		}
    		
    		FileUtils.init(function(err){
    			if(err) {Utils.handleError(err); return;}
    			PageManager.currentView.refresh();
    		});
    		
    		PageManager.currentView.refresh();
    	});
	});
    
};

PageManager.addButton = function(id, name, navigation, callback, opts){
	"use strict";
    var button = makeEl("div");
    button.id = id;
    if(opts.tooltip){
		$(button).tooltip({
			title : L10n.getValue("header-" + name),
			placement : "bottom"
		});
    }
//    setAttr(button, "l10n-id", "header-" + name);
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
//        button = makeEl("button");
//        button.appendChild(makeText("%"));
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
    var message = getL10n("utils-close-page-warning");
    if (typeof evt == "undefined") {
        evt = window.event;
    }
    if (evt) {
        evt.returnValue = message;
    }
    return message;
};

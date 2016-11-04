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
    UI.initSelectorFilters();
    UI.initPanelTogglers();
    if(MODE === "Standalone"){
        DBMS = new LocalDBMS();
        DBMS.setDatabase(BaseExample.data, function(err){
            if(err) {Utils.handleError(err); return;}
            PageManager.consistencyCheck(PageManager.onDatabaseLoad);
        });
    } else if(MODE === "NIMS_Server") {
        DBMS = new RemoteDBMS();
        PageManager.consistencyCheck(PageManager.onDatabaseLoad);
    }
};

PageManager.consistencyCheck = function(callback){
    "use strict";
    DBMS.getConsistencyCheckResult(function(err, consistencyErrors){
        if(err) {Utils.handleError(err); return;}
        consistencyErrors.forEach(CommonUtils.consoleLog);
        if(consistencyErrors.length > 0){
            Utils.alert(getL10n('overview-consistency-problem-detected'));
        } else {
            console.log('Consistency check didn\'t find errors');
        }
        callback();
    });
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
            
            addEl(navigation, addClass(makeEl("div"), "nav-separator"));
            
            Utils.addView(containers, "timeline", Timeline, {id:"timelineButton", tooltip:true});
            Utils.addView(containers, "social-network", SocialNetwork, {id:"socialNetworkButton", tooltip:true});
            Utils.addView(containers, "character-filter", CharacterFilter, {id:"filterButton", tooltip:true});
            Utils.addView(containers, "groups", Groups, {id:"groupsButton", tooltip:true});
            
            addEl(navigation, addClass(makeEl("div"), "nav-separator"));
            
            var btnOpts = {
                tooltip : true,
                className : 'mainNavButton'
            }
            
            if(isAdmin){
                var button = PageManager.makeButton("dataLoadButton", "open-database", null, btnOpts);
                button.addEventListener('change', FileUtils.readSingleFile, false);
                
                var input = makeEl("input");
                input.type = "file";
                button.appendChild(input);
                addEl(navigation, button);
            }
            
            addEl(navigation, PageManager.makeButton("dataSaveButton", "save-database", FileUtils.saveFile, btnOpts));
            if(MODE === "Standalone"){
                addEl(navigation, PageManager.makeButton("newBaseButton", "create-database", FileUtils.makeNewBase, btnOpts));
            }
            addEl(navigation, PageManager.makeButton("mainHelpButton", "docs", FileUtils.openHelp, btnOpts));
//            var l10nBtn = PageManager.makeButton("toggleL10nButton", "l10n", L10n.toggleL10n, btnOpts);
//            var setIcon = function(){
//                l10nBtn.style.backgroundImage = strFormat('url("./images/{0}.svg")', [getL10n('header-dictionary-icon')]);
//            }
//            L10n.onL10nChange(setIcon);
//            setIcon();
//            addEl(navigation, l10nBtn);
            
            Utils.addView(containers, "logViewer", LogViewer2, {id:"logViewerButton", tooltip:true});
//            addEl(navigation, PageManager.makeButton("testButton", "test", PageManager.runTests, btnOpts));
//            addEl(navigation, PageManager.makeButton("aboutButton", "about", null, btnOpts));
            if(MODE === "NIMS_Server"){
                Utils.addView(containers, "admins", AccessManager, {id:"accessManagerButton", tooltip:true});
//                Utils.addView(containers, "chat", Chat, {id:"chatButton", tooltip:true});
                addEl(navigation, PageManager.makeButton("logoutButton", "logout", PageManager.postLogout, btnOpts));
            }
            
            FileUtils.init(function(err){
                if(err) {Utils.handleError(err); return;}
                PageManager.consistencyCheck(PageManager.currentView.refresh);
            });
            
            PageManager.currentView.refresh();
        });
    });
    
};

PageManager.runTests = function(){
    "use strict";
//    window.RunTests();
    PageManager.consistencyCheck(function(){});
};

PageManager.postLogout = function(){
    "use strict";
    document.querySelector('#logoutForm button').click();
};

PageManager.makeButton = function(id, name, callback, opts){
    "use strict";
    var button = makeEl("div");
    button.id = id;
    if(opts.tooltip){
        var delegate = function(){
            $(button).attr('data-original-title', L10n.getValue("header-" + name));
        };
        L10n.onL10nChange(delegate);
        $(button).tooltip({
            title : L10n.getValue("header-" + name),
            placement : "bottom"
        });
    }
    addClass(button, "action-button");
    if(opts.className){
        addClass(button, opts.className);
    }
    if(callback){
        listen(button, 'click', callback);
    }
    return button;
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

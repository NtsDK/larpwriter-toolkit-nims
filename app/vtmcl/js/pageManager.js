/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

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
Utils, Overview, Profiles, Stories, Adaptations, Briefings, Timeline, SocialNetwork, FileUtils
 */

"use strict";

(function(exports){

    var state = {};
    state.views = {};
    
    var btnOpts = {
        tooltip : true,
        className : 'mainNavButton'
    }
    
    var initPage = function(){
        L10n.localizeStatic();
        L10n.onL10nChange(() => state.currentView.refresh());
        UI.initSelectorFilters();
        UI.initPanelTogglers();
        function updateDialogs(){
            vex.dialog.buttons.YES.text = getL10n('common-ok');
            vex.dialog.buttons.NO.text = getL10n('common-cancel');
        }
        updateDialogs();
        L10n.onL10nChange(updateDialogs);
    }
    
    var curTheme = Constants.themeList[1];
    
    var initTheme = function() {
        if(DBMS.setTheme){
            DBMS.getTheme(function(err, theme){
                if(err) {console.log(err);}
                if(theme !== ''){
                    curTheme = theme;
                }
                addClass(queryEl('body'), curTheme);
            });
        } else {
            addClass(queryEl('body'), curTheme);
        }
    };
    
    var nextTheme = function() {
        removeClass(queryEl('body'), curTheme);
        curTheme = Constants.themeList[(R.indexOf(curTheme, Constants.themeList)+1)%Constants.themeList.length];
        addClass(queryEl('body'), curTheme);
        if(DBMS.setTheme){
            DBMS.setTheme(curTheme, function(err){
                if(err) {console.log(err); return;}
            });
        }
    };
    
    var protoExpander = function(arr){
        function protoCarrier(){};
        arr.forEach( name => protoCarrier.prototype[name] = (() => 1));
        return protoCarrier;
    };
    
//    var playerArr = [
//                    'getShop'        ,
//                    "createCategory" ,
//                    "renameCategory" ,
//                    "removeCategory" ,
//                    
//                    "getLocalAsset",
//                    "createLocalAsset",
//                    "renameLocalAsset",
//                    "removeLocalAsset",
//                    
//                    "updateLocalAssetField",
//                    "setAssetCost",
//                    "addGlobalAssetToCategory",
//                    "addLocalAssetToCategory" ,
//                    
//                    "removeGlobalAssetFromCategory",
//                    "removeLocalAssetFromCategory",
//                    "getShopName",
//                    "getAsset",
//                    
//                    "getShopIndex",
//                    "getGlobalAssetDisplayNames",
//                    "buyAsset",
//                    "getTheme",
//                    "setTheme",
//                    ];
//    
//    exports.onPlayerPageLoad = function () {
//        initPage();
//        var RemoteDBMS = makeRemoteDBMS(protoExpander(playerArr));
//        window.DBMS = new RemoteDBMS();
//        initTheme();
//        stateInit();
//        Utils.addView(state.containers, "shop-management", PlayerShopManagement, {mainPage:true});
//        Utils.addView(state.containers, "shop-window", ShopWindow);
//        Utils.addView(state.containers, "shop-about", ShopAbout);
//        addEl(state.navigation, addClass(makeEl("div"), "nav-separator"));
////        addEl(state.navigation, makeL10nButton());
//        addEl(state.navigation, makeButton("themeButton", "theme", () => nextTheme(), btnOpts));
//        addEl(state.navigation, makeButton("logoutButton", "logout", postLogout, btnOpts));
//        addEl(state.navigation, makeButton("refreshButton", "refresh", () => state.currentView.refresh(), btnOpts));
//        addEl(state.navigation, makeButton("fullScreenButton", "fullScreen", toggleToolbarButtons, btnOpts));
//        state.currentView.refresh();
//    };
    
    var toggleToolbarButtons = () => {
        queryEls('#navigation > button').filter( button => !hasClass(button, 'refreshButton') && !hasClass(button, 'fullScreenButton'))
                                        .map(toggleClass(R.__, 'hidden'));
    };
    
//    exports.onIndexPageLoad = function () {
//        initPage();
//        var RemoteDBMS = makeRemoteDBMS(protoExpander(['getPlayersOptions','getRoleGridInfo']));
//        window.DBMS = new RemoteDBMS();
//        initTheme();
//        stateInit();
//        addEl(state.navigation, addClass(makeEl("div"), "nav-separator"));
//        Utils.addView(state.containers, "enter", Enter, {mainPage:true});
////            addEl(state.navigation, makeL10nButton());
//        state.currentView.refresh();
//    };
    
    exports.onMasterPageLoad = function () {
        initPage();
        var LocalDBMS = makeLocalDBMS(true);
        if(MODE === "Standalone"){
            window.DBMS = new LocalDBMS();
            DBMS.setDatabase(BaseExample.data, function(err){
                if(err) {Utils.handleError(err); return;}
                consistencyCheck(onDatabaseLoad);
            });
        } else if(MODE === "NIMS_Server") {
            var RemoteDBMS = makeRemoteDBMS(LocalDBMS);
            window.DBMS = new RemoteDBMS();
            consistencyCheck(onDatabaseLoad);
        }
    };
    
    var consistencyCheck = function(callback){
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
    
    var stateInit = function(){
        state.navigation = getEl("navigation");
        state.containers = {
                root: state,
                navigation: state.navigation,
                content: getEl("contentArea")
        };
    };
    
    var onDatabaseLoad = function () {
        initTheme();
        PermissionInformer.refresh(function(err){
            if(err) {Utils.handleError(err); return;}
            
            PermissionInformer.isAdmin(function(err, isAdmin){
                if(err) {Utils.handleError(err); return;}
                
                var button;
                stateInit();

                Utils.addView(state.containers, "charlist", Charlist, {mainPage:true});
//                Utils.addView(state.containers, "shops2", Shops2);
//                Utils.addView(state.containers, "assets", Assets);
//                Utils.addView(state.containers, "apiCheck", ApiCheck);
                
                addEl(state.navigation, addClass(makeEl("div"), "nav-separator"));
                
                if(isAdmin){
                    var button = makeButton("dataLoadButton", "open-database", null, btnOpts);
                    button.addEventListener('change', FileUtils.readSingleFile, false);
                    
                    var input = makeEl("input");
                    input.type = "file";
                    addClass(input, 'hidden');
                    setAttr(input, 'tabindex', -1);
                    button.appendChild(input);
                    button.addEventListener('click', function(e){
                        input.click();
    //                    e.preventDefault(); // prevent navigation to "#"
                    });
                    addEl(state.navigation, button);
                }
                
//                addEl(state.navigation, makeButton("themeButton", "theme", () => nextTheme(), btnOpts));
                addEl(state.navigation, makeButton("dataSaveButton", "save-database", FileUtils.saveFile, btnOpts));
                if(MODE === "Standalone"){
                    addEl(state.navigation, makeButton("newBaseButton", "create-database", FileUtils.makeNewBase, btnOpts));
                }
//                addEl(state.navigation, makeButton("mainHelpButton", "docs", FileUtils.openHelp, btnOpts));
                
                addEl(state.navigation, makeL10nButton());
                
                Utils.addView(state.containers, "logViewer", LogViewer2, {clazz:"logViewerButton", tooltip:true});
                addEl(state.navigation, makeButton("testButton", "test", runTests, btnOpts));
                if(MODE === "NIMS_Server"){
//                    Utils.addView(state.containers, "admins", AccessManager, {clazz:"accessManagerButton", tooltip:true});
                    addEl(state.navigation, makeButton("logoutButton", "logout", postLogout, btnOpts));
                }
//                addEl(state.navigation, makeButton("refreshButton", "refresh", () => state.currentView.refresh(), btnOpts));
                
                FileUtils.init(function(err){
                    if(err) {Utils.handleError(err); return;}
                    consistencyCheck(state.currentView.refresh);
                });
                
                state.currentView.refresh();
                if(MODE === "Standalone") {
                    addBeforeUnloadListener();
                }
            });
        });
        
    };
    
    var makeL10nButton = function(){
        var l10nBtn = makeButton("toggleL10nButton", "l10n", L10n.toggleL10n, btnOpts);
        var setIcon = function(){
            l10nBtn.style.backgroundImage = strFormat('url("./images/{0}.svg")', [getL10n('header-dictionary-icon')]);
        }
        L10n.onL10nChange(setIcon);
        setIcon();
        return l10nBtn;
    };
    
    var runTests = function(){
    //    window.RunTests();
        consistencyCheck(() => '');
//        consistencyCheck(function(err, checkRes){
//            if(err) {Utils.handleError(err); return;}
//            if(checkRes === undefined || checkRes.length === 0){
//                Utils.alert(getL10n('overview-consistency-is-ok'));
//            } else {
//                Utils.alert(getL10n('overview-consistency-problem-detected'));
//            }
//        });
    };
    
    var postLogout = function(){
        document.querySelector('#logoutForm button').click();
    };
    
    var makeButton = function(clazz, name, callback, opts){
        var button = makeEl("button");
        addClass(button, clazz);
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
    
    var addBeforeUnloadListener = function(){
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
    }
    

})(this['PageManager']={});
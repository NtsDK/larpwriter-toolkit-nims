/*Copyright 2015, 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

'use strict';

((exports) => {
    const state = {};
    state.views = {};

    const btnOpts = {
        tooltip: true,
        className: 'mainNavButton'
    };

    const initPage = () => {
        L10n.init();
        L10n.onL10nChange(() => state.currentView.refresh());
        UI.initSelectorFilters();
        UI.initPanelTogglers();
        L10n.localizeStatic();
        function updateDialogs() {
            vex.dialog.buttons.YES.text = getL10n('common-ok');
            vex.dialog.buttons.NO.text = getL10n('common-cancel');
        }
        updateDialogs();
        L10n.onL10nChange(updateDialogs);
    };

    const protoExpander = (arr) => {
        function protoCarrier() {}
        arr.forEach(name => (protoCarrier.prototype[name] = (() => 1)));
        return protoCarrier;
    };
    const playerArr = [
        'getPlayersOptions',
        'getWelcomeText',
        'getPlayerProfileInfo',
        'createCharacterByPlayer',
        'updateProfileField',
        'getRoleGridInfo'];

    exports.refresh = () => state.currentView.refresh();

    exports.onPlayerPageLoad = () => {
        initPage();
        const RemoteDBMS = makeRemoteDBMS(protoExpander(playerArr));
        window.DBMS = new RemoteDBMS();
        stateInit();
        Utils.addView(state.containers, 'player', Player, { mainPage: true });
        addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));
        Utils.addView(state.containers, 'about', About);
        //        addEl(state.navigation, makeL10nButton());
        addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
        state.currentView.refresh();
    };

    exports.onIndexPageLoad = () => {
        initPage();
        const RemoteDBMS = makeRemoteDBMS(protoExpander(['getPlayersOptions', 'getRoleGridInfo']));
        window.DBMS = new RemoteDBMS();
        stateInit();
        DBMS.getPlayersOptions((err, playersOptions) => {
            if (err) { Utils.handleError(err); return; }
            addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));
            Utils.addView(state.containers, 'enter', Enter, { mainPage: true });
            if (playersOptions.allowPlayerCreation) {
                Utils.addView(state.containers, 'register', Register);
            }
            Utils.addView(state.containers, 'about', About);
            //            addEl(state.navigation, makeL10nButton());
            state.currentView.refresh();
        });
    };

    exports.onMasterPageLoad = () => {
        initPage();
        const LocalDBMS = makeLocalDBMS(true);
        if (MODE === 'Standalone') {
            window.DBMS = new LocalDBMS();
            DBMS.setDatabase(BaseExample.data, (err) => {
                if (err) { Utils.handleError(err); return; }
                consistencyCheck((checkResult) => {
                    consistencyCheckAlert(checkResult);
                    onDatabaseLoad();
                });
            });
        } else if (MODE === 'NIMS_Server') {
            const RemoteDBMS = makeRemoteDBMS(LocalDBMS);
            window.DBMS = new RemoteDBMS();
            consistencyCheck((checkResult) => {
                consistencyCheckAlert(checkResult);
                onDatabaseLoad();
            });
        }
    };

    function consistencyCheckAlert(checkResult) {
        if (checkResult.errors.length > 0) {
            Utils.alert(getL10n('overview-consistency-problem-detected'));
        } else {
            console.log('Consistency check didn\'t find errors');
        }
    }

    function consistencyCheck(callback) {
        DBMS.getConsistencyCheckResult((err, checkResult) => {
            if (err) { Utils.handleError(err); return; }
            checkResult.errors.forEach(CommonUtils.consoleErr);
            callback(checkResult);
        });
    }

    function stateInit() {
        state.navigation = getEl('navigation');
        state.containers = {
            root: state,
            navigation: state.navigation,
            content: getEl('contentArea')
        };
    }

    function onDatabaseLoad() {
        PermissionInformer.refresh((err) => {
            if (err) { Utils.handleError(err); return; }

            PermissionInformer.isAdmin((err2, isAdmin) => {
                if (err2) { Utils.handleError(err2); return; }

                let button;
                stateInit();

                const tabs = {};
                const firstTab = 'Overview';

                const addView = (containers, btnName, viewName, opts) => {
                    tabs[viewName] = {
                        viewName,
                        viewRes: Utils.addView(containers, btnName, window[viewName], opts)
                    };
                };

                addView(state.containers, 'overview', 'Overview');
                //                addView(state.containers, 'profiles', 'Profiles');
                addView(state.containers, 'characters', 'Characters');
                addView(state.containers, 'players', 'Players');
                addView(state.containers, 'stories', 'Stories');
                addView(state.containers, 'adaptations', 'Adaptations');
                addView(state.containers, 'briefings', 'Briefings');
                addView(state.containers, 'relations', 'Relations');

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                addView(state.containers, 'timeline', 'Timeline', { clazz: 'timelineButton icon-button', tooltip: true });
                addView(state.containers, 'social-network', 'SocialNetwork', { clazz: 'socialNetworkButton icon-button', tooltip: true });
                addView(state.containers, 'profile-filter', 'ProfileFilter', { clazz: 'filterButton icon-button', tooltip: true });
                addView(state.containers, 'groups', 'GroupProfile', { clazz: 'groupsButton icon-button', tooltip: true });
                addView(state.containers, 'textSearch', 'TextSearch', { clazz: 'textSearchButton icon-button', tooltip: true });
                addView(state.containers, 'roleGrid', 'RoleGrid', { clazz: 'roleGridButton icon-button', tooltip: true });
                addView(state.containers, 'gears', 'Gears', { clazz: 'gearsButton icon-button', tooltip: true });
                addView(state.containers, 'sliders', 'Sliders', { clazz: 'slidersButton icon-button', tooltip: true });

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                if (MODE === 'NIMS_Server') {
                    addView(state.containers, 'admins', 'AccessManager', { clazz: 'accessManagerButton icon-button', tooltip: true });
                }
                addView(state.containers, 'logViewer', 'LogViewer2', { clazz: 'logViewerButton icon-button', tooltip: true });

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                if (isAdmin) {
                    button = makeButton('dataLoadButton icon-button', 'open-database', null, btnOpts);
                    button.addEventListener('change', FileUtils.readSingleFile, false);

                    const input = makeEl('input');
                    input.type = 'file';
                    addClass(input, 'hidden');
                    setAttr(input, 'tabindex', -1);
                    button.appendChild(input);
                    button.addEventListener('click', (e) => {
                        input.value = '';
                        input.click();
                        //                    e.preventDefault(); // prevent navigation to "#"
                    });
                    addEl(state.navigation, button);
                }

                addEl(state.navigation, makeButton('dataSaveButton icon-button', 'save-database', FileUtils.saveFile, btnOpts));
                if (MODE === 'Standalone') {
                    addEl(state.navigation, makeButton('newBaseButton icon-button', 'create-database', FileUtils.makeNewBase, btnOpts));
                }
                addEl(state.navigation, makeButton('mainHelpButton icon-button', 'docs', FileUtils.openHelp, btnOpts));

                //                addEl(state.navigation, makeL10nButton());

                addEl(state.navigation, makeButton('testButton icon-button', 'test', TestUtils.runTests, btnOpts));
                addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
                addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'showDbmsConsistencyState', showDbmsConsistencyState, btnOpts));
                addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'clickAllTabs', TestUtils.clickThroughtHeaders, btnOpts));
                addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'showDiff', TestUtils.showDiffExample, btnOpts));
                if (MODE === 'NIMS_Server') {
                    addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
                }
                addEl(state.navigation, makeButton('refreshButton icon-button', 'refresh', () => state.currentView.refresh(), btnOpts));

                FileUtils.init((err3) => {
                    if (err3) { Utils.handleError(err3); return; }
                    consistencyCheck((checkResult) => {
                        consistencyCheckAlert(checkResult);
                        state.currentView.refresh();
                    });
                });

                Utils.setFirstTab(state.containers, tabs[firstTab].viewRes);

                state.currentView.refresh();
                if (MODE === 'Standalone') {
                    addBeforeUnloadListener();
//                    localAutoSave();
                }
                //                                runTests();
            });
        });
    }

    function makeL10nButton() {
        const l10nBtn = makeButton('toggleL10nButton', 'l10n', L10n.toggleL10n, btnOpts);
        const setIcon = () => {
            l10nBtn.style.backgroundImage = strFormat('url("./images/{0}.svg")', [getL10n('header-dictionary-icon')]);
        };
        L10n.onL10nChange(setIcon);
        setIcon();
        return l10nBtn;
    }

    function showDbmsConsistencyState() {
        consistencyCheck(checkRes => TestUtils.showModuleSchema(checkRes));
    }

    function checkConsistency() {
        consistencyCheck(checkRes => TestUtils.showConsistencyCheckAlert(checkRes));
    }

    function postLogout() {
        document.querySelector('#logoutForm button').click();
    }

    function makeButton(clazz, name, callback, opts) {
        const button = makeEl('button');
        addClass(button, clazz);
        if (opts.tooltip) {
            const delegate = () => {
                $(button).attr('data-original-title', L10n.getValue(`header-${name}`));
            };
            L10n.onL10nChange(delegate);
            $(button).tooltip({
                title: L10n.getValue(`header-${name}`),
                placement: 'bottom'
            });
        }
        addClass(button, 'action-button');
        if (opts.className) {
            addClass(button, opts.className);
        }
        if (callback) {
            listen(button, 'click', callback);
        }
        return button;
    }

    function addBeforeUnloadListener() {
        window.onbeforeunload = (evt) => {
            const message = getL10n('utils-close-page-warning');
            if (typeof evt === 'undefined') {
                evt = window.event;
            }
            if (evt) {
                evt.returnValue = message;
            }
            return message;
        };
    }
    
//    function localAutoSave() {
//        if (!window.indexedDB) {
//            Utils.alert("Ваш браузер не поддерживат стабильную версию IndexedDB. Такие-то функции будут недоступны");
//            return;
//        }
//        
//        let counter = 0;
//        setInterval(() => {
//            console.log(counter + 1);
//            counter = (counter + 1) % 3;
//        }, 1000);
////        LocalBaseAPI.test();
//        
////        DBMS.getDatabase((err, database) => {
////            if (err) { Utils.handleError(err); return; }
////            
////            LocalBaseAPI.test();
////        });
//    }
    
})(this.PageManager = {});

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
        L10n.localizeStatic();
        L10n.onL10nChange(() => state.currentView.refresh());
        UI.initSelectorFilters();
        UI.initPanelTogglers();
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
        //        Utils.addView(state.containers, "roleGrid", RoleGrid);
        Utils.addView(state.containers, 'about', About);
        //        addEl(state.navigation, makeL10nButton());
        addEl(state.navigation, makeButton('logoutButton', 'logout', postLogout, btnOpts));
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
            //            Utils.addView(state.containers, "roleGrid", RoleGrid, {mainPage:true});
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
                consistencyCheck(onDatabaseLoad);
            });
        } else if (MODE === 'NIMS_Server') {
            const RemoteDBMS = makeRemoteDBMS(LocalDBMS);
            window.DBMS = new RemoteDBMS();
            consistencyCheck(onDatabaseLoad);
        }
    };

    function consistencyCheck(callback) {
        DBMS.getConsistencyCheckResult((err, consistencyErrors) => {
            if (err) { Utils.handleError(err); return; }
            consistencyErrors.forEach(CommonUtils.consoleLog);
            if (consistencyErrors.length > 0) {
                Utils.alert(getL10n('overview-consistency-problem-detected'));
            } else {
                console.log('Consistency check didn\'t find errors');
            }
            callback();
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

                Utils.addView(state.containers, 'overview', Overview);
                Utils.addView(state.containers, 'profiles', Profiles);
                Utils.addView(state.containers, 'stories', Stories);
                Utils.addView(state.containers, 'adaptations', Adaptations);
                Utils.addView(state.containers, 'briefings', Briefings);
                
                //            Utils.addView(state.containers, "about", About);

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                Utils.addView(state.containers, 'timeline', Timeline, { clazz: 'timelineButton icon-button', tooltip: true });
                Utils.addView(state.containers, 'social-network', SocialNetwork, { clazz: 'socialNetworkButton icon-button', tooltip: true });
                Utils.addView(state.containers, 'profile-filter', ProfileFilter, { clazz: 'filterButton icon-button', tooltip: true });
                Utils.addView(state.containers, 'groups', Groups, { clazz: 'groupsButton icon-button', tooltip: true });
                Utils.addView(state.containers, 'textSearch', TextSearch, { clazz: 'textSearchButton icon-button', tooltip: true });
                Utils.addView(state.containers, "roleGrid", RoleGrid, { clazz: 'roleGridButton icon-button', tooltip: true, mainPage: true });

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));
                
                if (MODE === 'NIMS_Server') {
                    Utils.addView(state.containers, 'admins', AccessManager, { clazz: 'accessManagerButton icon-button', tooltip: true });
//                    addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
                }
                Utils.addView(state.containers, 'logViewer', LogViewer2, { clazz: 'logViewerButton icon-button', tooltip: true });
                
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

                //addEl(state.navigation, makeL10nButton());

                addEl(state.navigation, makeButton('testButton icon-button', 'test', runTests, btnOpts));
                addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
                addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'clickAllTabs', clickThroughtHeaders, btnOpts));
                if (MODE === 'NIMS_Server') {
//                    Utils.addView(state.containers, 'admins', AccessManager, { clazz: 'accessManagerButton icon-button', tooltip: true });
                    addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
                }
                addEl(state.navigation, makeButton('refreshButton icon-button', 'refresh', () => state.currentView.refresh(), btnOpts));

                FileUtils.init((err3) => {
                    if (err3) { Utils.handleError(err3); return; }
                    consistencyCheck(state.currentView.refresh);
                });

                state.currentView.refresh();
                if (MODE === 'Standalone') {
                    addBeforeUnloadListener();
                }
                //                                runTests();
            });
        });
    }

    function clickThroughtHeaders() {
        let tabs = queryEls('#navigation .navigation-button');

        let index = 0;
        let subTabsNum = 0;
        function runClicker() {
            if (index <= tabs.length - 1) {
                tabs[index].click();
                if (subTabsNum === 0) {
                    const subTabs = queryEls('#contentArea .navigation-button');
                    tabs = R.insertAll(index + 1, subTabs, tabs);
                    subTabsNum = subTabs.length;
                } else {
                    subTabsNum--;
                }
                index++;
                setTimeout(runClicker, 500);
            }
        }
        runClicker();
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

    function runTests() {
        window.RunTests();
    }

    function checkConsistency() {
        consistencyCheck((err, checkRes) => {
            if (err) { Utils.handleError(err); return; }
            if (checkRes === undefined || checkRes.length === 0) {
                Utils.alert(getL10n('overview-consistency-is-ok'));
            } else {
                Utils.alert(getL10n('overview-consistency-problem-detected'));
            }
        });
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
})(this.PageManager = {});

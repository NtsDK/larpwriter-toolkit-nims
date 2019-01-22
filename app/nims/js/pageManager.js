

require('bootstrap-sass');
require('bootstrap-sass/assets/stylesheets/_bootstrap.scss');

require('@fortawesome/fontawesome-free/css/all.css');

require("jquery-datetimepicker");
require("jquery-datetimepicker/build/jquery.datetimepicker.min.css");
window.moment = require("moment");

require('select2');
require('select2/dist/css/select2.min.css');

require("../index.html");
require("../style/common.css");
require("../style/icons.css");
require("../style/style.css");
const {makeLocalDBMS} = require('./dbms/localDBMS.js');



var MODE = "Standalone";

// const { U, L10n, Utils, UI, CommonUtils, DemoBase, FileUtils, TestUtils, LocalBaseAPI }  = require('../../core');

// const CommonUtils = require('../../core/js/common/commonUtils.js');

// const DemoBase = require('../../core/js/demoBase.js');
const PermissionInformer = require('permissionInformer');
// const PermissionInformer = require('./permissionInformer.js');

var vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'));
vex.defaultOptions.className = 'vex-theme-os';

// const Overview = require('./pages/overview/overview.js')
const { Overview, Adaptations, Relations, RoleGrid, Timeline, SocialNetwork, TextSearch,
    Briefings, LogViewer2 } = require('./pages');

// require("../../core/js/common/commonUtils.js");
//const R = require("ramda");

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





// ((exports) => {
    const state = {};
    state.views = {};
    state.firstBaseLoad = MODE === 'Standalone';

    const BACKUP_NUMBER = 4;
    const BACKUP_INTERVAL = 60000*10; // 10 min

    const btnOpts = {
        tooltip: true,
        className: 'mainNavButton'
    };

    function SettingsManager() {
        this.clearSettings();
    }

    SettingsManager.prototype.getSettings = function () {
        return this.Settings;
    };

    SettingsManager.prototype.clearSettings = function () {
        this.Settings = {
            BriefingPreview: {},
            Stories: {},
            ProfileEditor: {}
        };
    };

    const initPage = () => {
        L10n.init();
        L10n.onL10nChange(() => state.currentView.refresh());
        UI.initSelectorFilters();
        UI.initPanelTogglers();
        L10n.localizeStatic();
        function updateDialogs() {
            vex.dialog.buttons.YES.text = L10n.getValue('common-ok');
            vex.dialog.buttons.NO.text = L10n.getValue('common-cancel');
        }
        updateDialogs();
        L10n.onL10nChange(updateDialogs);
        window.SM = new SettingsManager();
    };

    exports.refresh = () => state.currentView.refresh();

    exports.onPlayerPageLoad = () => {
        initPage();
        window.DBMS = makeRemoteDBMS();

        stateInit();
        UI.addView(state.containers, 'player', Player, { mainPage: true });
        U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
        UI.addView(state.containers, 'about', About);
        //        U.addEl(state.navigation, makeL10nButton());
        U.addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
        state.currentView.refresh();
    };

    exports.onIndexPageLoad = () => {
        initPage();
        window.DBMS = makeRemoteDBMS();
        stateInit();
        DBMS.getPlayersOptions().then((playersOptions) => {
            U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
            UI.addView(state.containers, 'enter', Enter, { mainPage: true });
            if (playersOptions.allowPlayerCreation) {
                UI.addView(state.containers, 'sign-up', SignUp);
            }
            UI.addView(state.containers, 'about', About);
            //            U.addEl(state.navigation, makeL10nButton());
            state.currentView.refresh();
        }).catch(Utils.handleError);
    };

    exports.onOrganizerPageLoad = () => {
        initPage();
        // const LocalDBMS = makeLocalDBMS(true);
        if (MODE === 'Standalone') {
            window.DBMS = makeLocalDBMS();
            DBMS.setDatabase({database: DemoBase.data}).then( onBaseLoaded, Utils.handleError);
            // runBaseSelectDialog();
        } else if (MODE === 'NIMS_Server') {
            window.DBMS = makeRemoteDBMS();
            consistencyCheck((checkResult) => {
                consistencyCheckAlert(checkResult);
                onDatabaseLoad();
            });
        }
    };

    function runBaseSelectDialog() {
        const dbDialog = U.queryEl('.set-database-dialog');
        U.addEl(U.queryEl('body'), dbDialog);
        U.listen(U.qee(dbDialog, '.on-action-button'), 'click', (event) => {
            $(dbDialog).modal('hide');
        });

        readLocalBases().then((browserBases) => {
            U.addEls(U.qee(dbDialog, '.modal-body .backup-bases'), (browserBases || []).map((base,i) => {
                const baseSelect = U.qmte('.backup-base-tmpl');
                const input = U.qee(baseSelect, 'input');
                U.setAttr(input, 'value', "browserBackup" + i);
                U.setAttr(input, 'id', "dbSourceBrowserBackup" + i);
                input.base = base;
                U.setAttr(U.qee(baseSelect, 'label'), 'for', "dbSourceBrowserBackup" + i);
                const date = new Date(base.Meta.saveTime).format('dd mmm yyyy HH:MM:ss');
                U.addEl(U.qee(baseSelect, '.base-name'), U.makeText(base.Meta.name + ' (' + date + ')'));
                return baseSelect;
            }));

            U.qee(dbDialog, 'input[name=dbSource]').checked = true;
            U.qee(dbDialog, '#dbSourceDemoBase').base = CommonUtils.clone(DemoBase.data);
            U.qee(dbDialog, '#dbSourceEmptyBase').base = CommonUtils.clone(EmptyBase.data);

            U.addEl(U.qee(dbDialog, '.demo-base-name'), U.makeText(DemoBase.data.Meta.name));

            const dialogOnBaseLoad = err => {
                if (err) { Utils.handleError(err); return; }
                $(dbDialog).modal('hide');
                onBaseLoaded(err);
            }

            initBaseLoadBtn(U.qee(dbDialog, '.upload-db'), U.qee(dbDialog, '.upload-db input'), dialogOnBaseLoad);

            U.listen(U.qee(dbDialog, '.on-action-button'), 'click', () => {
                const base = U.getSelectedRadio(dbDialog, 'input[name=dbSource]').base;
                DBMS.setDatabase({database: base}).then(() => {
                    dialogOnBaseLoad();
                }).catch(Utils.handleError);
            });

            L10n.localizeStatic(dbDialog);

            $(dbDialog).modal({
                backdrop: 'static'
            });
        }).catch(err => console.error(err));
    }

    function consistencyCheckAlert(checkResult) {
        if (checkResult.errors.length > 0) {
            Utils.alert(L10n.getValue('overview-consistency-problem-detected'));
        } else {
            console.log('Consistency check didn\'t find errors');
        }
    }

    function consistencyCheck(callback) {
        DBMS.getConsistencyCheckResult().then(checkResult => {
            checkResult.errors.forEach(CommonUtils.consoleErr);
            callback(checkResult);
        }).catch(Utils.handleError);
    }

    function stateInit() {
        state.navigation = U.queryEl('#navigation');
        state.containers = {
            root: state,
            navigation: state.navigation,
            content: U.queryEl('#contentArea')
        };
    }

    function onDatabaseLoad() {
        PermissionInformer.refresh().then(() => {
            PermissionInformer.isAdmin().then((isAdmin) => {
                $.datetimepicker.setDateFormatter('moment');

                let button;
                stateInit();

                const tabs = {};
                const firstTab = 'LogViewer2';

                const addView = (containers, btnName, viewName, view, opts) => {
                    tabs[viewName] = {
                        viewName,
                        viewRes: UI.addView(containers, btnName, view, opts)
                        // viewRes: UI.addView(containers, btnName, window[viewName], opts)
                    };
                };

                addView(state.containers, 'overview', 'Overview', Overview);
                // //                addView(state.containers, 'profiles', 'Profiles');
                // addView(state.containers, 'characters', 'Characters');
                // addView(state.containers, 'players', 'Players');
                // addView(state.containers, 'stories', 'Stories');
                addView(state.containers, 'adaptations', 'Adaptations', Adaptations);
                addView(state.containers, 'briefings', 'Briefings', Briefings);
                addView(state.containers, 'relations', 'Relations', Relations);

                U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));

                addView(state.containers, 'timeline', 'Timeline', Timeline, { clazz: 'timelineButton icon-button', tooltip: true });
                addView(state.containers, 'social-network', 'SocialNetwork', SocialNetwork, { clazz: 'socialNetworkButton icon-button', tooltip: true });
                // addView(state.containers, 'profile-filter', 'ProfileFilter', { clazz: 'filterButton icon-button', tooltip: true });
                // addView(state.containers, 'groups', 'GroupProfile', { clazz: 'groupsButton icon-button', tooltip: true });
                addView(state.containers, 'textSearch', 'TextSearch', TextSearch, { clazz: 'textSearchButton icon-button', tooltip: true });
                addView(state.containers, 'roleGrid', 'RoleGrid', RoleGrid, { clazz: 'roleGridButton icon-button', tooltip: true });

                U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));

                // if (MODE === 'NIMS_Server') {
                //     addView(state.containers, 'admins', 'AccessManager', { clazz: 'accessManagerButton icon-button', tooltip: true });
                // }
                addView(state.containers, 'logViewer', 'LogViewer2', LogViewer2, { clazz: 'logViewerButton icon-button', tooltip: true });

                U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));

                if (isAdmin) {
                    button = makeButton('dataLoadButton icon-button', 'open-database', null, btnOpts);
                    const input = U.makeEl('input');
                    input.type = 'file';
                    U.addClass(input, 'hidden');
                    U.setAttr(input, 'tabindex', -1);
                    button.appendChild(input);

                    initBaseLoadBtn(button, input, onBaseLoaded);
                    U.addEl(state.navigation, button);
                }

                U.addEl(state.navigation, makeButton('dataSaveButton icon-button', 'save-database', FileUtils.saveFile, btnOpts));
                if (MODE === 'Standalone') {
                    U.addEl(state.navigation, makeButton('newBaseButton icon-button', 'create-database', () => {
                        FileUtils.makeNewBase().then((confirmed) => {
                            if(confirmed){
                                onBaseLoaded();
                            }
                        }).catch(Utils.handleError);
                    }, btnOpts));
                }
//                U.addEl(state.navigation, makeButton('mainHelpButton icon-button', 'docs', FileUtils.openHelp, btnOpts));

                //                U.addEl(state.navigation, makeL10nButton());

                U.addEl(state.navigation, makeButton('testButton icon-button', 'test', TestUtils.runTests, btnOpts));
                U.addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
//                U.addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'showDbmsConsistencyState', showDbmsConsistencyState, btnOpts));
                U.addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'clickAllTabs', TestUtils.clickThroughtHeaders, btnOpts));
                U.addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'testTab', () => {
                    if(state.currentView.test){
                        state.currentView.test();
                    } else {
                        console.error('This tab has no tests')
                    }
                }, btnOpts));
                // U.addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'showDiff', TestUtils.showDiffExample, btnOpts));
                if (MODE === 'NIMS_Server') {
                    U.addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
                }
                U.addEl(state.navigation, makeButton('refreshButton icon-button', 'refresh', () => state.currentView.refresh(), btnOpts));

                Utils.setFirstTab(state.containers, tabs[firstTab].viewRes);

                state.currentView.refresh();
                if (MODE === 'Standalone') {
                    addBeforeUnloadListener();
                    localAutoSave();
                }

                // setTimeout(TestUtils.runTests, 1000);
                // setTimeout(TestUtils.clickThroughtHeaders, 1000);
//                FileUtils.makeNewBase();
//                state.currentView.refresh();
                //                                runTests();
            }).catch(Utils.handleError);
        }).catch(Utils.handleError);
    }

    function onBaseLoaded(err3) {
        if (err3) { Utils.handleError(err3); return; }
        consistencyCheck((checkResult) => {
            consistencyCheckAlert(checkResult);
            if(state.firstBaseLoad){
                onDatabaseLoad();
                state.firstBaseLoad = false;
            } else {
                state.currentView.refresh();
            }
        });
    }

    function initBaseLoadBtn(button, input, onBaseLoaded) {
        button.addEventListener('change', (evt) => {
            FileUtils.readSingleFile(evt).then(onBaseLoaded, Utils.handleError);
        }, false);
        button.addEventListener('click', (e) => {
            input.value = '';
            input.click();
            //                    e.preventDefault(); // prevent navigation to "#"
        });
    }

    function makeL10nButton() {
        const l10nBtn = makeButton('toggleL10nButton', 'l10n', L10n.toggleL10n, btnOpts);
        const setIcon = () => {
            l10nBtn.style.backgroundImage = U.strFormat('url("./images/{0}.svg")', [L10n.getValue('header-dictionary-icon')]);
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
        const button = U.makeEl('button');
        U.addClass(button, clazz);
        // if (opts.tooltip) {
        //     const delegate = () => {
        //         $(button).attr('data-original-title', L10n.getValue(`header-${name}`));
        //     };
        //     L10n.onL10nChange(delegate);
        //     $(button).tooltip({
        //         title: L10n.getValue(`header-${name}`),
        //         placement: 'bottom'
        //     });
        // }
        U.addClass(button, 'action-button');
        if (opts.className) {
            U.addClass(button, opts.className);
        }
        if (callback) {
            U.listen(button, 'click', callback);
        }
        return button;
    }

    function addBeforeUnloadListener() {
        window.onbeforeunload = (evt) => {
            console.error('Dont forget to enable on unload listener');
            // makeBackup();
            // const message = L10n.getValue('utils-close-page-warning');
            // if (typeof evt === 'undefined') {
            //     evt = window.event;
            // }
            // if (evt) {
            //     evt.returnValue = message;
            // }
            // return message;
        };
    }

    function readLocalBases() {
        if (!window.indexedDB) {
            Utils.alert(L10n.get('errors', 'indexeddb-is-not-found'));
            return Promise.resolve(null);
        }

        let counter = 0;
        let counters = [];
        while(!R.contains(counter, counters)) {
            counters.push(counter);
            counter = (counter + 1) % BACKUP_NUMBER;
        }

        return Promise.all(counters.map(counter => LocalBaseAPI.get('base' + counter))).then(bases => {
            bases = bases.filter(base => !R.isNil(base));
            if(bases.length === 0){
                return null;
            }

            bases.sort(CommonUtils.charOrdAFactory( base => -new Date(base.obj.Meta.saveTime).getTime()))
            return bases.map(R.prop('obj'));
        });
    }

    function localAutoSave() {
        if (!window.indexedDB) {
            return;
        }

        makeBackup();
        setInterval(makeBackup, BACKUP_INTERVAL); // 5 min
    }

    let counter = 0;
    function makeBackup() {
        console.log(counter + 1);
        counter = (counter + 1) % BACKUP_NUMBER;
        console.log('Starting autosave');

        DBMS.getDatabase().then(database => {
            LocalBaseAPI.put('base' + counter, database).then(() => {
                console.log('Autosave OK ' + new Date());
    //                LocalBaseAPI.get('base' + counter).then((database) => {
    //                    console.log(database);
    //                }).catch(Utils.handleError);
            }).catch(Utils.handleError);
        }).catch(Utils.handleError);
    }

// })(window.PageManager = {});
window.PageManager = {}
PageManager.onOrganizerPageLoad = exports.onOrganizerPageLoad;
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
    state.firstBaseLoad = MODE === 'Standalone';
    
    const BACKUP_NUMBER = 4;
    const BACKUP_INTERVAL = 60000*10; // 10 min

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
                Utils.addView(state.containers, 'sign-up', SignUp);
            }
            Utils.addView(state.containers, 'about', About);
            //            addEl(state.navigation, makeL10nButton());
            state.currentView.refresh();
        });
    };
    
    exports.onOrganizerPageLoad = () => {
        initPage();
        const LocalDBMS = makeLocalDBMS(true);
        if (MODE === 'Standalone') {
            window.DBMS = new LocalDBMS();
            window.DBMS = makeLocalDBMSWrapper(window.DBMS);
            DBMS.setDatabaseNew({database: DemoBase.data}).then( res => onBaseLoaded()).catch(onBaseLoaded);
            // DBMS.setDatabase(DemoBase.data, onBaseLoaded);
            // runBaseSelectDialog();
        } else if (MODE === 'NIMS_Server') {
            const RemoteDBMS = makeRemoteDBMS(LocalDBMS);
            window.DBMS = new RemoteDBMS();
            consistencyCheck((checkResult) => {
                consistencyCheckAlert(checkResult);
                onDatabaseLoad();
            });
        }
    };
    
    function runBaseSelectDialog() {
        const dbDialog = queryEl('.set-database-dialog');
        addEl(queryEl('body'), dbDialog);
        listen(qee(dbDialog, '.on-action-button'), 'click', (event) => {
            $(dbDialog).modal('hide');
        });
        
        readLocalBases().then((browserBases) => {
            addEls(qee(dbDialog, '.modal-body .backup-bases'), (browserBases || []).map((base,i) => {
                const baseSelect = qmte('.backup-base-tmpl');
                const input = qee(baseSelect, 'input');
                setAttr(input, 'value', "browserBackup" + i); 
                setAttr(input, 'id', "dbSourceBrowserBackup" + i);
                input.base = base;
                setAttr(qee(baseSelect, 'label'), 'for', "dbSourceBrowserBackup" + i);
                const date = new Date(base.Meta.saveTime).format('dd mmm yyyy HH:MM:ss');
                addEl(qee(baseSelect, '.base-name'), makeText(base.Meta.name + ' (' + date + ')'));
                return baseSelect;
            }));
            
            qee(dbDialog, 'input[name=dbSource]').checked = true;
            qee(dbDialog, '#dbSourceDemoBase').base = CommonUtils.clone(DemoBase.data);
            qee(dbDialog, '#dbSourceEmptyBase').base = CommonUtils.clone(EmptyBase.data);
            
            addEl(qee(dbDialog, '.demo-base-name'), makeText(DemoBase.data.Meta.name));
            
            const dialogOnBaseLoad = err => {
                if (err) { Utils.handleError(err); return; }
                $(dbDialog).modal('hide');
                onBaseLoaded(err);
            }
            
            initBaseLoadBtn(qee(dbDialog, '.upload-db'), qee(dbDialog, '.upload-db input'), dialogOnBaseLoad);
            
            listen(qee(dbDialog, '.on-action-button'), 'click', () => {
                const base = getSelectedRadio(dbDialog, 'input[name=dbSource]').base;
                DBMS.setDatabase(base, dialogOnBaseLoad);
            });
            
            L10n.localizeStatic(dbDialog);
            
            $(dbDialog).modal({
                backdrop: 'static'
            });
        }).catch(err => console.error(err));
    }

    function consistencyCheckAlert(checkResult) {
        if (checkResult.errors.length > 0) {
            Utils.alert(getL10n('overview-consistency-problem-detected'));
        } else {
            console.log('Consistency check didn\'t find errors');
        }
    }

    function consistencyCheck(callback) {
        DBMS.getConsistencyCheckResultNew().then(checkResult => {
            checkResult.errors.forEach(CommonUtils.consoleErr);
            callback(checkResult);
        }).catch(Utils.handleError);
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
        PermissionInformer.refreshNew().then(() => {
            PermissionInformer.isAdminNew().then((isAdmin) => {
                $.datetimepicker.setDateFormatter('moment');

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

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                if (MODE === 'NIMS_Server') {
                    addView(state.containers, 'admins', 'AccessManager', { clazz: 'accessManagerButton icon-button', tooltip: true });
                }
                addView(state.containers, 'logViewer', 'LogViewer2', { clazz: 'logViewerButton icon-button', tooltip: true });

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                if (isAdmin) {
                    button = makeButton('dataLoadButton icon-button', 'open-database', null, btnOpts);
                    const input = makeEl('input');
                    input.type = 'file';
                    addClass(input, 'hidden');
                    setAttr(input, 'tabindex', -1);
                    button.appendChild(input);
                    
                    initBaseLoadBtn(button, input, onBaseLoaded);
                    addEl(state.navigation, button);
                }

                addEl(state.navigation, makeButton('dataSaveButton icon-button', 'save-database', FileUtils.saveFile, btnOpts));
                if (MODE === 'Standalone') {
                    addEl(state.navigation, makeButton('newBaseButton icon-button', 'create-database', FileUtils.makeNewBase(onBaseLoaded), btnOpts));
                }
//                addEl(state.navigation, makeButton('mainHelpButton icon-button', 'docs', FileUtils.openHelp, btnOpts));

                //                addEl(state.navigation, makeL10nButton());

               addEl(state.navigation, makeButton('testButton icon-button', 'test', TestUtils.runTests, btnOpts));
//                addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
//                addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'showDbmsConsistencyState', showDbmsConsistencyState, btnOpts));
               addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'clickAllTabs', TestUtils.clickThroughtHeaders, btnOpts));
//                addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'showDiff', TestUtils.showDiffExample, btnOpts));
                if (MODE === 'NIMS_Server') {
                    addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
                }
                addEl(state.navigation, makeButton('refreshButton icon-button', 'refresh', () => state.currentView.refresh(), btnOpts));

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
        button.addEventListener('change', FileUtils.readSingleFile(onBaseLoaded), false);
        button.addEventListener('click', (e) => {
            input.value = '';
            input.click();
            //                    e.preventDefault(); // prevent navigation to "#"
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
            makeBackup();
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

        DBMS.getDatabaseNew().then(database => {
            LocalBaseAPI.put('base' + counter, database).then(() => {
                console.log('Autosave OK ' + new Date());
    //                LocalBaseAPI.get('base' + counter).then((database) => {
    //                    console.log(database);
    //                }).catch(Utils.handleError);
            }).catch(Utils.handleError);
        }).catch(Utils.handleError);
    }
    
})(this.PageManager = {});

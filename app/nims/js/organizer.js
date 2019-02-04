const { initPage, stateInit, state, makeButton, btnOpts, postLogout, refresh,
    addNavSeparator } = require('./pageCore');
const { EmptyBase, DemoBase, TestUtils, LocalBackupCore } = require('core');

const { localAutoSave, runBaseSelectDialog, makeBackup } = require('./localBaseBackup')({
    initBaseLoadBtn, onBaseLoaded, EmptyBase, DemoBase, LocalBackupCore
});

require("../index.html");
require("../style/common.css");
require("../style/icons.css");
require("../style/style.css");
require("../style/experimental.css");
const {makeLocalDBMS} = require('./dbms/localDBMS.js');

require('core/tests/jasmine');

require('../specs/baseAPI');
require('../specs/smokeTest');

const PermissionInformer = require('permissionInformer');



const { Overview, Adaptations, Relations, RoleGrid, Timeline, SocialNetwork, TextSearch,
    Briefings, LogViewer2, Characters, Players, Stories, ProfileFilter, GroupProfile } = require('./pages');

var MODE = "Standalone";

// common
// const state = {};
// state.views = {};

// local
let firstBaseLoad = MODE === 'Standalone';

exports.onStandalonePageLoad = () => {
    initPage();
    window.DBMS = makeLocalDBMS();
    DBMS.setDatabase({database: DemoBase.data}).then( onBaseLoaded, UI.handleError);
    // runBaseSelectDialog();
};

// exports.onServerOrgPageLoad = () => {
//     initPage();
//     // const LocalDBMS = makeLocalDBMS(true);
//     // if (MODE === 'Standalone') {
//     //     window.DBMS = makeLocalDBMS();
//     //     DBMS.setDatabase({database: DemoBase.data}).then( onBaseLoaded, UI.handleError);
//     //     // runBaseSelectDialog();
//     // } else if (MODE === 'NIMS_Server') {
//         window.DBMS = makeRemoteDBMS();
//         consistencyCheck((checkResult) => {
//             consistencyCheckAlert(checkResult);
//             onDatabaseLoad();
//         });
//     // }
// };

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
                };
            };

            addView(state.containers, 'overview', 'Overview', Overview);
            addView(state.containers, 'characters', 'Characters', Characters);
            addView(state.containers, 'players', 'Players', Players);
            addView(state.containers, 'stories', 'Stories', Stories);
            addView(state.containers, 'adaptations', 'Adaptations', Adaptations);
            addView(state.containers, 'briefings', 'Briefings', Briefings);
            addView(state.containers, 'relations', 'Relations', Relations);

            // U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
            addNavSeparator();

            addView(state.containers, 'timeline', 'Timeline', Timeline, { clazz: 'timelineButton icon-button', tooltip: true });
            addView(state.containers, 'social-network', 'SocialNetwork', SocialNetwork, { clazz: 'socialNetworkButton icon-button', tooltip: true });
            addView(state.containers, 'profile-filter', 'ProfileFilter', ProfileFilter, { clazz: 'filterButton icon-button', tooltip: true });
            addView(state.containers, 'groups', 'GroupProfile', GroupProfile, { clazz: 'groupsButton icon-button', tooltip: true });
            addView(state.containers, 'textSearch', 'TextSearch', TextSearch, { clazz: 'textSearchButton icon-button', tooltip: true });
            addView(state.containers, 'roleGrid', 'RoleGrid', RoleGrid, { clazz: 'roleGridButton icon-button', tooltip: true });

            // U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
            addNavSeparator();

            // if (MODE === 'NIMS_Server') {
            //     addView(state.containers, 'admins', 'AccessManager', { clazz: 'accessManagerButton icon-button', tooltip: true });
            // }
            addView(state.containers, 'logViewer', 'LogViewer2', LogViewer2, { clazz: 'logViewerButton icon-button', tooltip: true });

            // U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
            addNavSeparator();

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
                    FileUtils.makeNewBase(EmptyBase).then((confirmed) => {
                        if(confirmed){
                            onBaseLoaded();
                        }
                    }).catch(UI.handleError);
                }, btnOpts));
            }
//                U.addEl(state.navigation, makeButton('mainHelpButton icon-button', 'docs', FileUtils.openHelp, btnOpts));

            //                U.addEl(state.navigation, makeL10nButton());

            U.addEl(state.navigation, makeButton('testButton icon-button', 'test', TestUtils.runTests, btnOpts));
            U.addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
            U.addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'showDbmsConsistencyState', showDbmsConsistencyState, btnOpts));
            U.addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'clickAllTabs', TestUtils.clickThroughtHeaders, btnOpts));
            U.addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'testTab', () => {
                if(state.currentView.test){
                    state.currentView.test();
                } else {
                    console.error('This tab has no tests')
                }
            }, btnOpts));
            U.addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'showDiff', TestUtils.showDiffExample, btnOpts));
            if (MODE === 'NIMS_Server') {
                U.addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
            }
            U.addEl(state.navigation, makeButton('refreshButton icon-button', 'refresh', () => refresh(), btnOpts));

            UI.setFirstTab(state.containers, tabs[firstTab].viewRes);

            refresh();
            // state.currentView.refresh();
            if (MODE === 'Standalone') {
                addBeforeUnloadListener();
                localAutoSave();
            }

            // setTimeout(TestUtils.runTests, 1000);
            // setTimeout(TestUtils.clickThroughtHeaders, 1000);
//                FileUtils.makeNewBase();
//                state.currentView.refresh();
            //                                runTests();
        }).catch(UI.handleError);
    }).catch(UI.handleError);
}


function onBaseLoaded(err3) {
    if (err3) { UI.handleError(err3); return; }
    consistencyCheck((checkResult) => {
        consistencyCheckAlert(checkResult);
        if(firstBaseLoad){
            onDatabaseLoad();
            firstBaseLoad = false;
        } else {
            refresh();
            // state.currentView.refresh();
        }
    });
}

function consistencyCheck(callback) {
    DBMS.getConsistencyCheckResult().then(checkResult => {
        checkResult.errors.forEach(console.error);
        callback(checkResult);
    }).catch(UI.handleError);
}

function consistencyCheckAlert(checkResult) {
    if (checkResult.errors.length > 0) {
        UI.alert(L10n.getValue('overview-consistency-problem-detected'));
    } else {
        console.log('Consistency check didn\'t find errors');
    }
}

function initBaseLoadBtn(button, input, onBaseLoaded) {
    button.addEventListener('change', (evt) => {
        FileUtils.readSingleFile(evt).then( database => {
            return DBMS.setDatabase({database});
        }).then(() => PermissionInformer.refresh()).then(onBaseLoaded, UI.handleError);
    }, false);
    button.addEventListener('click', (e) => {
        input.value = '';
        input.click();
        //                    e.preventDefault(); // prevent navigation to "#"
    });
}

function showDbmsConsistencyState() {
    consistencyCheck(checkRes => TestUtils.showModuleSchema(checkRes));
}

function checkConsistency() {
    consistencyCheck(checkRes => TestUtils.showConsistencyCheckAlert(checkRes));
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




window.PageManager = {}
PageManager.onStandalonePageLoad = exports.onStandalonePageLoad;
const { TestUtils, LocalBackupCore } = require('core');
const DemoBase = require('resources/demoBase');
const EmptyBase = require('resources/emptyBase');


require('../nims.html');

require('../style/common.css');
require('../style/icons.css');
require('../style/style.css');
require('../style/experimental.css');
const { makeDBMS } = require('DBMSFactory');

if (MODE === 'DEV' && DEV_OPTS.ENABLE_TESTS) {
    require('core/tests/jasmine');
    require('../specs/baseAPI');
    require('../specs/smokeTest');
    if (PRODUCT === 'SERVER') {
        require('../specs/serverSmokeTest');
    }
}

const PermissionInformer = require('permissionInformer');
const { localAutoSave, runBaseSelectDialog, makeBackup } = require('./dbms/localBaseBackup')({
    initBaseLoadBtn, onBaseLoaded, EmptyBase, DemoBase, LocalBackupCore
});
const {
    initPage, makeButton, btnOpts, postLogout, refreshView,
    addNavSeparator, addNavEl, testView, addView, setFirstTab
} = require('./pageCore');

const {
    Overview, Adaptations, Relations, RoleGrid, Timeline, SocialNetwork, TextSearch,
    Briefings, LogViewer2, Characters, Players, Stories, ProfileFilter, GroupProfile, AccessManager
} = require('./pages');

let firstBaseLoad = PRODUCT === 'STANDALONE';

if (PRODUCT === 'STANDALONE') {
    exports.onPageLoad = () => {
        initPage();
        window.DBMS = makeDBMS();
        if (MODE === 'DEV' && !DEV_OPTS.ENABLE_BASE_SELECT_DLG) {
            DBMS.setDatabase({ database: DemoBase.data }).then(onBaseLoaded, UI.handleError);
        } else {
            runBaseSelectDialog();
        }
    };
} else {
    exports.onPageLoad = () => {
        initPage();
        window.DBMS = makeDBMS();
        consistencyCheck((checkResult) => {
            consistencyCheckAlert(checkResult);
            onDatabaseLoad();
        });
    };
}

window.onPageLoad = exports.onPageLoad;

// exports.onServerOrgPageLoad = () => {
//     initPage();
//     // const LocalDBMS = makeLocalDBMS(true);
//     // if (PRODUCT === 'STANDALONE') {
//     //     window.DBMS = makeLocalDBMS();
//     //     DBMS.setDatabase({database: DemoBase.data}).then( onBaseLoaded, UI.handleError);
//     //     // runBaseSelectDialog();
//     // } else if (PRODUCT === 'SERVER') {
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

            const firstTab = 'AccessManager';

            addView('overview', 'Overview', Overview);
            addView('characters', 'Characters', Characters);
            addView('players', 'Players', Players);
            addView('stories', 'Stories', Stories);
            addView('adaptations', 'Adaptations', Adaptations);
            addView('briefings', 'Briefings', Briefings);
            addView('relations', 'Relations', Relations);

            addNavSeparator();

            addView('timeline', 'Timeline', Timeline, { clazz: 'timelineButton icon-button', tooltip: true });
            addView('social-network', 'SocialNetwork', SocialNetwork, { clazz: 'socialNetworkButton icon-button', tooltip: true });
            addView('profile-filter', 'ProfileFilter', ProfileFilter, { clazz: 'filterButton icon-button', tooltip: true });
            addView('groups', 'GroupProfile', GroupProfile, { clazz: 'groupsButton icon-button', tooltip: true });
            addView('textSearch', 'TextSearch', TextSearch, { clazz: 'textSearchButton icon-button', tooltip: true });
            addView('roleGrid', 'RoleGrid', RoleGrid, { clazz: 'roleGridButton icon-button', tooltip: true });

            addNavSeparator();

            if (PRODUCT === 'SERVER') {
                addView('admins', 'AccessManager', AccessManager, { clazz: 'accessManagerButton icon-button', tooltip: true });
            }
            addView('logViewer', 'LogViewer2', LogViewer2, { clazz: 'logViewerButton icon-button', tooltip: true });

            addNavSeparator();

            if (isAdmin) {
                addNavEl(makeLoadBaseButton());
            }

            addNavEl(makeButton('dataSaveButton icon-button', 'save-database', FileUtils.saveFile, btnOpts));
            if (PRODUCT === 'STANDALONE') {
                addNavEl(makeButton('newBaseButton icon-button', 'create-database', loadEmptyBase, btnOpts));
            }
            //                addNavEl(makeButton('mainHelpButton icon-button', 'docs', FileUtils.openHelp, btnOpts));

            //               addNavEl(makeL10nButton());

            if (MODE === 'DEV') {
                if (DEV_OPTS.ENABLE_TESTS) {
                    addNavEl(makeButton('testButton icon-button', 'test', TestUtils.runTests, btnOpts));
                }
                if (DEV_OPTS.ENABLE_BASICS) {
                    addNavEl(makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
                    addNavEl(makeButton('clickAllTabsButton icon-button', 'clickAllTabs', TestUtils.clickThroughtHeaders, btnOpts));
                }
                if (DEV_OPTS.ENABLE_EXTRAS) {
                    addNavEl(makeButton('checkConsistencyButton icon-button', 'showDbmsConsistencyState', showDbmsConsistencyState, btnOpts));
                    addNavEl(makeButton('clickAllTabsButton icon-button', 'testTab', testView, btnOpts));
                    addNavEl(makeButton('clickAllTabsButton icon-button', 'showDiff', TestUtils.showDiffExample, btnOpts));
                }
            }

            if (PRODUCT === 'SERVER') {
                addNavEl(makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
            }
            addNavEl(makeButton('refreshButton icon-button', 'refresh', () => refreshView(), btnOpts));

            setFirstTab(firstTab);

            refreshView();
            if (PRODUCT === 'STANDALONE') {
                if (MODE === 'PROD') {
                    addBeforeUnloadListener();
                }
                localAutoSave();
            }

            // setTimeout(TestUtils.runTests, 1000);
            // setTimeout(TestUtils.clickThroughtHeaders, 1000);
            //                FileUtils.makeNewBase();
            //                                runTests();
        }).catch(UI.handleError);
    }).catch(UI.handleError);
}

function loadEmptyBase() {
    FileUtils.makeNewBase(EmptyBase).then((confirmed) => {
        if (confirmed) {
            onBaseLoaded();
        }
    }).catch(UI.handleError);
}

function makeLoadBaseButton() {
    const button = makeButton('dataLoadButton icon-button', 'open-database', null, btnOpts);
    const input = U.makeEl('input');
    input.type = 'file';
    U.addClass(input, 'hidden');
    U.setAttr(input, 'tabindex', -1);
    button.appendChild(input);

    initBaseLoadBtn(button, input, onBaseLoaded);
    return button;
}


function onBaseLoaded(err3) {
    if (err3) { UI.handleError(err3); return; }
    consistencyCheck((checkResult) => {
        consistencyCheckAlert(checkResult);
        if (firstBaseLoad) {
            onDatabaseLoad();
            firstBaseLoad = false;
        } else {
            refreshView();
        }
    });
}

function consistencyCheck(callback) {
    DBMS.getConsistencyCheckResult().then((checkResult) => {
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
        FileUtils.readSingleFile(evt).then(database => DBMS.setDatabase({ database })).then(() => PermissionInformer.refresh()).then(onBaseLoaded, UI.handleError);
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
        // console.error('Dont forget to enable on unload listener');
        makeBackup();
        const message = L10n.getValue('utils-close-page-warning');
        if (typeof evt === 'undefined') {
            evt = window.event;
        }
        if (evt) {
            evt.returnValue = message;
        }
        return message;
    };
}

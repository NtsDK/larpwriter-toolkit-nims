const PermissionInformer = require('permissionInformer');
const DbmsFactory = require('DbmsFactory');
const apis = require('apis');

const { TestUtils, LocalBackupCore } = require('nims-app-core');
const { demoBase, emptyBase } = require('nims-resources');

require('./nims.html');

// const CallNotificator = require('dbms-core/callNotificator');
const CallNotificator = require('../front-db/callNotificator');
const {
    initPage, makeButton, btnOpts, postLogout, refreshView,
    addNavSeparator, addNavEl, testView, addView, setFirstTab
} = require('./pageCore');

// require('common.css');
// require('icons.css');
// require('style.css');
// require('experimental.css');
require('../style/common.css');
require('../style/common.css');
require('../style/icons.css');
require('../style/style.css');
require('../style/experimental.css');

if (MODE === 'DEV' && DEV_OPTS.ENABLE_TESTS) {
    // eslint-disable-next-line global-require
    require('nims-app-core/tests/jasmine');
    // require('core/tests/jasmine');
    // eslint-disable-next-line global-require
    require('../specs/baseAPI');
    // eslint-disable-next-line global-require
    require('../specs/smokeTest');
    if (PRODUCT === 'SERVER') {
        // eslint-disable-next-line global-require
        require('../specs/serverSmokeTest');
    }
}

// eslint-disable-next-line import/order
// const { localAutoSave, runBaseSelectDialog, makeBackup } = require('front-db/localBaseBackup')({
const { localAutoSave, runBaseSelectDialog, makeBackup } = require('../front-db/localBaseBackup')({
    initBaseLoadBtn, onBaseLoaded, emptyBase, demoBase, LocalBackupCore
});

const {
    Overview, Adaptations, Relations, RoleGrid, Timeline, SocialNetwork, TextSearch,
    Briefings, LogViewer2, Characters, Players, Stories, ProfileFilter, GroupProfile, AccessManager
// } = require('views');
} = require('../views');

// const logModule = require('front-db/consoleLogModule');
const logModule = require('../front-db/consoleLogModule');
// const CallNotificator = require('front-db/callNotificator');

let firstBaseLoad = PRODUCT === 'STANDALONE';

if (PRODUCT === 'STANDALONE') {
    exports.onPageLoad = () => {
        initPage();
        window.DBMS = DbmsFactory({
            logModule,
            projectName: PROJECT_NAME,
            proxies: [CallNotificator],
            apis,
            isServer: PRODUCT !== 'STANDALONE'
        }).preparedDb;
        if (MODE === 'DEV' && !DEV_OPTS.ENABLE_BASE_SELECT_DLG) {
            DBMS.setDatabase({ database: demoBase }).then(onBaseLoaded, UI.handleError);
        } else {
            runBaseSelectDialog();
        }
    };
} else {
    exports.onPageLoad = () => {
        initPage();
        window.DBMS = DbmsFactory();
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

            const firstTab = 'Overview';

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
    FileUtils.makeNewBase(emptyBase).then((confirmed) => {
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

function initBaseLoadBtn(button, input, onBaseLoaded2) {
    button.addEventListener('change', (evt) => {
        FileUtils.readSingleFile(evt).then((database) => DBMS.setDatabase({ database })).then(() => PermissionInformer.refresh()).then(onBaseLoaded2, UI.handleError);
    }, false);
    button.addEventListener('click', (e) => {
        input.value = '';
        input.click();
        //                    e.preventDefault(); // prevent navigation to "#"
    });
}

function showDbmsConsistencyState() {
    consistencyCheck((checkRes) => TestUtils.showModuleSchema(checkRes));
}

function checkConsistency() {
    consistencyCheck((checkRes) => TestUtils.showConsistencyCheckAlert(checkRes));
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

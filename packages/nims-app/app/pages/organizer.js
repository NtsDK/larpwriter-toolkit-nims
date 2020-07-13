import PermissionInformer from 'permissionInformer';
import DbmsFactory from 'DbmsFactory';
import apis from 'apis';

import { TestUtils, LocalBackupCore } from 'nims-app-core';
import DemoBase from 'nims-resources/demoBase';
import EmptyBase from 'nims-resources/emptyBase';

import './nims.html';

import CallNotificator from '../front-db/callNotificator';
import {
    initPage, makeButton, btnOpts, postLogout, refreshView,
    addNavSeparator, addNavEl, testView, addView, setFirstTab
} from './pageCore';

import '../style/common.css';
import '../style/icons.css';
import '../style/style.css';
import '../style/experimental.css';

import {
    Overview, Adaptations, Relations, RoleGrid, Timeline, SocialNetwork, TextSearch,
    Briefings, LogViewer2, Characters, Players, Stories, ProfileFilter, GroupProfile, AccessManager
} from '../views';

import {
    showDiffExample
} from '../views/commons/diffExample';

import initLocalBaseBackup from '../front-db/localBaseBackup';

import logModule from '../front-db/consoleLogModule';

import 'nims-app-core/tests/jasmine';
import '../specs/baseAPI';
import '../specs/smokeTest';
import '../specs/serverSmokeTest';

// if (MODE === 'DEV' && DEV_OPTS.ENABLE_TESTS) {
//     // eslint-disable-next-line global-require
//     require('nims-app-core/tests/jasmine');
//     // eslint-disable-next-line global-require
//     require('../specs/baseAPI');
//     // eslint-disable-next-line global-require
//     require('../specs/smokeTest');
//     // eslint-disable-next-line global-require
//     require('../specs/serverSmokeTest');
// }

// eslint-disable-next-line import/order
const { localAutoSave, runBaseSelectDialog, makeBackup } = initLocalBaseBackup({
    initBaseLoadBtn, onBaseLoaded, EmptyBase, DemoBase, LocalBackupCore
});

let firstBaseLoad = PRODUCT === 'STANDALONE';

let onPageLoad = null;
if (PRODUCT === 'STANDALONE') {
    onPageLoad = () => {
        initPage();
        window.DBMS = DbmsFactory({
            logModule,
            projectName: PROJECT_NAME,
            proxies: [CallNotificator],
            apis,
            isServer: PRODUCT !== 'STANDALONE'
        }).preparedDb;
        if (MODE === 'DEV' && !DEV_OPTS.ENABLE_BASE_SELECT_DLG) {
            DBMS.setDatabase({ database: DemoBase.data }).then(onBaseLoaded, UI.handleError);
        } else {
            runBaseSelectDialog();
        }
    };
} else {
    onPageLoad = () => {
        initPage();
        window.DBMS = DbmsFactory();
        consistencyCheck((checkResult) => {
            consistencyCheckAlert(checkResult);
            onDatabaseLoad();
        });
    };
}

window.onPageLoad = onPageLoad;

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

            // const firstTab = 'Overview';
            const firstTab = 'LogViewer2';

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
                    addNavEl(makeButton('clickAllTabsButton icon-button', 'showDiff', showDiffExample, btnOpts));
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

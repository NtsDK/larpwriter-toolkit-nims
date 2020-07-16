import PermissionInformer from 'permissionInformer';
import DbmsFactory from 'DbmsFactory';
import apis from 'apis';

import ReactDOM from 'react-dom';
import { getLogoutFormTemplate } from "../views/serverSpecific/LogoutFormTemplate.jsx";

import * as TestUtils from 'nims-app-core/testUtils';
import * as FileUtils from 'nims-app-core/fileUtils';
import { UI, U, L10n } from 'nims-app-core';
import DemoBase from 'nims-resources/demoBase';
import EmptyBase from 'nims-resources/emptyBase';

import './nims.html';

import CallNotificator from '../front-db/callNotificator';
import {
    PageCore, btnOpts, makeL10nButton, postLogout, makeButton
} from './pageCore';

import '../style/common.css';
import '../style/icons.css';
import '../style/style.css';
import '../style/experimental.css';

import Overview from '../views/overview/overview';
import Stories from '../views/stories/stories';
import Adaptations from '../views/adaptations/adaptations';
import Relations from '../views/briefings/relations';
import { RoleGrid } from '../views/profiles2/roleGrid';
import { Timeline } from '../views/timeline/timeline';
import SocialNetwork from '../views/network/socialNetwork';
import { TextSearch } from '../views/textSearch/textSearch';
import { ProfileFilter } from '../views/groups/profileFilter';
import { GroupProfile } from '../views/groups/groupProfile';

import { Briefings } from '../views/briefings';
import { LogViewer2 } from '../views/logs';
import { Characters, Players } from '../views/profiles2';
import { AccessManager } from '../views/accessManager';



import {
    showDiffExample
} from '../views/commons/diffExample';
import {
    showModuleSchema
} from '../views/commons/showModuleSchema';

import initLocalBaseBackup from '../front-db/localBaseBackup';

import logModule from '../front-db/consoleLogModule';


// if (MODE === 'DEV' && DEV_OPTS.ENABLE_TESTS) {
import 'nims-app-core/tests/jasmine';
import '../specs/baseAPI';
import '../specs/smokeTest';
import '../specs/serverSmokeTest';
// }

// eslint-disable-next-line import/order
const { localAutoSave, runBaseSelectDialog, makeBackup } = initLocalBaseBackup({
    initBaseLoadBtn, onBaseLoaded
});

let firstBaseLoad = PRODUCT === 'STANDALONE';

const pageCore = new PageCore();

let onPageLoad = null;
if (PRODUCT === 'STANDALONE') {
    onPageLoad = () => {
        pageCore.initPage();
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
        pageCore.initPage();
        window.DBMS = DbmsFactory();
        consistencyCheck((checkResult) => {
            consistencyCheckAlert(checkResult);
            onDatabaseLoad();
        });
    };
}

window.onPageLoad = onPageLoad;

function onDatabaseLoad() {
    PermissionInformer.refresh().then(() => {
        PermissionInformer.isAdmin().then((isAdmin) => {
            $.datetimepicker.setDateFormatter('moment');

            const firstTab = 'ProfileFilter';
            // const firstTab = 'AccessManager';

            const globalObjects = {L10n, DBMS, SM};

            pageCore.addView('overview', 'Overview', Overview);
            pageCore.addView('characters', 'Characters', Characters);
            pageCore.addView('players', 'Players', Players);
            pageCore.addView('stories', 'Stories', Stories);
            pageCore.addView('adaptations', 'Adaptations', Adaptations);
            pageCore.addView('briefings', 'Briefings', Briefings);
            pageCore.addView('relations', 'Relations', Relations);

            pageCore.addNavSeparator();

            pageCore.addView('timeline', 'Timeline', new Timeline(globalObjects), { clazz: 'timelineButton icon-button', tooltip: true });
            pageCore.addView('social-network', 'SocialNetwork', SocialNetwork, { clazz: 'socialNetworkButton icon-button', tooltip: true });
            pageCore.addView('profile-filter', 'ProfileFilter', new ProfileFilter(), { clazz: 'filterButton icon-button', tooltip: true });
            pageCore.addView('groups', 'GroupProfile', new GroupProfile(globalObjects), { clazz: 'groupsButton icon-button', tooltip: true });
            pageCore.addView('textSearch', 'TextSearch', new TextSearch(globalObjects), { clazz: 'textSearchButton icon-button', tooltip: true });
            pageCore.addView('roleGrid', 'RoleGrid', new RoleGrid(globalObjects), { clazz: 'roleGridButton icon-button', tooltip: true });

            pageCore.addNavSeparator();

            if (PRODUCT === 'SERVER') {
                const content = U.makeEl('div');
                U.addEl(U.qe('.tab-container'), content);
                ReactDOM.render(getLogoutFormTemplate(), content);
                L10n.localizeStatic(content);

                pageCore.addView('admins', 'AccessManager', AccessManager, { clazz: 'accessManagerButton icon-button', tooltip: true });
            }
            pageCore.addView('logViewer', 'LogViewer2', LogViewer2, { clazz: 'logViewerButton icon-button', tooltip: true });

            pageCore.addNavSeparator();

            if (isAdmin) {
                pageCore.addNavEl(makeLoadBaseButton());
            }

            pageCore.addNavEl(makeButton('dataSaveButton icon-button', 'save-database', FileUtils.saveFile, btnOpts));
            if (PRODUCT === 'STANDALONE') {
                pageCore.addNavEl(makeButton('newBaseButton icon-button', 'create-database', loadEmptyBase, btnOpts));
            }
            //                addNavEl(makeButton('mainHelpButton icon-button', 'docs', FileUtils.openHelp, btnOpts));

            //               addNavEl(makeL10nButton());

            if (MODE === 'DEV') {
                if (DEV_OPTS.ENABLE_TESTS) {
                    pageCore.addNavEl(makeButton('testButton icon-button', 'test', TestUtils.runTests, btnOpts));
                }
                if (DEV_OPTS.ENABLE_BASICS) {
                    pageCore.addNavEl(makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
                    pageCore.addNavEl(makeButton('clickAllTabsButton icon-button', 'clickAllTabs', TestUtils.clickThroughtHeaders, btnOpts));
                }
                if (DEV_OPTS.ENABLE_EXTRAS) {
                    pageCore.addNavEl(makeButton('checkConsistencyButton icon-button', 'showDbmsConsistencyState', showDbmsConsistencyState, btnOpts));
                    pageCore.addNavEl(makeButton('clickAllTabsButton icon-button', 'testTab', () => pageCore.testView(), btnOpts));
                    pageCore.addNavEl(makeButton('clickAllTabsButton icon-button', 'showDiff', showDiffExample, btnOpts));
                }
            }

            if (PRODUCT === 'SERVER') {
                pageCore.addNavEl(makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
            }
            pageCore.addNavEl(makeButton('refreshButton icon-button', 'refresh', () => pageCore.refreshView(), btnOpts));

            pageCore.setFirstTab(firstTab);

            pageCore.refreshView();
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
            pageCore.refreshView();
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
    consistencyCheck((checkRes) => showModuleSchema(checkRes));
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

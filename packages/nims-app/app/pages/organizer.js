import PermissionInformer from 'permissionInformer';
import DbmsFactory from 'DbmsFactory';
import apis from 'apis';

import ReactDOM from 'react-dom';
import React from "react";
import { getLogoutFormTemplate, LogoutFormTemplate } from "../views/serverSpecific/LogoutFormTemplate.jsx";

import * as TestUtils from 'nims-app-core/testUtils';
import * as FileUtils from 'nims-app-core/fileUtils';
import { UI, U, L10n } from 'nims-app-core';
import DemoBase from 'nims-resources/demoBase';
import EmptyBase from 'nims-resources/emptyBase';

import './nims.html';

import CallNotificator from '../front-db/callNotificator';
import {
    btnOpts, makeL10nButton, postLogout, makeButton, initPage
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

// import { Briefings } from '../views/briefings';
import BriefingPreview from '../views/briefings/briefingPreview';
import BriefingExport from '../views/briefings/briefingExport';

// import { LogViewer2 } from '../views/logs';
import { LogViewer } from '../views/logs/logViewer';
import { About } from '../views/logs/About';
import { GroupSchema } from '../views/groups/groupSchema';

// import { Characters, Players } from '../views/profiles2';
import { CharacterEditor, PlayerEditor } from '../views/profiles2/profileEditor2';
import { CharacterConfigurer, PlayerConfigurer } from '../views/profiles2/profileConfigurer2';
import ProfileBinding2 from '../views/profiles2/profileBinding2';

// import { AccessManager } from '../views/accessManager';
import { OrganizerManagement } from '../views/accessManager/organizerManagement';
import { PlayerManagement } from '../views/accessManager/playerManagement';

import { getNavExperiment } from "./NavExperiment.jsx";

// import { getRootComponent } from "./rootComponent.jsx";

import { I18nextProvider } from 'react-i18next';
import { i18n } from "nims-app-core/i18n";

import { LoadBaseButton } from "./makeLoadBaseButton.jsx";
import { NavComponent, NavButton, NavSeparator, NavViewLink } from "./NavComponent.jsx";
import {
    HashRouter as Router,
    Switch,
    Route,
    Link,
    NavLink,
    Redirect
  } from "react-router-dom";
  import { ViewWrapper } from "./ViewWrapper.jsx";



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
import { view } from 'ramda';
// }

// eslint-disable-next-line import/order
const { localAutoSave, runBaseSelectDialog, makeBackup } = initLocalBaseBackup({
    initBaseLoadBtn, onBaseLoaded
});

let firstBaseLoad = PRODUCT === 'STANDALONE';

// const pageCore = new PageCore();
let navComponent = null;
let navComponent2 = null;

let onPageLoad = null;
if (PRODUCT === 'STANDALONE') {
    onPageLoad = () => {
        const res = initPage();
        // navComponent = res.nav1;
        navComponent = res.nav2;
        // pageCore.initPage();
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
        const res = initPage();
        // navComponent = res.nav1;
        navComponent = res.nav2;
        // pageCore.initPage();
        window.DBMS = DbmsFactory();
        consistencyCheck((checkResult) => {
            consistencyCheckAlert(checkResult);
            onDatabaseLoad();
        });
    };
}

class ViewCache {
    cache = {};

    add(key, view) {
        this.cache[key] = view;
        view.init();
    }

    get(key) {
        return this.cache[key];
    }
}

const viewCache = new ViewCache();

onPageLoad();

async function onDatabaseLoad() {
    let isAdmin;
    try {
        await PermissionInformer.refresh();
        isAdmin = await PermissionInformer.isAdmin();
    } catch(err) {
        UI.handleError(err);
        return;
    }
    $.datetimepicker.setDateFormatter('moment');

    // const firstTab = 'Stories';
    const firstTab = 'Overview';
    // const firstTab = 'AccessManager';

    const globalObjects = {L10n, DBMS, SM};

    viewCache.add('overview', Overview);
    // viewCache.add('characters', Characters);
    // viewCache.add('players', Players);
    viewCache.add('characterEditor', CharacterEditor);
    viewCache.add('playerEditor', PlayerEditor);
    viewCache.add('characterConfigurer', CharacterConfigurer);
    viewCache.add('playerConfigurer', PlayerConfigurer);
    viewCache.add('profileBinding', ProfileBinding2);
    viewCache.add('stories', Stories);
    viewCache.add('adaptations', Adaptations);
    // viewCache.add('briefings', Briefings);
    viewCache.add('briefingPreview', BriefingPreview);
    viewCache.add('briefingExport', BriefingExport);
    viewCache.add('relations', Relations);

    viewCache.add('timeline', new Timeline(globalObjects));
    viewCache.add('socialNetwork', SocialNetwork);
    viewCache.add('profileFilter', new ProfileFilter());
    viewCache.add('groups', new GroupProfile(globalObjects),);
    viewCache.add('textSearch', new TextSearch(globalObjects));
    viewCache.add('roleGrid', new RoleGrid(globalObjects));

    if (PRODUCT === 'SERVER') {
        // viewCache.add('admins', AccessManager);
        viewCache.add('organizerManagement', OrganizerManagement);
        viewCache.add('playerManagement', PlayerManagement);
    }
    // viewCache.add('logViewer', LogViewer2);
    viewCache.add('logViewer', new LogViewer());
    viewCache.add('groupSchema', new GroupSchema());
    viewCache.add('about', new About());

    ReactDOM.render(
        <I18nextProvider i18n={i18n}>
            <Router>
                <nav className="navigation navigation2">
                    <ul className="width-100p">
                        <NavViewLink labelKey={'overview'} to={'/overview'}/>
                        <NavViewLink labelKey={'characters'} to={'/characters'}/>
                        <NavViewLink labelKey={'players'} to={'/players'}/>
                        <NavViewLink labelKey={'stories'} to={'/stories'}/>
                        <NavViewLink labelKey={'adaptations'} to={'/adaptations'}/>
                        <NavViewLink labelKey={'briefings'} to={'/briefings'}/>
                        <NavViewLink labelKey={'relations'} to={'/relations'}/>

                        <NavSeparator/>
                        <NavViewLink labelKey={'timeline'} to={'/timeline'} clazz={'timelineButton icon-button'} hasTooltip={true}/>
                        <NavViewLink labelKey={'social-network'} to={'/social-network'} clazz={'socialNetworkButton icon-button'} hasTooltip={true}/>
                        <NavViewLink labelKey={'profile-filter'} to={'/profile-filter'} clazz={'filterButton icon-button'} hasTooltip={true}/>
                        <NavViewLink labelKey={'groups'} to={'/groups'} clazz={'groupsButton icon-button'} hasTooltip={true}/>
                        <NavViewLink labelKey={'textSearch'} to={'/textSearch'} clazz={'textSearchButton icon-button'} hasTooltip={true}/>
                        <NavViewLink labelKey={'roleGrid'} to={'/roleGrid'} clazz={'roleGridButton icon-button'} hasTooltip={true}/>

                        <NavSeparator/>
                        {
                            PRODUCT === 'SERVER' &&
                            <NavViewLink labelKey={'admins'} to={'/admins'} clazz={'accessManagerButton icon-button'} hasTooltip={true}/>
                        }
                        <NavViewLink labelKey={'logViewer'} to={'/logViewer'} clazz={'logViewerButton icon-button'} hasTooltip={true}/>

                        <NavSeparator/>
                        {
                            isAdmin && <LoadBaseButton opts={btnOpts} onChange={(evt) => {
                                FileUtils.readSingleFile(evt)
                                    .then((database) => DBMS.setDatabase({ database }))
                                    .then(() => PermissionInformer.refresh())
                                    .then(onBaseLoaded, UI.handleError);
                            }} />
                        }
                        <NavButton clazz={'dataSaveButton'} btnName={'save-database'} callback={FileUtils.saveFile} />
                        {
                            PRODUCT === 'STANDALONE' &&
                            <NavButton clazz={'newBaseButton'} btnName={'create-database'} callback={loadEmptyBase} />
                        }
                        {
                            MODE === 'DEV' && DEV_OPTS.ENABLE_TESTS &&
                            <NavButton clazz={'testButton'} btnName={'test'} callback={TestUtils.runTests} />
                        }
                        {
                            MODE === 'DEV' && DEV_OPTS.ENABLE_BASICS &&
                            <>
                                <NavButton clazz={'checkConsistencyButton'} btnName={'checkConsistency'} callback={checkConsistency} />
                                <NavButton clazz={'clickAllTabsButton'} btnName={'clickAllTabs'} callback={TestUtils.clickThroughtHeaders} />
                            </>
                        }
                        {
                            MODE === 'DEV' && DEV_OPTS.ENABLE_EXTRAS &&
                            <>
                                <NavButton clazz={'checkConsistencyButton'} btnName={'showDbmsConsistencyState'} callback={showDbmsConsistencyState} />
                                <NavButton clazz={'clickAllTabsButton'} btnName={'showDiff'} callback={showDiffExample} />
                            </>
                        }
                        {
                            PRODUCT === 'SERVER' &&
                            <NavButton clazz={'logoutButton'} btnName={'logout'} callback={postLogout} />
                        }
                        {/* <NavButton clazz={'refreshButton'} btnName={'refresh'} callback={() => navComponent.refreshCurrentView()} /> */}
                    </ul>
                </nav>
                <Switch>
                    <Route path="/overview">    <ViewWrapper view={viewCache.get('overview')}/></Route>
                    {/* <Route path="/characters">  <ViewWrapper view={viewCache.get('characters')}/></Route> */}
                    <Route path="/characters">
                        <nav className="navigation navigation2">
                            <ul className="width-100p">
                                <NavViewLink labelKey={'filling-profile'} to={'/characters/characterEditor'}/>
                                <NavViewLink labelKey={'changing-profile-structure'} to={'/characters/characterConfigurer'}/>
                                <NavViewLink labelKey={'binding-characters-and-players'} to={'/characters/profileBinding'}/>
                            </ul>
                        </nav>
                        <Switch>
                            <Route path="/characters/characterEditor">  <ViewWrapper view={viewCache.get('characterEditor')}/></Route>
                            <Route path="/characters/characterConfigurer">   <ViewWrapper view={viewCache.get('characterConfigurer')}/></Route>
                            <Route path="/characters/profileBinding">   <ViewWrapper view={viewCache.get('profileBinding')}/></Route>
                            {/* <Redirect to={"/characters/characterEditor"}/> */}
                        </Switch>
                    </Route>
                    {/* <Route path="/players">     <ViewWrapper view={viewCache.get('players')}/></Route> */}
                    <Route path="/players">
                        <nav className="navigation navigation2">
                            <ul className="width-100p">
                                <NavViewLink labelKey={'filling-profile'} to={'/players/playerEditor'}/>
                                <NavViewLink labelKey={'changing-profile-structure'} to={'/players/playerConfigurer'}/>
                                <NavViewLink labelKey={'binding-characters-and-players'} to={'/players/profileBinding'}/>
                            </ul>
                        </nav>
                        <Switch>
                            <Route path="/players/playerEditor">  <ViewWrapper view={viewCache.get('playerEditor')}/></Route>
                            <Route path="/players/playerConfigurer">   <ViewWrapper view={viewCache.get('playerConfigurer')}/></Route>
                            <Route path="/players/profileBinding">   <ViewWrapper view={viewCache.get('profileBinding')}/></Route>
                            {/* <Redirect to={"/players/playerEditor"}/> */}
                        </Switch>
                    </Route>
                    <Route path="/stories">     <ViewWrapper view={viewCache.get('stories')}/></Route>
                    <Route path="/adaptations"> <ViewWrapper view={viewCache.get('adaptations')}/></Route>
                    <Route path="/briefings">
                        <nav className="navigation navigation2">
                            <ul className="width-100p">
                                <NavViewLink labelKey={'briefing-preview'} to={'/briefings/briefingPreview'}/>
                                <NavViewLink labelKey={'briefing-export'} to={'/briefings/briefingExport'}/>
                            </ul>
                        </nav>
                        <Switch>
                            <Route path="/briefings/briefingPreview">  <ViewWrapper view={viewCache.get('briefingPreview')}/></Route>
                            <Route path="/briefings/briefingExport">   <ViewWrapper view={viewCache.get('briefingExport')}/></Route>
                            {/* <Redirect to={"/briefings/briefingPreview"}/> */}
                        </Switch>
                    </Route>
                    <Route path="/relations">   <ViewWrapper view={viewCache.get('relations')}/></Route>

                    <Route path="/timeline">    <ViewWrapper view={viewCache.get('timeline')}/></Route>
                    <Route path="/social-network"><ViewWrapper view={viewCache.get('socialNetwork')}/></Route>
                    <Route path="/profile-filter"><ViewWrapper view={viewCache.get('profileFilter')}/></Route>
                    <Route path="/groups">      <ViewWrapper view={viewCache.get('groups')}/></Route>
                    <Route path="/textSearch">  <ViewWrapper view={viewCache.get('textSearch')}/></Route>
                    <Route path="/roleGrid">    <ViewWrapper view={viewCache.get('roleGrid')}/></Route>

                    {
                        PRODUCT === 'SERVER' &&
                        // <Route path="/admins">    <ViewWrapper view={viewCache.get('admins')}/></Route>
                        <Route path="/admins">
                            <nav className="navigation navigation2">
                                <ul className="width-100p">
                                    <NavViewLink labelKey={'organizerManagement'} to={'/admins/organizerManagement'}/>
                                    <NavViewLink labelKey={'playerManagement'} to={'/admins/playerManagement'}/>
                                </ul>
                            </nav>
                            <Switch>
                                <Route path="/admins/organizerManagement"><ViewWrapper view={viewCache.get('organizerManagement')}/></Route>
                                <Route path="/admins/playerManagement">   <ViewWrapper view={viewCache.get('playerManagement')}/></Route>
                                {/* <Redirect to={"/admins/organizerManagement"}/> */}
                            </Switch>
                        </Route>
                    }
                    {/* <Route path="/logViewer">    <ViewWrapper view={viewCache.get('logViewer')}/></Route> */}
                    <Route path="/logViewer">
                        <nav className="navigation navigation2">
                            <ul className="width-100p">
                                <NavViewLink labelKey={'group-schema'} to={'/logViewer/groupSchema'}/>
                                <NavViewLink labelKey={'logViewer'} to={'/logViewer/logViewer'}/>
                                <NavViewLink labelKey={'about'} to={'/logViewer/about'}/>
                            </ul>
                        </nav>
                        <Switch>
                            <Route path="/logViewer/groupSchema">   <ViewWrapper view={viewCache.get('groupSchema')}/></Route>
                            <Route path="/logViewer/logViewer">     <ViewWrapper view={viewCache.get('logViewer')}/></Route>
                            <Route path="/logViewer/about">         <ViewWrapper view={viewCache.get('about')}/></Route>
                            {/* <Redirect to={"/logViewer/logViewer"}/> */}
                        </Switch>
                    </Route>

                    {/* <Redirect to={"/overview"}/> */}
                </Switch>
                <div className="hidden">
                    {
                        PRODUCT === 'SERVER' && <LogoutFormTemplate/>
                    }
                </div>
            </Router>

            {/* <div id="contentArea"></div> */}
        </I18nextProvider>,
        document.getElementById('root')
    );

    // navComponent.render();

    // navComponent.refreshCurrentView();
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


function initBaseLoadBtn(button, input, onBaseLoaded2) {
    button.addEventListener('change', (evt) => {
        FileUtils.readSingleFile(evt)
            .then((database) => DBMS.setDatabase({ database }))
            .then(() => PermissionInformer.refresh())
            .then(onBaseLoaded2, UI.handleError);
    }, false);
    button.addEventListener('click', (e) => {
        input.value = '';
        input.click();
        //                    e.preventDefault(); // prevent navigation to "#"
    });
}

function onBaseLoaded(err3) {
    if (err3) { UI.handleError(err3); return; }
    consistencyCheck((checkResult) => {
        consistencyCheckAlert(checkResult);
        if (firstBaseLoad) {
            onDatabaseLoad();
            firstBaseLoad = false;
        } else {
            // navComponent.refreshCurrentView();
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

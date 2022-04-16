import PermissionInformer from 'permissionInformer';
import DbmsFactory from 'DbmsFactory';
// import apis from 'apis';
import * as apis from 'apis';

import ReactDOM from 'react-dom';
import React from 'react';
import { makeDbms } from 'nims-dbms';
import { UI, U, L10n } from 'nims-app-core';
import * as TestUtils from 'nims-app-core/testUtils';
import * as FileUtils from 'nims-app-core/fileUtils';
import { DemoBase, EmptyBase } from 'nims-resources';
import { I18nextProvider } from 'react-i18next';
import { i18n } from 'nims-app-core/i18n';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect
} from 'react-router-dom';

import { LoadBaseButton } from './makeLoadBaseButton.jsx';

import { getLogoutFormTemplate, LogoutFormTemplate } from '../views/serverSpecific/LogoutFormTemplate.jsx';

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
import OrganizerManagement from '../views/accessManager/organizerManagement';
import PlayerManagement from '../views/accessManager/playerManagement';

// import { getNavExperiment } from './NavExperiment.jsx';

// import { getRootComponent } from "./rootComponent.jsx";

import { ViewWrapper } from './ViewWrapper.jsx';
import { AboutV2 } from '../views/logs/AboutV2';

import { OrganizerApp } from './OrganizerApp';

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

// const pageCore = new PageCore();
let navComponent = null;
const navComponent2 = null;

let onPageLoad = null;
if (PRODUCT === 'STANDALONE') {
  onPageLoad = () => {
    const res = initPage();
    // navComponent = res.nav1;
    navComponent = res.nav2;
    // pageCore.initPage();
    // console.log('apis', apis);
    window.DBMS = makeDbms(EmptyBase).preparedDb;
    // window.DBMS = DbmsFactory({
    //   logModule,
    //   projectName: PROJECT_NAME,
    //   proxies: [CallNotificator],
    //   apis,
    //   isServer: PRODUCT !== 'STANDALONE'
    // }).preparedDb;
    if (MODE === 'DEV' && !DEV_OPTS.ENABLE_BASE_SELECT_DLG) {
      DBMS.setDatabase({ database: DemoBase }).then(onBaseLoaded, UI.handleError);
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
  constructor() {
    this.cache = {};
  }

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
  } catch (err) {
    UI.handleError(err);
    return;
  }
  $.datetimepicker.setDateFormatter('moment');

  // const firstTab = 'Stories';
  const firstTab = 'Overview';
  // const firstTab = 'AccessManager';

  const globalObjects = { L10n, DBMS, SM };

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
    <OrganizerApp
      viewCache={viewCache}
      isAdmin={isAdmin}
      loadEmptyBase={loadEmptyBase}
      checkConsistency={checkConsistency}
      showDiffExample={showDiffExample}
      showDbmsConsistencyState={showDbmsConsistencyState}
      dbms={DBMS}
      permissionInformer={PermissionInformer}
      onLoadBaseClick={(evt) => {
        FileUtils.readSingleFile(evt)
          .then((database) => DBMS.setDatabase({ database }))
          .then(() => PermissionInformer.refresh())
          .then(onBaseLoaded, UI.handleError);
      }}
    />,
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

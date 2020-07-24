import React, { Component } from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect
} from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n } from 'nims-app-core/i18n';
import * as TestUtils from 'nims-app-core/testUtils';
import * as FileUtils from 'nims-app-core/fileUtils';

import './OrganizerApp.css';
import {
  NavButton, NavSeparator, NavViewLink
} from '../NavComponent.jsx';
import { ViewWrapper } from '../ViewWrapper.jsx';

import { AboutV2 } from '../../views/logs/AboutV2';
import { LogViewerV2 } from '../../views/logs/LogViewerV2';
import { GroupSchemaV2 } from '../../views/groups/GroupSchemaV2';
import { TextSearch } from '../../views/textSearch/TextSearch/index';

import { LogoutFormTemplate } from '../../views/serverSpecific/LogoutFormTemplate.jsx';
import { LoadBaseButton } from '../makeLoadBaseButton.jsx';
import {
  btnOpts, makeL10nButton, postLogout, makeButton, initPage
} from '../pageCore';

// import { OrganizerAppPropTypes } from '../../types';

export class OrganizerApp extends Component {
  // static propTypes = OrganizerAppPropTypes;

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('OrganizerApp mounted');
  }

  componentDidUpdate() {
    console.log('OrganizerApp did update');
  }

  componentWillUnmount() {
    console.log('OrganizerApp will unmount');
  }

  render() {
    const {
      viewCache, isAdmin, loadEmptyBase, checkConsistency, showDiffExample, showDbmsConsistencyState, onLoadBaseClick
    } = this.props;

    return (
      <I18nextProvider i18n={i18n}>
        <Router>
          <nav className="navigation navigation2">
            <ul className="width-100p">
              <NavViewLink labelKey="overview" to="/overview" />
              <NavViewLink labelKey="characters" to="/characters" />
              <NavViewLink labelKey="players" to="/players" />
              <NavViewLink labelKey="stories" to="/stories" />
              <NavViewLink labelKey="adaptations" to="/adaptations" />
              <NavViewLink labelKey="briefings" to="/briefings" />
              <NavViewLink labelKey="relations" to="/relations" />

              <NavSeparator />
              <NavViewLink labelKey="timeline" to="/timeline" clazz="timelineButton icon-button" hasTooltip />
              <NavViewLink labelKey="social-network" to="/social-network" clazz="socialNetworkButton icon-button" hasTooltip />
              <NavViewLink labelKey="profile-filter" to="/profile-filter" clazz="filterButton icon-button" hasTooltip />
              <NavViewLink labelKey="groups" to="/groups" clazz="groupsButton icon-button" hasTooltip />
              <NavViewLink labelKey="textSearch" to="/textSearch" clazz="textSearchButton icon-button" hasTooltip />
              <NavViewLink labelKey="roleGrid" to="/roleGrid" clazz="roleGridButton icon-button" hasTooltip />

              <NavSeparator />
              {
                PRODUCT === 'SERVER'
                            && <NavViewLink labelKey="admins" to="/admins" clazz="accessManagerButton icon-button" hasTooltip />
              }
              <NavViewLink labelKey="logViewer" to="/logViewer" clazz="logViewerButton icon-button" hasTooltip />

              <NavSeparator />
              {
                isAdmin && (
                  <LoadBaseButton
                    opts={btnOpts}
                    onChange={onLoadBaseClick}
                  />
                )
              }
              <NavButton clazz="dataSaveButton" btnName="save-database" callback={FileUtils.saveFile} />
              {
                PRODUCT === 'STANDALONE'
                            && <NavButton clazz="newBaseButton" btnName="create-database" callback={loadEmptyBase} />
              }
              {
                MODE === 'DEV' && DEV_OPTS.ENABLE_TESTS
                            && <NavButton clazz="testButton" btnName="test" callback={TestUtils.runTests} />
              }
              {
                MODE === 'DEV' && DEV_OPTS.ENABLE_BASICS
                            && (
                              <>
                                <NavButton clazz="checkConsistencyButton" btnName="checkConsistency" callback={checkConsistency} />
                                <NavButton clazz="clickAllTabsButton" btnName="clickAllTabs" callback={TestUtils.clickThroughtHeaders} />
                              </>
                            )
              }
              {
                MODE === 'DEV' && DEV_OPTS.ENABLE_EXTRAS
                    && (
                      <>
                        <NavButton clazz="checkConsistencyButton" btnName="showDbmsConsistencyState" callback={showDbmsConsistencyState} />
                        <NavButton clazz="clickAllTabsButton" btnName="showDiff" callback={showDiffExample} />
                      </>
                    )
              }
              {
                PRODUCT === 'SERVER'
                            && <NavButton clazz="logoutButton" btnName="logout" callback={postLogout} />
              }
              {/* <NavButton clazz={'refreshButton'} btnName={'refresh'} callback={() => navComponent.refreshCurrentView()} /> */}
            </ul>
          </nav>
          <Switch>
            <Route path="/overview">
              <ViewWrapper view={viewCache.get('overview')} />
            </Route>
            {/* <Route path="/characters">  <ViewWrapper view={viewCache.get('characters')}/></Route> */}
            <Route path="/characters">
              <nav className="navigation navigation2 sub-tab-navigation">
                <ul className="width-100p">
                  <NavViewLink labelKey="filling-profile" to="/characters/characterEditor" />
                  <NavViewLink labelKey="changing-profile-structure" to="/characters/characterConfigurer" />
                  <NavViewLink labelKey="binding-characters-and-players" to="/characters/profileBinding" />
                </ul>
              </nav>
              <Switch>
                <Route path="/characters/characterEditor">
                  <ViewWrapper view={viewCache.get('characterEditor')} />
                </Route>
                <Route path="/characters/characterConfigurer">
                  <ViewWrapper view={viewCache.get('characterConfigurer')} />
                </Route>
                <Route path="/characters/profileBinding">
                  <ViewWrapper view={viewCache.get('profileBinding')} />
                </Route>
                {/* <Redirect to={"/characters/characterEditor"}/> */}
              </Switch>
            </Route>
            {/* <Route path="/players">     <ViewWrapper view={viewCache.get('players')}/></Route> */}
            <Route path="/players">
              <nav className="navigation navigation2 sub-tab-navigation">
                <ul className="width-100p">
                  <NavViewLink labelKey="filling-profile" to="/players/playerEditor" />
                  <NavViewLink labelKey="changing-profile-structure" to="/players/playerConfigurer" />
                  <NavViewLink labelKey="binding-characters-and-players" to="/players/profileBinding" />
                </ul>
              </nav>
              <Switch>
                <Route path="/players/playerEditor">
                  <ViewWrapper view={viewCache.get('playerEditor')} />
                </Route>
                <Route path="/players/playerConfigurer">
                  <ViewWrapper view={viewCache.get('playerConfigurer')} />
                </Route>
                <Route path="/players/profileBinding">
                  <ViewWrapper view={viewCache.get('profileBinding')} />
                </Route>
                {/* <Redirect to={"/players/playerEditor"}/> */}
              </Switch>
            </Route>
            <Route path="/stories">
              <ViewWrapper view={viewCache.get('stories')} />
            </Route>
            <Route path="/adaptations">
              <ViewWrapper view={viewCache.get('adaptations')} />
            </Route>
            <Route path="/briefings">
              <nav className="navigation navigation2 sub-tab-navigation">
                <ul className="width-100p">
                  <NavViewLink labelKey="briefing-preview" to="/briefings/briefingPreview" />
                  <NavViewLink labelKey="briefing-export" to="/briefings/briefingExport" />
                </ul>
              </nav>
              <Switch>
                <Route path="/briefings/briefingPreview">
                  <ViewWrapper view={viewCache.get('briefingPreview')} />
                </Route>
                <Route path="/briefings/briefingExport">
                  <ViewWrapper view={viewCache.get('briefingExport')} />
                </Route>
                {/* <Redirect to={"/briefings/briefingPreview"}/> */}
              </Switch>
            </Route>
            <Route path="/relations">
              <ViewWrapper view={viewCache.get('relations')} />
            </Route>

            <Route path="/timeline">
              <ViewWrapper view={viewCache.get('timeline')} />
            </Route>
            <Route path="/social-network"><ViewWrapper view={viewCache.get('socialNetwork')} /></Route>
            <Route path="/profile-filter"><ViewWrapper view={viewCache.get('profileFilter')} /></Route>
            <Route path="/groups">
              <ViewWrapper view={viewCache.get('groups')} />
            </Route>
            <Route path="/textSearch">
              <ViewWrapper view={viewCache.get('textSearch')} />
              <TextSearch />
            </Route>
            {/* <Route path="/roleGrid">
              <ViewWrapper view={viewCache.get('roleGrid')} />
            </Route> */}

            {
              PRODUCT === 'SERVER'
                        // <Route path="/admins">    <ViewWrapper view={viewCache.get('admins')}/></Route>
                        && (
                          <Route path="/admins">
                            <nav className="navigation navigation2 sub-tab-navigation">
                              <ul className="width-100p">
                                <NavViewLink labelKey="organizerManagement" to="/admins/organizerManagement" />
                                <NavViewLink labelKey="playerManagement" to="/admins/playerManagement" />
                              </ul>
                            </nav>
                            <Switch>
                              <Route path="/admins/organizerManagement"><ViewWrapper view={viewCache.get('organizerManagement')} /></Route>
                              <Route path="/admins/playerManagement">

                                <ViewWrapper view={viewCache.get('playerManagement')} />
                              </Route>
                              {/* <Redirect to={"/admins/organizerManagement"}/> */}
                            </Switch>
                          </Route>
                        )
            }
            {/* <Route path="/logViewer">    <ViewWrapper view={viewCache.get('logViewer')}/></Route> */}
            <Route path="/logViewer">
              <nav className="navigation navigation2 sub-tab-navigation">
                <ul className="width-100p">
                  <NavViewLink labelKey="group-schema" to="/logViewer/groupSchema" />
                  <NavViewLink labelKey="logViewer" to="/logViewer/logViewer" />
                  <NavViewLink labelKey="about" to="/logViewer/about" />
                </ul>
              </nav>
              <Switch>
                <Route path="/logViewer/groupSchema">
                  <GroupSchemaV2 />
                  {/* <ViewWrapper view={viewCache.get('groupSchema')} /> */}
                </Route>
                <Route path="/logViewer/logViewer">
                  <LogViewerV2 />
                  {/* <ViewWrapper view={viewCache.get('logViewer')} /> */}
                </Route>
                <Route path="/logViewer/about">
                  <AboutV2 />
                </Route>
                {/* <Redirect to={"/logViewer/logViewer"}/> */}
              </Switch>
            </Route>

            {/* <Redirect to={"/overview"}/> */}
            {/* <Redirect to="/logViewer/groupSchema" /> */}
            <Redirect to="/textSearch" />
          </Switch>
          <div className="hidden">
            {
              PRODUCT === 'SERVER' && <LogoutFormTemplate />
            }
          </div>
        </Router>

        {/* <div id="contentArea"></div> */}
      </I18nextProvider>
    );
  }
}

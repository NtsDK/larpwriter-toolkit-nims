/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';

// const DbmsFactory = require('DbmsFactory');

import * as makeDBMS from 'DbmsFactory';
// import Button from 'react-bootstrap/Button';
// import ButtonGroup from 'react-bootstrap/ButtonGroup';
// import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
// import { faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
// import Header from '../header';
// import Overview from '../../views2/overview';


// import RandomPlanet from '../random-planet';
// import ErrorBoundry from '../error-boundry';
// import SwapiService from '../../services/swapi-service';
// import DummySwapiService from '../../services/dummy-swapi-service';

// import {
//   PeoplePage,
//   PlanetsPage,
//   StarshipsPage,
//   LoginPage,
//   SecretPage } from '../pages';

// import { SwapiServiceProvider } from '../swapi-service-context';


import './app.css';

import DemoBase from 'resources/demoBase';

import GameInfo from '../views/gameInfo';
import StatisticDiagrams from '../views/statisticDiagrams';
import { json2File, makeFileName, readJsonFile } from '../../utils/fileUtils';
import ProfileStructureEditor from '../views/profileStructureEditor';
// import Characters from '../views/characters';

const apis = require('apis');
const logModule = require('front-db/consoleLogModule');
const CallNotificator = require('front-db/callNotificator');

// const nav = [
//   {
//     viewName: 'overview',
//     view: Overview
//   }
// ];


// console.log(makeDBMS);

// console.log(DemoBase);

// import StarshipDetails from '../sw-components/starship-details';

export default class App extends Component {
  state = {
    dbms: null
    // swapiService: new SwapiService(),
    // isLoggedIn: false
  };

  settings = {
    routing: {

    }
  };

  componentDidMount() {
    this.setDatabase(DemoBase.data);
  }

  setDatabase = (database) => {
    const dbms = makeDBMS(
      {
        logModule,
        projectName: PROJECT_NAME,
        proxies: [],
        // proxies: [CallNotificator],
        apis,
        isServer: PRODUCT !== 'STANDALONE'
      }
    ).preparedDb;
    // eslint-disable-next-line react/destructuring-assignment
    dbms.setDatabase({ database }).then(
      () => {
        this.consistencyCheck(dbms).then((checkResult) => {
          this.consistencyCheckAlert(checkResult);
          this.setState({
            dbms,
            // dbmsUid: Math.random()
          });
          // this.forceUpdate();
        });
      },
      err => console.log(err)
    );
  }

  consistencyCheck = function (dbms) {
    // eslint-disable-next-line react/destructuring-assignment
    return dbms.getConsistencyCheckResult();
  }

  consistencyCheckAlert = function (checkResult) {
    if (checkResult.errors.length > 0) {
      // UI.alert(L10n.getValue('overview-consistency-problem-detected'));
      console.log('overview-consistency-problem-detected');
    } else {
      console.log('Consistency check didn\'t find errors');
    }
  }

  addRoutingState = (path, subpath) => {
    this.settings.routing[path] = subpath;
  };

  getRoutingState = path => this.settings.routing[path];

  downloadDatabaseAsFile = () => {
    this.state.dbms.getDatabase().then((database) => {
      json2File(database, makeFileName(`${PROJECT_NAME}_${database.Meta.name}`, 'json', new Date(database.Meta.saveTime)));
    }).catch(UI.handleError);
  };

  uploadDatabaseFile = (evt) => {
    const input = evt.target.querySelector('input');
    if (input) {
      input.value = '';
      input.click();
    }
  };

  onFileSelected = (evt) => {
    readJsonFile(evt).then(database => this.setDatabase(database));
  };

  //

  //   onLogin = () => {
  //     this.setState({
  //       isLoggedIn: true
  //     });
  //   };

  //   onServiceChange = () => {
  //     this.setState(({ swapiService }) => {
  //       const Service = swapiService instanceof SwapiService ?
  //                         DummySwapiService : SwapiService;
  //       return {
  //         swapiService: new Service()
  //       };
  //     });
  //   };

  render() {
    // const { isLoggedIn } = this.state;

    const { dbms } = this.state;

    const { t, i18n } = this.props;

    if (!dbms) {
      return (<h2>Loading...</h2>);
    }

    return (
      <Router>

        <div className="nims-app">
          <header>
            <nav className="view-switch">
              <ul>
                <li>
                  <NavLink to="/overview">{t('header.overview')}</NavLink>

                </li>
                <li>
                  <NavLink to="/characters">{t('header.characters')}</NavLink>
                </li>
                <li>
                  <NavLink to="/stories">{t('header.stories')}</NavLink>
                </li>
              </ul>

              <ul>
                <li>
                  <button
                    type="button"
                    className="dataLoadButton icon-button action-button mainNavButton"
                    data-original-title=""
                    title={t('header.open-database')}
                    onClick={this.uploadDatabaseFile}
                  >
                    <input
                      type="file"
                      className="hidden"
                      tabIndex="-1"
                      onChange={this.onFileSelected}
                    />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="dataSaveButton icon-button action-button mainNavButton"
                    data-original-title=""
                    onClick={this.downloadDatabaseAsFile}
                    title={t('header.save-database')}
                  />
                </li>
                <li>
                  <button
                    type="button"
                    className="newBaseButton icon-button action-button mainNavButton"
                    data-original-title=""
                    title={t('header.create-database')}
                  />
                </li>
              </ul>
            </nav>

            <Switch>
              <Route path="/overview">
                <nav className="view-switch view-switch-secondary">
                  <ul>
                    <li>
                      <NavLink to="/overview/info">{t('overview.about-game')}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/overview/gameStats">{t('overview.statistic-diagrams')}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/overview/profileStats">{t('overview.profile-diagrams')}</NavLink>
                    </li>
                    {/* <li>
                      <NavLink to="/overview/gears">{t('header.gears')}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/overview/mixer">{t('header.sliders')}</NavLink>
                    </li> */}
                  </ul>
                </nav>
              </Route>

              <Route path="/characters">
                <nav className="view-switch view-switch-secondary">
                  <ul>
                    <li>
                      <NavLink to="/characters/profiles">{t('header.filling-profile')}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/characters/profileStructureEditor">{t('header.changing-profile-structure')}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/characters/binding">{t('header.binding-characters-and-players')}</NavLink>
                    </li>
                  </ul>
                </nav>
              </Route>

            </Switch>

          </header>
          <main>
            <Route
              path="/overview"
              render={() => (
                <Redirect to={
                  this.getRoutingState('overview') || '/overview/info'
                }
                />
              )}
              exact
            />
            {
              // todo gears and mixer later
              // ['info', 'gameStats', 'profileStats', 'gears', 'mixer'].map(name => (
              ['info', 'gameStats', 'profileStats'].map(name => (
                <Route
                  key={name}
                  path={`/overview/${name}`}
                  render={({ match }) => {
                    this.addRoutingState('overview', match.url);
                    switch (name) {
                    case 'info':
                      return <GameInfo dbms={dbms} />;
                    case 'gameStats':
                      return <StatisticDiagrams dbms={dbms} />;
                    default:
                      return (
                        <div>
                          {`${name} stub`}
                        </div>
                      );
                    }
                  }}
                />
              ))
            }

            <Route path="/characters" render={() => <Redirect to="/characters/profiles" />} exact />
            <Route path="/characters/profiles" render={() => <h2>profiles</h2>} exact />
            <Route path="/characters/profileStructureEditor" render={() => <ProfileStructureEditor dbms={dbms} />} exact />
            <Route path="/characters/binding" render={() => <h2>binding</h2>} exact />

            <Route path="/" render={() => <Redirect to="/overview" />} exact />
            {/* <Redirect to="/overview" /> */}

            {/* <Route path="/" render={() => <h2></h2>)} exact /> */}
            {/* <Route path="/" component={Overview} exact />
            <Route path="/overview" component={Overview} />
            <Route path="/characters" component={Characters} /> */}

          </main>
          <footer>
            {/* footer */}
            <div id="debugNotification" className="hidden" />
          </footer>
        </div>
      </Router>
    //   <ErrorBoundry>
    //     <SwapiServiceProvider value={this.state.swapiService} >
    //       <Router>
    //         <div className="stardb-app">
    //           <Header onServiceChange={this.onServiceChange} />
    //           <RandomPlanet />

    //           <Switch>
    //             <Route path="/"
    //                    render={() => <h2>Welcome to StarDB</h2>}
    //             <Route path="/people/:id?" component={PeoplePage} />
    //             <Route path="/planets" component={PlanetsPage} />
    //             <Route path="/starships/:id"
    //                    render={({ match }) => {
    //                      const { id } = match.params;
    //                      return <StarshipDetails itemId={id} />
    //                    }}/>

    //             <Route
    //               path="/login"
    //               render={() => (
    //                 <LoginPage
    //                   isLoggedIn={isLoggedIn}
    //                   onLogin={this.onLogin}/>
    //               )}/>

    //             <Route
    //               path="/secret"
    //               render={() => (
    //                 <SecretPage isLoggedIn={isLoggedIn} />
    //               )}/>

    //             <Route render={() => <h2>Page not found</h2>} />
    //           </Switch>

    //         </div>
    //       </Router>
    //     </SwapiServiceProvider>
    //   </ErrorBoundry>
    );
  }
}

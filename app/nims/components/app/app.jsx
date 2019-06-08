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

// import Overview from '../views/overview';
import GameInfo from '../views/gameInfo';
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


console.log(makeDBMS);

console.log(DemoBase);

// import StarshipDetails from '../sw-components/starship-details';

export default class App extends Component {
  state = {
    dbms: makeDBMS(
      {
        logModule,
        projectName: PROJECT_NAME,
        proxies: [],
        // proxies: [CallNotificator],
        apis,
        isServer: PRODUCT !== 'STANDALONE'
      }
    ).preparedDb
    // swapiService: new SwapiService(),
    // isLoggedIn: false
  };

  settings = {
    routing: {

    }
  };

  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    this.state.dbms.setDatabase({ database: DemoBase.data });
  }

  addRoutingState = (path, subpath) => {
    this.settings.routing[path] = subpath;
  };

  getRoutingState = path => this.settings.routing[path]

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

    return (
      <Router>

        <div className="nims-app">
          <header>
            <nav className="view-switch">
              <ul>
                <li>
                  <NavLink to="/overview">Обзор</NavLink>
                </li>
                <li>
                  <NavLink to="/characters">Персонажи</NavLink>
                </li>
                <li>
                  <NavLink to="/stories">Истории</NavLink>
                </li>
              </ul>

              <ul>
                <li>
                  <NavLink to="/223322">Загрузить базу</NavLink>
                </li>
              </ul>
            </nav>

            <Switch>
              <Route path="/overview">
                <nav className="view-switch view-switch-secondary">
                  <ul>
                    <li>
                      <NavLink to="/overview/info">Информация об игре</NavLink>
                    </li>
                    <li>
                      <NavLink to="/overview/gameStats">Статистические диаграммы</NavLink>
                    </li>
                    <li>
                      <NavLink to="/overview/profileStats">Диаграммы досье</NavLink>
                    </li>
                    <li>
                      <NavLink to="/overview/gears">Шестеренка</NavLink>
                    </li>
                    <li>
                      <NavLink to="/overview/mixer">Микшерный пульт</NavLink>
                    </li>
                  </ul>
                </nav>
              </Route>

              <Route path="/characters">
                <nav className="view-switch view-switch-secondary">
                  <ul>
                    <li>
                      <NavLink to="/characters/profiles">Заполнение досье</NavLink>
                    </li>
                    <li>
                      <NavLink to="/characters/profileStructureEditor">Изменение структуры досье</NavLink>
                    </li>
                    <li>
                      <NavLink to="/characters/binding">Сопоставление персонажей и игроков</NavLink>
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
              ['info', 'gameStats', 'profileStats', 'gears', 'mixer'].map(name => (
                <Route
                  path={`/overview/${name}`}
                  render={({ match }) => {
                    this.addRoutingState('overview', match.url);
                    return (
                      <GameInfo dbms={dbms} />
                    );
                  }}
                />
              ))
            }

            <Route path="/characters" render={() => <Redirect to="/characters/profiles" />} exact />
            <Route path="/characters/profiles" render={() => <h2>profiles</h2>} exact />
            <Route path="/characters/profileStructureEditor" render={() => <h2>profileStructureEditor</h2>} exact />
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

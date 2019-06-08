/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import {
  BrowserRouter as Router, Switch, Route, Redirect
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

const apis = require('apis');
const logModule = require('front-db/consoleLogModule');
const CallNotificator = require('front-db/callNotificator');

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

  componentDidMount() {
    this.state.dbms.setDatabase({ database: DemoBase.data });
  }

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
      <div className="nims-app">
        <header>
          <nav className="view-switch">nav</nav>
        </header>
        <main>main</main>
        <footer><div id="debugNotification" className="hidden" /></footer>
      </div>
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

/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import {
  BrowserRouter as Router, Switch, Route, Redirect
} from 'react-router-dom';

import Header from '../header';
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


// import StarshipDetails from '../sw-components/starship-details';

export default class App extends Component {
//   state = {
//     swapiService: new SwapiService(),
//     isLoggedIn: false
//   };

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

    return (
      <Router>
        <div>
          <Header />
          {/* <div>Hello, App!</div> */}
          <Switch>

            {/* <Route
              path="/"
              render={() => <h2>overview2</h2>}
            /> */}


            <Route
              path="/overview"
              render={() => <h2>overview</h2>}
            />
            <Route
              path="/characterProfiles"
              render={() => <h2>characterProfiles</h2>}
            />
            <Route
              path="/characterProfileSchema"
              render={() => <h2>characterProfileSchema</h2>}
            />
            <Route
              path="/profileBindings"
              render={() => <h2>profileBindings</h2>}
            />
            <Route
              path="/stories"
              render={() => <h2>stories</h2>}
            />
            <Route
              path="/subjectiveVisions"
              render={() => <h2>subjectiveVisions</h2>}
            />
            <Route
              path="/characterSheetsPreview"
              render={() => <h2>characterSheetsPreview</h2>}
            />
            <Route
              path="/characterSheetsExport"
              render={() => <h2>characterSheetsExport</h2>}
            />


            <Route render={() => <h2>Page not found</h2>} />
          </Switch>
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

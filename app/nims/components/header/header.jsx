import React, { Component } from 'react';

// import Header from '../header';
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

import './header.css';


// import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';
// import Navbar from 'react-bootstrap/lib/Navbar';
// import NavItem  from 'react-bootstrap/lib/NavItem';


const Header = () => (
  // expand="lg" bg="light" variant="primary"
  <Navbar>
    {/* <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand> */}
    {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav"> */}
    <Nav className="mr-auto" variant="tabs" defaultActiveKey="/overview">
      <LinkContainer to="/overview">
        <Nav.Link>Обзор</Nav.Link>
      </LinkContainer>
      {/* <Nav.Link href="#link">Link</Nav.Link> */}
      <NavDropdown title="Персонажи">
        <LinkContainer to="/characterProfiles">
          <NavDropdown.Item>Заполнение досье</NavDropdown.Item>
        </LinkContainer>
        <LinkContainer to="/characterProfileSchema">
          <NavDropdown.Item>Изменение структуры досье</NavDropdown.Item>
        </LinkContainer>
        <LinkContainer to="/profileBindings">
          <NavDropdown.Item>Сопоставление персонажей и игроков</NavDropdown.Item>
        </LinkContainer>
      </NavDropdown>
      <LinkContainer to="/stories">
        <Nav.Link>Истории</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/subjectiveVisions">
        <Nav.Link>Адаптации</Nav.Link>
      </LinkContainer>
      <NavDropdown title="Вводные">
        <LinkContainer to="/characterSheetsPreview">
          <NavDropdown.Item>Предварительный просмотр</NavDropdown.Item>
        </LinkContainer>
        <LinkContainer to="/characterSheetsExport">
          <NavDropdown.Item>Экспорт</NavDropdown.Item>
        </LinkContainer>
      </NavDropdown>
      {/* <NavDropdown title="Истори">
                    <NavDropdown.Item href="/characterProfiles">Заполнение досье</NavDropdown.Item>
                    <NavDropdown.Item href="/characterProfileSchema">Изменение структуры досье</NavDropdown.Item>
                    <NavDropdown.Item href="/profileBindings">Сопоставление персонажей и игроков</NavDropdown.Item>
                </NavDropdown> */}
      {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown> */}
    </Nav>
    {/* </Navbar.Collapse> */}
  </Navbar>
  // <div className="header d-flex">
  //   <h3>
  //     <Link to="/">
  //       StarDB
  //     </Link>
  //   </h3>
  //   <ul className="d-flex">
  //     <li>
  //       <Link to="/people/">People</Link>
  //     </li>
  //     <li>
  //       <Link to="/planets/">Planets</Link>
  //     </li>
  //     <li>
  //       <Link to="/starships/">Starships</Link>
  //     </li>
  //     <li>
  //       <Link to="/login">Login</Link>
  //     </li>
  //     <li>
  //       <Link to="/secret">Secret</Link>
  //     </li>
  //   </ul>

  //   <button
  //       onClick={onServiceChange}
  //       className="btn btn-primary btn-sm">
  //     Change Service
  //   </button>
  // </div>
);

export default Header;

// import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
// import StarshipDetails from '../sw-components/starship-details';

// export default class App extends Component {

// //   state = {
// //     swapiService: new SwapiService(),
// //     isLoggedIn: false
// //   };

// //   onLogin = () => {
// //     this.setState({
// //       isLoggedIn: true
// //     });
// //   };

// //   onServiceChange = () => {
// //     this.setState(({ swapiService }) => {
// //       const Service = swapiService instanceof SwapiService ?
// //                         DummySwapiService : SwapiService;
// //       return {
// //         swapiService: new Service()
// //       };
// //     });
// //   };

//   render() {

//     // const { isLoggedIn } = this.state;

//     return (
//         <div>Hello, App!</div>
//     //   <ErrorBoundry>
//     //     <SwapiServiceProvider value={this.state.swapiService} >
//     //       <Router>
//     //         <div className="stardb-app">
//     //           <Header onServiceChange={this.onServiceChange} />
//     //           <RandomPlanet />

//     //           <Switch>
//     //             <Route path="/"
//     //                    render={() => <h2>Welcome to StarDB</h2>}
//     //                    exact />
//     //             <Route path="/people/:id?" component={PeoplePage} />
//     //             <Route path="/planets" component={PlanetsPage} />
//     //             <Route path="/starships" exact component={StarshipsPage} />
//     //             <Route path="/starships/:id"
//     //                    render={({ match }) => {
//     //                      const { id } = match.params;
//     //                      return <StarshipDetails itemId={id} />
//     //                    }}/>

//     //             <Route
//     //               path="/login"
//     //               render={() => (
//     //                 <LoginPage
//     //                   isLoggedIn={isLoggedIn}
//     //                   onLogin={this.onLogin}/>
//     //               )}/>

//     //             <Route
//     //               path="/secret"
//     //               render={() => (
//     //                 <SecretPage isLoggedIn={isLoggedIn} />
//     //               )}/>

//     //             <Route render={() => <h2>Page not found</h2>} />
//     //           </Switch>

//     //         </div>
//     //       </Router>
//     //     </SwapiServiceProvider>
//     //   </ErrorBoundry>
//     );
//   }
// }

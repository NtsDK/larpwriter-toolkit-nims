import React, { Component } from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

export function getNavExperiment() {
  return <NavExperiment />;
}

class BodyStub extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount(props) {
    const {name} = this.props;
    this.setState({
      name
    });
    console.log(name, 'componentDidMount');
  }
  componentDidUpdate() {
    const {name} = this.state;
    console.log(name, 'componentDidUpdate');
  }
  componentWillUnmount() {
    const {name} = this.state;
    console.log(name, 'componentWillUnmount');
  }

  render() {
    const {name} = this.state;
    console.log(name, 'render');
    return <>{name}</>;
  }
  
}

export default function NavExperiment() {
  const routes = [{
    btnName: "Characters",
    route: "/characters",
    component: <BodyStub name="characters"/>
    // component: () => {
    //   console.log('called characters');
    //   return <div>characters view</div>;
    // }
  }, {
    btnName: "About",
    route: "/about",
    component: <BodyStub name="about"/>
    // component: () => {
    //   console.log('called about');
    //   return <div>about view</div>;
    // }
  }, {
    btnName: "Users",
    route: "/users",
    component: <BodyStub name="users"/>
    // component: () => {
    //   console.log('called users');
    //   return <div>users view</div>;
    // }
  }]

  return (
    <Router>
      <div>
        <nav>
          <ul>
            {
              routes.map(routeData => <li key={routeData.route}>
                <Link to={routeData.route}>{routeData.btnName}</Link>
              </li>)
            }
          </ul>
        </nav>
        <Switch>
          {
            routes.map(routeData => 
              <Route key={routeData.route} path={routeData.route}>{routeData.component}</Route>
              )
            }
            {/* <Route key={routeData.route} path={routeData.route}>{routeData.component()}</Route> */}
            {/* <Route key={routeData.route} path={routeData.route}>{routeData.route}</Route> */}
            {/* <Route key={routeData.route} path={routeData.route}>{routeData.component()}</Route> */}
          <Redirect to="/users"/>
        </Switch>
      </div>
    </Router>
  );
}
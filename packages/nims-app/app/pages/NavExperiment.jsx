import React, { Component } from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect
} from "react-router-dom";
import classNames from 'classnames';

import "./NavExperiment.css";
// component: () => {
//   console.log('called characters');
//   return <div>characters view</div>;
// }

export function getNavExperiment(props) {
  return <NavExperiment {...props}/>;
}

class BodyStub extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount(props) {
    const {name, callback} = this.props;
    this.setState({
      name
    });
    callback(true);
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
    // return <>{name}</>;
    return null;
  }
  
}

export default function NavExperiment({navEls, L10n, firstRouteName}) {
  console.log(navEls);
  return (
    <Router>
      <div className="width-100p">
        <nav className="navigation2 width-100p">
          <ul className="width-100p">
            {
              navEls.map(el => {
                if(el.type === 'separator') {
                  return <div className="nav-separator"/>;
                }
                if(el.type === 'link') {
                  const { opts } = el;
                  const text = L10n.getValue(`header-${el.btnName}`);
                  return <li key={el.btnName}>
                    <NavLink 
                      className={classNames("navigation-button", {[opts.clazz]: !!opts.clazz})}
                      to={'/' + el.btnName} title={opts.tooltip ? text : ''}>{opts.tooltip ? '' : text}</NavLink>
                  </li>
                }
                if(el.type === 'button') {
                  const { clazz, btnName, callback, opts } = el;
                  return <button 
                    type="button"
                    className={classNames(clazz, 'action-button', {
                      [opts.className]: !!opts.className
                    })} 
                    title={opts.tooltip ? L10n.getValue(`header-${btnName}`) : ''}
                    onClick={callback}></button>
                }
                return null;
              })
            }
            {/* {
              routes.map(routeData => <li key={routeData.route}>
                <Link to={routeData.route}>{L10n.getValue(`header-${routeData.btnName}`)}</Link>
              </li>)
            } */}
          </ul>
        </nav>
        <Switch>
          {
            navEls.filter(el => el.type === 'link').map(el => {
              return <Route key={el.btnName} path={'/' + el.btnName}><BodyStub name={el.btnName} callback={el.callback}/></Route>;
              // <li key={el.btnName}>
              //   <Link to={'/' + el.btnName}>{L10n.getValue(`header-${el.btnName}`)}</Link>
              // </li>
            })
          }
          {/* {
            routes.map(routeData => 
              <Route key={routeData.route} path={routeData.route}>{routeData.component}</Route>
              )
            } */}
            {/* <Route key={routeData.route} path={routeData.route}>{routeData.component()}</Route> */}
            {/* <Route key={routeData.route} path={routeData.route}>{routeData.route}</Route> */}
            {/* <Route key={routeData.route} path={routeData.route}>{routeData.component()}</Route> */}
          <Redirect to={"/" + firstRouteName}/>
        </Switch>
      </div>
    </Router>
  );
}
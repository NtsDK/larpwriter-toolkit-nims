import React, { Component } from "react";
import classNames from 'classnames';
import { UI, U, L10n } from 'nims-app-core';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect
} from "react-router-dom";
import { BodyStub } from "./BodyStub.jsx";
import { ViewWrapper } from "./ViewWrapper.jsx";

import "./NavExperiment.css";

export class NavComponent extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     navEls2: [],
  //     firstRouteName: null
  //   }
  //   // this.inputRef = React.createRef();
  //   // this.onClick = this.onClick.bind(this);
  // }
//   componentDidMount() {
//     const { navEls, firstViewName } = this.props;
  
//     const viewIndex = {};
//     const navEls2 = navEls.map(navEl => {
//       const copy = {...navEl};
//       if (navEl.type === 'link') {
//           const { btnName, viewName, view, opts } = navEl;
//           // view.init();
//           const callback = (show, btnName) => this.showView(show, viewName);
//           copy.callback = callback;
//           viewIndex[viewName] = {
//               viewName,
//               btnName,
//               // button,
//               view,
//           };
//       }
//       return copy;
//     });
  
//     const { button, view, btnName } = viewIndex[firstViewName];
//     const firstRouteName = btnName;
//     this.setState({
//       navEls2,
//       firstRouteName,
//       viewIndex
//     });
//   }

//   showView(show, viewName) {
//     const {viewIndex} = this.state;
//     const obj = R.values(viewIndex).find(obj => obj.viewName === viewName);
//     if(!obj) {
//         console.warn('Obj for viewName not found: ', viewName);
//         return;
//     }
//     const { view } = obj;
//     // view.init();

//     // if (show) {
//     //     U.passEls(this.content, U.queryEl('#warehouse'));
//     //     this.content.appendChild(view.content || view.getContent());
//     //     U.removeClass(this.content, 'hidden');
//     //     this.currentView = view;
//     //     view.refresh();
//     // } else {
//     //     U.passEls(this.content, U.queryEl('#warehouse'));
//     //     this.currentView = null;
//     //     U.addClass(this.content, 'hidden');
//     // }
// }

  render() {
    // if(!this.navEls2) {
    //   return null;
    // }
    // const {navEls2, firstRouteName} = this.state;
    const {navEls, firstRouteName} = this.props;
    

    return (
      <nav className="navigation main-navigation navigation2">
        {/* <div className="width-100p">
          <nav className="navigation2 width-100p"> */}
            <ul className="width-100p">
              {
                navEls.map(el => {
                  if(el.type === 'separator') {
                    return <div className="nav-separator"/>;
                  }
                  if(el.type === 'customEl') {
                    return el.elComponent;
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
            </ul>
          {/* </nav>
        </div> */}
      </nav>
    )
  }
}


import React, { Component } from 'react';
import classNames from 'classnames';
import { UI, U, L10n } from 'nims-app-core';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect
} from 'react-router-dom';

import './NavComponent.css';

export function NavSeparator() {
  return <div className="nav-separator" />;
}

export function NavViewLink(props) {
  const {
    labelKey, clazz, to, hasTooltip = false
  } = props;
  const text = L10n.getValue(`header-${labelKey}`);
  return (
    <li>
      <NavLink
        className={classNames('navigation-button', { [clazz]: !!clazz })}
        to={to}
        title={hasTooltip ? text : ''}
      >
        {hasTooltip ? '' : text}
      </NavLink>
    </li>
  );
}

export function NavButton(props) {
  const {
    clazz, btnName, callback, hasTooltip = true, extraClass = 'mainNavButton icon-button'
  } = props;
  return (
    <button
      type="button"
      className={classNames(clazz, 'action-button', {
        [extraClass]: !!extraClass
      })}
      title={hasTooltip ? L10n.getValue(`header-${btnName}`) : ''}
      onClick={callback}
    />
  );
}

export function NavContainer(props) {
  const { children, className } = props;
  return (
    <nav className={classNames('navigation navigation2', className)}>
      <ul className="width-100p">
        {children}
      </ul>
    </nav>
  );
}

// export class NavComponent extends Component {
//   render() {
//     // if(!this.navEls2) {
//     //   return null;
//     // }
//     // const {navEls2, firstRouteName} = this.state;
//     const { navEls, firstRouteName } = this.props;

//     return (
//       <nav className="navigation main-navigation navigation2">
//         <ul className="width-100p">
//           {
//             navEls.map((el) => {
//               if (el.type === 'separator') {
//                 return <NavSeparator />;
//               }
//               if (el.type === 'customEl') {
//                 return el.elComponent;
//               }
//               if (el.type === 'link') {
//                 return <NavViewLink labelKey={el.btnName} clazz={el.opts.clazz} to={`/${el.btnName}`} hasTooltip={el.opts.tooltip} />;
//               }
//               if (el.type === 'button') {
//                 const {
//                   clazz, btnName, callback, opts
//                 } = el;
//                 return <NavButton clazz={clazz} hasTooltip={opts.tooltip} extraClass={opts.className} btnName={btnName} callback={callback} />;
//               }
//               return null;
//             })
//           }
//         </ul>
//       </nav>
//     );
//   }
// }

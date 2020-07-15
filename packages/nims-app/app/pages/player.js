import DbmsFactory from 'DbmsFactory';
import ReactDOM from 'react-dom';
import { getLogoutFormTemplate } from "../views/serverSpecific/LogoutFormTemplate.jsx";

import {
    PageCore, btnOpts, makeL10nButton, postLogout, makeButton
} from './pageCore';

import './player.html';

import '../style/common.css';
import '../style/icons.css';
import '../style/style.css';
import '../style/experimental.css';

import Player from '../views/serverSpecific/player';
import About from '../views/logs/about';
import { U, L10n } from 'nims-app-core';

const pageCore = new PageCore();

let onPageLoad = null;

onPageLoad = () => {
    pageCore.initPage();
    window.DBMS = DbmsFactory();

    pageCore.addView('player', 'Player', Player);
    pageCore.addNavSeparator();
    pageCore.addView('about', 'About', About);

    const content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getLogoutFormTemplate(), content);
    L10n.localizeStatic(content);

    pageCore.addNavEl(makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));

    pageCore.setFirstTab('Player');
    pageCore.refreshView();
};

window.onPageLoad = onPageLoad;

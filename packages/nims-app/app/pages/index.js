import {
    PageCore
} from './pageCore';

import './index.html';

import '../style/common.css';
import '../style/icons.css';
import '../style/style.css';
import '../style/experimental.css';

import Enter from '../views/serverSpecific/enter';
import SignUp from '../views/serverSpecific/sign-up';
import About from '../views/logs/about';

const pageCore = new PageCore();

let onPageLoad = null;

onPageLoad = () => {
    pageCore.initPage();
    // window.DBMS = makeRemoteDBMS();
    // DBMS.getPlayersOptions().then((playersOptions) => {

    const playersOptions = {};
    playersOptions.allowPlayerCreation = true;
    pageCore.addNavSeparator();

    pageCore.addView('enter', 'Enter', Enter);
    if (playersOptions.allowPlayerCreation) {
        pageCore.addView('sign-up', 'SignUp', SignUp);
    }
    pageCore.addView('about', 'About', About);

    pageCore.setFirstTab('Enter');
    //            U.addEl(state.navigation, makeL10nButton());
    pageCore.refreshView();
    // state.currentView.refresh();
};

window.onPageLoad = onPageLoad;

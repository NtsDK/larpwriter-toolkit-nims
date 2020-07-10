const {
    initPage, makeButton, btnOpts, postLogout, refreshView,
    addNavSeparator, addNavEl, testView, addView, setFirstTab
} = require('./pageCore');

require('./index.html');

require('../style/common.css');
require('../style/icons.css');
require('../style/style.css');
require('../style/experimental.css');

const { Enter, SignUp, About } = require('../views');

exports.onPageLoad = () => {
    initPage();
    // window.DBMS = makeRemoteDBMS();
    // exports.stateInit();
    // DBMS.getPlayersOptions().then((playersOptions) => {

    const playersOptions = {};
    playersOptions.allowPlayerCreation = true;
    addNavSeparator();

    // U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
    addView('enter', 'Enter', Enter);
    if (playersOptions.allowPlayerCreation) {
        addView('sign-up', 'SignUp', SignUp);
    }
    addView('about', 'About', About);

    setFirstTab('Enter');
    //            U.addEl(state.navigation, makeL10nButton());
    refreshView();
    // state.currentView.refresh();
    // }).catch(UI.handleError);
};

window.onPageLoad = exports.onPageLoad;

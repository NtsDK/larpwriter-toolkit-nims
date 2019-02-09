const { makeDBMS } = require('DBMSFactory');

const {
    initPage, makeButton, btnOpts, postLogout, refreshView,
    addNavSeparator, addNavEl, testView, addView, setFirstTab
} = require('./pageCore');

require('../player.html');

require('../style/common.css');
require('../style/icons.css');
require('../style/style.css');
require('../style/experimental.css');

const { Player, About } = require('./pages');

exports.onPageLoad = () => {
    initPage();
    window.DBMS = makeDBMS();

    addView('player', 'Player', Player);
    addNavSeparator();
    addView('about', 'About', About);
    addNavEl(makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));

    setFirstTab('Player');
    refreshView();
};

window.onPageLoad = exports.onPageLoad;

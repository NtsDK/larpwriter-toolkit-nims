require('bootstrap-sass');
require('bootstrap-sass/assets/stylesheets/_bootstrap.scss');

require('@fortawesome/fontawesome-free/css/all.css');

require("jquery-datetimepicker");
require("jquery-datetimepicker/build/jquery.datetimepicker.min.css");
window.moment = require("moment");

require('select2');
require('select2/dist/css/select2.min.css');

var vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'));
vex.defaultOptions.className = 'vex-theme-os';

require('vex-js/dist/css/vex-theme-os.css');

const state = {};
state.views = {};

// exports.state = state;

const tabs = {};

exports.addView = (btnName, viewName, view, opts) => {
    tabs[viewName] = {
        viewName,
        viewRes: UI.addView(state.containers, btnName, view, opts)
    };
};

exports.setFirstTab = firstTab => UI.setFirstTab(state.containers, tabs[firstTab].viewRes);

const btnOpts = {
    tooltip: true,
    className: 'mainNavButton'
};

exports.btnOpts = btnOpts;

function SettingsManager() {
    this.clearSettings();
}

SettingsManager.prototype.getSettings = function () {
    return this.Settings;
};

SettingsManager.prototype.clearSettings = function () {
    this.Settings = {
        BriefingPreview: {},
        Stories: {},
        ProfileEditor: {}
    };
};

exports.initPage = () => {
    L10n.init();
    L10n.onL10nChange(() => state.currentView.refresh());
    UI.initSelectorFilters();
    UI.initPanelTogglers();
    L10n.localizeStatic();
    function updateDialogs() {
        vex.dialog.buttons.YES.text = L10n.getValue('common-ok');
        vex.dialog.buttons.NO.text = L10n.getValue('common-cancel');
    }
    updateDialogs();
    L10n.onL10nChange(updateDialogs);
    window.SM = new SettingsManager();
    stateInit();
};

exports.refreshView = () => state.currentView.refresh();

exports.testView = () => () => {
    if(state.currentView.test){
        state.currentView.test();
    } else {
        console.error('This tab has no tests')
    }
};

exports.onPlayerPageLoad = () => {
    exports.initPage();
    window.DBMS = makeRemoteDBMS();

    // exports.stateInit();
    UI.addView(state.containers, 'player', Player, { mainPage: true });
    U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
    UI.addView(state.containers, 'about', About);
    //        U.addEl(state.navigation, makeL10nButton());
    U.addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
    state.currentView.refresh();
};

function stateInit() {
    state.navigation = U.queryEl('#navigation');
    state.containers = {
        root: state,
        navigation: state.navigation,
        content: U.queryEl('#contentArea')
    };
}

function makeL10nButton() {
    const l10nBtn = makeButton('toggleL10nButton', 'l10n', L10n.toggleL10n, btnOpts);
    const setIcon = () => {
        l10nBtn.style.backgroundImage = CU.strFormat('url("./images/{0}.svg")', [L10n.getValue('header-dictionary-icon')]);
    };
    L10n.onL10nChange(setIcon);
    setIcon();
    return l10nBtn;
}
exports.makeL10nButton = makeL10nButton;

function postLogout() {
    document.querySelector('#logoutForm button').click();
}
exports.postLogout = postLogout;

function makeButton(clazz, name, callback, opts) {
    const button = U.makeEl('button');
    U.addClass(button, clazz);
    if (opts.tooltip) {
        const delegate = () => {
            $(button).attr('data-original-title', L10n.getValue(`header-${name}`));
        };
        L10n.onL10nChange(delegate);
        $(button).tooltip({
            title: L10n.getValue(`header-${name}`),
            placement: 'bottom'
        });
    }
    U.addClass(button, 'action-button');
    if (opts.className) {
        U.addClass(button, opts.className);
    }
    if (callback) {
        U.listen(button, 'click', callback);
    }
    return button;
}
exports.makeButton = makeButton;

exports.addNavSeparator = () => 
    U.addEl(state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));

exports.addNavEl = (el) => 
    U.addEl(state.navigation, el);
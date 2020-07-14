import 'bootstrap-sass';
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';

import '@fortawesome/fontawesome-free/css/all.css';

import 'jquery-datetimepicker';
import 'jquery-datetimepicker/build/jquery.datetimepicker.min.css';
import moment from 'moment';
import { SettingsManager } from './SettingsManager';
window.moment = moment;

import 'select2';
import 'select2/dist/css/select2.min.css';

export class PageCore {

    constructor(){
        this.state = {
            views: {}
        };
        this.tabs = {};
    }

    addView(btnName, viewName, view, opts){
        this.tabs[viewName] = {
            viewName,
            viewRes: UI.addView(this.state.containers, btnName, view, opts)
        };
    };

    setFirstTab(firstTab) {
        return UI.setFirstTab(this.state.containers, this.tabs[firstTab].viewRes);
    }

    initPage() {
        L10n.init();
        L10n.onL10nChange(() => this.state.currentView.refresh());
        UI.initSelectorFilters();
        UI.initPanelTogglers();
        L10n.localizeStatic();
        UI.updateDialogL10n();
        L10n.onL10nChange(UI.updateDialogL10n);
        window.SM = new SettingsManager();
        this.stateInit();
    };

    refreshView() {
        this.state.currentView.refresh();
    }

    testView() {
        return () => {
            if (this.state.currentView.test) {
                this.state.currentView.test();
            } else {
                console.error('This tab has no tests');
            }
        };
    }

    stateInit() {
        this.state.navigation = U.queryEl('#navigation');
        this.state.containers = {
            root: this.state,
            navigation: this.state.navigation,
            content: U.queryEl('#contentArea')
        };
    }

    addNavSeparator() {
        return U.addEl(this.state.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
    }

    addNavEl(el) {
        return U.addEl(this.state.navigation, el);
    }
}

export const btnOpts = {
    tooltip: true,
    className: 'mainNavButton'
};

export function makeL10nButton() {
    const l10nBtn = makeButton('toggleL10nButton', 'l10n', L10n.toggleL10n, btnOpts);
    const setIcon = () => {
        l10nBtn.style.backgroundImage = CU.strFormat('url("./images/{0}.svg")', [L10n.getValue('header-dictionary-icon')]);
    };
    L10n.onL10nChange(setIcon);
    setIcon();
    return l10nBtn;
}

export function postLogout() {
    document.querySelector('#logoutForm button').click();
}

export function makeButton(clazz, name, callback, opts) {
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

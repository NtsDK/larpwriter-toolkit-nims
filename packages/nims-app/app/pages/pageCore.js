import 'bootstrap-sass';
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';

import '@fortawesome/fontawesome-free/css/all.css';

import 'jquery-datetimepicker';
import 'jquery-datetimepicker/build/jquery.datetimepicker.min.css';
import moment from 'moment';
import { UI, U, L10n } from 'nims-app-core';
import { SettingsManager } from './SettingsManager';

import 'select2';
import 'select2/dist/css/select2.min.css';

window.moment = moment;

export function initPage() {
  L10n.init();
  L10n.onL10nChange(() => this.navComponent.refreshCurrentView());
  UI.initSelectorFilters();
  UI.initPanelTogglers();
  L10n.localizeStatic();
  UI.updateDialogL10n();
  L10n.onL10nChange(UI.updateDialogL10n);
  window.SM = new SettingsManager();
  return {
    // nav1: new NavComponentV1(U.queryEl('.navigation.main-navigation'), U.queryEl('#contentArea')),
    // nav2: new NavComponentV2(U.queryEl('.navigation.test-navigation'), U.queryEl('#contentArea'))
  };
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

export function makeButton(clazz, btnName, callback, opts) {
  const button = U.makeEl('button');
  U.addClass(button, clazz);
  if (opts.tooltip) {
    const delegate = () => {
      $(button).attr('data-original-title', L10n.getValue(`header-${btnName}`));
    };
    L10n.onL10nChange(delegate);
    $(button).tooltip({
      title: L10n.getValue(`header-${btnName}`),
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

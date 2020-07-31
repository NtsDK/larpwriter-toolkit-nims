import PermissionInformer from 'permissionInformer';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import FilterConfiguration from './FilterConfiguration';
import { getGroupFilter, getGroupFilterRow, getGroupProfileTemplate } from './GroupProfileTemplate.jsx';
import { getProfileEditorRow } from '../profiles2/ProfileEditorCoreTemplate.jsx';
import { getEntityItem } from '../profiles2/ProfileEditorTemplate.jsx';
import { createModalDialog } from '../commons/uiCommons';
import { getModalPromptBody } from '../commons/uiCommons2.jsx';

const root = '.group-profile-tab ';
const settingsPath = 'GroupProfile';

export class GroupProfile {
    state = {};

    content;

    constructor({ L10n, DBMS }) {
      this.filterOptions = this.filterOptions.bind(this);
      this.renameGroup = this.renameGroup.bind(this);
      this.data2row = this.data2row.bind(this);
      this.refresh = this.refresh.bind(this);
      this.L10nObj = L10n;
      this.DBMSObj = DBMS;
      this.l10n = L10n.get('groups');
    }

    getContent() {
      return this.content;
    }

    init() {
      this.content = U.makeEl('div');
      U.addEl(U.qe('.tab-container'), this.content);
      ReactDOM.render(getGroupProfileTemplate(), this.content);
      L10n.localizeStatic(this.content);

      const createGroupDialog = createModalDialog(root, createGroup(true, this.refresh), {
        // bodySelector: 'modal-prompt-body',
        dialogTitle: 'groups-enter-group-name',
        actionButtonTitle: 'common-create',
        getComponent: getModalPromptBody,
        componentClass: 'ModalPromptBody'
      });
      U.listen(U.qe(`${root}.create`), 'click', () => createGroupDialog.showDlg());

      this.state.renameGroupDialog = createModalDialog(root, this.renameGroup, {
        // bodySelector: 'modal-prompt-body',
        dialogTitle: 'groups-enter-new-group-name',
        actionButtonTitle: 'common-rename',
        getComponent: getModalPromptBody,
        componentClass: 'ModalPromptBody'
      });

      const tbody = U.clearEl(U.queryEl(`${root} .entity-profile`));

      this.state.inputItems = {};

      Constants.groupProfileStructure.forEach((profileSettings) => {
        profileSettings.displayName = L10n.getValue(`groups-${profileSettings.name}`);
        U.addEl(tbody, this.makeInput(profileSettings));
      });

      U.listen(U.queryEl(`${root} .entity-filter`), 'input', this.filterOptions);

      this.content = U.queryEl(`${root}`);
    }

    refresh() {
      PermissionInformer.getEntityNamesArray({ type: 'group', editableOnly: false }).then((groupNames) => {
        U.showEl(U.qe(`${root} .alert`), groupNames.length === 0);
        U.showEl(U.qe(`${root} .col-xs-9`), groupNames.length !== 0);
        UI.enableEl(U.qe(`${root} .entity-filter`), groupNames.length !== 0);

        U.addEls(U.clearEl(U.queryEl(`${root} .entity-list`)), groupNames.map((name, i, arr) => {
          const content = U.makeEl('div');
          ReactDOM.render(getEntityItem(), content);
          const el = U.qee(content, '.EntityItem');

          // const el = U.wrapEl('div', U.qte('.entity-item-tmpl'));
          U.addEl(U.qee(el, '.primary-name'), U.makeText(name.displayName));
          U.setAttr(el, 'primary-name', name.displayName);
          U.setAttr(el, 'profile-name', name.value);
          U.listen(U.qee(el, '.select-button'), 'click', this.showProfileInfoDelegate2(name.value));
          U.setAttr(U.qee(el, '.rename'), 'title', this.l10n('rename-entity'));
          const removeBtn = U.qee(el, '.remove');
          U.setAttr(removeBtn, 'title', this.l10n('remove-entity'));
          if (i + 1 < arr.length) {
            removeBtn.nextName = arr[i + 1].value;
          }
          if (i > 0) {
            removeBtn.prevName = arr[i - 1].value;
          }
          if (name.editable) {
            U.listen(U.qee(el, '.rename'), 'click', () => {
              U.qee(this.state.renameGroupDialog, '.entity-input').value = name.value;
              this.state.renameGroupDialog.fromName = name.value;
              this.state.renameGroupDialog.showDlg();
            });
            U.listen(removeBtn, 'click', removeGroup(() => name.value, this.refresh, removeBtn));
          } else {
            U.setAttr(U.qee(el, '.rename'), 'disabled', 'disabled');
            U.setAttr(removeBtn, 'disabled', 'disabled');
          }
          return el;
        }));

        this.showProfileInfoDelegate2(UI.checkAndGetEntitySetting(settingsPath, groupNames))();
      }).catch(UI.handleError);
    }

    makeInput(profileItemConfig) {
      let input;
      switch (profileItemConfig.type) {
      case 'text':
        input = U.makeEl('textarea');
        U.addClass(input, 'profileTextInput form-control');
        input.addEventListener('change', this.updateFieldValue(profileItemConfig.type));
        break;
      case 'checkbox':
        input = U.makeEl('input');
        input.type = 'checkbox';
        U.addClass(input, 'form-control');
        input.addEventListener('change', this.updateFieldValue(profileItemConfig.type));
        break;
      case 'container':
        input = U.makeEl('div');
        input.type = 'container';
        break;
      default:
        throw new Error(`Unexpected type ${profileItemConfig.type}`);
      }
      input.selfName = profileItemConfig.name;
      U.addClass(input, 'isGroupEditable');
      this.state.inputItems[profileItemConfig.name] = input;

      const content = U.makeEl('div');
      ReactDOM.render(getProfileEditorRow(), content);
      const row = U.qee(content, '.ProfileEditorRow');

      // const row = U.qmte('.profile-editor-row-tmpl');
      U.addEl(U.qee(row, '.profile-item-name'), U.makeText(profileItemConfig.displayName));
      U.setAttr(U.qee(row, '.profile-item-name'), 'l10n-id', `groups-${profileItemConfig.name}`);
      U.addEl(U.qee(row, '.profile-item-input'), input);
      return row;
    }

    updateFieldValue(type) {
      return (event) => {
        const fieldName = event.target.selfName;
        const groupName = this.state.name;

        let value;
        switch (type) {
        case 'text':
          // eslint-disable-next-line prefer-destructuring
          value = event.target.value;
          DBMS.updateGroupField({ groupName, fieldName, value }).catch(UI.handleError);
          break;
        case 'checkbox':
          value = event.target.checked;
          DBMS.doExportGroup({ groupName, value }).catch(UI.handleError);
          break;
        default:
          throw new Error(`Unexpected type ${type}`);
        }
      };
    }

    showProfileInfoDelegate2(name) {
      return () => {
        U.queryEls(`${root} [profile-name] .select-button`).map(U.removeClass(R.__, 'btn-primary'));
        if (name !== null) {
          UI.updateEntitySetting(settingsPath, name);
          const el = U.queryEl(`${root} [profile-name="${name}"] .select-button`);
          U.addClass(el, 'btn-primary');

          const parentEl = el.parentElement.parentElement;
          const entityList = U.queryEl(`${root} .entity-list`);
          UI.scrollTo(entityList, parentEl);

          this.showProfileInfoCallback(name);
        }
      };
    }

    showProfileInfoCallback(groupName) {
      Promise.all([
        DBMS.getGroup({ groupName }),
        FilterConfiguration.makeFilterConfiguration(),
        PermissionInformer.isEntityEditable({ type: 'group', name: groupName })
      ]).then((results) => {
        const [group, filterConfiguration, isGroupEditable] = results;
        const { name } = group;
        this.updateSettings(name);

        const name2DisplayName = filterConfiguration.getName2DisplayNameMapping();

        const name2Source = filterConfiguration.getName2SourceMapping();

        this.state.name = name;
        const { inputItems } = this.state;
        Object.keys(inputItems).forEach((inputName) => {
          if (inputItems[inputName].type === 'checkbox') {
            inputItems[inputName].checked = group[inputName];
          } else if (inputItems[inputName].type === 'container') {
            if (inputName === 'filterModel') {
              const content = U.makeEl('div');
              ReactDOM.render(getGroupFilter(), content);
              const table = U.qee(content, '.GroupFilter');

              // const table = U.qmte(`${root} .group-filter-template`);
              const datas = group.filterModel.map(this.makeFilterItemString(name2DisplayName, name2Source));
              U.addEls(U.qee(table, 'tbody'), datas.map(this.data2row));
              L10n.localizeStatic(table);
              U.addEl(U.clearEl(inputItems[inputName]), table);
            } else if (inputName === 'characterList') {
              const data = filterConfiguration.getProfileIds(group.filterModel);
              const inputItem = U.clearEl(inputItems[inputName]);
              U.addEls(inputItem, [U.makeText(data.join(', ')), U.makeEl('br'), U.makeText(L10n.getValue('groups-total') + data.length)]);
            } else {
              throw new Error(`Unexpected container: ${inputName}`);
            }
          } else if (inputItems[inputName].type === 'textarea') {
            inputItems[inputName].value = group[inputName];
          } else {
            throw new Error(`Unexpected input type: ${inputItems[inputName].type}`);
          }
          inputItems[inputName].oldValue = group[inputName];
          UI.enable(this.content, 'isGroupEditable', isGroupEditable);
        });
      }).catch(UI.handleError);
    }

    // eslint-disable-next-line no-var,vars-on-top
    makeFilterItemString = R.curry((name2DisplayName, name2Source, filterItem) => {
      const displayName = name2DisplayName[filterItem.name];
      const source = name2Source[filterItem.name];
      let condition, arr, value;
      switch (filterItem.type) {
      case 'enum':
        condition = L10n.getValue('groups-one-from');
        value = Object.keys(filterItem.selectedOptions).join(', ');
        break;
      case 'checkbox':
        arr = [];
        if (filterItem.selectedOptions.true) { arr.push(L10n.getValue('constant-yes')); }
        if (filterItem.selectedOptions.false) { arr.push(L10n.getValue('constant-no')); }
        condition = L10n.getValue('groups-one-from');
        value = arr.join(', ');
        break;
      case 'number':
        condition = L10n.getValue(`constant-${filterItem.condition}`);
        value = filterItem.num;
        break;
      case 'multiEnum':
        condition = L10n.getValue(`constant-${filterItem.condition}`);
        value = Object.keys(filterItem.selectedOptions).join(', ');
        break;
      case 'text':
      case 'string':
        condition = L10n.getValue('groups-text-contains');
        value = filterItem.regexString;
        break;
      default:
        throw new Error(`Unexpected type ${filterItem.type}`);
      }
      const title = `${L10n.getValue(`profile-filter-${source}`)}, ${L10n.getValue(`constant-${filterItem.type}`)}`;
      return {
        displayName, title, condition, value
      };
    });

    data2row(data) {
      const {
        displayName, title, condition, value
      } = data;
      const content = U.makeEl('tbody');
      ReactDOM.render(getGroupFilterRow(), content);
      const row = U.qee(content, '.GroupFilterRow');

      // const row = U.qmte(`${root} .group-filter-row-template`);
      U.addEl(U.qee(row, '.profile-item'), U.makeText(displayName));
      U.setAttr(U.qee(row, '.profile-item'), 'title', title);
      U.addEl(U.qee(row, '.condition'), U.makeText(condition));
      U.addEl(U.qee(row, '.value'), U.makeText(value));
      return row;
    }

    updateSettings(name) {
      const settings = SM.getSettings();
      settings.GroupProfile.groupName = name;
    }

    filterOptions(event) {
      const str = event.target.value.toLowerCase();

      const els = U.queryEls(`${root} [primary-name]`);
      els.forEach((el) => {
        const isVisible = U.getAttr(el, 'primary-name').toLowerCase().indexOf(str) !== -1;
        U.hideEl(el, !isVisible);
      });

      if (U.queryEl(`${root} .hidden[primary-name] .select-button.btn-primary`) !== null
                || U.queryEl(`${root} [primary-name] .select-button.btn-primary`) === null) {
        const els2 = U.queryEls(`${root} [primary-name]`).filter(R.pipe(U.hasClass(R.__, 'hidden'), R.not));
        this.showProfileInfoDelegate2(els2.length > 0 ? U.getAttr(els2[0], 'profile-name') : null)();
      } else {
        //            U.queryEl(`${root} [primary-name] .select-button.btn-primary`).scrollIntoView();
      }
    }

    renameGroup(dialog) {
      return () => {
        const toInput = U.qee(dialog, '.entity-input');
        const { fromName } = dialog;
        const toName = toInput.value.trim();

        DBMS.renameGroup({ fromName, toName }).then(() => {
          PermissionInformer.refresh().then(() => {
            UI.updateEntitySetting(settingsPath, toName);
            toInput.value = '';
            dialog.hideDlg();
            this.refresh();
          }).catch(UI.handleError);
        }).catch((err) => UI.setError(dialog, err));
      };
    }
}

export const createGroup = (updateSettingsFlag, refresh) => (dialog) => () => {
  const input = U.qee(dialog, '.entity-input');
  const name = input.value.trim();

  DBMS.createGroup({ groupName: name }).then(() => {
    if (updateSettingsFlag) {
      UI.updateEntitySetting(settingsPath, name);
    }
    PermissionInformer.refresh().then(() => {
      input.value = '';
      dialog.hideDlg();
      refresh();
    }).catch(UI.handleError);
  }).catch((err) => UI.setError(dialog, err));
};

export const removeGroup = (callback, refresh, btn) => () => {
  const name = callback();

  UI.confirm(CU.strFormat(L10n.getValue('groups-are-you-sure-about-group-removing'), [name]), () => {
    DBMS.removeGroup({ groupName: name }).then(() => {
      PermissionInformer.refresh().then(() => {
        if (btn.nextName !== undefined) {
          UI.updateEntitySetting(settingsPath, btn.nextName);
        } else if (btn.prevName !== undefined) {
          UI.updateEntitySetting(settingsPath, btn.prevName);
        }
        refresh();
      }).catch(UI.handleError);
    }).catch(UI.handleError);
  });
};

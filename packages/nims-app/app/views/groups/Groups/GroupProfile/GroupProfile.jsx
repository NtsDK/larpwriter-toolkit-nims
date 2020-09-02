import React, {
  useContext, useEffect, useState, useMemo
} from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import { FilterConfiguration } from '../../FilterConfiguration';
import './GroupProfile.css';

export function GroupProfile(props) {
  const { id: groupName } = props;
  const { t } = useTranslation();
  const { dbms, permissionInformer } = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    Promise.all([
      dbms.getGroup({ groupName }),
      FilterConfiguration.makeFilterConfiguration(dbms),
      permissionInformer.isEntityEditable({ type: 'group', name: groupName })
    ]).then((results) => {
      const [group, filterConfiguration, isGroupEditable] = results;
      const { name } = group;
      // this.updateSettings(name);

      const name2DisplayName = filterConfiguration.getName2DisplayNameMapping();

      const name2Source = filterConfiguration.getName2SourceMapping();

      const groupFilterData = group.filterModel.map((el) => makeFilterItemString(t, name2DisplayName, name2Source, el));
      setState({ group, groupFilterData, filterConfiguration });
    }).catch(UI.handleError);
  }

  useEffect(refresh, [groupName]);

  if (!state) {
    return null;
  }

  const { group, groupFilterData, filterConfiguration } = state;

  function updateFieldValue(event) {
    const { type, fieldName } = event.target.dataset;
    const groupName = group.name;

    let value;
    switch (type) {
    case 'text':
      // eslint-disable-next-line prefer-destructuring
      value = event.target.value;
      dbms.updateGroupField({ groupName, fieldName, value }).catch(UI.handleError);
      break;
    case 'checkbox':
      value = event.target.checked;
      dbms.doExportGroup({ groupName, value }).catch(UI.handleError);
      break;
    default:
      throw new Error(`Unexpected type ${type}`);
    }
  }

  const groupMembersList = filterConfiguration.getProfileIds(group.filterModel);

  return (
    <div className="GroupProfile panel panel-default">
      <div className="panel-body">
        <div className="form-horizontal insertion-point entity-profile">
          <div className="ProfileEditorRow form-group">
            <label className="col-xs-3 control-label profile-item-name">{t('groups.filterModel')}</label>
            <div className="col-xs-9 profile-item-input form-control-static">
              <div className="isGroupEditable">
                <table className="GroupFilter table table-striped">
                  <thead>
                    <tr>
                      <th>{t('groups.profile-item')}</th>
                      <th>{t('groups.condition')}</th>
                      <th>{t('groups.value')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      groupFilterData.map((rowData) => (
                        <tr className="GroupFilterRow">
                          <td className="profile-item" title={rowData.title}>{rowData.displayName}</td>
                          <td className="condition">{rowData.condition}</td>
                          <td className="value">{rowData.value}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="ProfileEditorRow form-group">
            <label className="col-xs-3 control-label profile-item-name">{t('groups.characterList')}</label>
            <div className="col-xs-9 profile-item-input form-control-static">
              {groupMembersList.join(', ')}
              <br />
              {t('groups.total2', { total: groupMembersList.length })}
            </div>
          </div>
          <div className="ProfileEditorRow form-group">
            <label className="col-xs-3 control-label profile-item-name">{t('groups.masterDescription')}</label>
            <div className="col-xs-9 profile-item-input form-control-static">
              <textarea
                className="profileTextInput form-control isGroupEditable"
                defaultValue={group.masterDescription}
                onChange={updateFieldValue}
                data-type="text"
                data-field-name="masterDescription"
              />
            </div>
          </div>
          <div className="ProfileEditorRow form-group">
            <label className="col-xs-3 control-label profile-item-name">{t('groups.doExport')}</label>
            <div className="col-xs-9 profile-item-input form-control-static">
              <input
                type="checkbox"
                className="form-control isGroupEditable"
                defaultChecked={group.doExport}
                onChange={updateFieldValue}
                data-type="checkbox"
              />
            </div>
          </div>
          <div className="ProfileEditorRow form-group">
            <label className="col-xs-3 control-label profile-item-name">{t('groups.characterDescription')}</label>
            <div className="col-xs-9 profile-item-input form-control-static">
              <textarea
                className="profileTextInput form-control isGroupEditable"
                defaultValue={group.characterDescription}
                onChange={updateFieldValue}
                data-type="text"
                data-field-name="characterDescription"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function makeFilterItemString(t, name2DisplayName, name2Source, filterItem) {
  const displayName = name2DisplayName[filterItem.name];
  const source = name2Source[filterItem.name];
  let condition, arr, value;
  switch (filterItem.type) {
  case 'enum':
    condition = t('groups.one-from');
    value = Object.keys(filterItem.selectedOptions).join(', ');
    break;
  case 'checkbox':
    arr = [];
    if (filterItem.selectedOptions.true) { arr.push(t('constant-yes')); }
    if (filterItem.selectedOptions.false) { arr.push(t('constant-no')); }
    condition = t('groups.one-from');
    value = arr.join(', ');
    break;
  case 'number':
    condition = t(`constant.${filterItem.condition}`);
    value = filterItem.num;
    break;
  case 'multiEnum':
    condition = t(`constant.${filterItem.condition}`);
    value = Object.keys(filterItem.selectedOptions).join(', ');
    break;
  case 'text':
  case 'string':
    condition = t('groups.text-contains');
    value = filterItem.regexString;
    break;
  default:
    throw new Error(`Unexpected type ${filterItem.type}`);
  }
  const title = `${t(`profile.filter-${source}`)}, ${t(`constant.${filterItem.type}`)}`;
  return {
    displayName, title, condition, value
  };
}

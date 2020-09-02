import React, {
  useContext, useEffect, useState, useMemo
} from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  NavLink, Route, Redirect
} from 'react-router-dom';
import { FilterConfiguration } from '../FilterConfiguration';

import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';

import './ProfileFilter.css';

export function ProfileFilter(props) {
  const { t } = useTranslation();
  const { dbms, permissionInformer } = useContext(DbmsContext);

  const [state, setState] = useState(null);
  const [sortState, setSortState] = useState({
    sortKey: Constants.CHAR_NAME,
    sortDir: 'asc'
  });

  function refresh() {
    FilterConfiguration.makeFilterConfiguration(dbms).then((filterConfiguration) => {
      setState({ filterConfiguration });
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  if (!state) {
    return null;
  }

  const { filterConfiguration } = state;

  const headerData = R.map(R.pick(['name', 'displayName', 'type']), filterConfiguration.getProfileFilterItems());

  const rawDataArrays = filterConfiguration.getDataArrays([]);

  const sortFunc = CU.charOrdAFactoryBase(sortState.sortDir, (a, b) => a > b, (a) => {
    const map = R.indexBy(R.prop('itemName'), a);
    const item = map[sortState.sortKey];
    let { value } = item;
    if (value === undefined) return value;
    switch (item.type) {
    case 'text':
    case 'string':
    case 'enum':
    case 'multiEnum':
      value = value.toLowerCase();
      break;
    case 'checkbox':
    case 'number':
      break;
    default:
      throw new Error(`Unexpected type ${item.type}`);
    }
    return value;
  });
  const dataArrays = R.sort(sortFunc, rawDataArrays);
  function onSortChange(e) {
    const { sortDir, sortKey } = e.target.dataset;
    if (sortKey === sortState.sortKey) {
      setSortState({
        sortKey,
        // eslint-disable-next-line no-nested-ternary
        sortDir: sortDir === 'noSort' ? 'asc' : (sortDir === 'asc' ? 'desc' : 'asc')
      });
    } else {
      setSortState({
        sortKey,
        sortDir: 'asc'
      });
    }
  }

  return (
    <div className="ProfileFilter profile-filter-tab block">
      <InlineNotification type="info" className="tw-mb-2" showIf={!filterConfiguration.haveProfiles()}>
        {t('advices.no-character')}
      </InlineNotification>
      <InlineNotification type="info" className="tw-mb-2" showIf={!filterConfiguration.haveProfiles()}>
        {t('advices.no-player')}
      </InlineNotification>
      <InlineNotification type="info" className="tw-mb-2" showIf={!filterConfiguration.haveProfileStructures()}>
        {t('advices.empty-character-profile-structure')}
      </InlineNotification>
      <InlineNotification type="info" className="tw-mb-2" showIf={!filterConfiguration.haveProfileStructures()}>
        {t('advices.empty-player-profile-structure')}
      </InlineNotification>
      <div className="panel panel-default">
        <table className="table table-striped table-bordered">
          <thead className="filter-head">
            <tr>
              {
                headerData.map((elem, i) => (
                  <th className={classNames('sorting', {
                    'text-align-right': elem.type === 'number',
                    'text-align-left': elem.type !== 'number',
                    sortDesc: sortState.sortKey === elem.name && sortState.sortDir !== 'desc',
                    sortAsc: sortState.sortKey === elem.name && sortState.sortDir !== 'asc',
                  })}
                  >
                    <button
                      type="button"
                      data-sort-key={elem.name}
                      data-sort-dir={sortState.sortKey === elem.name ? sortState.sortDir : 'noSort'}
                      onClick={onSortChange}
                    >
                      {elem.displayName}
                    </button>
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody className="filter-content">
            {
              dataArrays.map((dataArray) => (
                <tr>
                  {
                    dataArray.map((valueInfo, i) => {
                      let regex, pos, displayValue;
                      const { value } = valueInfo;
                      if (value === undefined) {
                        displayValue = t('constant.notAvailable');
                      } else if (valueInfo.type === 'checkbox') {
                        displayValue = t(`constant.${Constants[value]}`);
                      } else if (valueInfo.type === 'text') {
                        pos = 0;
                        // pos = value.toLowerCase().indexOf(inputItems[valueInfo.itemName].value.toLowerCase());
                        displayValue = value.substring(pos - 5, pos + 15);
                      } else if (R.contains(valueInfo.type, ['number', 'enum', 'multiEnum', 'string'])) {
                        displayValue = value;
                      } else {
                        throw new Error(`Unexpected valueInfo.type: ${valueInfo.type}`);
                      }
                      return (
                        <td className={classNames({
                          lightGrey: value === undefined,
                          'text-align-right': valueInfo.type === 'number',
                          'text-align-left': valueInfo.type !== 'number'
                        })}
                        >
                          {displayValue}
                        </td>
                      );
                    })
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

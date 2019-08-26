import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ProfileFilter.css';

import FilterConfiguration from '../../../utils/filterConfiguration';
import CharacterFilter from '../../util/CharacterFilter';

export default class ProfileFilter extends Component {
  state = {
    filterModel: []
  };

  componentDidMount = () => {
    console.log('ProfileFilter mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('ProfileFilter did update');
  }

  componentWillUnmount = () => {
    console.log('ProfileFilter will unmount');
  }

  getStateInfo = () => {
    const { dbms, id, t } = this.props;
    Promise.all([
      FilterConfiguration.makeFilterConfiguration(dbms, t),
    ]).then((results) => {
      const [filterConfiguration] = results;
      this.setState({
        filterConfiguration
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getHeaderProfileItemNames(profileSettings) {
    return R.map(R.pick(['name', 'displayName', 'type']), profileSettings);
  }

  getAlign = elem => (elem.type === 'number' ? 'text-align-right' : 'text-align-left');

  getColorClass = value => (value === undefined ? 'lightGrey' : '');

  makePrintData() {
    const { filterConfiguration, filterModel } = this.state;
    const dataArrays = filterConfiguration.getDataArrays(filterModel);

    const sortKey = Constants.CHAR_NAME;
    const sortDir = 'asc';

    const sortFunc = CU.charOrdAFactoryBase(sortDir, (a, b) => a > b, (a) => {
      const map = R.indexBy(R.prop('itemName'), a);
      const item = map[sortKey];
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
    return dataArrays.sort(sortFunc);
  }

  render() {
    const { filterConfiguration, filterModel } = this.state;
    const { t } = this.props;

    if (!filterConfiguration) {
      // return <div> ProfileFilter stub </div>;
      return null;
    }

    const optionGroups = filterConfiguration.getGroupsForSelect();

    const itemSelectorSize = R.sum(optionGroups.map(group => group.array.length + 1));

    const profileItemNames = this.getHeaderProfileItemNames(filterConfiguration.getProfileFilterItems());

    const dataArrays = this.makePrintData();
    // U.addEl(U.clearEl(U.queryEl(`${root}.filter-result-size`)), U.makeText(dataArrays.length));
    // U.addEls(U.clearEl(U.queryEl(`${root}.filter-content`)), dataArrays.map(makeDataString));

    return (
      <div className="profile-filter block">
        <div className="panel panel-default">
          <div className="panel-body first-panel">
            <div className="flex-row entity-toolbar">
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon create group flex-0-0-auto icon-padding"
                title={t('groups.create-entity')}
              >
                <span>{t('groups.group')}</span>
              </button>
              <select className="common-select save-entity-select form-control" />
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon rename group flex-0-0-auto isGroupEditable"
                title={t('groups.rename-entity')}
              />
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon remove group flex-0-0-auto isGroupEditable"
                title={t('groups.remove-entity')}
              />
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon group-to-filter flex-0-0-auto show-entity-button"
                title={t('groups.show-group-filter')}
              />
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon filter-to-group flex-0-0-auto save-entity-button isGroupEditable"
                title={t('groups.save-group-filter')}
              />
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon download-table download-filter-table"
                title={t('profile-filter.download-filter-table')}
              />
            </div>
          </div>
        </div>

        <div className="flex-row">
          <div className="flex-0-0-auto settings-panel">

            <div id="exTab3" className="panel panel-default">
              <div className="panel-body">

                <ul className="nav nav-pills margin-bottom-16">
                  <li className="btn-default active">
                    <a href="#profile-filter-rows" data-toggle="tab">{t('profile-filter.rows')}</a>
                  </li>
                  <li className="btn-default"><a href="#profile-filter-columns" data-toggle="tab">{t('profile-filter.columns')}</a></li>
                  <li className="filter-result-size" title={t('profile-filter.results')}>{dataArrays.length}</li>
                </ul>

                <div className="tab-content clearfix">
                  <div className="tab-pane active" id="profile-filter-rows">
                    <div className="panel-resizable">
                      <div className="filter-settings-panel" />
                      <CharacterFilter model={filterModel} filterConfiguration={filterConfiguration} />
                    </div>
                  </div>
                  <div className="tab-pane" id="profile-filter-columns">
                    <select multiple className="profile-item-selector form-control" size={itemSelectorSize}>
                      {
                        optionGroups.map(group => (
                          <optgroup label={group.displayName}>
                            {
                              group.array.map(option => <option value={option.name} selected="true">{option.displayName}</option>)
                            }
                          </optgroup>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-0-0-auto profile-filter-container">
            <div className="alert alert-info no-characters margin-bottom-8">{t('advices.no-character')}</div>
            <div className="alert alert-info no-players margin-bottom-8">{t('advices.no-player')}</div>
            <div className="alert alert-info no-character-profile margin-bottom-8">{t('advices.empty-character-profile-structure')}</div>
            <div className="alert alert-info no-player-profile margin-bottom-8">{t('advices.empty-player-profile-structure')}</div>
            <div className="panel panel-default">
              <table className="table table-striped table-bordered">
                <thead className="filter-head">
                  <tr>
                    {
                      profileItemNames.map((elem, i) => (
                        <th
                          dependent-index={i}
                          className={`dependent-${i} dependent sorting ${this.getAlign(elem)}`}
                        >
                          {elem.displayName}
                        </th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody className="filter-content">
                  {
                    dataArrays.map(dataArray => (
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
                              // pos = value.toLowerCase().indexOf(inputItems[valueInfo.itemName].value.toLowerCase());
                              // displayValue = value.substring(pos - 5, pos + 15);
                              displayValue = value.substring(pos, pos + 20);
                            } else if (R.contains(valueInfo.type, ['number', 'enum', 'multiEnum', 'string'])) {
                              displayValue = value;
                            } else {
                              throw new Error(`Unexpected valueInfo.type: ${valueInfo.type}`);
                            }
                            return (
                              <td
                                dependent-index={i}
                                className={`dependent-${i} dependent ${this.getAlign(valueInfo)} ${this.getColorClass(value)}`}
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
        </div>
      </div>
    );
  }
}

ProfileFilter.propTypes = {
  // bla: PropTypes.string,
};

ProfileFilter.defaultProps = {
  // bla: 'test',
};

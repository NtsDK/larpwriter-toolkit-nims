import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import dateFormat from 'dateformat';
import * as R from 'ramda';
import classNames from 'classnames';

import './LogViewerV2.css';

const filterNames = [
  'date',
  'user',
  'action',
  'params',
  'status',
];

const emptyFilters = {
  date: '',
  user: '',
  action: '',
  params: '',
  status: '',
};

export class LogViewerV2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: R.clone(emptyFilters),
      logData: [],
      currentPage: 0,
      max: 0,
      logSize: 0
    };
    this.onFilterChange = this.onFilterChange.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.dataRecieved = this.dataRecieved.bind(this);
    this.selectPage = this.selectPage.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('LogViewerV2 mounted');
  }

  componentDidUpdate() {
    console.log('LogViewerV2 did update');
  }

  componentWillUnmount() {
    console.log('LogViewerV2 will unmount');
  }

  clearFilter() {
    this.setState({
      filters: R.clone(emptyFilters)
    }, () => {
      const { currentPage } = this.state;
      this.getData(currentPage);
    });
  }

  refresh() {
    this.getData(0);
    this.setState({
      currentPage: 0
    });
  }

  getData(pageNumber) {
    const { filters } = this.state;
    DBMS.getLog({ pageNumber, filter: filters }).then(this.dataRecieved).catch(UI.handleError);
  }

  onFilterChange(e) {
    const { filterName } = e.target.dataset;
    const { value } = e.target;
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        [filterName]: value
      }
    }));
    clearTimeout(this.inputChangeTimeout);

    this.inputChangeTimeout = setTimeout(() => {
      const { currentPage } = this.state;
      this.getData(currentPage);
    }, 500);
  }

  selectPage(e) {
    const { pageNumber } = e.target.dataset;
    this.getData(Number(pageNumber));
    this.setState({
      currentPage: Number(pageNumber)
    });
  }

  dataRecieved(data) {
    this.setState((prevState) => ({
      currentPage: prevState.currentPage > data.logSize ? 0 : prevState.currentPage,
      logData: data.requestedLog,
      max: data.max,
      logSize: data.logSize,
    }));
  }

  render() {
    const {
      filters, logData, max, logSize, currentPage
    } = this.state;
    const { t } = this.props;

    return (
      <div className="LogViewerV2 log-viewer-tab">
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="flex-row">
              <div className="flex-0-0-auto" style={{ margin: '8px 8px 8px 0' }}>
                <ul className="pagination margin-0">
                  {
                    R.range(0, logSize).map((num) => (
                      <li key={`id${num}`}>
                        <button
                          type="button"
                          className={classNames({
                            active: currentPage === num
                          })}
                          data-page-number={num}
                          onClick={this.selectPage}
                        >
                          {num + 1}
                        </button>
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div className="flex-0-0-auto" style={{ margin: '8px 0' }}>
                <label className="result-number form-control-static">
                  {t('log-viewer.total2', {
                    rowCount: max
                  })}
                </label>
              </div>
              <div className="flex-1-1-auto" />
              <div className="flex-0-0-auto" style={{ margin: '8px 0' }}>
                <button type="button" className="btn btn-primary clear-filter" onClick={this.clearFilter}>{t('log-viewer.clear-filter')}</button>
              </div>
            </div>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>№</th>
                  {
                    filterNames.map((filterName) => (
                      <th key={filterName}>{t(`log-viewer.${filterName}`)}</th>
                    ))
                  }
                </tr>
                <tr>
                  <th />
                  {
                    filterNames.map((filterName) => (
                      <th key={filterName}>
                        <input
                          className="form-control"
                          data-filter-name={filterName}
                          value={filters[filterName]}
                          onChange={this.onFilterChange}
                        />
                      </th>
                    ))
                  }
                </tr>
              </thead>
              <tbody className="log-data">

                {
                  logData.map((rowData) => (
                    <tr key={rowData[0]}>
                      <td><span>{rowData[0]}</span></td>
                      <td><span>{dateFormat(new Date(rowData[2]), 'yyyy/mm/dd HH:MM:ss')}</span></td>
                      <td><span>{rowData[1]}</span></td>
                      <td><span>{rowData[3]}</span></td>
                      <td>
                        {
                          JSON.parse(rowData[4]).map((item, index) => (
                            <div className="log-param" key={`id${index}`}>
                              {R.is(Object, item) ? JSON.stringify(item) : item}
                            </div>
                          ))
                        }
                      </td>
                      <td>
                        {
                          JSON.parse(rowData[5]).map((item, index) => (
                            <div className="log-param" key={`id${index}`}>
                              {R.is(Object, item) ? JSON.stringify(item) : item}
                            </div>
                          ))
                        }
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

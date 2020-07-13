import React from 'react';

export const GroupProfileTemplate = function() {
  return (
    <div className="GroupProfileTemplate group-profile-tab block fixed-tab">
      <div className="alert alert-info margin-bottom-8" l10n-id="advices-no-group"></div>
      <div className="container-fluid height-100p">
        <div className="row height-100p">
          <div className="col-xs-3 height-100p">
            <div className="panel panel-default entity-select height-100p">
              <div className="panel-body height-100p">
              
                <div className="flex-row entity-toolbar">
                  <button className="btn btn-default btn-reduced fa-icon create flex-0-0-auto"></button>
                  <input className="form-control entity-filter flex-1-1-auto" type="search" l10n-placeholder-id="groups-find-group"/>
                </div>
                <div className="entity-list">
                </div>
              </div>
            </div>
          </div>
          <div className="col-xs-9 height-100p" style={{overflow: "auto"}}>
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="form-horizontal insertion-point entity-profile">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getGroupProfileTemplate() {
  return <GroupProfileTemplate />;
}



export const GroupFilterRow = function() {
  return (
    <tr className="GroupFilterRow">
      <td className="profile-item"></td>
      <td className="condition"></td>
      <td className="value"></td>
    </tr>
  );
};

export function getGroupFilterRow() {
  return <GroupFilterRow />;
}

export const GroupFilter = function() {
  return (
    <table className="GroupFilter table table-striped">
      <thead>
        <tr>
          <th l10n-id="groups-profile-item"></th>
          <th l10n-id="groups-condition"></th>
          <th l10n-id="groups-value"></th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
  );
};

export function getGroupFilter() {
  return <GroupFilter />;
}
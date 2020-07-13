import React from 'react';

export const ProfileFilterTemplate = function() {
  return (
    <div className="ProfileFilterTemplate profile-filter-tab block">

      <div className="panel panel-default">
        <div className="panel-body first-panel">
          <div className="flex-row entity-toolbar">
            <button className="btn btn-default btn-reduced fa-icon create group flex-0-0-auto icon-padding" 
              l10n-title="groups-create-entity"><span l10n-id="groups-group"></span></button>
            <select className="common-select save-entity-select"></select>
            <button className="btn btn-default btn-reduced fa-icon rename group flex-0-0-auto isGroupEditable"
              l10n-title="groups-rename-entity"></button>
            <button className="btn btn-default btn-reduced fa-icon remove group flex-0-0-auto isGroupEditable"
              l10n-title="groups-remove-entity"></button>
            <button className="btn btn-default btn-reduced fa-icon group-to-filter flex-0-0-auto show-entity-button"
              l10n-title="groups-show-group-filter"></button>
            <button className="btn btn-default btn-reduced fa-icon filter-to-group flex-0-0-auto save-entity-button isGroupEditable"
              l10n-title="groups-save-group-filter"></button>
            <button className="btn btn-default btn-reduced fa-icon download-table download-filter-table" 
              l10n-title="profile-filter-download-filter-table"></button>
          </div>
        </div>
      </div>

      <div className="flex-row">
        <div className="flex-0-0-auto" style={{marginRight: "8px", minWidth: "300px"}}>
        
          <div id="exTab3" className="panel panel-default">
            <div className="panel-body">
            
              <ul className="nav nav-pills margin-bottom-16">
                <li className="btn-default active"><a href="#profile-filter-rows" data-toggle="tab" l10n-id="profile-filter-rows"></a>
                </li>
                <li className="btn-default"><a href="#profile-filter-columns" data-toggle="tab" l10n-id="profile-filter-columns"></a></li>
                <li className="filter-result-size" style={{padding: "10px 15px"}} l10n-title="profile-filter-results"></li>
              </ul>
            
              <div className="tab-content clearfix">
                <div className="tab-pane active" id="profile-filter-rows">
                  <div className="panel-resizable">
                    <div className="filter-settings-panel"></div>
                  </div>
                </div>
                <div className="tab-pane" id="profile-filter-columns">
                  <select multiple className="profile-item-selector form-control"></select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-0-0-auto profile-filter-container">
          <div className="alert alert-info no-characters margin-bottom-8" l10n-id="advices-no-character"></div>
          <div className="alert alert-info no-players margin-bottom-8" l10n-id="advices-no-player"></div>
          <div className="alert alert-info no-character-profile margin-bottom-8" l10n-id="advices-empty-character-profile-structure"></div>
          <div className="alert alert-info no-player-profile margin-bottom-8" l10n-id="advices-empty-player-profile-structure"></div>
          <div className="panel panel-default">
            <table  className="table table-striped table-bordered">
              <thead className="filter-head"></thead>
              <tbody className="filter-content"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getProfileFilterTemplate() {
  return <ProfileFilterTemplate />;
}

export const MultiEnumFilter = function() {
  return (
    <div className="MultiEnumFilter">
      <select className="form-control multi-enum-filter-type"></select>
      <select className="form-control multi-enum-filter-content" multiple></select>
    </div>
  );
};

export function getMultiEnumFilter() {
  return <MultiEnumFilter />;
}

export const CommonEnumFilter = function() {
  return (
    <select className="CommonEnumFilter form-control" multiple></select>
  );
};

export function getCommonEnumFilter() {
  return <CommonEnumFilter />;
}

export const NumberFilter = function() {
  return (
    <div className="NumberFilter">
      <select className="form-control"></select>
      <input className="form-control" type="number"/>
    </div>
  );
};

export function getNumberFilter() {
  return <NumberFilter />;
}

export const TextFilter = function() {
  return (
    <input className="TextFilter form-control"/>
  );
};

export function getTextFilter() {
  return <TextFilter />;
}

export const FilterItem = function() {
  return (
    <div className="FilterItem">
      <input type="checkbox" className="hidden"/>
      <label className="checkbox-label-icon common-checkbox"><span className="filter-item-name"></span></label>
      <div className="hidden filter-item-container">
      </div>
    </div>
  );
};

export function getFilterItem() {
  return <FilterItem />;
}
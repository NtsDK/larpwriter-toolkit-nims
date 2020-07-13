import React from 'react';

export const ProfileEditorTemplate = function() {
  return (
    <div className="ProfileEditorTemplate profile-editor2-tab-tmpl fixed-tab">
      <div className="container-fluid height-100p">
        <div className="row height-100p">
          <div className="col-xs-3 height-100p">
            <div className="panel panel-default  entity-select height-100p">
              <div className="panel-body height-100p">
                <div className="flex-row entity-toolbar">
                  <button className="btn btn-default btn-reduced fa-icon create flex-0-0-auto"></button>
                  <input className="form-control entity-filter flex-1-1-auto" type="search" />
                </div>
                <div className="entity-list">
                </div>
              </div>
            </div>
          </div>
          <div className="col-xs-9 content-column height-100p">
            <div className="alert-block alert alert-info"></div>
          
            <div className="panel panel-default report-by-stories">
              <div className="panel-heading">
                <a href="#">
                  <h3 className="panel-title" l10n-id="profiles-character-report-by-stories"></h3>
                </a>
              </div>
              <div className="panel-body report-by-stories-div">
                <div className="alert alert-info" l10n-id="advices-character-has-no-stories"></div>
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th l10n-id="profiles-story"></th>
                      <th l10n-id="profiles-activity" colSpan="4"></th>
                      <th l10n-id="profiles-completeness"></th>
                      <th l10n-id="profiles-meets"></th>
                      <th l10n-id="profiles-inventory"></th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
            
            <div className="panel panel-default report-by-relations">
              <div className="panel-heading">
                <a href="#">
                  <h3 className="panel-title" l10n-id="profiles-character-report-by-relations"></h3>
                </a>
              </div>
              <div className="panel-body report-by-relations-div">
                <div className="alert alert-info" l10n-id="advices-character-has-no-relations"></div>
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th l10n-id="profiles-character"></th>
                      <th l10n-id="profiles-direction" colSpan="3"></th>
                      <th l10n-id="profiles-completeness"></th>
                      <th l10n-id="profiles-origin"></th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
            
            <div className="panel panel-default profile-panel">
              <div className="panel-heading">
                <a href="#">
                  <h3 className="panel-title"></h3>
                </a>
              </div>
              <div className="panel-body profile-div">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getProfileEditorTemplate() {
  return <ProfileEditorTemplate />;
}

export const EntityItem = function() {
  return (
    <div className="EntityItem btn-group flex-row">
      <button className="btn btn-default btn-reduced fa-icon remove flex-0-0-auto transparent"></button>
      <button className="btn btn-default btn-reduced fa-icon rename flex-0-0-auto transparent"></button>
      <button type="button" className="select-button btn btn-default btn-reduced flex-1-1-auto text-align-left white-space-normal">
        <span className="primary-name"></span>
        <small><div className="secondary-name"></div></small>
      </button>
    </div>
  );
};

export function getEntityItem() {
  return <EntityItem />;
}
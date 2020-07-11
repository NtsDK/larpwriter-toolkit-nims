import React from 'react';

export const LogViewerTemplate = function() {
  return (
    <div className="log-viewer-tab">
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="flex-row">
            <div className="flex-0-0-auto" style={{margin: "8px 8px 8px 0"}}>
              <ul className="pagination margin-0"></ul>
            </div>
            <div className="flex-0-0-auto" style={{margin: "8px 0"}}>
              <label className="result-number form-control-static"></label>
            </div>
            <div className="flex-1-1-auto"></div>
            <div className="flex-0-0-auto" style={{margin: "8px 0"}}>
              <button className="btn btn-primary clear-filter" l10n-id="log-viewer-clear-filter"></button>
            </div>
          </div>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>№</th>
                <th l10n-id="log-viewer-date"></th>
                <th l10n-id="log-viewer-user"></th>
                <th l10n-id="log-viewer-action"></th>
                <th l10n-id="log-viewer-params"></th>
                <th l10n-id="log-viewer-status"></th>
              </tr>
              <tr>
                <th></th>
                <th><input className="form-control" filter="date"/></th>
                <th><input className="form-control" filter="user"/></th>
                <th><input className="form-control" filter="action"/></th>
                <th><input className="form-control" filter="params"/></th>
                <th><input className="form-control" filter="status"/></th>
              </tr>
            </thead>
            <tbody className="log-data"></tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export function getLogViewerTemplate() {
  return <LogViewerTemplate />;
}
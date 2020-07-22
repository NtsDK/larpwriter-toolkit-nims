import React from 'react';

export const LogViewerTemplate = function () {
  return (
    <div className="log-viewer-tab">
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="flex-row">
            <div className="flex-0-0-auto" style={{ margin: '8px 8px 8px 0' }}>
              <ul className="pagination margin-0" />
            </div>
            <div className="flex-0-0-auto" style={{ margin: '8px 0' }}>
              <label className="result-number form-control-static" />
            </div>
            <div className="flex-1-1-auto" />
            <div className="flex-0-0-auto" style={{ margin: '8px 0' }}>
              <button className="btn btn-primary clear-filter" l10n-id="log-viewer-clear-filter" />
            </div>
          </div>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>№</th>
                <th l10n-id="log-viewer-date" />
                <th l10n-id="log-viewer-user" />
                <th l10n-id="log-viewer-action" />
                <th l10n-id="log-viewer-params" />
                <th l10n-id="log-viewer-status" />
              </tr>
              <tr>
                <th />
                <th><input className="form-control" filter="date" /></th>
                <th><input className="form-control" filter="user" /></th>
                <th><input className="form-control" filter="action" /></th>
                <th><input className="form-control" filter="params" /></th>
                <th><input className="form-control" filter="status" /></th>
              </tr>
            </thead>
            <tbody className="log-data" />
          </table>
        </div>
      </div>
    </div>
  );
};

export function getLogViewerTemplate() {
  return <LogViewerTemplate />;
}

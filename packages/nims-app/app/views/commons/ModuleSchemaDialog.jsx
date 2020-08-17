import React from 'react';

export const ModuleSchemaDialog = function () {
  return (
    <div className="modal fade consistency-check-result-dialog" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document" style={{ width: '100%' }}>
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" />
          </div>
          <div className="modal-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="image-place flex-0-0-auto">
              <svg className="svg-hierarchy-schema" id="svg-canvas" width="960" height="450" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal" l10n-id="common-cancel" />
          </div>
        </div>
      </div>
    </div>
  );
};

export function getModuleSchemaDialog() {
  return <ModuleSchemaDialog />;
}

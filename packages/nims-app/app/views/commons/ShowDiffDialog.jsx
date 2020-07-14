import React from 'react';

export const ShowDiffDialog = function() {
  return (
    <div className="modal fade show-diff-dialog" tabindex="-1" role="dialog">
      <div className="modal-dialog" role="document" style={{width:"100%"}}>
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title"></h4>
          </div>
          <div className="modal-body">
            <div className="container-fluid">
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal" l10n-id="common-cancel"></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getShowDiffDialog() {
  return <ShowDiffDialog />;
}
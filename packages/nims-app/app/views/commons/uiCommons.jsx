import React from 'react';

export const RequestDataDialogTemplate = function() {
  return (
    <div className="RequestDataDialogTemplate modal fade" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close on-close-button" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title"></h4>
          </div>
          <div className="modal-body">
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default on-cancel-button" l10n-id="common-cancel"></button>
            <button type="button" className="btn btn-primary on-action-button"></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getRequestDataDialogTemplate() {
  return <RequestDataDialogTemplate />;
}

export const ModalErrorBlock = function() {
  return (
    <div className="ModalErrorBlock form-group has-error">
      <span className="help-block error-msg"></span>
    </div>
  );
};

export function getModalErrorBlock() {
  return <ModalErrorBlock />;
}
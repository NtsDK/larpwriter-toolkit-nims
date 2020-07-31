import React from 'react';

export const AlertBlock = function () {
  return (
    <div className="AlertBlock alert alert-info" />
  );
};

export function getAlertBlock() {
  return <AlertBlock />;
}

export const ModalPromptBody = function () {
  return (
    <div className="ModalPromptBody form-group">
      <input className="entity-input form-control focusable onenterable" />
    </div>
  );
};

export function getModalPromptBody() {
  return <ModalPromptBody />;
}

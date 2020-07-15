import React from 'react';

export const AlertBlock = function() {
  return (
    <div class="AlertBlock alert alert-info"></div>
  );
};

export function getAlertBlock() {
  return <AlertBlock />;
}

export const ModalPromptBody = function() {
  return (
    <div class="ModalPromptBody form-group">
      <input class="entity-input form-control focusable onenterable"></input>
    </div>
  );
};

export function getModalPromptBody() {
  return <ModalPromptBody />;
}


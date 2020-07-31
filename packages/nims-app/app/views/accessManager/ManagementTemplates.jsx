import React from 'react';

export const CreateOrganizerBody = function () {
  return (
    <div className="CreateOrganizerBody">
      <div className="form-group">
        <label className="control-label" l10n-id="admins-login" />
        <input className="form-control create-user-name-input focusable" />
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="admins-user-password" />
        <input className="form-control create-user-password-input" />
      </div>
    </div>
  );
};

export function getCreateOrganizerBody() {
  return <CreateOrganizerBody />;
}
export const CreatePlayerAccountBody = function () {
  return (
    <div className="CreatePlayerAccountBody">
      <div className="form-group">
        <label className="control-label" l10n-id="admins-player" />
        <select className="adminOnly create-login-name-select form-control" style={{ width: '100%' }} />
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="admins-user-password" />
        <input className="adminOnly form-control create-login-password-input" />
      </div>
    </div>
  );
};

export function getCreatePlayerAccountBody() {
  return <CreatePlayerAccountBody />;
}

import React from 'react';

export const CreateOrganizerBody = function() {
  return (
    <div className="CreateOrganizerBody">
      <div className="form-group">
        <label className="control-label" l10n-id="admins-login"></label>
        <input className="form-control create-user-name-input focusable"></input>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="admins-user-password"></label>
        <input className="form-control create-user-password-input"></input>
      </div>
    </div>
  );
};

export function getCreateOrganizerBody() {
  return <CreateOrganizerBody />;
}
export const CreatePlayerAccountBody = function() {
  return (
    <div className="CreatePlayerAccountBody">
      <div className="form-group">
        <label className="control-label" l10n-id="admins-player"></label>
        <select className="adminOnly create-login-name-select form-control" style={{width:"100%"}}></select>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="admins-user-password"></label>
        <input className="adminOnly form-control create-login-password-input"></input>
      </div>
    </div>
  );
};

export function getCreatePlayerAccountBody() {
  return <CreatePlayerAccountBody />;
}

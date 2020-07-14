import React from 'react';

export const SignUpTemplate = function() {
  return (
    <div className="sign-up-tab flex-row block" style={{justifyContent: "center", height: "80vh", alignItems: "center"}}>
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title" l10n-id="entrance-enter-user-name-and-password"></h3>
        </div>
        <div className="panel-body group-control-area">

          <form className="sign-up-form entity-management" name="sign-up-form">
            <div className="input-group">
              <input name="username" type="text" id="input-username" className="form-control" l10n-placeholder-id="entrance-login" type="text"/>
              <input name="password" type="password" id="input-password" className="form-control" l10n-placeholder-id="entrance-password"/>
              <input name="confirmPassword" type="password" id="confirm-password" className="form-control" l10n-placeholder-id="entrance-confirm-password"/>
              <span className="help-block error" style={{flexGrow: 1}}></span>
              <button type="submit" className="form-control" l10n-id="entrance-sign-up"></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export function getSignUpTemplate() {
  return <SignUpTemplate />;
}
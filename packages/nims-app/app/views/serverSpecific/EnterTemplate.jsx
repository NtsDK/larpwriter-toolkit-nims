import React from 'react';

export const EnterTemplate = function() {
  return (
    <div className="enter-tab flex-row block" style={{justifyContent: "center", height: "80vh", "alignItems": "center", "flexDirection": "column"}}>
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title" l10n-id="entrance-enter-user-name-and-password"></h3>
        </div>
        <div className="panel-body group-control-area">
          <form className="login-form entity-management" name="login-form">
            <div className="input-group">
                <input name="username" type="text" id="input-username" className="form-control" l10n-placeholder-id="entrance-login"/>
                <input name="password" type="password" id="input-password" className="form-control" l10n-placeholder-id="entrance-password"/>
                <span className="help-block error" style={{flexGrow: 1}}></span>
                <button type="submit" className="form-control" l10n-id="entrance-enter"></button>
            </div>
          </form>
        </div>
      </div>
      <div className="panel panel-default" style={{width: "450px"}}>
        <div className="panel-body group-control-area">
            <span l10n-id="entrance-disclaimer"></span>
            <a href="http://trechkalov.com/" l10n-id="entrance-developer-site"></a>
        </div>
      </div>
    </div>
  );
};

export function getEnterTemplate() {
  return <EnterTemplate />;
}
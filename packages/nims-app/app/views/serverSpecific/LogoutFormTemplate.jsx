import React from 'react';

export const LogoutFormTemplate = function() {
  return (
    <div id="logoutForm">
      <form className="form-horizontal login-form" name="login-form" method="POST" action="/logout">
        <button type="submit" className="654btn 654btn-primary" data-loading-text="Sending...">Exit</button>
      </form> 
    </div>
  );
};

export function getLogoutFormTemplate() {
  return <LogoutFormTemplate />;
}
import React from 'react';

export const RoleGridTemplate = function() {
  return (
    <div className="role-grid-tab block">
      <div className="alert alert-info no-characters margin-bottom-8" l10n-id="advices-no-character"></div>
      <div className="alert alert-info no-character-profile margin-bottom-8" l10n-id="advices-empty-character-profile-structure"></div>
      <div className="container-fluid">
        <div className="row">
          <div className="panel panel-default col-xs-3">
            <div className="panel-heading">
              <p l10n-id="role-grid-advice1"></p>
              <p l10n-id="role-grid-advice2"></p>
              <div className="button-container flex-column"></div>
            </div>
          </div>
          
          <div className="group-content col-xs-9"></div>
        </div>
      </div>
    </div>
  );
};

export function getRoleGridTemplate() {
  return <RoleGridTemplate />;
}
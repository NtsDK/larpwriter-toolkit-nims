import React from 'react';

export const OrganizerManagementTemplate = function() {
  return (
    <div className="organizer-management-tab block">
      <div className="panel panel-default">
        <div className="panel-body first-panel">
          <div className="flex-row entity-toolbar">
            <button className="btn btn-default btn-reduced fa-icon create user flex-0-0-auto adminOnly" 
              l10n-title="admins-create-entity"></button>
            <select className="common-select change-password-user-select adminOnly"></select>
            <button className="btn btn-default btn-reduced fa-icon change-password user flex-0-0-auto adminOnly"
              l10n-title="admins-change-organizer-password"></button>
            <button className="btn btn-default btn-reduced fa-icon remove user flex-0-0-auto remove-user-button adminOnly"
              l10n-title="admins-remove-organizer"></button>
            <button className="btn btn-default btn-reduced fa-icon assign flex-0-0-auto icon-padding assign-admin-button adminOnly"
              l10n-title="admins-assign-admin"><span l10n-id="admins-admin"></span></button>
            <button className="btn btn-default btn-reduced fa-icon assign flex-0-0-auto icon-padding assign-editor-button adminOnly"
              l10n-title="admins-assign-editor"><span l10n-id="admins-editor"></span></button>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-body special-actions-area flex-row">
          <fieldset className="margin-right-16">
            <legend l10n-id="admins-current-admin"></legend>
            <div>
              <label className="current-admin-label"></label>
            </div>
          </fieldset>
          
          <fieldset className="margin-right-16">
            <legend l10n-id="admins-current-editor"></legend>
            <div>
              <label className="current-editor-label"></label>
              <button className="btn btn-default editorOrAdmin remove-editor-button fa-icon remove" l10n-title="admins-remove-editor"></button>
            </div>
          </fieldset>
          
          <fieldset className="margin-right-16">
            <legend l10n-id="admins-assign-adaptation-rights"></legend>
            <div>
              <input type="radio" name="adaptationRights" className="adaptationRights adminOnly hidden" value="ByStory"
                id="adaptationRightsByStory"
              />
              <label htmlFor="adaptationRightsByStory" className="radio-label-icon common-radio"><span l10n-id="admins-by-stories"></span></label>
            </div>
            <div>
              <input type="radio" name="adaptationRights" className="adaptationRights adminOnly hidden" value="ByCharacter"
                id="adaptationRightsByCharacter"
              />
              <label htmlFor="adaptationRightsByCharacter" className="radio-label-icon common-radio"><span l10n-id="admins-by-characters"></span></label>
            </div>
          </fieldset>
        </div>
      </div>


      <div className="panel panel-default rights-panel">
        <div className="panel-body ">
          <div className="container-fluid ">
            <div className="flex-row ">
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-characters"></h4>
                <input className="form-control entity-filter characters margin-bottom-8" type="search" l10n-placeholder-id="admins-character-search"/>
                <div className="entity-list characters">
                </div>
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-stories"></h4>
                <input className="form-control entity-filter stories margin-bottom-8" type="search" l10n-placeholder-id="admins-story-search"/>
                <div className="entity-list stories">
                </div>
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-groups"></h4>
                <input className="form-control entity-filter groups margin-bottom-8" type="search" l10n-placeholder-id="admins-group-search"/>
                <div className="entity-list groups">
                </div>
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-players"></h4>
                <input className="form-control entity-filter players margin-bottom-8" type="search" l10n-placeholder-id="admins-player-search"/>
                <div className="entity-list players">
                </div>
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-users"></h4>
                <div className="entity-list users">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="panel panel-default hidden">
        <div className="panel-heading">
          <h3 className="panel-title" l10n-id="admins-editing-rights"></h3>
        </div>
        <div className="panel-body " style={{display:"flex"}}>
          <div>
            <span l10n-id="admins-rights"></span>
            <div className="permission-table"></div>
          </div>
          <div>
            <table>
              <thead>
                <tr>
                  <th l10n-id="admins-characters"></th>
                  <th l10n-id="admins-stories"></th>
                  <th l10n-id="admins-groups"></th>
                  <th l10n-id="admins-players"></th>
                  <th l10n-id="admins-users"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__characters"/>
                    <select size="15" className="permission-selector__characters" multiple></select>
                  </td>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__stories"/>
                    <select size="15" className="permission-selector__stories" multiple></select>
                  </td>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__groups"/>
                    <select size="15" className="permission-selector__groups" multiple></select>
                  </td>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__groups"/>
                    <select size="15" className="permission-selector__players" multiple></select>
                  </td>
                  <td>
                    <select size="10" className="user-permission-select" style={{minWidth: "96px"}}></select>
                  </td>
                </tr>
              </tbody>
            </table>
            <button className="assign-permission-button" l10n-id="admins-assign-rights"></button>
            <button className="adminOnly remove-permission-button" l10n-id="admins-take-away-rights"></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getOrganizerManagementTemplate() {
  return <OrganizerManagementTemplate />;
}
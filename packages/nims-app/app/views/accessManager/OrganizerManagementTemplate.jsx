import React from 'react';

export const OrganizerManagementTemplate = function () {
  return (
    <div className="organizer-management-tab block">
      <div className="panel panel-default">
        <div className="panel-body first-panel">
          <div className="flex-row entity-toolbar">
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon create user flex-0-0-auto adminOnly"
              l10n-title="admins-create-entity"
            />
            <select className="common-select change-password-user-select adminOnly" />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon change-password user flex-0-0-auto adminOnly"
              l10n-title="admins-change-organizer-password"
            />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon remove user flex-0-0-auto remove-user-button adminOnly"
              l10n-title="admins-remove-organizer"
            />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon assign flex-0-0-auto icon-padding assign-admin-button adminOnly"
              l10n-title="admins-assign-admin"
            >
              <span l10n-id="admins-admin" />

            </button>
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon assign flex-0-0-auto icon-padding assign-editor-button adminOnly"
              l10n-title="admins-assign-editor"
            >
              <span l10n-id="admins-editor" />

            </button>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-body special-actions-area flex-row">
          <fieldset className="margin-right-16">
            <legend l10n-id="admins-current-admin" />
            <div>
              <label className="current-admin-label" />
            </div>
          </fieldset>

          <fieldset className="margin-right-16">
            <legend l10n-id="admins-current-editor" />
            <div>
              <label className="current-editor-label" />
              <button type="button" className="btn btn-default editorOrAdmin remove-editor-button fa-icon remove" l10n-title="admins-remove-editor" />
            </div>
          </fieldset>

          <fieldset className="margin-right-16">
            <legend l10n-id="admins-assign-adaptation-rights" />
            <div>
              <input
                type="radio"
                name="adaptationRights"
                className="adaptationRights adminOnly hidden"
                value="ByStory"
                id="adaptationRightsByStory"
              />
              <label htmlFor="adaptationRightsByStory" className="radio-label-icon common-radio"><span l10n-id="admins-by-stories" /></label>
            </div>
            <div>
              <input
                type="radio"
                name="adaptationRights"
                className="adaptationRights adminOnly hidden"
                value="ByCharacter"
                id="adaptationRightsByCharacter"
              />
              <label htmlFor="adaptationRightsByCharacter" className="radio-label-icon common-radio"><span l10n-id="admins-by-characters" /></label>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="panel panel-default rights-panel">
        <div className="panel-body ">
          <div className="container-fluid ">
            <div className="flex-row ">
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-characters" />
                <input className="form-control entity-filter characters margin-bottom-8" type="search" l10n-placeholder-id="admins-character-search" />
                <div className="entity-list characters" />
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-stories" />
                <input className="form-control entity-filter stories margin-bottom-8" type="search" l10n-placeholder-id="admins-story-search" />
                <div className="entity-list stories" />
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-groups" />
                <input className="form-control entity-filter groups margin-bottom-8" type="search" l10n-placeholder-id="admins-group-search" />
                <div className="entity-list groups" />
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-players" />
                <input className="form-control entity-filter players margin-bottom-8" type="search" l10n-placeholder-id="admins-player-search" />
                <div className="entity-list players" />
              </div>
              <div className="flex-1-1-auto margin-rl-16">
                <h4 l10n-id="admins-users" />
                <div className="entity-list users" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel-default hidden">
        <div className="panel-heading">
          <h3 className="panel-title" l10n-id="admins-editing-rights" />
        </div>
        <div className="panel-body " style={{ display: 'flex' }}>
          <div>
            <span l10n-id="admins-rights" />
            <div className="permission-table" />
          </div>
          <div>
            <table>
              <thead>
                <tr>
                  <th l10n-id="admins-characters" />
                  <th l10n-id="admins-stories" />
                  <th l10n-id="admins-groups" />
                  <th l10n-id="admins-players" />
                  <th l10n-id="admins-users" />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__characters" />
                    <select size="15" className="permission-selector__characters" multiple />
                  </td>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__stories" />
                    <select size="15" className="permission-selector__stories" multiple />
                  </td>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__groups" />
                    <select size="15" className="permission-selector__groups" multiple />
                  </td>
                  <td>
                    <input selector-filter=".organizer-management-tab .permission-selector__groups" />
                    <select size="15" className="permission-selector__players" multiple />
                  </td>
                  <td>
                    <select size="10" className="user-permission-select" style={{ minWidth: '96px' }} />
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="button" className="assign-permission-button" l10n-id="admins-assign-rights" />
            <button type="button" className="adminOnly remove-permission-button" l10n-id="admins-take-away-rights" />
          </div>
        </div>
      </div>
    </div>
  );
};

export function getOrganizerManagementTemplate() {
  return <OrganizerManagementTemplate />;
}

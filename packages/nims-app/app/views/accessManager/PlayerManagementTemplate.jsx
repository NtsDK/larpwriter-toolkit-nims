import React from 'react';

export const PlayerManagementTemplate = function () {
  return (
    <div className="player-management-tab block">

      <div className="panel panel-default">
        <div className="panel-body first-panel">
          <div className="flex-row entity-toolbar">
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon create player flex-0-0-auto icon-padding"
              l10n-title="admins-create-player"
            >
              <span l10n-id="admins-player" />

            </button>
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon create player-account flex-0-0-auto icon-padding adminOnly"
              l10n-title="admins-create-player-account"
            >
              <span l10n-id="admins-player-account" />

            </button>
            <select className="common-select change-password-user-select" />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon change-password user flex-0-0-auto"
              l10n-title="admins-change-player-password"
            />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon remove user flex-0-0-auto remove-user-button adminOnly"
              l10n-title="admins-remove-player-account"
            />
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-body">
          <div className="entity-management">
            <div>
              <input type="checkbox" className="playerOptions hidden adminOnly" value="allowPlayerCreation" id="allowPlayerCreation" />
              <label htmlFor="allowPlayerCreation" className="checkbox-label-icon common-checkbox"><span l10n-id="admins-allow-player-creation" /></label>
            </div>
            <div>
              <input type="checkbox" className="playerOptions hidden adminOnly" value="allowCharacterCreation" id="allowCharacterCreation" />
              <label htmlFor="allowCharacterCreation" className="checkbox-label-icon common-checkbox"><span l10n-id="admins-allow-character-creation" /></label>
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title" l10n-id="admins-welcome-text" />
        </div>
        <div className="panel-body">
          <textarea className="welcome-text-area form-control adminOnly" />
        </div>
      </div>

    </div>
  );
};

export function getPlayerManagementTemplate() {
  return <PlayerManagementTemplate />;
}

import React from 'react';

export const ProfileBindingTemplate = function () {
  return (
    <div className="profile-binding2-tab block fixed-tab">
      <div className="panel panel-default height-100p">
        <div className="panel-body height-100p">
          <label l10n-id="binding-binding-tip" />
          <div className="container-fluid height-100p">
            <div className="row height-100p">
              <div className="col-xs-4 height-100p">
                <h4 l10n-id="binding-characters" />
                <input className="form-control character-filter" type="search" l10n-placeholder-id="binding-character-search" />
                <div className="alert no-character alert-info" l10n-id="advices-no-character" />
                <div className="entity-list character-list" />
              </div>
              <div className="col-xs-4 height-100p">
                <h4 l10n-id="binding-players" />
                <input className="form-control player-filter" type="search" l10n-placeholder-id="binding-player-search" />
                <div className="alert no-player alert-info" l10n-id="advices-no-player" />
                <div className="entity-list player-list" />
              </div>
              <div className="col-xs-4 height-100p">
                <h4 l10n-id="binding-bonded-characters-n-players" />
                <input className="form-control binding-filter" type="search" l10n-placeholder-id="binding-binding-search" />
                <div className="entity-list binding-list" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getProfileBindingTemplate() {
  return <ProfileBindingTemplate />;
}

export const ProfileItem = function () {
  return (
    <div className="ProfileItem btn-group flex-row">
      <a draggable="true" role="button" href="#" className="select-button btn btn-default btn-reduced flex-1-1-auto text-align-left white-space-normal">
        <span className="primary-name" />
      </a>
    </div>
  );
};

export function getProfileItem() {
  return <ProfileItem />;
}

export const BindingItem = function () {
  return (
    <div className="BindingItem btn-group flex-row">
      <button type="button" className="select-button btn btn-default btn-reduced flex-1-1-auto text-align-left white-space-normal">
        <span className="primary-name" />
      </button>
      <button type="button" className="btn btn-default btn-reduced fa-icon unlink flex-0-0-auto transparent" />
    </div>
  );
};

export function getBindingItem() {
  return <BindingItem />;
}

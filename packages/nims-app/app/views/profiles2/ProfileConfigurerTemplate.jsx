import React from 'react';

export const ProfileConfigurerTemplate = function() {
  return (
    <div className="ProfileConfigurerTemplate profile-configurer2-tab-tmpl block fixed-tab">
      <div className="panel panel-default max-height-100p overflow-auto">
        <div className="panel-heading">
          <a href="#">
            <h3 className="panel-title" l10n-id="profiles-characters-profile-structure"></h3>
          </a>
        </div>
        <div className="panel-body profile-panel">
          <div className="entity-management">
            <div>
              <button className="btn btn-default btn-reduced fa-icon create adminOnly" l10n-title="profiles-create-profile-item"></button>
            </div>
          </div>
          <div className="alert alert-info"></div>
          <table className="table table-bordered" style={{"width": "auto"}}>
            <thead>
              <tr>
                <th>№</th>
                <th l10n-id="profiles-table-profile-item-name"></th>
                <th l10n-id="profiles-profile-item-type"></th>
                <th l10n-id="profiles-profile-item-default-value"></th>
                <th l10n-id="profiles-profile-item-player-access"></th>
                <th l10n-id="profiles-show-in-role-grid" className="hidden"></th>
              </tr>
            </thead>
            <tbody className="profile-config-container"></tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export function getProfileConfigurerTemplate() {
  return <ProfileConfigurerTemplate />;
}

export const ProfileConfigurerRow = function() {
  return (
    <tr className="ProfileConfigurerRow">
      <td><span className="item-position adminOnly"></span></td>
      <td><span className="item-name adminOnly"></span></td>
      <td><select className="item-type adminOnly form-control"></select></td>
      <td className="item-default-value-container"></td>
      <td><select className="player-access adminOnly form-control"></select></td>
      <td>
        <button className="btn btn-default btn-reduced fa-icon print flex-0-0-auto adminOnly" l10n-title="profiles-profile-item-do-export"></button>
      </td>
      <td className="hidden"><input type="checkbox" className="show-in-role-grid adminOnly form-control"/></td>
      <td>
        <button className="btn btn-default btn-reduced fa-icon move flex-0-0-auto adminOnly" l10n-title="profiles-move-profile-item"></button>
        <button className="btn btn-default btn-reduced fa-icon rename rename-profile-item flex-0-0-auto adminOnly" l10n-title="profiles-rename-profile-item"></button>
        <button className="btn btn-default btn-reduced fa-icon remove flex-0-0-auto adminOnly" l10n-title="profiles-remove-profile-item"></button>
      </td>
    </tr>
  );
};

export function getProfileConfigurerRow() {
  return <ProfileConfigurerRow />;
}


export const EnumValueEditor = function() {
  return (
    <div className="EnumValueEditor flex-row">
      <div className="margin-right-8 flex-1-1-auto">
        <span className="text"></span>
      </div>
      <div className="flex-0-0-auto">
        <button className="btn btn-default btn-reduced fa-icon add flex-0-0-auto adminOnly" l10n-title="profiles-add-remove-values"></button>
        <button className="btn btn-default btn-reduced fa-icon rename flex-0-0-auto adminOnly" l10n-title="profiles-rename-enum-item"></button>
      </div>
    </div>
  );
};

export function getEnumValueEditor() {
  return <EnumValueEditor />;
}



export const EnumDialogEditor = function() {
  return (
    <div className="EnumDialogEditor">
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-current-enum-value"></label>
        <div className="initial-value"></div>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-new-enum-value"></label>
        <span className="control-label display-block" l10n-id="profiles-enum-filling-instruction"></span>
        <textarea className="form-control enum-value-input focusable"></textarea> 
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-new-enum-values"></label>
        <div className="new-enum-values"></div>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-removed-enum-values"></label>
        <div className="removed-enum-values"></div>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-default-value"></label>
        <select className="form-control default-value-select"></select> 
      </div>
    </div>
  );
};

export function getEnumDialogEditor() {
  return <EnumDialogEditor />;
}

export const MultiEnumDialogEditor = function() {
  return (
    <div className="MultiEnumDialogEditor">
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-current-enum-value"></label>
        <div className="initial-value"></div>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-new-enum-value"></label>
        <span className="control-label display-block" l10n-id="profiles-enum-filling-instruction"></span>
        <textarea className="form-control enum-value-input focusable"></textarea> 
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-new-enum-values"></label>
        <div className="new-enum-values"></div>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-removed-enum-values"></label>
        <div className="removed-enum-values"></div>
      </div>
    </div>
  );
};

export function getMultiEnumDialogEditor() {
  return <MultiEnumDialogEditor />;
}

export const RenameEnumValue = function() {
  return (
    <div className="RenameEnumValue">
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-renamed-value"></label>
        <select className="renamed-value-select form-control focusable"></select>
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-new-enum-value-name"></label>
        <input className="enum-value-name-input form-control"></input>
      </div>
    </div>
  );
};

export function getRenameEnumValue() {
  return <RenameEnumValue />;
}

export const CreateProfileItemBody = function() {
  return (
    <div className="CreateProfileItemBody">
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-profile-item-name"></label>
        <input className="form-control create-entity-name-input focusable" ></input> 
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-profile-item-position"></label>
        <select className="adminOnly form-control create-entity-position-select">
        </select> 
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="profiles-profile-item-type"></label>
        <select className="adminOnly form-control create-entity-type-select"></select> 
      </div>
    </div>
  );
};

export function getCreateProfileItemBody() {
  return <CreateProfileItemBody />;
}

export const MoveProfileItemBody = function() {
  return (
    <div className="MoveProfileItemBody form-group">
      <select className="adminOnly form-control move-entity-position-select"></select> 
    </div>
  );
};

export function getMoveProfileItemBody() {
  return <MoveProfileItemBody />;
}
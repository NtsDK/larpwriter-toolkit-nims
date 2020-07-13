import React from 'react';

export const ProfileEditorContainer = function() {
  return (
    <div className="ProfileEditorContainer form-horizontal insertion-point"></div>
  );
};

export function getProfileEditorContainer() {
  return <ProfileEditorContainer />;
}

export const ProfileEditorRow = function() {
  return (
    <div className="ProfileEditorRow form-group">
      <label className="col-xs-3 control-label profile-item-name"></label>
      <div className="col-xs-9 profile-item-input form-control-static">
      </div>
    </div>
  );
};

export function getProfileEditorRow() {
  return <ProfileEditorRow />;
}


import React from 'react';

export const BackupBaseTemplate = function() {
  return (
    <div className="BackupBaseTemplate margin-bottom-16">
      <input type="radio" name="dbSource"  className="hidden"/>
      <label  className="radio-label-icon common-radio"><span l10n-id="dialogs-browser-database"></span><span className="base-name"></span></label>
    </div>
  );
};

export function getBackupBaseTemplate() {
  return <BackupBaseTemplate />;
}
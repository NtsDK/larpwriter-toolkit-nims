import React from 'react';

export const SetDatabaseDialog = function() {
  return (
    <div className="modal fade set-database-dialog" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title" l10n-id="dialogs-select-database"></h4>
          </div>
          <div className="modal-body">
            <div className="alert alert-info margin-bottom-16" l10n-id2="advices-no-player-profile-items-for-diagram">
              <p l10n-id="dialogs-warn1"> </p>
              <p> 
                <span l10n-id="dialogs-warn2"></span>
                <span className="icon-button dataSaveButton"></span>
                <span l10n-id="dialogs-warn3"></span> 
              </p> 
              <p l10n-id="dialogs-warn4"></p>
            </div>
            <div className="margin-bottom-16 text-align-center">
              <button className="btn btn-primary upload-db" data-original-title="" title="">
                <span l10n-id="dialogs-upload-database"></span>
                <input type="file" className="hidden" tabIndex="-1"/>
              </button>
            </div>
            <div className="margin-bottom-16 text-align-center">
              <label l10n-id="dialogs-or"></label>
            </div>
            <div>
              <div className="backup-bases">
              </div>
              <div className="margin-bottom-16">
                <input type="radio" name="dbSource" value="demoBase" id="dbSourceDemoBase" className="hidden"/>
                <label htmlFor="dbSourceDemoBase" className="radio-label-icon common-radio"><span l10n-id="dialogs-demo-database"></span>
                <span className="demo-base-name"></span></label>
              </div>
              <div className="margin-bottom-16">
                <input type="radio" name="dbSource" value="emptyBase" id="dbSourceEmptyBase" className="hidden"/>
                <label htmlFor="dbSourceEmptyBase" className="radio-label-icon common-radio"><span l10n-id="dialogs-empty-database"></span></label>
              </div>
              <div className="text-align-right">
                <button type="button" className="btn btn-primary on-action-button" l10n-id="common-load"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getSetDatabaseDialog() {
  return <SetDatabaseDialog />;
}
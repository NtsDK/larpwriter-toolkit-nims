import React from 'react';

export const EventPresenceTemplate = function () {
  return (
    <div id="eventPresenceDiv">
      <div className="panel panel-default">
        <div className="alert no-characters alert-info margin-bottom-8" l10n-id="advices-no-characters-in-story" />
        <div className="alert no-events alert-info margin-bottom-8" l10n-id="advices-no-events-in-story" />
        <div className="panel-body flex-row" style={{ overflowX: 'auto' }}>
          <div className="flex-0-0-auto margin-right-8">
            {/* <span l10n-id="stories-show-characters" className="margin-bottom-8 inline-block"></span> */}
            <select multiple id="eventPresenceSelector" className="form-control" />
          </div>
          <div className="flex-1-1-auto">
            <table cellSpacing="0" cellPadding="0" className="table table-bordered">
              <thead id="eventPresenceTableHead" />
              <tbody id="eventPresenceTable" />
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getEventPresenceTemplate() {
  return <EventPresenceTemplate />;
}

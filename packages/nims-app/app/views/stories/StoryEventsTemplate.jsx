import React from 'react';

export const StoryEventsTemplate = function () {
  return (
    <div className="story-events-tab">
      <div className="panel panel-default">
        <div className="alert alert-info" l10n-id="advices-no-events-in-story" />
        <table className="table table-bordered">
          <tbody id="eventBlock" />
        </table>
      </div>
    </div>
  );
};

export function getStoryEventsTemplate() {
  return <StoryEventsTemplate />;
}

export const MoveEventBody = function () {
  return (
    <div className="MoveEventBody form-group">
      <select className="isStoryEditable eventPositionSelector movePositionSelector form-control" />
    </div>
  );
};

export function getMoveEventBody() {
  return <MoveEventBody />;
}

export const CreateEventBody = function () {
  return (
    <div className="CreateEventBody">
      <div className="form-group">
        <label className="control-label" l10n-id="stories-event-name" />
        <input className="isStoryEditable form-control eventNameInput focusable" />
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="stories-event-position" />
        <select className="isStoryEditable eventPositionSelector positionSelector form-control" />
      </div>
    </div>
  );
};

export function getCreateEventBody() {
  return <CreateEventBody />;
}

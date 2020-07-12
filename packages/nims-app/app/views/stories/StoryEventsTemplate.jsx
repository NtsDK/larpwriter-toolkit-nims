import React from 'react';

export const StoryEventsTemplate = function() {
  return (
    <div className="story-events-tab">
      <div className="panel panel-default">
        <div className="alert alert-info" l10n-id="advices-no-events-in-story"></div>
        <table className="table table-bordered">
          <tbody id="eventBlock"></tbody>
        </table>
      </div>
    </div>
  );
};

export function getStoryEventsTemplate() {
  return <StoryEventsTemplate />;
}
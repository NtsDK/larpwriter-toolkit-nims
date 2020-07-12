import React from 'react';

export const TimelineEventTemplate = function({
  time,
  storyName,
  eventName,
  characters
}) {
  return (
    <div className="row">
      <div className="col-xs-2 white-space-normal time">{time}</div>
      <div className="col-xs-2 white-space-normal story-name">{storyName}</div>
      <div className="col-xs-3 white-space-normal event-name">{eventName}</div>
      <div className="col-xs-5 white-space-normal characters">{characters}</div>
    </div>
  );
};

export function getTimelineEventTemplate(props) {
  return <TimelineEventTemplate {...props} />;
}
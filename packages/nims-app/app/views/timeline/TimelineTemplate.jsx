import React from 'react';

export const TimelineTemplate = function () {
  return (
    <div className="timeline-tab block">
      <div className="flex-row">
        <div className="storySelectorContainer">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title" l10n-id="timeline-timeline" />
            </div>
            <div className="panel-body panel-resizable">
              <div>
                <input type="radio" name="timelineFilter" value="ByStory" id="timelineFilterByStory" className="hidden" />
                <label htmlFor="timelineFilterByStory" className="radio-label-icon common-radio"><span l10n-id="timeline-filter-by-stories" /></label>
              </div>
              <div>
                <input type="radio" name="timelineFilter" value="ByCharacter" id="timelineFilterByCharacter" className="hidden" />
                <label htmlFor="timelineFilterByCharacter" className="radio-label-icon common-radio"><span l10n-id="timeline-filter-by-characters" /></label>
              </div>

              <input selector-filter="#timelineStorySelector" />
              <select size="20" id="timelineStorySelector" multiple className="form-control" />
            </div>
          </div>
        </div>
        <div className="panel panel-default flex-1-1-auto">
          <div className="panel-body">
            <ul className="nav nav-pills margin-bottom-16">
              <li className="btn-default active">
                <a href="#timeline-list" data-toggle="tab" l10n-id="timeline-list" />
              </li>
              <li className="btn-default"><a href="#timeline-interactive" data-toggle="tab" l10n-id="timeline-interactive" /></li>
            </ul>
            <div className="tab-content clearfix">
              <div className="tab-pane active" id="timeline-list">
                <div className="container-fluid">
                  <div className="row margin-bottom-8">
                    <div className="col-xs-2 white-space-normal" style={{ fontWeight: 'bold' }} l10n-id="timeline-time" />
                    <div className="col-xs-2 white-space-normal" style={{ fontWeight: 'bold' }} l10n-id="timeline-story-name" />
                    <div className="col-xs-3 white-space-normal" style={{ fontWeight: 'bold' }} l10n-id="timeline-event-name" />
                    <div className="col-xs-5 white-space-normal" style={{ fontWeight: 'bold' }} l10n-id="timeline-characters" />
                  </div>
                </div>
                <div className="container-fluid timeline-list" />
              </div>
              <div className="tab-pane" id="timeline-interactive">
                <div className="visualObjectContainer full-screen-elem " id="timelineContainer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getTimelineTemplate() {
  return <TimelineTemplate />;
}

export const TimelineEventTemplate = function ({
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

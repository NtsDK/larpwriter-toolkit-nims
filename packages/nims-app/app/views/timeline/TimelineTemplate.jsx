import React from 'react';

export const TimelineTemplate = function() {
  return (
    <div className="timeline-tab block">
      <div className="flex-row">
        <div className="storySelectorContainer">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title" l10n-id="timeline-timeline"></h3>
            </div>
            <div className="panel-body panel-resizable">
              <div>
                <input type="radio" name="timelineFilter" value="ByStory" id="timelineFilterByStory" className="hidden"/>
                <label htmlFor="timelineFilterByStory" className="radio-label-icon common-radio"><span l10n-id="timeline-filter-by-stories"></span></label>
              </div>
              <div>
                <input type="radio" name="timelineFilter" value="ByCharacter" id="timelineFilterByCharacter" className="hidden"/>
                <label htmlFor="timelineFilterByCharacter" className="radio-label-icon common-radio"><span l10n-id="timeline-filter-by-characters"></span></label>
              </div>
            
              <input selector-filter="#timelineStorySelector"/>
              <select size="20" id="timelineStorySelector" multiple className="form-control"></select>
            </div>
          </div>
        </div>
        <div className="panel panel-default flex-1-1-auto">
          <div className="panel-body">
            <ul className="nav nav-pills margin-bottom-16">
              <li className="btn-default active"><a href="#timeline-list" data-toggle="tab" l10n-id="timeline-list"></a>
              </li>
              <li className="btn-default"><a href="#timeline-interactive" data-toggle="tab" l10n-id="timeline-interactive"></a></li>
            </ul>
            <div className="tab-content clearfix">
              <div className="tab-pane active" id="timeline-list">
                <div className="container-fluid">
                  <div className="row margin-bottom-8">
                    <div className="col-xs-2 white-space-normal" style={{fontWeight: "bold"}} l10n-id="timeline-time"></div>
                    <div className="col-xs-2 white-space-normal" style={{fontWeight: "bold"}} l10n-id="timeline-story-name"></div>
                    <div className="col-xs-3 white-space-normal" style={{fontWeight: "bold"}} l10n-id="timeline-event-name"></div>
                    <div className="col-xs-5 white-space-normal" style={{fontWeight: "bold"}} l10n-id="timeline-characters"></div>
                  </div>
                </div>
                <div className="container-fluid timeline-list"></div>
              </div>
              <div className="tab-pane" id="timeline-interactive">
                <div className="visualObjectContainer full-screen-elem " id="timelineContainer"></div>
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
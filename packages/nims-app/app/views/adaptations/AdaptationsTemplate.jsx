import React from 'react';

export const AdaptationsTemplate = function () {
  return (
    <div className="adaptations-tab block">
      <div className="alert alert-info margin-bottom-8" l10n-id="advices-no-story" />

      <div className="adaptations-content">
        <div className="panel panel-default">
          <div className="panel-body">
            <input type="checkbox" id="finishedStoryCheckbox" className="hidden" />
            <label htmlFor="finishedStoryCheckbox" className="checkbox-label-icon common-checkbox"><span l10n-id="adaptations-show-only-unfinished-stories" /></label>
          </div>
        </div>
        <div className="main-container">
          <div>
            <div id="personalStoriesCharacterContainer">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title" l10n-id="adaptations-story" />
                </div>
                <div className="panel-body panel-resizable form-group">
                  <input selector-filter="#events-storySelector" />
                  <select id="events-storySelector" className="form-control" />
                </div>
              </div>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title" l10n-id="adaptations-filter" />
                </div>
                <div className="panel-body">

                  <div>
                    <input type="radio" name="adaptationFilter" value="ByCharacter" id="adaptationFilterByCharacter" className="hidden" />
                    <label htmlFor="adaptationFilterByCharacter" className="radio-label-icon common-radio"><span l10n-id="adaptations-by-characters" /></label>
                  </div>
                  <div>
                    <input type="radio" name="adaptationFilter" value="ByEvent" id="adaptationFilterByEvent" className="hidden" />
                    <label htmlFor="adaptationFilterByEvent" className="radio-label-icon common-radio"><span l10n-id="adaptations-by-events" /></label>
                  </div>

                  <div id="events-characterSelectorDiv">
                    <h4 l10n-id="adaptations-characters" />
                    <select id="events-characterSelector" className="form-control" multiple />
                  </div>
                  <div id="events-eventSelectorDiv" className="hidden">
                    <h4 l10n-id="adaptations-events" />
                    <select id="events-eventSelector" className="form-control" multiple size={15} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="personalStories" style={{ flexGrow: 1 }} />
        </div>
      </div>
    </div>
  );
};

export function getAdaptationsTemplate() {
  return <AdaptationsTemplate />;
}

export const AdaptationRow = function () {
  return (
    <div className="AdaptationRow container-fluid eventRow-dependent">
      <div className="row eventMainPanelRow-left events-eventsContainer" />
    </div>
  );
};

export function getAdaptationRow() {
  return <AdaptationRow />;
}

export const Origin = function () {
  return (
    <div className="Origin col-xs-6">
      <div className="panel panel-primary">
        <div className="panel-heading flex-row">
          <h1 className="panel-title card-title flex-1-1-auto" />
          <input className="isStoryEditable time-input form-control flex-0-0-auto" />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon locked btn-primary flex-0-0-auto margin-left-8 isStoryEditable"
            l10n-title="briefings-unlock-event-source"
          />
        </div>
        <div className="panel-body">
          <textarea className="isStoryEditable eventPersonalStory form-control text-input" />
        </div>
      </div>
    </div>
  );
};

export function getOrigin() {
  return <Origin />;
}

export const Adaptation = function () {
  return (
    <div className="Adaptation col-xs-6">
      <div className="panel panel-default">
        <div className="panel-heading flex-row">
          <h1 className="panel-title card-title flex-1-1-auto" />
          <input className=" time-input form-control flex-0-0-auto" l10n-placeholder-id="adaptations-subjective-time" />
          <button type="button" className="btn btn-default btn-reduced fa-icon finished flex-0-0-auto margin-left-8" l10n-title="constant-adaptation-finished" />
        </div>
        <div className="panel-body">
          <textarea className="eventPersonalStory form-control text-input" l10n-placeholder-id="adaptations-adaptation-text" />
        </div>
      </div>
    </div>
  );
};

export function getAdaptation() {
  return <Adaptation />;
}

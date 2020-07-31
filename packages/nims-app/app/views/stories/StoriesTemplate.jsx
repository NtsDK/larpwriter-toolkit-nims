import React from 'react';

export const StoriesTemplate = function () {
  return (
    <div className="stories-tab block">
      <div className="panel panel-default">
        <div className="panel-body first-panel">
          <div className="flex-row entity-toolbar">
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon create story flex-0-0-auto icon-padding"
              l10n-title="stories-create-entity"
            >
              <span l10n-id="stories-story" />

            </button>
            <select id="storySelector" className="common-select" />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon rename story flex-0-0-auto isStoryEditable"
              l10n-title="stories-rename-entity"
            />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon remove story flex-0-0-auto isStoryEditable"
              l10n-title="stories-remove-entity"
            />
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon create event flex-0-0-auto icon-padding isStoryEditable"
              l10n-title="stories-create-event"
            >
              <span l10n-id="stories-event" />

            </button>
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon add character flex-0-0-auto icon-padding isStoryEditable"
              l10n-title="stories-add-character"
            >
              <span l10n-id="stories-character" />

            </button>
          </div>
        </div>
      </div>

      <div className="alert alert-info" l10n-id="advices-no-story" />

      <div className="stories-main-container">
        <div className="stories-navigation-container">
          <div className="left-side" />
          <div className="right-side" />
        </div>
        <div className="stories-content-container">
          <div className="left-side" />
          <div className="right-side" />
        </div>
      </div>
    </div>
  );
};

export function getStoriesTemplate() {
  return <StoriesTemplate />;
}

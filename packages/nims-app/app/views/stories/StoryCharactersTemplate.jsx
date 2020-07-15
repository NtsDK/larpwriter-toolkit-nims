import React from 'react';

export const StoryCharactersTemplate = function() {
  return (
    <div className="story-characters-tab">
      <div className="panel panel-default">
        <div className="alert alert-info" l10n-id="advices-no-characters-in-story"></div>
        <table className="table table-bordered character-inventory-area">
          <thead>
            <tr>
              <th l10n-id="stories-name"></th>
              <th l10n-id="stories-inventory"></th>
              <th l10n-id="constant-active"></th>
              <th l10n-id="constant-follower"></th>
              <th l10n-id="constant-defensive"></th>
              <th l10n-id="constant-passive"></th>
            </tr>
          </thead>
          <tbody className="storyCharactersTable"></tbody>
        </table>
      </div>
    </div>
  );
};

export function getStoryCharactersTemplate() {
  return <StoryCharactersTemplate />;
}

export const ModalSwitchEventBody = function() {
  return (
    <div className="ModalSwitchEventBody form-group">
      <select className="isStoryEditable storyCharactersToSelector form-control" style={{width: "100%"}}></select>
    </div>
  );
};

export function getModalSwitchEventBody() {
  return <ModalSwitchEventBody />;
}
export const ModalAddCharacterBody = function() {
  return (
    <div className="ModalAddCharacterBody form-group">
      <select className="isStoryEditable storyCharactersAddSelector form-control" style={{width: "100%"}}></select>
    </div>
  );
};

export function getModalAddCharacterBody() {
  return <ModalAddCharacterBody />;
}
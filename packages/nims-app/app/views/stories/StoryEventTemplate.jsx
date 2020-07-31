import React from 'react';

export const StoryEventTemplate = function () {
  return (
    <tr className="StoryEventTemplate">
      <td><span className="event-number" /></td>
      <td>
        <div className="story-events-div-main">
          <div className="story-events-div-left">
            <input className="isStoryEditable  form-control event-name-input " />
          </div>
          <div className="story-events-div-right">
            <input className="isStoryEditable  form-control event-time " />
          </div>
        </div>
        <textarea className="isStoryEditable  form-control event-text " />

      </td>
      <td>
        <div className="flex-column">
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon move event flex-0-0-auto isStoryEditable"
            l10n-title="stories-move-event"
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon clone event flex-0-0-auto isStoryEditable"
            l10n-title="stories-clone-event"
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon merge event flex-0-0-auto isStoryEditable"
            l10n-title="stories-merge-events"
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon remove event flex-0-0-auto isStoryEditable"
            l10n-title="stories-remove-event"
          />
        </div>
      </td>
    </tr>
  );
};

export function getStoryEventTemplate() {
  return <StoryEventTemplate />;
}

import React from 'react';

export const StoryEventTemplate = function() {
  return (
    <tr className="StoryEventTemplate">
      <td><span className="event-number"></span></td>
      <td><div className="story-events-div-main">
          <div className="story-events-div-left">
            <input className="isStoryEditable  form-control event-name-input "/>
          </div>
          <div className="story-events-div-right">
            <input className="isStoryEditable  form-control event-time "/>
          </div>
        </div>
        <textarea className="isStoryEditable  form-control event-text "></textarea></td>
      <td>
        <div className="flex-column">
          <button className="btn btn-default btn-reduced fa-icon move event flex-0-0-auto isStoryEditable"
              l10n-title="stories-move-event"></button>
          <button className="btn btn-default btn-reduced fa-icon clone event flex-0-0-auto isStoryEditable"
              l10n-title="stories-clone-event"></button>
          <button className="btn btn-default btn-reduced fa-icon merge event flex-0-0-auto isStoryEditable"
              l10n-title="stories-merge-events"></button>
          <button className="btn btn-default btn-reduced fa-icon remove event flex-0-0-auto isStoryEditable"
              l10n-title="stories-remove-event"></button>
        </div>
      </td>
    </tr>
  );
};

export function getStoryEventTemplate() {
  return <StoryEventTemplate />;
}
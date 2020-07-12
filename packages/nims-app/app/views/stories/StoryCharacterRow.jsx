import React from 'react';

export const StoryCharacterRow = function() {
  return (
    <tr className="StoryCharacterRow">
      <td className="character-name"></td>
      <td><input className="inventoryInput isStoryEditable form-control"/></td>
      <td className="vertical-aligned-td active"><input
        className="isStoryEditable hidden" type="checkbox"/><label
        className="checkbox-label activity-icon-active fa-icon"></label></td>
      <td className="vertical-aligned-td follower"><input
        className="isStoryEditable hidden" type="checkbox"/><label
        className="checkbox-label activity-icon-follower fa-icon"></label></td>
      <td className="vertical-aligned-td defensive"><input
        className="isStoryEditable hidden" type="checkbox"/><label
        className="checkbox-label activity-icon-defensive fa-icon"></label></td>
      <td className="vertical-aligned-td passive"><input
        className="isStoryEditable hidden" type="checkbox"/><label
        className="checkbox-label activity-icon-passive fa-icon"></label></td>
      <td>
        <button
          className="btn btn-default btn-reduced fa-icon replace character flex-0-0-auto isStoryEditable"
          l10n-title="stories-replace-character"></button>
        <button
          className="btn btn-default btn-reduced fa-icon remove character flex-0-0-auto isStoryEditable"
          l10n-title="stories-remove-character"></button>
      </td>
    </tr>
  );
};

export function getStoryCharacterRow() {
  return <StoryCharacterRow />;
}
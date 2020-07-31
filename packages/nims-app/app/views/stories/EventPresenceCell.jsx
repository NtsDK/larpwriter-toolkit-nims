import React from 'react';

export const EventPresenceCell = function () {
  return (
    <td className="EventPresenceCell vertical-aligned-td">
      <input className="isStoryEditable hidden" type="checkbox" />
      <label className="checkbox-label checkbox-label-icon">
        <span className="margin-left-8" />
      </label>
    </td>
  );
};

export function getEventPresenceCell() {
  return <EventPresenceCell />;
}

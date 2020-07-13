import React from 'react';

export const StoryReportRow = function() {
  return (
    <tr className="StoryReportRow story-report-row">
      <td className="story-name"></td>
      <td className="activity-active fa-icon activity-icon-active not-active-item-in-report" l10n-title="constant-active"></td>
      <td className="activity-follower fa-icon activity-icon-follower not-active-item-in-report" l10n-title="constant-follower"></td>
      <td className="activity-defensive fa-icon activity-icon-defensive not-active-item-in-report" l10n-title="constant-defensive"></td>
      <td className="activity-passive fa-icon activity-icon-passive not-active-item-in-report" l10n-title="constant-passive"></td>
      <td className="completeness text-right"></td>
      <td className="meets"></td>
      <td className="inventory"></td>
    </tr>
  );
};

export function getStoryReportRow() {
  return <StoryReportRow />;
}

export const RelationReportRow = function() {
  return (
    <tr className="RelationReportRow relation-report-row">
      <td className="character-name"></td>
      <td className="direction-starterToEnder fa-icon starterToEnder text-center not-active-item-in-report"></td>
      <td className="direction-allies fa-icon allies text-center not-active-item-in-report" l10n-title="constant-allies"></td>
      <td className="direction-enderToStarter fa-icon enderToStarter text-center not-active-item-in-report"></td>
      <td className="completeness"></td>
      <td className="origin"></td>
    </tr>
  );
};

export function getRelationReportRow() {
  return <RelationReportRow />;
}
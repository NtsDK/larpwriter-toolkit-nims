import React from 'react';

export const StoryReportRow = function () {
  return (
    <tr className="StoryReportRow story-report-row">
      <td className="story-name" />
      <td className="activity-active fa-icon activity-icon-active not-active-item-in-report" l10n-title="constant-active" />
      <td className="activity-follower fa-icon activity-icon-follower not-active-item-in-report" l10n-title="constant-follower" />
      <td className="activity-defensive fa-icon activity-icon-defensive not-active-item-in-report" l10n-title="constant-defensive" />
      <td className="activity-passive fa-icon activity-icon-passive not-active-item-in-report" l10n-title="constant-passive" />
      <td className="completeness text-right" />
      <td className="meets" />
      <td className="inventory" />
    </tr>
  );
};

export function getStoryReportRow() {
  return <StoryReportRow />;
}

export const RelationReportRow = function () {
  return (
    <tr className="RelationReportRow relation-report-row">
      <td className="character-name" />
      <td className="direction-starterToEnder fa-icon starterToEnder text-center not-active-item-in-report" />
      <td className="direction-allies fa-icon allies text-center not-active-item-in-report" l10n-title="constant-allies" />
      <td className="direction-enderToStarter fa-icon enderToStarter text-center not-active-item-in-report" />
      <td className="completeness" />
      <td className="origin" />
    </tr>
  );
};

export function getRelationReportRow() {
  return <RelationReportRow />;
}

import React from 'react';

export const BriefingPreviewTemplate = function() {
  return (
    <div id="briefingPreviewDiv" className="block">

      <div className="flex-row">
        <div className="flex-1-1-auto data-area">
          <div className="alert alert-info" l10n-id="advices-no-character"></div>
          <div className="panel panel-default">
            <div className="panel-heading">
              <select id="briefingCharacter" className="common-select"></select>
            </div>
            <div className="panel-body">
              <div className="flex-row">
                <div className="flex-0-0-auto" style={{padding: "0px 32px 0px 0px"}}>
                  <div>
                    <input type="radio" name="tabMode" value="adaptations" id="adaptationsModeRadio" className="hidden"/>
                    <label htmlFor="adaptationsModeRadio" className="radio-label-icon common-radio"><span l10n-id="briefings-adaptations-mode"></span></label>
                  </div>
                  <div>
                    <input type="radio" name="tabMode" value="proofreading" id="proofreadingModeRadio" className="hidden"/>
                    <label htmlFor="proofreadingModeRadio" className="radio-label-icon common-radio"><span l10n-id="briefings-proofreading-mode"></span></label>
                  </div>
                </div>
                <div className="flex-0-0-auto" style={{padding: "0px 32px 0px 0px"}}>
                  <div>
                    <input type="radio" name="eventsGroupBy" value="story" id="eventGroupingByStoryRadio" className="hidden"/>
                    <label htmlFor="eventGroupingByStoryRadio" className="radio-label-icon common-radio"><span l10n-id="briefings-group-by-story"></span></label>
                  </div>
                  <div>
                    <input type="radio" name="eventsGroupBy" value="time" id="eventGroupingByTimeRadio" className="hidden"/>
                    <label htmlFor="eventGroupingByTimeRadio" className="radio-label-icon common-radio"><span l10n-id="briefings-sort-by-timeline"></span></label>
                  </div>
                </div>
                <div className="flex-0-0-auto">
                  <div>
                    <input type="checkbox" id="hideAllPanelsCheckbox" className="hidden"/>
                    <label htmlFor="hideAllPanelsCheckbox" className="checkbox-label-icon common-checkbox"><span l10n-id="briefings-hide-all-panels"></span></label>
                  </div>
                  <div>
                    <input type="checkbox" id="disableHeadersCheckbox" className="hidden"/>
                    <label htmlFor="disableHeadersCheckbox" className="checkbox-label-icon common-checkbox"><span l10n-id="briefings-disable-headers"></span></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="briefingContent" ></div>
        </div>
      </div>
    </div>
  );
};

export function getBriefingPreviewTemplate() {
  return <BriefingPreviewTemplate />;
}
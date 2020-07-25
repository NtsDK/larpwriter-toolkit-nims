import React from 'react';

export const SocialNetworkTemplate = function () {
  return (
    <div id="socialNetworkDiv" className="block">
      <div id="socialNetworkWarning" className="alert alert-warning" />
      <div>
        <div className="storySelectorContainer sn-navigation-container">
          <div className="panel panel-default">
            <div className="panel-body">
              <span l10n-id="social-network-show-node" className="display-block" />
              <div className="margin-bottom-8">
                <select id="nodeFocusSelector" className="common-select " />
              </div>
              <div>
                <input id="showPlayerNamesCheckbox" type="checkbox" className="hidden" />
                <label htmlFor="showPlayerNamesCheckbox" className="checkbox-label-icon common-checkbox"><span l10n-id="social-network-show-player-names" /></label>
              </div>
            </div>
          </div>
        </div>

        <div className="storySelectorContainer" id="commonSettingsContainer">
          <div id="faq" role="tablist" aria-multiselectable="true">
            <div className="panel panel-default">
              <div className="panel-heading" role="tab" id="">
                <h3 className="panel-title">
                  <a
                    data-toggle="collapse"
                    data-parent="#faq"
                    href="#answerOne"
                    aria-expanded="false"
                    aria-controls="answerOne"
                    className="collapsed"
                    l10n-id="social-network-color-nodes"
                  />
                </h3>
              </div>
              <div id="answerOne" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false" style={{ height: '0px' }}>
                <div className="panel-body">
                  <div className="network-coloring-area">
                    <div className="margin-bottom-16">
                      <select id="networkNodeGroupSelector" className="form-control" />
                    </div>
                    <span l10n-id="social-network-legend" className="margin-bottom-8 inline-block" />
                    <div id="colorLegend" />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading" role="tab" id="">
                <h3 className="panel-title">
                  <a
                    data-toggle="collapse"
                    data-parent="#faq"
                    href="#answerTwo"
                    aria-expanded="false"
                    aria-controls="answerTwo"
                    className="collapsed"
                    l10n-id="social-network-selection"
                  />
                </h3>
              </div>
              <div id="answerTwo" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false">
                <div className="panel-body">
                  <div className="network-filter-area">
                    <select size="3" id="networkSubsetsSelector" className="form-control" />
                    <div id="networkCharacterDiv" className="hidden">
                      <h4 l10n-id="social-network-characters" />
                      <input selector-filter="#networkCharacterSelector" />
                      <select id="networkCharacterSelector" multiple className="form-control" />
                    </div>
                    <div id="networkStoryDiv" className="hidden">
                      <h4 l10n-id="social-network-stories" />
                      <input selector-filter="#networkStorySelector" />
                      <select id="networkStorySelector" multiple className="form-control" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading" role="tab" id="">
                <h3 className="panel-title">
                  <a
                    data-toggle="collapse"
                    data-parent="#faq"
                    href="#answerThree"
                    aria-expanded="false"
                    aria-controls="answerThree"
                    className="collapsed"
                    l10n-id="social-network-social-network"
                  />
                </h3>
              </div>
              <div id="answerThree" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="" aria-expanded="false">
                <div className="panel-body">
                  <div className="network-type-area">
                    <select size="4" id="networkSelector" className="form-control" />

                    <div id="activityBlock" className="hidden">
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-active" data-value="active" l10n-title="constant-active" />
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-follower" data-value="follower" l10n-title="constant-follower" />
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-defensive" data-value="defensive" l10n-title="constant-defensive" />
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-passive" data-value="passive" l10n-title="constant-passive" />
                    </div>

                    <div id="relationsBlock" className="hidden">
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto allies" data-value="allies" l10n-title="briefings-allies" />
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto directional" data-value="directional" l10n-title="briefings-directional" />
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto neutral" data-value="neutral" l10n-title="briefings-neutral" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button id="drawNetworkButton" l10n-id="social-network-draw" className="btn btn-default width-100p" />
          </div>
        </div>

        <div className="visualObjectContainer full-screen-elem" id="socialNetworkContainer" />
      </div>
      <div>
        <div id="Stats-output" />
        <div id="gui-settings-output" />
        <div id="WebGL-output" />
      </div>
    </div>
  );
};

export function getSocialNetworkTemplate() {
  return <SocialNetworkTemplate />;
}

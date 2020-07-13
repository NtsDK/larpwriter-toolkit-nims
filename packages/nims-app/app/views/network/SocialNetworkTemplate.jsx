import React from 'react';

export const SocialNetworkTemplate = function() {
  return (
    <div id="socialNetworkDiv" className="block">
      <div id="socialNetworkWarning" className="alert alert-warning"></div>
      <div>
        <div className="storySelectorContainer sn-navigation-container">
          <div className="panel panel-default">
            <div className="panel-body">
              <span l10n-id="social-network-show-node" className="display-block"></span>
              <div className="margin-bottom-8">
                <select id="nodeFocusSelector" className="common-select "></select>
              </div>
              <div>
                <input id="showPlayerNamesCheckbox" type="checkbox" className="hidden"></input>
                <label htmlFor="showPlayerNamesCheckbox" className="checkbox-label-icon common-checkbox"><span l10n-id="social-network-show-player-names"></span></label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="storySelectorContainer" id="commonSettingsContainer">
          <div id="faq" role="tablist" aria-multiselectable="true">
            <div className="panel panel-default">
              <div className="panel-heading" role="tab" id="">
                <h3 className="panel-title">
                  <a data-toggle="collapse" data-parent="#faq" href="#answerOne" aria-expanded="false" aria-controls="answerOne" className="collapsed"
                    l10n-id="social-network-color-nodes">
                  </a>
                </h3>
              </div>
              <div id="answerOne" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false" style={{height: "0px"}}>
                <div className="panel-body">
                  <div className="network-coloring-area">
                    <div className="margin-bottom-16">
                      <select id="networkNodeGroupSelector" className="form-control"></select>
                    </div>
                    <span l10n-id="social-network-legend" className="margin-bottom-8 inline-block"></span>
                    <div id="colorLegend"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="panel panel-default">
              <div className="panel-heading" role="tab" id="">
                <h3 className="panel-title">
                  <a data-toggle="collapse" data-parent="#faq" href="#answerTwo" aria-expanded="false" aria-controls="answerTwo" className="collapsed"
                  l10n-id="social-network-selection">
                  </a>
                </h3>
              </div>
              <div id="answerTwo" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false">
                <div className="panel-body">
                  <div className="network-filter-area">
                    <select size="3" id="networkSubsetsSelector" className="form-control"></select>
                    <div id="networkCharacterDiv" className="hidden">
                      <h4 l10n-id="social-network-characters"></h4> 
                      <input selector-filter="#networkCharacterSelector"/>
                      <select id="networkCharacterSelector" multiple className="form-control"></select>
                    </div>
                    <div id="networkStoryDiv" className="hidden">
                      <h4 l10n-id="social-network-stories"></h4> 
                      <input selector-filter="#networkStorySelector"/>
                      <select id="networkStorySelector" multiple className="form-control"></select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="panel panel-default">
              <div className="panel-heading" role="tab" id="">
                <h3 className="panel-title">
                  <a data-toggle="collapse" data-parent="#faq" href="#answerThree" aria-expanded="false" aria-controls="answerThree" className="collapsed"
                  l10n-id="social-network-social-network">
                  </a>
                </h3>
              </div>
              <div id="answerThree" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="" aria-expanded="false">
                <div className="panel-body">
                  <div className="network-type-area">
                    <select size="4" id="networkSelector" className="form-control"></select>
          
                    <div id="activityBlock" className="hidden">
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-active" data-value="active" l10n-title="constant-active"></button>
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-follower" data-value="follower" l10n-title="constant-follower"></button>
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-defensive" data-value="defensive" l10n-title="constant-defensive"></button>
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-passive" data-value="passive" l10n-title="constant-passive"></button>
                    </div>
                    
                    <div id="relationsBlock" className="hidden">
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto allies" data-value="allies" l10n-title="briefings-allies"></button>
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto directional" data-value="directional" l10n-title="briefings-directional"></button>
                      <button className="btn btn-default btn-reduced fa-icon flex-0-0-auto neutral" data-value="neutral" l10n-title="briefings-neutral"></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button id="drawNetworkButton" l10n-id="social-network-draw" className="btn btn-default width-100p"></button>
          </div>
        </div>

        <div className="visualObjectContainer full-screen-elem" id="socialNetworkContainer"></div>
      </div>
      <div>
        <div id="Stats-output"></div>
        <div id="gui-settings-output"></div>
        <div id="WebGL-output"></div>
      </div>
    </div>
  );
};

export function getSocialNetworkTemplate() {
  return <SocialNetworkTemplate />;
}
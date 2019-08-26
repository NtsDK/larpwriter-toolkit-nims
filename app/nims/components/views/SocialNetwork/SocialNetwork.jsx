import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './SocialNetwork.css';

export default class SocialNetwork extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('SocialNetwork mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('SocialNetwork did update');
  }

  componentWillUnmount = () => {
    console.log('SocialNetwork will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }), // subset selector
      dbms.getEntityNamesArray({ type: 'story' }), // subset selector
      dbms.getAllProfiles({ type: 'character' }), // node coloring
      dbms.getAllStories(), // contains most part of SN data
      dbms.getProfileStructure({ type: 'character' }), // node coloring
      dbms.getProfileBindings(), // node coloring
      dbms.getGroupCharacterSets(), // node coloring
      dbms.getMetaInfo(), // timelined network
      dbms.getRelations() // relations
    ]).then((results) => {
      const [characterNames,
        storyNames,
        profiles,
        stories,
        profileStructure,
        profileBindings,
        groupCharacterSets,
        metaInfo,
        relations] = results;
      this.setState({
        characterNames,
        storyNames,
        profiles,
        stories,
        profileStructure,
        profileBindings,
        groupCharacterSets,
        metaInfo,
        relations
      });
    });
  }

  render() {
    const {
      characterNames,
      storyNames,
      profiles,
      stories,
      profileStructure,
      profileBindings,
      groupCharacterSets,
      metaInfo,
      relations
    } = this.state;
    const { t } = this.props;

    if (!characterNames) {
      return <div> SocialNetwork stub </div>;
      // return null;
    }
    return (
      <div className="social-network block" id="socialNetworkDiv">
        <div id="socialNetworkWarning" className="alert alert-warning">{t('social-network.require-resources-warning')}</div>
        <div>
          <div className="storySelectorContainer sn-navigation-container">
            <div className="panel panel-default">
              <div className="panel-body">
                <span className="display-block">{t('social-network.show-node')}</span>
                <div className="margin-bottom-8">
                  <select id="nodeFocusSelector" className="common-select " />
                </div>
                <div>
                  <input id="showPlayerNamesCheckbox" type="checkbox" className="hidden" />
                  <label htmlFor="showPlayerNamesCheckbox" className="checkbox-label-icon common-checkbox">
                    <span>{t('social-network.show-player-names')}</span>

                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="storySelectorContainer" id="commonSettingsContainer">
            <div id="faq" role="tablist" aria-multiselectable="true">
              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h3 className="panel-title">
                    {t('social-network.color-nodes')}
                    {/* <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerOne"
                      aria-expanded="false"
                      aria-controls="answerOne"
                      className="collapsed"
                      l10n-id="social-network-color-nodes"
                    /> */}
                  </h3>
                </div>
                <div id="answerOne" className="panel-collapse " role="tabpanel" aria-labelledby="" aria-expanded="false">
                  <div className="panel-body">
                    <div className="network-coloring-area">
                      <div className="margin-bottom-16">
                        <select id="networkNodeGroupSelector" className="form-control" />
                      </div>
                      <span className="margin-bottom-8 inline-block">{t('social-network.legend')}</span>
                      <div id="colorLegend" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h3 className="panel-title">
                    {t('social-network.selection')}
                    {/* <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerTwo"
                      aria-expanded="false"
                      aria-controls="answerTwo"
                      className="collapsed"
                      l10n-id="social-network-selection"
                    /> */}
                  </h3>
                </div>
                <div id="answerTwo" className="panel-collapse " role="tabpanel" aria-labelledby="" aria-expanded="false">
                  <div className="panel-body">
                    <div className="network-filter-area">
                      <select size="3" id="networkSubsetsSelector" className="form-control" />
                      <div id="networkCharacterDiv" className="hidden">
                        <h4>{t('social-network.characters')}</h4>
                        <input selector-filter="#networkCharacterSelector" />
                        <select id="networkCharacterSelector" multiple className="form-control" />
                      </div>
                      <div id="networkStoryDiv" className="hidden">
                        <h4>{t('social-network.stories')}</h4>
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
                    {t('social-network.social-network')}
                    {/* <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerThree"
                      aria-expanded="false"
                      aria-controls="answerThree"
                      className="collapsed"
                      l10n-id="social-network-social-network"
                    /> */}
                  </h3>
                </div>
                <div id="answerThree" className="panel-collapse  in" role="tabpanel" aria-labelledby="" aria-expanded="false">
                  <div className="panel-body">
                    <div className="network-type-area">
                      <select size="4" id="networkSelector" className="form-control" />

                      <div id="activityBlock" className="hidden">
                        <button type="button" className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-active" data-value="active" title={t('constant.active')} />
                        <button type="button" className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-follower" data-value="follower" title={t('constant.follower')} />
                        <button type="button" className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-defensive" data-value="defensive" title={t('constant.defensive')} />
                        <button type="button" className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-passive" data-value="passive" title={t('constant.passive')} />
                      </div>

                      <div id="relationsBlock" className="hidden">
                        <button type="button" className="btn btn-default btn-reduced fa-icon flex-0-0-auto allies" data-value="allies" title={t('briefings.allies')} />
                        <button type="button" className="btn btn-default btn-reduced fa-icon flex-0-0-auto directional" data-value="directional" title={t('briefings.directional')} />
                        <button type="button" className="btn btn-default btn-reduced fa-icon flex-0-0-auto neutral" data-value="neutral" title={t('briefings.neutral')} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="drawNetworkButton"
                className="btn btn-default width-100p"
              >
                {t('social-network.draw')}
              </button>
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
  }
}


SocialNetwork.propTypes = {
  // bla: PropTypes.string,
};

SocialNetwork.defaultProps = {
  // bla: 'test',
};

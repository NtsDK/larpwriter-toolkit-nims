import React, { Component, useState } from 'react';
import './SocialNetwork.css';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import * as Constants from 'nims-dbms/nimsConstants';
import PermissionInformer from 'permissionInformer';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';

const STORY_PREFIX = 'St:';
const CHAR_PREFIX = 'Ch:';
const PROFILE_GROUP = 'prof-';
const FILTER_GROUP = 'filter-';

function SocialNetworkWarning() {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  return (
    <div
      id="socialNetworkWarning"
      className={classNames('alert alert-warning', {
        hidden: !show
      })}
    >
      {t('social-network.require-resources-warning')}
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="tw-bg-gray-200"
      >
        {t('social-network.remove-resources-warning')}
      </button>
    </div>
  );
}

export class SocialNetwork extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.refresh();
    console.log('SocialNetwork mounted');
  }

  componentDidUpdate() {
    console.log('SocialNetwork did update');
  }

  componentWillUnmount() {
    console.log('SocialNetwork will unmount');
  }

  refresh() {
    // let selector = U.fillSelector(U.clearEl(U.queryEl('#networkSelector')), UI.constArr2Select(Constants.networks));
    // [selector.value] = Constants.networks;
    // onNetworkSelectorChangeDelegate({ target: selector });

    // selector = U.clearEl(U.queryEl('#networkNodeGroupSelector'));

    Promise.all([
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }), // subset selector
      PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }), // subset selector
      DBMS.getAllProfiles({ type: 'character' }), // node coloring
      DBMS.getAllStories(), // contains most part of SN data
      DBMS.getProfileStructure({ type: 'character' }), // node coloring
      DBMS.getProfileBindings(), // node coloring
      DBMS.getGroupCharacterSets(), // node coloring
      DBMS.getMetaInfo(), // timelined network
      DBMS.getRelations() // relations
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

      const checkboxes = profileStructure.filter((element) => R.equals(element.type, 'checkbox'));
      R.values(profiles).forEach((profile) => {
        checkboxes.map((item) => (profile[item.name] = L10n.const(Constants[profile[item.name]])));
      });

      // console.log(this.getNetworkNodeGroups(profileStructure, groupCharacterSets));

      this.initGroupColors(profileStructure);

      // NetworkSubsetsSelector.refresh({
      //   characterNames,
      //   storyNames,
      //   Stories: stories
      // });

      this.setState({
        Stories: stories,
        Characters: profiles,
        profileBindings,
        profileStructure,
        groupCharacterSets,
        metaInfo,
        relations,
      });
    }).catch(UI.handleError);
  }

  initGroupColors(profileStructure) {
    const colorGroups = this.getColorGroups(profileStructure);
    // const groupColors = R.clone(Constants.snFixedColors);
    // const groupLists = {};

    const info = colorGroups.reduce((acc, group) => {
      if (group.type === 'enum') {
        acc.groupLists[PROFILE_GROUP + group.name] = group.value.split(',').map((subGroupName, i) => {
          acc.groupColors[`${PROFILE_GROUP + group.name}.${subGroupName.trim()}`] = Constants.colorPalette[i + 2];
          return `${PROFILE_GROUP + group.name}.${subGroupName.trim()}`;
        });
      } else if (group.type === 'checkbox') {
        const trueName = L10n.const(Constants.true);
        const falseName = L10n.const(Constants.false);
        acc.groupColors[`${PROFILE_GROUP + group.name}.${trueName}`] = Constants.colorPalette[group.value ? 0 + 2 : 1 + 2];
        acc.groupColors[`${PROFILE_GROUP + group.name}.${falseName}`] = Constants.colorPalette[group.value ? 1 + 2 : 0 + 2];
        acc.groupLists[PROFILE_GROUP + group.name] = [`${PROFILE_GROUP + group.name}.${trueName}`, `${PROFILE_GROUP + group.name}.${falseName}`];
      } else {
        throw new Error(`Unexpected profile item type: ${group.type}`);
      }
      return acc;
    }, {
      groupColors: R.clone(Constants.snFixedColors),
      groupLists: {}
    });
    return info;
  }

  getColorGroups(profileStructure) {
    return profileStructure.filter((element) => R.contains(element.type, ['enum', 'checkbox']));
  }

  getNetworkNodeGroups(profileStructure, groupCharacterSets) {
    const { t } = this.props;

    const colorGroups = this.getColorGroups(profileStructure);
    const defaultColorGroup = {
      value: Constants.noGroup,
      name: L10n.const(Constants.noGroup)
    };

    const profileGroups = R.pluck('name', colorGroups).map((name) => ({
      value: PROFILE_GROUP + name,
      name: t('social-network.profile-group2', { name })
    }));
    const filterGroups = R.keys(groupCharacterSets).map((name) => ({
      value: FILTER_GROUP + name,
      name: t('social-network.filter-group2', { name })
    }));
    return [defaultColorGroup].concat(profileGroups).concat(filterGroups);
  }

  render() {
    const { profileStructure, groupCharacterSets } = this.state;
    const { t } = this.props;

    if (profileStructure === undefined) {
      return null;
    }

    const networkNodeGroups = this.getNetworkNodeGroups(profileStructure, groupCharacterSets);

    // if (!something) {
    //   return <div> SocialNetwork stub </div>;
    //   // return null;
    // }
    return (
      <div id="socialNetworkDiv" className="SocialNetwork block">
        <SocialNetworkWarning />
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
                    <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerOne"
                      aria-expanded="false"
                      aria-controls="answerOne"
                      className="collapsed"
                    >
                      {t('social-network.color-nodes')}
                    </a>
                  </h3>
                </div>
                <div id="answerOne" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false" style={{ height: '0px' }}>
                  <div className="panel-body">
                    <div className="network-coloring-area">
                      <div className="margin-bottom-16">
                        <select id="networkNodeGroupSelector" className="form-control">
                          {
                            networkNodeGroups.map((group) => <option value={group.value}>{group.name}</option>)
                          }
                        </select>
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
                    <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerTwo"
                      aria-expanded="false"
                      aria-controls="answerTwo"
                      className="collapsed"
                    >
                      {t('social-network.selection')}
                    </a>
                  </h3>
                </div>
                <div id="answerTwo" className="panel-collapse collapse" role="tabpanel" aria-labelledby="" aria-expanded="false">
                  <div className="panel-body">
                    <div className="network-filter-area">
                      <select size={3} id="networkSubsetsSelector" className="form-control" />
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
                    <a
                      data-toggle="collapse"
                      data-parent="#faq"
                      href="#answerThree"
                      aria-expanded="false"
                      aria-controls="answerThree"
                      className="collapsed"
                    >
                      {t('social-network.social-network')}
                    </a>
                  </h3>
                </div>
                <div id="answerThree" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="" aria-expanded="false">
                  <div className="panel-body">
                    <div className="network-type-area">
                      <select size={Constants.networks.length} id="networkSelector" className="form-control">
                        {
                          Constants.networks.map((networkType) => <option value={networkType}>{t(`constant.${networkType}`)}</option>)
                        }
                      </select>

                      <div id="activityBlock" className="hidden">
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-active"
                          data-value="active"
                          title={t('constant.active')}
                        />
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-follower"
                          data-value="follower"
                          title={t('constant.follower')}
                        />
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-defensive"
                          data-value="defensive"
                          title={t('constant.defensive')}
                        />
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-passive"
                          data-value="passive"
                          title={t('constant.passive')}
                        />
                      </div>

                      <div id="relationsBlock" className="hidden">
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon flex-0-0-auto allies"
                          data-value="allies"
                          title={t('briefings.allies')}
                        />
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon flex-0-0-auto directional"
                          data-value="directional"
                          title={t('briefings.directional')}
                        />
                        <button
                          type="button"
                          className="btn btn-default btn-reduced fa-icon flex-0-0-auto neutral"
                          data-value="neutral"
                          title={t('briefings.neutral')}
                        />
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
      </div>
    );
  }
}

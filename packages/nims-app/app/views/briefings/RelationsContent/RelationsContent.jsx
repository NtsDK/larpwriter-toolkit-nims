import React, { Component } from 'react';
import * as R from 'ramda';
import PermissionInformer from 'permissionInformer';
import { UI, U, L10n } from 'nims-app-core';
import ProjectUtils from 'nims-dbms/db-utils/projectUtils';
import * as CU from 'nims-dbms-core/commonUtils';
import './RelationsContent.css';
import { RelationRow } from './RelationRow';

const findRel = R.curry((fromCharacter, toCharacter, relations) => {
  const findFunc = R.curry((fromCharacter2, toCharacter2, rel) => rel[fromCharacter2] !== undefined && rel[toCharacter2] !== undefined);
  return R.find(findFunc(fromCharacter, toCharacter), relations);
});

const emptyState = {
  profiles: null,
  relationsSummary: null,
  characterNamesArray: null,
  profileBindings: null,
  profileItemNames: null,
  selectedProfileItem: null,
  showCharacters: null,
  knownByStoriesNoRels: null,
  selectedKnownCharacter: null,
  unknownByStoriesNoRels: null,
  selectedUnknownCharacter: null
};

export class RelationsContent extends Component {
  constructor(props) {
    super(props);
    this.state = R.clone(emptyState);
    this.onKnownCharacterChange = this.onKnownCharacterChange.bind(this);
    this.onUnknownCharacterChange = this.onUnknownCharacterChange.bind(this);
    this.onSelectedProfileItemChange = this.onSelectedProfileItemChange.bind(this);
    this.onAddCharacterRelation = this.onAddCharacterRelation.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('RelationsContent mounted');
  }

  componentDidUpdate(prevProps) {
    const { characterName } = this.props;
    if (characterName !== prevProps.characterName) {
      this.setState(R.clone(emptyState));
      this.refresh();
    }
    console.log('RelationsContent did update');
    // console.log(`RelationsContent did update ${count}`);
    // count++;
  }

  componentWillUnmount() {
    console.log('RelationsContent will unmount');
  }

  refresh() {
    const { characterName, characterProfileStructure } = this.props;
    if (characterName === null) {
      return;
    }

    Promise.all([
      DBMS.getAllProfiles({ type: 'character' }),
      DBMS.getRelationsSummary({ characterName }),
      DBMS.getExtendedProfileBindings(),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false })
    ]).then((results) => {
      const [profiles, relationsSummary, profileBindings, characterNamesArray] = results;
      const profileItemNames = characterProfileStructure.map(R.prop('name')).sort();

      const notCharacter = R.compose(R.not, R.equals(characterName), R.prop('value'));
      const otherCharacters = characterNamesArray.filter(notCharacter);

      const get2ndCharName = ProjectUtils.get2ndRelChar(characterName);
      const showCharacters = relationsSummary.relations.map(get2ndCharName).sort(CU.charOrdA);
      const hasRelWithCharacter = R.compose(R.not, R.contains(R.__, showCharacters), R.prop('value'));
      const noRelsList = otherCharacters.filter(hasRelWithCharacter);
      const meetInStories = R.compose(R.contains(R.__, R.keys(relationsSummary.knownCharacters)), R.prop('value'));
      const [knownByStoriesNoRels, unknownByStoriesNoRels] = R.partition(meetInStories, noRelsList);

      this.setState({
        profiles,
        relationsSummary,
        characterNamesArray,
        profileBindings: R.fromPairs(profileBindings),
        profileItemNames,
        selectedProfileItem: profileItemNames.length > 0 ? profileItemNames[0] : null,
        showCharacters,
        knownByStoriesNoRels,
        selectedKnownCharacter: knownByStoriesNoRels.length > 0 ? knownByStoriesNoRels[0].value : null,
        unknownByStoriesNoRels,
        selectedUnknownCharacter: unknownByStoriesNoRels.length > 0 ? unknownByStoriesNoRels[0].value : null,
      });
    }).catch(UI.handleError);
  }

  onAddCharacterRelation(e) {
    const {
      characterName
    } = this.props;
    const { selectProp } = e.target.dataset;
    const fromCharacter = characterName;
    const toCharacter = this.state[selectProp];
    if (toCharacter === null) {
      return;
    }
    DBMS.createCharacterRelation({ fromCharacter, toCharacter }).then(() => {
      this.refresh();
    }).catch(UI.handleError);
  }

  onKnownCharacterChange(e) {
    this.setState({
      selectedKnownCharacter: e.target.value
    });
  }

  onUnknownCharacterChange(e) {
    this.setState({
      selectedUnknownCharacter: e.target.value
    });
  }

  onSelectedProfileItemChange(e) {
    this.setState({
      selectedProfileItem: e.target.value
    });
  }

  render() {
    const {
      relationsSummary, profiles, profileBindings, characterNamesArray,
      profileItemNames, selectedProfileItem,
      showCharacters,
      knownByStoriesNoRels,
      unknownByStoriesNoRels,
      selectedKnownCharacter,
      selectedUnknownCharacter,
    } = this.state;
    const {
      t, characterName, isAdaptationsMode, characterProfileStructure
    } = this.props;

    // console.log(`RelationsContent render ${count}`);
    // count++;

    if (characterName === null || characterNamesArray === null) {
      return null;
    }

    const toCharacterFilter = (toCharacter) => (isAdaptationsMode ? true
      : !R.isEmpty(findRel(characterName, toCharacter, relationsSummary.relations)[characterName]));
    const findRelTmp = findRel(characterName, R.__, relationsSummary.relations);
    return (
      <div className="RelationsContent">

        <div className="Relation entity-management relations-management">
          <div>
            <span className="known-characters-label">{t('briefings.known-characters')}</span>
            <span>
              <select
                className="common-select known-characters-select"
                value={selectedKnownCharacter}
                style={{ width: '200px' }}
                onChange={this.onKnownCharacterChange}
              >
                {
                  knownByStoriesNoRels.map((character) => (
                    <option
                      key={character.value}
                      value={character.value}
                    >
                      {character.displayName}
                    </option>
                  ))
                }
              </select>
            </span>
            <button
              type="button"
              className="add-known-character-relation btn btn-default btn-reduced"
              data-select-prop="selectedKnownCharacter"
              onClick={this.onAddCharacterRelation}
            >
              {t('common.add')}
            </button>
          </div>
          <div>
            <span className="unknown-characters-label">{t('briefings.unknown-characters')}</span>
            <span>
              <select
                className="common-select unknown-characters-select"
                value={selectedUnknownCharacter}
                style={{ width: '200px' }}
                onChange={this.onUnknownCharacterChange}
              >
                {
                  unknownByStoriesNoRels.map((character) => (
                    <option
                      key={character.value}
                      value={character.value}
                    >
                      {character.displayName}
                    </option>
                  ))
                }
              </select>
            </span>
            <button
              type="button"
              className="add-unknown-character-relation btn btn-default btn-reduced"
              data-select-prop="selectedUnknownCharacter"
              onClick={this.onAddCharacterRelation}
            >
              {t('common.add')}
            </button>
          </div>
          <div>
            <span className="profile-item-label">{t('briefings.profile-item')}</span>
            <span>
              <select
                className="common-select profile-item-select"
                value={selectedProfileItem}
                style={{ width: '200px' }}
                onChange={this.onSelectedProfileItemChange}
              >
                {
                  profileItemNames.map((name) => <option key={name} value={name}>{name}</option>)
                }
              </select>
            </span>
          </div>
        </div>

        <div className="relation-content container-fluid">
          {
            showCharacters.filter(toCharacterFilter).map((toCharacter) => (
              <RelationRow
                key={`${characterName}_${toCharacter}`}
                profiles={profiles}
                selectedProfileItem={selectedProfileItem}
                isAdaptationsMode={isAdaptationsMode}
                knownCharacters={relationsSummary.knownCharacters}
                profileBindings={profileBindings}
                fromCharacter={characterName}
                toCharacter={toCharacter}
                rel={findRelTmp(toCharacter)}
                externalRefresh={this.refresh}
              />
            ))
          }
        </div>
      </div>
    );
  }
}

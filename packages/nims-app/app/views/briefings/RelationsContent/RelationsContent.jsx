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

let count = 1;

export class RelationsContent extends Component {
  // static getDerivedStateFromProps(props, state) {
  //   // Store prevId in state so we can compare when props change.
  //   // Clear out previously-loaded data (so we don't render stale stuff).
  //   if (props.id !== state.prevId) {
  //     return {
  //       externalData: null,
  //       prevId: props.id,
  //     };
  //   }
  //   // No state update necessary
  //   return null;
  // }

  constructor(props) {
    super(props);
    this.state = R.clone(emptyState);
    this.onKnownCharacterChange = this.onKnownCharacterChange.bind(this);
    this.onUnknownCharacterChange = this.onUnknownCharacterChange.bind(this);
    this.onSelectedProfileItemChange = this.onSelectedProfileItemChange.bind(this);
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
    // console.log('RelationsContent did update');
    console.log(`RelationsContent did update ${count}`);
    count++;
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
      // data.relationsSummary = relationsSummary;
      // data.characterNamesArray = characterNamesArray;
      // data.profiles = profiles;
      // data.profileBindings = R.fromPairs(profileBindings);
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

      // callback();
    }).catch(UI.handleError);
  }

  // const content = RelationsPreview.makeRelationsContent(
  //   state.data, true, state.characterProfileStructure,
  //   refresh
  // );

  makeRelationsContent() {
    // TODO externalRefresh
    // const {
    //   relationsSummary, profiles, profileBindings, characterNamesArray
    // } = this.state;
    // const {
    //   t, characterName, isAdaptationsMode, characterProfileStructure
    // } = this.props;
    // const profileSettings = characterProfileStructure;

    // const notCharacter = R.compose(R.not, R.equals(characterName), R.prop('value'));
    // const otherCharacters = characterNamesArray.filter(notCharacter);

    // const get2ndCharName = ProjectUtils.get2ndRelChar(characterName);
    // const showCharacters = relationsSummary.relations.map(get2ndCharName).sort(CU.charOrdA);
    // const hasRelWithCharacter = R.compose(R.not, R.contains(R.__, showCharacters), R.prop('value'));
    // const noRelsList = otherCharacters.filter(hasRelWithCharacter);
    // const meetInStories = R.compose(R.contains(R.__, R.keys(relationsSummary.knownCharacters)), R.prop('value'));
    // const [knownByStoriesNoRels, unknownByStoriesNoRels] = R.partition(meetInStories, noRelsList);

    // const profileItemNames = profileSettings.map(R.prop('name')).sort();

    // const markup = (

    // );

    // function makeProfileItemSelector(select1, profileSettings, refresh) {
    //   select1 = $(select1);
    //   const tmpSelect = select1.select2(
    // U.arr2Select2(
    //   profileSettings.map(R.prop('name')).sort()
    //   )
    // );

    //   select1.select2({ width: 'style' });
    //   tmpSelect.on('change', refresh);
    //   if (profileSettings[0]) {
    //     tmpSelect.val(profileSettings[0].name).trigger('change');
    //   }
    // }

    //   // const relationTmpl = U.wrapEl('div', U.qte('.relation-tmpl'));

    //   const relationTmpl = U.makeEl('div');
    //   ReactDOM.render(getRelation(), relationTmpl);

    //   const tmplQe = U.qee(relationTmpl);
    //   const content = tmplQe('.relation-content');
    //   const getProfileItemSelect = () => tmplQe('.profile-item-select');

    //   makeProfileItemSelector(tmplQe('.profile-item-select'), profileSettings, refreshProfileItem(content, profiles));

    //   const makeRow = makeNewRow(
    //     profiles, getProfileItemSelect, isAdaptationsMode, relationsSummary.knownCharacters, profileBindings,
    //     externalRefresh, characterName
    //   );

    //   // filling header - need table body for callbacks
    //   const makeRowCallback = R.compose(U.addEl(content), makeRow);
    //   U.addEl(tmplQe('.known-characters-label'), U.makeText(l10n('known-characters')));
    //   const knownBtn = U.addEl(tmplQe('.add-known-character-relation'), U.makeText(L10n.getValue('common-add')));
    //   U.addEl(tmplQe('.unknown-characters-label'), U.makeText(l10n('unknown-characters')));
    //   const unknownBtn = U.addEl(tmplQe('.add-unknown-character-relation'), U.makeText(L10n.getValue('common-add')));
    //   U.addEl(tmplQe('.profile-item-label'), U.makeText(l10n('profile-item')));

    //   fillCharSelector(tmplQe('.known-characters-select'), knownBtn, knownByStoriesNoRels, characterName, makeRowCallback);
    //   fillCharSelector(tmplQe('.unknown-characters-select'), unknownBtn, unknownByStoriesNoRels, characterName, makeRowCallback);

  //   // filling table
  //   const toCharacterFilter = (toCharacter) => (isAdaptationsMode ? true
  //     : !R.isEmpty(findRel(characterName, toCharacter, relationsSummary.relations)[characterName]));
  //   const findRelTmp = findRel(characterName, R.__, relationsSummary.relations);
  //   U.addEls(content, showCharacters.filter(toCharacterFilter).map((toChar) => makeRow(toChar, findRelTmp(toChar))));
  //   return relationTmpl;
  }

  // function fillCharSelector(select1, button, data, fromCharacter, makeRowCallback) {
  //   select1 = $(select1);
  //   const tmpSelect = select1.select2(UI.getSelect2Data(data));
  //   select1.select2({ width: 'style' });
  //   U.listen(button, 'click', () => {
  //     const toCharacter = select1[0].value;
  //     DBMS.createCharacterRelation({ fromCharacter, toCharacter }).then(() => {
  //       DBMS.getCharacterRelation({ fromCharacter, toCharacter }).then((rel) => {
  //         makeRowCallback(select1[0].value, rel);
  //         data = data.filter(R.compose(R.not, R.equals(select1[0].value), R.prop('value')));
  //         U.clearEl(select1[0]);
  //         select1.select2(UI.getSelect2Data(data));
  //       }).catch(UI.handleError);
  //     }).catch(UI.handleError);
  //   });
  // }

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

    console.log(`RelationsContent render ${count}`);
    count++;

    //
    //     profiles, getProfileItemSelect, isAdaptationsMode, relationsSummary.knownCharacters, profileBindings,
    //     externalRefresh, characterName

    if (characterName === null || characterNamesArray === null) {
      // return <div> RelationsContent stub </div>;
      return null;
    }
    this.makeRelationsContent();

    const toCharacterFilter = (toCharacter) => (isAdaptationsMode ? true
      : !R.isEmpty(findRel(characterName, toCharacter, relationsSummary.relations)[characterName]));
    const findRelTmp = findRel(characterName, R.__, relationsSummary.relations);
    // U.addEls(content, showCharacters.filter(toCharacterFilter).map((toChar) => makeRow(toChar, findRelTmp(toChar))));
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
            <button type="button" className="add-known-character-relation btn btn-default btn-reduced">{t('common.add')}</button>
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
            <button type="button" className="add-unknown-character-relation btn btn-default btn-reduced">{t('common.add')}</button>
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
              // makeNewRow = R.curry((
              // profiles,  profiles
              // getProfileItemSelect,  selectedProfileItem
              // isAdaptationsMode,  isAdaptationsMode
              // knownCharacters,  relationsSummary.knownCharacters
              // profileBindings,    profileBindings
              // externalRefresh,   ????
              // fromCharacter,   characterName
              // toCharacter, toCharacter
              // rel findRelTmp(toCharacter)
              // ) => {
              <div>stub</div>

              // <RelationRow
              //   profiles={profiles}
              //   selectedProfileItem={selectedProfileItem}
              //   isAdaptationsMode={isAdaptationsMode}
              //   knownCharacters={relationsSummary.knownCharacters}
              //   profileBindings={profileBindings}
              //   fromCharacter={characterName}
              //   toCharacter={toCharacter}
              //   rel={findRelTmp(toCharacter)}
              // />
            ))
          }
        </div>
      </div>
    );
  }
}

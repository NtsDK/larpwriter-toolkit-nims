import React, { Component } from 'react';
import PermissionInformer from 'permissionInformer';
import { UI, U, L10n } from 'nims-app-core';
import './Relations.css';
import { RelationsContent } from '../RelationsContent';

export class Relations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      characterProfileStructure: {},
      characterNames: [],
      selectedCharacter: null
    };
    this.onCharacterChange = this.onCharacterChange.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('Relations mounted');
  }

  componentDidUpdate() {
    console.log('Relations did update');
  }

  componentWillUnmount() {
    console.log('Relations will unmount');
  }

  refresh() {
    // U.clearEl(U.queryEl(`${root} .character-select`));
    // U.clearEl(U.queryEl(`${root} .panel-body`));

    Promise.all([
      DBMS.getProfileStructure({ type: 'character' }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false })
    ]).then((results) => {
      const [characterProfileStructure, characterNames] = results;

      this.setState({
        characterProfileStructure,
        characterNames,
        selectedCharacter: characterNames.length > 0 ? characterNames[0].value : null
      });
      // state.characterProfileStructure = characterProfileStructure;

      // U.showEl(U.qe(`${root} .alert`), names.length < 2);
      // U.showEl(U.qe(`${root} > .panel`), names.length > 1);

      // if (names.length > 0) {
      //   const characterName = UI.checkAndGetEntitySetting(settingsPath, names);
      //   const data = UI.getSelect2Data(names);
      //   // this call trigger buildContent
      //   $(`${root} .character-select`).select2(data).val(characterName).trigger('change');
      // }
    }).catch(UI.handleError);
  }

  onCharacterChange(e) {
    this.setState({
      selectedCharacter: e.target.value
    });
  }

  render() {
    const { characterNames, selectedCharacter, characterProfileStructure } = this.state;
    const { t } = this.props;

    return (
      <div className="Relations relations-tab block">
        {
          characterNames.length < 2
          && (
            <div className="alert alert-info">
              {t('advices.no-characters-for-relations')}
            </div>
          )
        }
        {
          characterNames.length > 1
          && (
            <div className="panel panel-default">
              <div className="panel-heading">
                <select className="character-select common-select" value={selectedCharacter} onChange={this.onCharacterChange}>
                  {
                    characterNames.map((name) => <option key={name.value} value={name.value}>{name.displayName}</option>)
                  }
                </select>
              </div>
              <div className="panel-body">
                <RelationsContent
                  characterName={selectedCharacter}
                  isAdaptationsMode
                  characterProfileStructure={characterProfileStructure}
                />
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

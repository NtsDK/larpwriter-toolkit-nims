/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Characters.css';
// import R from 'ramda';

export default class Characters extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('Characters mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Characters did update');
  }

  componentWillUnmount = () => {
    console.log('Characters will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }),
      dbms.getStoryCharacters({ storyName: id })
    ]).then((results) => {
      const [allCharacters, localCharactersObj] = results;
      const localCharacters = Object.values(localCharactersObj);
      localCharacters.sort(CU.charOrdAFactory(a => a.name.toLowerCase()));
      this.setState({
        allCharacters, localCharacters
      });
    });
  }

  render() {
    const { allCharacters, localCharacters } = this.state;
    const { t } = this.props;

    if (!allCharacters) {
      return null;
    }
    return (
      <div className="characters panel panel-default">
        <div className="alert alert-info">{t('advices.no-characters-in-story')}</div>
        <table className="table table-bordered character-inventory-area">
          <thead>
            <tr>
              <th>{t('stories.name')}</th>
              <th>{t('stories.inventory')}</th>
              <th>{t('constant.active')}</th>
              <th>{t('constant.follower')}</th>
              <th>{t('constant.defensive')}</th>
              <th>{t('constant.passive')}</th>
            </tr>
          </thead>
          <tbody>
            {
              localCharacters.map((character, i) => (
                <tr>

                  <td className="character-name">{character.name}</td>
                  <td><input className="inventoryInput isStoryEditable form-control" value={character.inventory} /></td>
                  <td className="vertical-aligned-td active">
                    <input
                      className="isStoryEditable hidden"
                      type="checkbox"
                    />
                    <label
                      className="checkbox-label activity-icon-active fa-icon"
                    />

                  </td>
                  <td className="vertical-aligned-td follower">
                    <input
                      className="isStoryEditable hidden"
                      type="checkbox"
                    />
                    <label
                      className="checkbox-label activity-icon-follower fa-icon"
                    />

                  </td>
                  <td className="vertical-aligned-td defensive">
                    <input
                      className="isStoryEditable hidden"
                      type="checkbox"
                    />
                    <label
                      className="checkbox-label activity-icon-defensive fa-icon"
                    />

                  </td>
                  <td className="vertical-aligned-td passive">
                    <input
                      className="isStoryEditable hidden"
                      type="checkbox"
                    />
                    <label
                      className="checkbox-label activity-icon-passive fa-icon"
                    />

                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-default btn-reduced fa-icon replace character flex-0-0-auto isStoryEditable"
                      title={t('stories.replace-character')}
                    />
                    <button
                      type="button"
                      className="btn btn-default btn-reduced fa-icon remove character flex-0-0-auto isStoryEditable"
                      title={t('stories.remove-character')}
                    />
                  </td>
                </tr>
              ))

              //   function getCharacterInput(characterMeta, character) {
              //     const el = U.wrapEl('tr', U.qte(`${root} .story-character-row-tmpl`));
              //     L10n.localizeStatic(el);
              //     const qe = U.qee(el);

              //     U.addEl(qe('.character-name'), U.makeText(characterMeta.displayName));

              //     let input = qe('.inventoryInput');
              //     input.value = character.inventory;
              //     input.characterName = character.name;
              //     U.listen(input, 'change', updateCharacterInventory);

              //     Constants.characterActivityTypes.forEach((activityType) => {
              //         input = qe(`.${activityType} input`);
              //         if (character.activity[activityType]) {
              //             input.checked = true;
              //         }
              //         input.characterName = character.name;
              //         input.activityType = activityType;
              //         U.listen(input, 'change', onChangeCharacterActivity);
              //         U.setAttr(input, 'id', character.name + activityType);
              //         U.setAttr(qe(`.${activityType} label`), 'for', character.name + activityType);
              //     });

            //     U.listen(qe('.replace.character'), 'click', () => {
            //         state.switchCharacterDialog.characterName = character.name;
            //         state.switchCharacterDialog.showDlg();
            //     });
            //     U.listen(qe('.remove.character'), 'click', removeCharacter(character.name));
            //     return el;
            // }
            }
          </tbody>
        </table>
      </div>
    );
  }
}

Characters.propTypes = {
  // bla: PropTypes.string,
};

Characters.defaultProps = {
  // bla: 'test',
};

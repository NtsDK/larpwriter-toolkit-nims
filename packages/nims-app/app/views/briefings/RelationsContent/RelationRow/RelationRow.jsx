import React, { Component } from 'react';
import * as R from 'ramda';
import classNames from 'classnames';
import './RelationRow.css';
import { UI, U, L10n } from 'nims-app-core';
import { ConfirmDialog } from '../../../commons/uiCommon3.jsx';

export class RelationRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteRequest: false
    };
    this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
    this.onDeleteCancel = this.onDeleteCancel.bind(this);
    this.onDeleteRequest = this.onDeleteRequest.bind(this);
  }

  componentDidMount() {
    console.log('RelationRow mounted');
  }

  componentDidUpdate() {
    console.log('RelationRow did update');
  }

  componentWillUnmount() {
    console.log('RelationRow will unmount');
  }

  // makeNewRow = R.curry((
  //   profiles, getProfileItemSelect, isAdaptationsMode, knownCharacters, profileBindings,
  //   externalRefresh, fromCharacter, toCharacter, rel
  // ) => {

  //   const directText = tmplQe('.direct textarea');
  //   directText.value = rel[fromCharacter];
  //   U.setAttr(directText, 'placeholder', L10n.format('briefings', 'relation-from-to', [fromCharacter, toCharacter]));
  //   U.listen(directText, 'change', (event) => {
  //     DBMS.setCharacterRelationText({
  //       fromCharacter,
  //       toCharacter,
  //       character: fromCharacter,
  //       text: event.target.value
  //     }).catch(UI.handleError);
  //   });

  //   Constants.relationEssences.forEach((name) => {
  //     const btn = tmplQe(`.${name}`);
  //     $(btn).tooltip({
  //       title: L10n.format('briefings', `${name}`, [fromCharacter, toCharacter]),
  //       placement: 'top'
  //     });
  //     let attrName = name;
  //     if (rel.starter !== fromCharacter) {
  //       if (name === 'starterToEnder') attrName = 'enderToStarter';
  //       if (name === 'enderToStarter') attrName = 'starterToEnder';
  //     }
  //     U.setClassByCondition(btn, 'btn-primary', rel.essence.indexOf(attrName) !== -1);
  //     U.listen(btn, 'click', (event) => {
  //       DBMS.setRelationEssenceStatus({
  //         fromCharacter,
  //         toCharacter,
  //         essence: attrName,
  //         flag: !U.hasClass(event.target, 'btn-primary')
  //       }).then(() => {
  //         U.toggleClass(event.target, 'btn-primary');
  //       }).catch(UI.handleError);
  //     });
  //   });

  //   const originText = tmplQe('.origin textarea');
  //   originText.value = rel.origin;
  //   U.setAttr(originText, 'placeholder', l10n('relation-origin'));
  //   U.listen(originText, 'change', (event) => {
  //     DBMS.setOriginRelationText({
  //       fromCharacter,
  //       toCharacter,
  //       text: event.target.value
  //     }).catch(UI.handleError);
  //   });

  //   const reverseText = tmplQe('.reverse textarea');
  //   reverseText.value = rel[toCharacter];
  //   U.setAttr(reverseText, 'placeholder', L10n.format('briefings', 'relation-from-to', [toCharacter, fromCharacter]));
  //   U.listen(reverseText, 'change', (event) => {
  //     DBMS.setCharacterRelationText({
  //       fromCharacter,
  //       toCharacter,
  //       character: toCharacter,
  //       text: event.target.value
  //     }).catch(UI.handleError);
  //   });

  //   const directChecked = rel.starter === fromCharacter ? rel.starterTextReady : rel.enderTextReady;
  //   fillFinishedButton(
  //     tmplQe('.direct .finished'), JSON.stringify([fromCharacter, toCharacter]), fromCharacter,
  //     toCharacter, fromCharacter, directChecked, directText
  //   );

  //   const reverseChecked = rel.starter === toCharacter ? rel.starterTextReady : rel.enderTextReady;
  //   fillFinishedButton(
  //     tmplQe('.reverse .finished'), JSON.stringify([toCharacter, fromCharacter]), fromCharacter,
  //     toCharacter, toCharacter, reverseChecked, reverseText
  //   );

  //   if (!isAdaptationsMode) {
  //     U.removeClass(tmplQe('.direct'), 'col-xs-3');
  //     U.addClass(tmplQe('.direct'), 'col-xs-9');
  //     U.addClass(tmplQe('.origin'), 'hidden');
  //     U.addClass(tmplQe('.reverse'), 'hidden');
  //   }
  //   L10n.localizeStatic(row);

  //   return row;
  // });

  onDeleteConfirm() {
    const {
      fromCharacter, toCharacter, externalRefresh
    } = this.props;
    this.setState({
      showDeleteRequest: false
    });
    DBMS.removeCharacterRelation({ fromCharacter, toCharacter }).then(externalRefresh).catch(UI.handleError);
  }

  onDeleteCancel() {
    this.setState({
      showDeleteRequest: false
    });
  }

  onDeleteRequest() {
    this.setState({
      showDeleteRequest: true
    });
  }

  render() {
    const { showDeleteRequest } = this.state;
    const {
      t, profiles, selectedProfileItem, isAdaptationsMode, knownCharacters,
      profileBindings, fromCharacter, toCharacter, rel
    } = this.props;

    const stories = knownCharacters[toCharacter];

    //   const directText = tmplQe('.direct textarea');
    //   U.listen(directText, 'change', (event) => {
    //     DBMS.setCharacterRelationText({
    //       fromCharacter,
    //       toCharacter,
    //       character: fromCharacter,
    //       text: event.target.value
    //     }).catch(UI.handleError);
    //   });

    //   const originText = tmplQe('.origin textarea');
    //   U.listen(originText, 'change', (event) => {
    //     DBMS.setOriginRelationText({
    //       fromCharacter,
    //       toCharacter,
    //       text: event.target.value
    //     }).catch(UI.handleError);
    //   });

    //   const reverseText = tmplQe('.reverse textarea');
    //   U.listen(reverseText, 'change', (event) => {
    //     DBMS.setCharacterRelationText({
    //       fromCharacter,
    //       toCharacter,
    //       character: toCharacter,
    //       text: event.target.value
    //     }).catch(UI.handleError);
    //   });

    const directChecked = rel.starter === fromCharacter ? rel.starterTextReady : rel.enderTextReady;
    //   fillFinishedButton(
    //     tmplQe('.direct .finished'), JSON.stringify([fromCharacter, toCharacter]), fromCharacter,
    //     toCharacter, fromCharacter, directChecked, directText
    //   );

    const reverseChecked = rel.starter === toCharacter ? rel.starterTextReady : rel.enderTextReady;
    //   fillFinishedButton(
    //     tmplQe('.reverse .finished'), JSON.stringify([toCharacter, fromCharacter]), fromCharacter,
    //     toCharacter, toCharacter, reverseChecked, reverseText
    //   );

    // function fillFinishedButton(button, id, fromCharacter, toCharacter, character, checked, textarea) {
    //   U.setClassIf(button, 'btn-primary', checked);
    //   UI.enableEl(textarea, !checked);
    //   button.id = id;
    //   U.listen(button, 'click', (event) => {
    //     const newValue = !U.hasClass(button, 'btn-primary');
    //     U.setClassByCondition(button, 'btn-primary', newValue);
    //     UI.enableEl(textarea, !newValue);

    //     DBMS.setRelationReadyStatus({
    //       fromCharacter,
    //       toCharacter,
    //       character,
    //       ready: newValue
    //     }).catch(UI.handleError);
    //   });
    // }

    return (
      <div className="RelationRow row">
        <div className="to-character-data col-xs-3">
          <h4 className="to-character-name">{`${toCharacter}/${profileBindings[toCharacter]}`}</h4>
          <div>
            <div className="where-meets-label bold-cursive">{t('briefings.where-meets')}</div>
            <div className="where-meets-content">{stories === undefined ? '' : R.keys(stories).join(', ')}</div>
          </div>
          <div toCharacter={toCharacter}>
            <div className="profile-item-name bold-cursive">{selectedProfileItem}</div>
            <div className="profile-item-value">{String(profiles[toCharacter][selectedProfileItem])}</div>
          </div>
          <div>
            <button type="button" className="btn btn-default fa-icon remove" onClick={this.onDeleteRequest} />
            <ConfirmDialog
              show={showDeleteRequest}
              title={t('briefings.deleteRelationTitle')}
              message={t('briefings.are-you-sure-about-relation-removing2', { relationName: `${fromCharacter}-${toCharacter}` })}
              onConfirm={this.onDeleteConfirm}
              onCancel={this.onDeleteCancel}
            />
          </div>
        </div>
        <div className={classNames('direct text-column', isAdaptationsMode ? 'col-xs-3' : 'col-xs-9')}>
          <div className="pre-text-area">
            <button type="button" className="btn btn-default fa-icon finished" title={t('constant.finishedText')} />
          </div>
          <textarea
            className="briefing-relation-area form-control"
            value={rel[fromCharacter]}
            placeholder={t('briefings.relation-from-to2', { fromCharacter, toCharacter })}
          />
        </div>
        {
          isAdaptationsMode
          && (
            <>
              <div className="origin text-column col-xs-3">
                <div className="pre-text-area btn-group">
                  <button type="button" className="btn btn-default fa-icon starterToEnder" />
                  <button type="button" className="btn btn-default fa-icon allies" />
                  <button type="button" className="btn btn-default fa-icon enderToStarter" />
                </div>
                <textarea
                  value={rel.origin}
                  className="briefing-relation-area form-control"
                  placeholder={t('briefings.relation-origin')}
                />
              </div>
              <div className="reverse text-column col-xs-3">
                <div className="pre-text-area">
                  <button type="button" className="btn btn-default fa-icon finished" title={t('constant.finishedText')} />
                </div>
                <textarea
                  value={rel[toCharacter]}
                  className="briefing-relation-area form-control"
                  placeholder={t('briefings.relation-from-to2', { fromCharacter: toCharacter, toCharacter: fromCharacter })}
                />
              </div>
            </>
          )
        }
      </div>
    );
  }
}

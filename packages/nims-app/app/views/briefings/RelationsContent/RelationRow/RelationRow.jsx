import React, { Component } from 'react';
import * as R from 'ramda';
import classNames from 'classnames';
import './RelationRow.css';
import { UI, U, L10n } from 'nims-app-core';
import Tooltip from 'react-bootstrap/es/Tooltip';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, ToggleButton } from '../../../commons/uiCommon3.jsx';

export class RelationRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteRequest: false,
      directChecked: false,
      reverseChecked: false,
      essence: []
    };
    this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
    this.onDeleteCancel = this.onDeleteCancel.bind(this);
    this.onDeleteRequest = this.onDeleteRequest.bind(this);
    this.setCharacterRelationText = this.setCharacterRelationText.bind(this);
    this.setOriginRelationText = this.setOriginRelationText.bind(this);
    this.onFinishChange = this.onFinishChange.bind(this);
    this.onEssenceChange = this.onEssenceChange.bind(this);
  }

  componentDidMount() {
    this.updateFinishState();
    console.log('RelationRow mounted');
  }

  componentDidUpdate(prevProps) {
    const { fromCharacter, toCharacter, rel } = this.props;
    if (fromCharacter !== prevProps.fromCharacter
      || toCharacter !== prevProps.toCharacter
      || rel !== prevProps.rel
    ) {
      this.updateFinishState();
    }
    console.log('RelationRow did update');
  }

  componentWillUnmount() {
    console.log('RelationRow will unmount');
  }

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

  setCharacterRelationText(e) {
    const {
      fromCharacter, toCharacter
    } = this.props;
    const { character } = e.target.dataset;
    DBMS.setCharacterRelationText({
      fromCharacter,
      toCharacter,
      character,
      text: e.target.value
    }).catch(UI.handleError);
  }

  setOriginRelationText(e) {
    const {
      fromCharacter, toCharacter
    } = this.props;
    DBMS.setOriginRelationText({
      fromCharacter,
      toCharacter,
      text: e.target.value
    }).catch(UI.handleError);
  }

  updateFinishState() {
    const {
      fromCharacter, toCharacter, rel
    } = this.props;
    if (!rel || !fromCharacter || !toCharacter) {
      return;
    }

    const directChecked = rel.starter === fromCharacter ? rel.starterTextReady : rel.enderTextReady;
    const reverseChecked = rel.starter === toCharacter ? rel.starterTextReady : rel.enderTextReady;
    this.setState({
      directChecked,
      reverseChecked,
      essence: [...rel.essence]
    });
  }

  onFinishChange(e) {
    const {
      fromCharacter, toCharacter
    } = this.props;
    const { checked } = e.target;
    const { prop, character } = e.target.dataset;
    this.setState({
      [prop]: checked
    });
    DBMS.setRelationReadyStatus({
      fromCharacter,
      toCharacter,
      character,
      ready: checked
    }).catch(UI.handleError);
  }

  getTooltip(essenceName) {
    const {
      t, fromCharacter, toCharacter
    } = this.props;
    return (
      <Tooltip id={essenceName}>
        {t(`briefings.${essenceName}2`, { fromCharacter, toCharacter })}
      </Tooltip>
    );
  }

  onEssenceChange(e) {
    const {
      fromCharacter, toCharacter
    } = this.props;
    const { checked } = e.target;
    const { attrName } = e.target.dataset;
    DBMS.setRelationEssenceStatus({
      fromCharacter,
      toCharacter,
      essence: attrName,
      flag: checked
    }).then(() => {
      this.setState((prevState) => ({
        essence: checked ? [...prevState.essence, attrName] : [...prevState.essence].filter((el) => attrName !== el)
      }));
    }).catch(UI.handleError);
  }

  render() {
    const {
      showDeleteRequest, directChecked, reverseChecked, essence
    } = this.state;
    const {
      t, profiles, selectedProfileItem, isAdaptationsMode, knownCharacters,
      profileBindings, fromCharacter, toCharacter, rel
    } = this.props;

    const stories = knownCharacters[toCharacter];

    const isDirectRel = rel.starter !== fromCharacter;

    return (
      <div className="RelationRow row">
        <div className="to-character-data col-xs-3">
          <h4 className="to-character-name">{`${toCharacter}/${profileBindings[toCharacter]}`}</h4>
          <div>
            <div className="where-meets-label bold-cursive">{t('briefings.where-meets')}</div>
            <div className="where-meets-content">{stories === undefined ? '' : R.keys(stories).join(', ')}</div>
          </div>
          <div>
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
            <ToggleButton
              type="checkbox"
              checked={directChecked}
              title={t('constant.finishedText')}
              onChange={this.onFinishChange}
              className="finished"
              data={{
                prop: 'directChecked',
                character: fromCharacter
              }}
            />
          </div>
          <textarea
            className="briefing-relation-area form-control"
            defaultValue={rel[fromCharacter]}
            placeholder={t('briefings.relation-from-to2', { fromCharacter, toCharacter })}
            data-character={fromCharacter}
            onChange={this.setCharacterRelationText}
            readOnly={directChecked}
          />
        </div>
        {
          isAdaptationsMode
          && (
            <>
              <div className="origin text-column col-xs-3">
                <div className="pre-text-area btn-group">
                  <ToggleButton
                    type="checkbox"
                    checked={essence.includes(isDirectRel ? 'starterToEnder' : 'enderToStarter')}
                    className="starterToEnder"
                    tooltip={this.getTooltip('starterToEnder')}
                    data={{ 'attr-name': isDirectRel ? 'starterToEnder' : 'enderToStarter' }}
                    onChange={this.onEssenceChange}
                  />
                  <ToggleButton
                    type="checkbox"
                    checked={essence.includes('allies')}
                    className="allies"
                    tooltip={this.getTooltip('allies')}
                    data={{ 'attr-name': 'allies' }}
                    onChange={this.onEssenceChange}
                  />
                  <ToggleButton
                    type="checkbox"
                    checked={essence.includes(isDirectRel ? 'enderToStarter' : 'starterToEnder')}
                    className="enderToStarter"
                    tooltip={this.getTooltip('enderToStarter')}
                    data={{ 'attr-name': isDirectRel ? 'enderToStarter' : 'starterToEnder' }}
                    onChange={this.onEssenceChange}
                  />
                </div>
                <textarea
                  defaultValue={rel.origin}
                  className="briefing-relation-area form-control"
                  placeholder={t('briefings.relation-origin')}
                  onChange={this.setOriginRelationText}
                />
              </div>
              <div className="reverse text-column col-xs-3">
                <div className="pre-text-area">
                  <ToggleButton
                    type="checkbox"
                    checked={reverseChecked}
                    title={t('constant.finishedText')}
                    onChange={this.onFinishChange}
                    className="finished"
                    data={{
                      prop: 'reverseChecked',
                      character: toCharacter
                    }}
                  />
                </div>
                <textarea
                  defaultValue={rel[toCharacter]}
                  className="briefing-relation-area form-control"
                  placeholder={t('briefings.relation-from-to2', { fromCharacter: toCharacter, toCharacter: fromCharacter })}
                  data-character={toCharacter}
                  onChange={this.setCharacterRelationText}
                  readOnly={reverseChecked}
                />
              </div>
            </>
          )
        }
      </div>
    );
  }
}

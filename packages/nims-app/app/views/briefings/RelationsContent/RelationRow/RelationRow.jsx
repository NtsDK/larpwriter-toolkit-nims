import React, { Component } from 'react';
import * as R from 'ramda';
import classNames from 'classnames';
import './RelationRow.css';
import { UI, U, L10n } from 'nims-app-core';
import Tooltip from 'react-bootstrap/es/Tooltip';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../commons/uiCommon3.jsx';

const tooltip = (
  <Tooltip id="tooltip">
    <strong>Holy guacamole!</strong>
    {' '}
    Check this info.
  </Tooltip>
);

function ToggleButton(props) {
  const {
    checked, onChange, title, icon, data, tooltip, ...elementProps
  } = props;
  const dataAttrs = {};
  if (data) {
    R.keys(data).forEach((name) => (dataAttrs[`data-${name}`] = data[name]));
  }

  const body = (
    <label
      // need this to use OverlayTrigger. Otherwise it doesn't work
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
      className={classNames('btn btn-default fa-icon', icon, { 'btn-primary': checked })}
      title={title}
    >
      <input
        type="checkbox"
        checked={checked}
        autoComplete="off"
        // className="sr-only"
        className="tw-hidden"
        onChange={onChange}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...dataAttrs}
        // data-prop="directChecked"
        // data-character={fromCharacter}
      />
    </label>
  );

  // return body;

  // by unknown reason OverlayTrigger
  return tooltip ? (
    <OverlayTrigger placement="top" overlay={tooltip}>
      {body}
      {/* <label
        className={classNames('btn btn-default fa-icon', icon, { 'btn-primary': checked })}
        title={title}
      >
        <input
          type="checkbox"
          checked={checked}
          autoComplete="off"
          // className="sr-only"
          className="tw-hidden"
          onChange={onChange}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...dataAttrs}
        />
      </label> */}

    </OverlayTrigger>
  ) : body;

  // // const { t } = useTranslation();
  // return (
  // );
}

export class RelationRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteRequest: false,
      directChecked: false,
      reverseChecked: false
    };
    this.onDeleteConfirm = this.onDeleteConfirm.bind(this);
    this.onDeleteCancel = this.onDeleteCancel.bind(this);
    this.onDeleteRequest = this.onDeleteRequest.bind(this);
    this.setCharacterRelationText = this.setCharacterRelationText.bind(this);
    this.setOriginRelationText = this.setOriginRelationText.bind(this);
    this.onFinishChange = this.onFinishChange.bind(this);
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
      // this.setState(R.clone(emptyState));
      // this.refresh();
    }
    console.log('RelationRow did update');
  }

  componentWillUnmount() {
    console.log('RelationRow will unmount');
  }

  // makeNewRow = R.curry((
  //   profiles, getProfileItemSelect, isAdaptationsMode, knownCharacters, profileBindings,
  //   externalRefresh, fromCharacter, toCharacter, rel
  // ) => {

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
      reverseChecked
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

  // const positionerInstance = (
  //   <ButtonToolbar>
  //     <OverlayTrigger placement="left" overlay={tooltip}>
  //       <Button bsStyle="default">Holy guacamole!</Button>
  //     </OverlayTrigger>

  render() {
    const { showDeleteRequest, directChecked, reverseChecked } = this.state;
    const {
      t, profiles, selectedProfileItem, isAdaptationsMode, knownCharacters,
      profileBindings, fromCharacter, toCharacter, rel
    } = this.props;

    const stories = knownCharacters[toCharacter];

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
              checked={directChecked}
              title={t('constant.finishedText')}
              onChange={this.onFinishChange}
              icon="finished"
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
                  <button type="button" className="btn btn-default fa-icon starterToEnder" />
                  <button type="button" className="btn btn-default fa-icon allies" />
                  <button type="button" className="btn btn-default fa-icon enderToStarter" />
                </div>
                <div className="pre-text-area btn-group">
                  {/* exports.relationEssences = ['starterToEnder', 'allies', 'enderToStarter']; */}

                  {/* <OverlayTrigger  */}
                  {/* <OverlayTrigger placement="top" overlay={this.getTooltip('starterToEnder')}> */}

                  {/* <ToggleButton checked={false} icon="starterToEnder" tooltip={tooltip} /> */}
                  <ToggleButton checked={false} icon="starterToEnder" tooltip={this.getTooltip('starterToEnder')} />
                  {/* <OverlayTrigger placement="top" overlay={tooltip}> */}
                  <ToggleButton checked={false} icon="allies" />
                  {/* </OverlayTrigger> */}

                  <ToggleButton checked={false} icon="enderToStarter" />
                  {/* //   Constants.relationEssences.forEach((name) => {
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
  //   }); */}

                  {/* <button type="button" className="btn btn-default fa-icon starterToEnder" />
                  <button type="button" className="btn btn-default fa-icon allies" />
                  <button type="button" className="btn btn-default fa-icon enderToStarter" /> */}
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
                    checked={reverseChecked}
                    title={t('constant.finishedText')}
                    onChange={this.onFinishChange}
                    icon="finished"
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

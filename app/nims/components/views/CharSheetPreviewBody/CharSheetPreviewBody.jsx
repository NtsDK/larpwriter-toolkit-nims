import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './CharSheetPreviewBody.css';

import {
  Redirect
} from 'react-router-dom';

import EntitySelect from '../../util/EntitySelect';
import PreviewCharProfile from './PreviewCharProfile';
import PreviewPlayerProfile from './PreviewPlayerProfile';
import Inventory from './Inventory';
import Groups from './Groups';

import RelationsBody from '../RelationsBody';
import PreviewStories from './PreviewStories';
import PreviewEvents from './PreviewEvents';


export default class CharSheetPreviewBody extends Component {
  state = {
    redirect: false,
    charNames: null,
    to: null
  };

  componentDidMount = () => {
    console.log('CharSheetPreviewBody mounted');
    this.getStateInfo();
  }

  componentDidUpdate = (prevProps, prevState) => {
    console.log('CharSheetPreviewBody did update');
    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.redirect !== prevState.redirect) {
      this.setState({
        redirect: false
      });
    }
  }

  componentWillUnmount = () => {
    console.log('CharSheetPreviewBody will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }),
    ]).then((results) => {
      const [charNames] = results;
      charNames.sort(CU.charOrdA);
      this.setState({
        charNames
      });
    });
  }

  onCharacterChange = (event) => {
    const {
      tab1, tab2
    } = this.props;
    const { value } = event.target;
    this.setState({
      redirect: true,
      to: `/characterSheets/preview/${value}`
    });
    console.log(event.target.value);
  }

  render() {
    const { charNames, redirect, to } = this.state;
    const { t, id, dbms } = this.props;


    if (!charNames) {
      // return <div> CharSheetPreviewBody stub </div>;
      return null;
    }

    if (redirect) {
      return <Redirect to={to} />;
    }

    return (
      <div id="briefingPreviewDiv" className="char-sheet-preview ">
        <div className="flex-row">
          <div className="flex-1-1-auto data-area">

            <div className="panel panel-default">
              <div className="panel-heading">
                {/* <select id="briefingCharacter" className="common-select" /> */}
                <EntitySelect names={charNames} id={id} onChange={this.onCharacterChange} />
              </div>
              <div className="panel-body">
                <div className="flex-row">
                  <div className="flex-0-0-auto settings-group">
                    <div>
                      <input type="radio" name="tabMode" value="adaptations" id="adaptationsModeRadio" className="hidden" />
                      <label htmlFor="adaptationsModeRadio" className="radio-label-icon common-radio">
                        <span>{t('briefings.adaptations-mode')}</span>
                      </label>
                    </div>
                    <div>
                      <input type="radio" name="tabMode" value="proofreading" id="proofreadingModeRadio" className="hidden" />
                      <label htmlFor="proofreadingModeRadio" className="radio-label-icon common-radio">
                        <span>{t('briefings.proofreading-mode')}</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex-0-0-auto settings-group">
                    <div>
                      <input type="radio" name="eventsGroupBy" value="story" id="eventGroupingByStoryRadio" className="hidden" />
                      <label htmlFor="eventGroupingByStoryRadio" className="radio-label-icon common-radio">
                        <span>{t('briefings.group-by-story')}</span>
                      </label>
                    </div>
                    <div>
                      <input type="radio" name="eventsGroupBy" value="time" id="eventGroupingByTimeRadio" className="hidden" />
                      <label htmlFor="eventGroupingByTimeRadio" className="radio-label-icon common-radio">
                        <span>{t('briefings.sort-by-timeline')}</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex-0-0-auto">
                    <div>
                      <input type="checkbox" id="hideAllPanelsCheckbox" className="hidden" />
                      <label htmlFor="hideAllPanelsCheckbox" className="checkbox-label-icon common-checkbox">
                        <span>{t('briefings.hide-all-panels')}</span>
                      </label>
                    </div>
                    <div>
                      <input type="checkbox" id="disableHeadersCheckbox" className="hidden" />
                      <label htmlFor="disableHeadersCheckbox" className="checkbox-label-icon common-checkbox">
                        <span>{t('briefings.disable-headers')}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="briefingContent">
              <PreviewEvents id={id} dbms={dbms} />
              <PreviewStories id={id} dbms={dbms} />
              <RelationsBody id={id} dbms={dbms} />
              <Groups id={id} dbms={dbms} />
              <Inventory id={id} dbms={dbms} />
              <PreviewPlayerProfile charId={id} dbms={dbms} />
              <PreviewCharProfile id={id} dbms={dbms} />
            </div>
          </div>
        </div>

      </div>
    );
  }
}

CharSheetPreviewBody.propTypes = {
  // bla: PropTypes.string,
};

CharSheetPreviewBody.defaultProps = {
  // bla: 'test',
};

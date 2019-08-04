import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './CharSheetExport.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';

import AdvancedDocxExport from './AdvancedDocxExport';
import SimpleExport from './SimpleExport';
import AdvancedTextExport from './AdvancedTextExport';

export default class CharSheetExport extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('CharSheetExport mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('CharSheetExport did update');
  }

  componentWillUnmount = () => {
    console.log('CharSheetExport will unmount');
  }

  // getStateInfo = () => {
  //   const { dbms } = this.props;
  //   Promise.all([
  //     dbms.getSomething(),
  //   ]).then((results) => {
  //     const [something] = results;
  //     this.setState({
  //       something
  //     });
  //   });
  // }

  render() {
    const { something } = this.state;
    const { t, dbms } = this.props;

    // if (!something) {
    //   return <div> CharSheetExport stub </div>;
    //   // return null;
    // }
    return (
      <div className="CharSheetExport block">
        <Route path="/characterSheets/export" render={() => <Redirect to="/characterSheets/export/simple" />} exact />

        <div className="panel panel-default">
          <div className="panel-heading">
            {/* <a href="#" panel-toggler=".briefing-export-tab div.export-panel-body"> */}
            <h3 className="panel-title">{t('briefings.export-settings')}</h3>
            {/* </a> */}
          </div>
          <div className="panel-body export-panel-body flex-row">

            <fieldset className="margin-right-16">
              <legend>{t('briefings.export-mode')}</legend>
              <div>
                <input type="checkbox" id="toSeparateFileCheckbox" className="hidden" />
                <label htmlFor="toSeparateFileCheckbox" className="checkbox-label-icon common-checkbox">
                  <span>{t('briefings.each-briefing-to-own-file')}</span>

                </label>
              </div>
              <div>
                <input type="checkbox" id="exportOnlyFinishedStories" className="hidden" />
                <label htmlFor="exportOnlyFinishedStories" className="checkbox-label-icon common-checkbox">
                  <span>{t('briefings.export-only-finished-stories')}</span>

                </label>
              </div>
            </fieldset>

            <fieldset className="margin-right-16">
              <legend>{t('briefings.briefing-selection')}</legend>
              <div className="flex-row">
                <div className="flex-0-0-auto margin-right-16">
                  <div>
                    <input type="radio" name="exportCharacterSelection" id="exportAllCharacters" className="hidden" />
                    <label htmlFor="exportAllCharacters" className="radio-label-icon common-radio">
                      <span>{t('briefings.print-all')}</span>
                    </label>
                  </div>
                  <div>
                    <input type="radio" name="exportCharacterSelection" id="exportCharacterRange" className="hidden" />
                    <label htmlFor="exportCharacterRange" className="radio-label-icon common-radio">
                      <span>{t('briefings.print-partly')}</span>

                    </label>
                  </div>
                  <div>
                    <input type="radio" name="exportCharacterSelection" id="exportCharacterSet" className="hidden" />
                    <label htmlFor="exportCharacterSet" className="radio-label-icon common-radio">
                      <span>{t('briefings.exact-character-select')}</span>

                    </label>
                  </div>
                </div>
                <div className="flex-0-0-auto">
                  <div id="characterRangeSelect" className="hidden">
                    <div>
                      <span>{t('briefings.briefings-amount')}</span>
                      <select id="briefingNumberSelector" className="form-control" />
                    </div>
                    <div>
                      <span className="display-block">{t('briefings.briefings-range')}</span>
                      <select id="briefingIntervalSelector" className="form-control common-select" />
                    </div>
                  </div>
                  <div id="characterSetSelect" className="hidden">
                    <input selector-filter="#characterSetSelector" />
                    <select id="characterSetSelector" multiple size="15" className="form-control" />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>{t('briefings.story-selection')}</legend>
              <div className="flex-row">
                <div className="flex-0-0-auto margin-right-16">
                  <div>
                    <input type="radio" name="exportStorySelection" value="all" id="exportAllStories" className="hidden" />
                    <label htmlFor="exportAllStories" className="radio-label-icon common-radio">
                      <span>{t('briefings.export-all-stories')}</span>

                    </label>
                  </div>
                  <div>
                    <input type="radio" name="exportStorySelection" value="multiple" id="exportStorySet" className="hidden" />
                    <label htmlFor="exportStorySet" className="radio-label-icon common-radio">
                      <span>{t('briefings.exact-story-select')}</span>

                    </label>
                  </div>
                </div>
                <div className="flex-0-0-auto">
                  <div id="storySetSelect" className="hidden">
                    <input selector-filter="#storySetSelector" />
                    <select id="storySetSelector" multiple size="15" className="form-control" />
                  </div>
                </div>
              </div>

            </fieldset>
          </div>
        </div>

        <nav className="view-switch stories-nav">
          <ul>
            <li>
              <NavLink to="/characterSheets/export/simple">{t('header.simple-export')}</NavLink>
            </li>
            <li>
              <NavLink to="/characterSheets/export/advancedDocx">{t('header.advanced-docx-export')}</NavLink>
            </li>
            <li>
              <NavLink to="/characterSheets/export/advancedTxt">{t('header.advanced-txt-export')}</NavLink>
            </li>
          </ul>
        </nav>
        <div className="panel panel-default">
          <div className="panel-body">
            <Switch>
              <Route path="/characterSheets/export/simple" render={() => <SimpleExport dbms={dbms} />} />
              <Route path="/characterSheets/export/advancedDocx" render={() => <AdvancedDocxExport dbms={dbms} />} />
              <Route path="/characterSheets/export/advancedTxt" render={() => <AdvancedTextExport dbms={dbms} />} />
            </Switch>
            <h3>{t('briefings.export-status')}</h3>
            <div id="exportStatus" />
          </div>
        </div>

      </div>
    );

    //   <div id="advancedTextExportContainer" class="exportContainer container-fluid">
    //     <div class="row">
    //       <div class="col-xs-2">
    //         <div class="margin-bottom-16">
    //           <button class="btn btn-default btn-reduced white-space-normal" id="previewTextOutput" l10n-id="briefings-preview"></button>
    //           <button class="btn btn-default btn-reduced white-space-normal" id="showRawData" l10n-id="briefings-raw-data"></button>
    //           <button class="btn btn-default btn-reduced white-space-normal" id="convertToDocxTemplate" l10n-id="briefings-convert-to-docx-template"></button>
    //           <button class="btn btn-default btn-reduced white-space-normal" id="generateByDocxTemplate" l10n-id="briefings-generate-by-docx-template"></button>
    //           <button class="btn btn-default btn-reduced white-space-normal" id="makeCustomTextBriefings" l10n-id="briefings-export"></button>
    //           <button class="btn btn-default btn-reduced white-space-normal" id="makeMarkdownBriefings" l10n-id="briefings-markdown-export"></button>
    //         </div>
    //         <div>
    //           <label l10n-id="briefings-enter-text-file-type"></label>
    //           <input id="textTypeSelector" value="txt" class="form-control"/>
    //         </div>
    //       </div>
    //       <div class="col-xs-5">
    //         <div>
    //           <h3 l10n-id="briefings-template"></h3>
    //           <textarea id="templateArea" class="form-control"></textarea>
    //         </div>
    //       </div>
    //       <div class="col-xs-5">
    //         <h3 l10n-id="briefings-exported-text"></h3>
    //         <textarea id="textBriefingPreviewArea" class="form-control"></textarea>
    //       </div>
    //     </div>
    //   </div>
  }
}

CharSheetExport.propTypes = {
  // bla: PropTypes.string,
};

CharSheetExport.defaultProps = {
  // bla: 'test',
};

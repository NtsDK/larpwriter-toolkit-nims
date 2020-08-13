import React, { Component, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import classNames from 'classnames';
import Highlight from 'react-highlighter';
import './TextSearch.css';
import { PanelCore } from '../../commons/uiCommon3';

const searchAreas = [{
  value: 'characterProfiles',
  id: 'characterProfilesTextSearch',
  label: 'text-search.characterProfiles'
}, {
  value: 'playerProfiles',
  id: 'playerProfilesTextSearch',
  label: 'text-search.playerProfiles'
}, {
  value: 'groups',
  id: 'groupsTextSearch',
  label: 'text-search.groups'
}, {
  value: 'relations',
  id: 'relationsTextSearch',
  label: 'text-search.relations'
}, {
  value: 'writerStory',
  id: 'writerStoryTextSearch',
  label: 'text-search.writerStory'
}, {
  value: 'eventOrigins',
  id: 'eventOriginsTextSearch',
  label: 'text-search.eventOrigins'
}, {
  value: 'eventAdaptations',
  id: 'eventAdaptationsTextSearch',
  label: 'text-search.eventAdaptations'
}];

export class TextSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      texts: [],
      searchStr: '',
      caseSensitive: false
    };
    this.onSubmit = this.onSubmit.bind(this);
    // this.onCaseSensitiveChange = this.onCaseSensitiveChange.bind(this);
    // this.onSearchChange = this.onSearchChange.bind(this);
  }

  componentDidMount() {
    console.log('TextSearch mounted');
  }

  componentDidUpdate() {
    console.log('TextSearch did update');
  }

  componentWillUnmount() {
    console.log('TextSearch will unmount');
  }

  // onCaseSensitiveChange(e) {
  //   this.setState({
  //     caseSensitive: e.target.checked
  //   });
  // }

  // onSearchChange(e) {
  //   this.setState({
  //     searchStr: e.target.value
  //   });
  // }

  onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const textTypes = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [name, value] of formData) {
      if (name === 'searchString' || name === 'caseSensitiveTextSearch') {
        // eslint-disable-next-line no-continue
        continue;
      }
      textTypes.push(value);
    }
    const formData2 = {
      searchStr: formData.get('searchString'),
      textTypes,
      caseSensitive: !!formData.get('caseSensitiveTextSearch'),
    };
    this.setState({
      searchStr: formData.get('searchString'),
      caseSensitive: !!formData.get('caseSensitiveTextSearch')
    });
    console.log(formData2);
    this.findTexts(formData2);
  }

  findTexts(params) {
    DBMS.getTexts(params).then((texts) => {
      console.log(texts);
      texts.forEach((textsInfo) => textsInfo.result.sort(CU.charOrdAFactory(R.prop('name'))));
      this.setState({
        texts
      });
    }).catch(UI.handleError);
  }

  render() {
    const { texts, searchStr, caseSensitive } = this.state;
    const { t } = this.props;

    return (
      <div className="TextSearch text-search-tab block">
        <div className="flex-row">
          <div className="settings-panel">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">{t('text-search.search')}</h3>
              </div>
              <div className="panel-body panel-resizable">
                <form onSubmit={this.onSubmit}>
                  <div className="margin-bottom-8">
                    <input
                      className="text-search-input form-control"
                      name="searchString"
                      placeholder={t('text-search.enter-search-string')}
                      // onChange={this.onSearchChange}
                    />
                  </div>

                  <div className="margin-bottom-16">
                    {
                      searchAreas.map((searchArea) => (
                        <div key={searchArea.id}>
                          <input
                            type="checkbox"
                            className="textSearchTypeRadio hidden"
                            value={searchArea.value}
                            id={searchArea.id}
                            name={searchArea.id}
                            // checked="true"
                          />
                          <label htmlFor={searchArea.id} className="checkbox-label-icon common-checkbox">
                            <span>{t(searchArea.label)}</span>
                          </label>
                        </div>
                      ))
                    }
                  </div>

                  <div className="margin-bottom-16">
                    <input
                      type="checkbox"
                      className="hidden"
                      value="caseSensitive"
                      id="caseSensitiveTextSearch"
                      name="caseSensitiveTextSearch"
                      // checked={caseSensitive}
                      // onChange={this.onCaseSensitiveChange}
                    />
                    <label htmlFor="caseSensitiveTextSearch" className="checkbox-label-icon common-checkbox">
                      <span>{t('text-search.case-sensitive-search')}</span>
                    </label>
                  </div>
                  <button type="submit" className="text-search-button btn btn-default">{t('text-search.find')}</button>
                </form>
              </div>
            </div>
          </div>
          <div className="result-panel">
            {
              texts.map((textsInfo) => (
                <PanelCore initExpanded={false} title={`${t(`text-search.${textsInfo.textType}`)} (${textsInfo.result.length})`}>
                  {
                    textsInfo.result.map((textInfo) => (
                      <div className="text-card">
                        <div>{textInfo.name}</div>
                        <div className={textInfo.type === 'text' ? 'text-body' : 'string-body'}>
                          <Highlight search={searchStr} caseSensitive={caseSensitive} matchClass="tw-p-0 tw-bg-green-600 tw-text-white">
                            {textInfo.text}
                          </Highlight>
                        </div>
                      </div>
                    ))
                  }
                </PanelCore>
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}

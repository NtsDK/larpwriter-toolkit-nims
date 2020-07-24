import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import './TextSearch.css';

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

function PanelCore(props) {
  const { title, children } = props;
  return (
    <div className="panel panel-default">
      <button type="button" className="panel-heading">
        <span className="panel-title">{title}</span>
      </button>
      <div className="panel-body">
        {children}
      </div>
    </div>
  );
}

// export const makePanelCore = (title, content) => {
//   const panel = U.addClasses(U.makeEl('div'), ['panel', 'panel-default']);
//   const h3 = U.addClass(U.addEl(U.makeEl('h3'), title), 'panel-title');
//   const a = U.setAttr(U.makeEl('a'), 'href', '#/');
//   U.setAttr(a, 'panel-toggler', '');
//   const headDiv = U.addClass(U.makeEl('div'), 'panel-heading');
//   U.addEl(panel, U.addEl(headDiv, U.addEl(a, h3)));
//   const contentDiv = U.addClass(U.makeEl('div'), 'panel-body');
//   U.addEl(panel, U.addEl(contentDiv, content));
//   return {
//     panel,
//     contentDiv,
//     a
//   };
// };

export class TextSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      texts: []
    };
    this.onSubmit = this.onSubmit.bind(this);
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
    console.log(formData2);
    this.findTexts(formData2);
  }

  findTexts(params) {
    // const selectedTextTypes = U.queryElEls(U.queryEl(root), `${root}.textSearchTypeRadio`)
    //   .filter((el) => el.checked).map((el) => el.value);
    // const searchStr = U.queryEl(`${root}.text-search-input`).value;
    // const caseSensitive = U.queryEl('#caseSensitiveTextSearch').checked;
    DBMS.getTexts(params).then((texts) => {
      console.log(texts);
      texts.forEach((textsInfo) => textsInfo.result.sort(CU.charOrdAFactory(R.prop('name'))));
      this.setState({
        texts
      });
      // const text2panel = (text) => makePanel(
      //   U.makeText(`${this.L10nObj.getValue(`text-search-${text.textType}`)} (${text.result.length})`),
      //   makePanelContent(text, searchStr, caseSensitive)
      // );
      // U.addEls(U.clearEl(U.queryEl(`${root}.result-panel`)), texts.map(text2panel));
    }).catch(UI.handleError);
  }

  render() {
    const { texts } = this.state;
    const { t } = this.props;

    // if (!something) {
    //   return <div> TextSearch stub </div>;
    //   // return null;
    // }

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
                    <input className="text-search-input form-control" name="searchString" placeholder={t('text-search.enter-search-string')} />
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
                            checked="true"
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
              texts.map((text) => (
                <PanelCore title={`${t(`text-search.${text.textType}`)} (${text.result.length})`}>
                  123
                </PanelCore>
              ))
            }

            {/* // const text2panel = (text) => makePanel(
      //   U.makeText(`${this.L10nObj.getValue(`text-search-${text.textType}`)} (${text.result.length})`),
      //   makePanelContent(text, searchStr, caseSensitive)
      // );
      // U.addEls(U.clearEl(U.queryEl(`${root}.result-panel`)), texts.map(text2panel)); */}

          </div>
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './AdvancedTextExport.css';

export default class AdvancedTextExport extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('AdvancedTextExport mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('AdvancedTextExport did update');
  }

  componentWillUnmount = () => {
    console.log('AdvancedTextExport will unmount');
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
    const { t } = this.props;

    return (
      <div className="AdvancedTextExport exportContainer container-fluid">
        <div className="row">
          <div className="col-xs-2">
            <div className="margin-bottom-16">
              <button type="button" className="btn btn-default btn-reduced white-space-normal" id="previewTextOutput">{t('briefings.preview')}</button>
              <button type="button" className="btn btn-default btn-reduced white-space-normal" id="showRawData">{t('briefings.raw-data')}</button>
              <button type="button" className="btn btn-default btn-reduced white-space-normal" id="convertToDocxTemplate">{t('briefings.convert-to-docx-template')}</button>
              <button type="button" className="btn btn-default btn-reduced white-space-normal" id="generateByDocxTemplate">{t('briefings.generate-by-docx-template')}</button>
              <button type="button" className="btn btn-default btn-reduced white-space-normal" id="makeCustomTextBriefings">{t('briefings.export')}</button>
              <button type="button" className="btn btn-default btn-reduced white-space-normal" id="makeMarkdownBriefings">{t('briefings.markdown-export')}</button>
            </div>
            <div>
              <label>{t('briefings.enter-text-file-type')}</label>
              <input id="textTypeSelector" value="txt" className="form-control" />
            </div>
          </div>
          <div className="col-xs-5">
            <div>
              <h3>{t('briefings.template')}</h3>
              <textarea id="templateArea" className="form-control" />
            </div>
          </div>
          <div className="col-xs-5">
            <h3>{t('briefings.exported-text')}</h3>
            <textarea id="textBriefingPreviewArea" className="form-control" />
          </div>
        </div>
      </div>
    );
  }
}

AdvancedTextExport.propTypes = {
  // bla: PropTypes.string,
};

AdvancedTextExport.defaultProps = {
  // bla: 'test',
};

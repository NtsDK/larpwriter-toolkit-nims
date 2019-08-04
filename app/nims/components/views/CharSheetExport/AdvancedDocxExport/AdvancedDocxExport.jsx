import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './AdvancedDocxExport.css';

export default class AdvancedDocxExport extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('AdvancedDocxExport mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('AdvancedDocxExport did update');
  }

  componentWillUnmount = () => {
    console.log('AdvancedDocxExport will unmount');
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
      <div className="AdvancedDocxExport">
        <span>{t('briefings.upload-template')}</span>
        <input type="file" name="file" className="form-control" />
        <button type="button" className="btn btn-default btn-reduced">{t('briefings.make-export')}</button>
      </div>
    );
  }
}

AdvancedDocxExport.propTypes = {
  // bla: PropTypes.string,
};

AdvancedDocxExport.defaultProps = {
  // bla: 'test',
};

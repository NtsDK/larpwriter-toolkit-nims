import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Groups.css';

import Panel from '../../../util/Panel';

export default class Groups extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('Groups mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Groups did update');
  }

  componentWillUnmount = () => {
    console.log('Groups will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getCharacterGroupTexts({ characterName: id })
    ]).then((results) => {
      const [groupTexts] = results;
      this.setState({
        groupTexts
      });
    });
  }

  render() {
    const { groupTexts } = this.state;
    const { t } = this.props;

    if (!groupTexts) {
      // return <div> Groups stub </div> ;
      return null;
    }
    return (
      <Panel title={`${t('header.groups')} (${groupTexts.length})`} className="Groups">
        {
          groupTexts.map(groupText => (
            <div key={groupText.groupName}>
              <h4>{groupText.groupName}</h4>
              <textarea className="briefingTextSpan form-control" value={groupText.text} />
            </div>
          ))
        }
      </Panel>
    );
  }
}

Groups.propTypes = {
  // bla: PropTypes.string,
};

Groups.defaultProps = {
  // bla: 'test',
};

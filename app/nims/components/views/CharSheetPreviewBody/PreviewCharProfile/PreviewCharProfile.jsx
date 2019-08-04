import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PreviewCharProfile.css';

import Panel from '../../../util/Panel';
import PreviewProfile from '../PreviewProfile';

export default class PreviewCharProfile extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('PreviewCharProfile mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('PreviewCharProfile did update');
  }

  componentWillUnmount = () => {
    console.log('PreviewCharProfile will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getProfileStructure({ type: 'character' }),
      dbms.getProfile({ type: 'character', name: id })
    ]).then((results) => {
      const [profileStructure, charProfile] = results;
      this.setState({
        profileStructure, charProfile
      });
    });
  }

  render() {
    const { profileStructure, charProfile } = this.state;
    const { t, id } = this.props;

    if (!profileStructure && !charProfile) {
      // return <div> PreviewCharProfile stub </div>;
      return null;
    }
    return (
      <Panel title={t('briefings.character-profile', { name: id })} className="PreviewCharProfile">
        <PreviewProfile profile={charProfile} structure={profileStructure} />
      </Panel>
    );
  }
}

PreviewCharProfile.propTypes = {
  // bla: PropTypes.string,
};

PreviewCharProfile.defaultProps = {
  // bla: 'test',
};

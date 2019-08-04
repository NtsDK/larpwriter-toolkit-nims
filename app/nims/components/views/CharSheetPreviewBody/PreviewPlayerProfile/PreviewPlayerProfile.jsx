import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PreviewPlayerProfile.css';

import Panel from '../../../util/Panel';
import PreviewProfile from '../PreviewProfile';

export default class PreviewPlayerProfile extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('PreviewPlayerProfile mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('PreviewPlayerProfile did update');
  }

  componentWillUnmount = () => {
    console.log('PreviewPlayerProfile will unmount');
  }

  getStateInfo = () => {
    const { dbms, charId } = this.props;
    Promise.all([
      dbms.getProfileBinding({ type: 'character', name: charId })
    ]).then((results) => {
      const [binding] = results;
      if (binding[1] !== '') {
        Promise.all([
          dbms.getProfileStructure({ type: 'player' }),
          dbms.getProfile({ type: 'player', name: binding[1] })
        ]).then((results2) => {
          const [profileStructure, playerProfile] = results2;
          this.setState({
            profileStructure, playerProfile, id: binding[1]
          });
        });
      }
    });
  }

  render() {
    const { profileStructure, playerProfile, id } = this.state;
    const { t } = this.props;

    if (!profileStructure && !playerProfile) {
      return null;
    }
    return (
      <Panel title={t('briefings.character-profile', { name: id })} className="PreviewPlayerProfile">
        <PreviewProfile profile={playerProfile} structure={profileStructure} />
      </Panel>
    );
  }
}

PreviewPlayerProfile.propTypes = {
  // bla: PropTypes.string,
};

PreviewPlayerProfile.defaultProps = {
  // bla: 'test',
};

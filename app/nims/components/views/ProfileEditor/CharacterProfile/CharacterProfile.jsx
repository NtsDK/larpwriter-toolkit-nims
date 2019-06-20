import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './CharacterProfile.css';

export default class CharacterProfile extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('CharacterProfile mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('CharacterProfile did update');
  }

  componentWillUnmount = () => {
    console.log('CharacterProfile will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getProfileStructure({ type: 'character' }),
      dbms.getProfile({ type: 'character', name: id })
      // dbms.getEntityNamesArray({ type: 'character' }),
      // dbms.getEntityNamesArray({ type: 'player' }),
      // dbms.getProfileBindings(),
    ]).then((results) => {
      const [profileModel, profile] = results;
      this.setState({
        profileModel, profile
      });
    });

  //   DBMS.getProfileStructure({ type: firstType }).then((allProfileSettings) => {
  //     profileEditorCore.initProfileStructure(profileDiv, firstType, allProfileSettings, callback);
  // }).catch(UI.handleError);
  // DBMS.getProfile({ type: firstType, name }),
  }

  render() {
    const { profileModel, profile } = this.state;

    if (!profile) {
      return null;
    }
    return (
      <div className="character-profile">
        CharacterProfile body
      </div>
    );
  }
}

CharacterProfile.propTypes = {
  // bla: PropTypes.string,
};

CharacterProfile.defaultProps = {
  // bla: 'test',
};

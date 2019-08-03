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

  componentDidUpdate = (prevProps) => {
    console.log('CharacterProfile did update');
    if (prevProps.id === this.props.id) {
      return;
    }
    this.getStateInfo();
  }

  componentWillUnmount = () => {
    console.log('CharacterProfile will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getProfileStructure({ type: 'character' }),
      dbms.getProfile({ type: 'character', name: id })
    ]).then((results) => {
      const [profileModel, profile] = results;
      this.setState({
        profileModel, profile
      });
    });
  }

  render() {
    const { profileModel, profile } = this.state;
    const { t } = this.props;

    if (!profile) {
      return null;
    }
    return (
      <div className="character-profile panel panel-default profile-panel">
        <div className="panel-heading">
          {/* <a href="#"> */}
          <h3 className="panel-title">{t('profiles.character-profile')}</h3>
          {/* </a> */}
        </div>
        <div className="panel-body profile-div form-horizontal">
          {
            profileModel.map(profileItemModel => (

              <div className="form-group">
                <label className="col-xs-3 control-label profile-item-name">{profileItemModel.name}</label>
                <div className="col-xs-9 profile-item-input form-control-static">
                  {
                    (() => {
                      switch (profileItemModel.type) {
                      case 'text':
                        return <textarea className="profileTextInput form-control" value={profile[profileItemModel.name]} />;
                      case 'string':
                        return <input className="form-control" value={profile[profileItemModel.name]} />;
                      case 'enum':
                        const options = R.sort(CU.charOrdA, profileItemModel.value.split(','));
                        return (
                          <select className="form-control">
                            {
                              options.map(option => <option value={option} selected={profile[profileItemModel.name] === option}>{option}</option>)
                            }
                          </select>
                        );
                      case 'multiEnum':
                        const options2 = R.sort(CU.charOrdA, profileItemModel.value.split(','));
                        const values = profile[profileItemModel.name].split(',');
                        return (
                          <select className="form-control" multiple size={options2.length}>
                            {
                              options2.map(option => <option value={option} selected={values.includes(option)}>{option}</option>)
                            }
                          </select>
                        );
                      case 'number':
                        return <input className="form-control" type="number" value={profile[profileItemModel.name]} />;
                      case 'checkbox':
                        return <input className="form-control" type="checkbox" checked={profile[profileItemModel.name]} />;
                      default:
                        // throw new Errors.InternalError('errors-unexpected-switch-argument', [profileItemModel.type]);
                      }
                      return <div>{`unexpected type ${profileItemModel.type}`}</div>;
                    })()
                  }

                </div>
              </div>
            ))
          }
        </div>
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

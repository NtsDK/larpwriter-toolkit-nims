import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './GroupProfile.css';

import FilterConfiguration from '../../../../utils/filterConfiguration';

import CharacterFilter from '../../../util/CharacterFilter';

export default class GroupProfile extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('GroupProfile mounted');
    this.getStateInfo();
  }

  componentDidUpdate = (prevProps) => {
    console.log('GroupProfile did update');
    // eslint-disable-next-line react/destructuring-assignment
    if (prevProps.id === this.props.id) {
      return;
    }
    this.getStateInfo();
  }

  // componentDidMount = () => {
  //   console.log('GroupProfile mounted');
  //   // this.getStateInfo();
  // }

  // componentDidUpdate = () => {
  //   console.log('GroupProfile did update');
  // }

  componentWillUnmount = () => {
    console.log('GroupProfile will unmount');
  }

  getStateInfo = () => {
    const { dbms, id, t } = this.props;
    Promise.all([
      dbms.getGroup({ groupName: id }),
      FilterConfiguration.makeFilterConfiguration(dbms, t),
    ]).then((results) => {
      const [group, filterConfiguration] = results;
      this.setState({
        group, filterConfiguration
      });
    });
  }

  render() {
    const { group, filterConfiguration } = this.state;
    const { t } = this.props;

    if (!group) {
      return <div> GroupProfile stub </div>;
      // return null;
    }
    const data = filterConfiguration.getProfileIds(group.filterModel);
    return (
      <div className="group-profile panel panel-default profile-panel">
        {/* <div className="panel-heading">
          <h3 className="panel-title">{t('profiles.character-profile')}</h3>
        </div> */}
        <div className="panel-body profile-div form-horizontal">
          {
            Constants.groupProfileStructure.map(profileItemModel => (

              <div className="form-group">
                <label className="col-xs-3 control-label profile-item-name">{t(`groups.${profileItemModel.name}`)}</label>
                <div className="col-xs-9 profile-item-input form-control-static">
                  {
                    (() => {
                      switch (profileItemModel.type) {
                      case 'text':
                        return <textarea className="profileTextInput form-control" value={group[profileItemModel.name]} />;
                      case 'filterModel':
                        return <CharacterFilter model={group.filterModel} filterConfiguration={filterConfiguration} />;
                      case 'characterList':
                        return (
                          <div>
                            {data.join(', ')}
                            <br />
                            {t('groups.total') + data.length}
                          </div>
                        );
                      case 'checkbox':
                        return <input className="form-control" type="checkbox" checked={group[profileItemModel.name]} />;
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

GroupProfile.propTypes = {
  // bla: PropTypes.string,
};

GroupProfile.defaultProps = {
  // bla: 'test',
};

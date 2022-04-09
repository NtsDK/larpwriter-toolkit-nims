import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';
import FormControl from 'react-bootstrap/es/FormControl';
import { PanelCore } from '../../../commons/uiCommon3/PanelCore.jsx';
import './CharacterProfile.css';

export class CharacterProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
    // console.log('CharacterProfile mounted');
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    console.log('CharacterProfile did update');
    // if (prevProps.id === this.props.id) {
    //   return;
    // }
    // this.getStateInfo();
  }

  componentWillUnmount = () => {
    console.log('CharacterProfile will unmount');
  }

  refresh() {
    const { id, dbms } = this.props;
    Promise.all([
      dbms.getProfileStructure({ type: 'character' }),
      dbms.getProfile({ type: 'character', name: id })
    ]).then((results) => {
      const [profileModel, profile] = results;
      this.setState({
        profileModel, profile
      });
    }).catch(UI.handleError);
  }

  getDataInput(profileItemModel) {
    const { profileModel, profile } = this.state;
    switch (profileItemModel.type) {
    case 'text':
      return (
        <FormControl
          componentClass="textarea"
          className="profileTextInput"
          defaultValue={profile[profileItemModel.name]}
          data-type={profileItemModel.type}
          data-field-name={profileItemModel.name}
          onChange={this.onInputChange}
        />
      );
      // return <textarea className="profileTextInput form-control" value={profile[profileItemModel.name]} />;
    case 'string':
      return (
        <FormControl
          type="text"
          defaultValue={profile[profileItemModel.name]}
          data-type={profileItemModel.type}
          data-field-name={profileItemModel.name}
          onChange={this.onInputChange}
        />
      );
      // return <input className="form-control" value={profile[profileItemModel.name]} />;
    case 'enum':
      const options = R.sort(CU.charOrdA, profileItemModel.value.split(','));
      return (
        <FormControl
          componentClass="select"
          data-type={profileItemModel.type}
          data-field-name={profileItemModel.name}
          onChange={this.onInputChange}
        >
          {
            options.map((option) => <option value={option} selected={profile[profileItemModel.name] === option}>{option}</option>)
          }
        </FormControl>
        // <select className="form-control">
        //   {
        //     options.map((option) => <option value={option} selected={profile[profileItemModel.name] === option}>{option}</option>)
        //   }
        // </select>
      );
    case 'multiEnum':
      const options2 = R.sort(CU.charOrdA, profileItemModel.value.split(','));
      const values = profile[profileItemModel.name].split(',');
      return (
        <FormControl
          componentClass="select"
          multiple
          size={options2.length}
          data-type={profileItemModel.type}
          data-field-name={profileItemModel.name}
          onChange={this.onInputChange}
        >
          {
            options2.map((option) => <option value={option} selected={values.includes(option)}>{option}</option>)
          }
        </FormControl>
        // <select className="form-control" multiple size={options2.length}>
        //   {
        //     options2.map((option) => <option value={option} selected={values.includes(option)}>{option}</option>)
        //   }
        // </select>
      );
    case 'number':
      return (
        <FormControl
          type="number"
          defaultValue={profile[profileItemModel.name]}
          data-type={profileItemModel.type}
          data-field-name={profileItemModel.name}
          onChange={this.onInputChange}
        />
      );
      // return <input className="form-control" type="number" value={profile[profileItemModel.name]} />;
    case 'checkbox':
      return (
        <FormControl
          type="checkbox"
          defaultChecked={profile[profileItemModel.name]}
          data-type={profileItemModel.type}
          data-field-name={profileItemModel.name}
          onChange={this.onInputChange}
        />
      );
      // return <input className="form-control" type="checkbox" checked={profile[profileItemModel.name]} />;
    default:
        // throw new Errors.InternalError('errors-unexpected-switch-argument', [profileItemModel.type]);
    }
    return <div>{`unexpected type ${profileItemModel.type}`}</div>;
  }

  onInputChange(event) {
    const { profile } = this.state;
    // const fieldName = this.name;
    // const profileName = state[this.profileType].name;
    // if (this.multiEnumSelect && this.multiEnumSelect.prop('disabled')) {
    //   return; // we need to trigger change event on multiEnumSelect to update selection.
    //   // It may be disabled so it has false positive call.
    // }

    const { type, fieldName } = event.target.dataset;

    let value, val;
    switch (type) {
    case 'text':
    case 'string':
    case 'enum':
      val = event.target.value;
      value = val;
      break;
    case 'number':
      if (Number.isNaN(event.target.value)) {
        // UI.alert(L10n.getValue('profiles-not-a-number'));
        // this.dom.value = this.oldValue;
        return;
      }
      value = Number(event.target.value);
      break;
    case 'checkbox':
      value = event.target.checked;
      break;
    case 'multiEnum':
      const list = Array.from(event.target.selectedOptions, (option) => option.value);
      // value = this.multiEnumSelect.val().join(',');
      value = list.join(',');
      break;
    default:
      // UI.handleError(new Errors.InternalError('errors-unexpected-switch-argument', [this.type]));
      return;
    }
    const { dbms } = this.props;
    dbms.updateProfileField({
      type: 'character',
      characterName: profile.name,
      fieldName,
      itemType: type,
      value
    }).catch(UI.processError());
  }

  render() {
    const { profileModel, profile } = this.state;
    const { t } = this.props;

    if (!profile) {
      return null;
    }
    return (
      <PanelCore
        className="character-profile"
        title={t('profiles.character-profile')}
      >
        <div className="form-horizontal">
          {
            profileModel.map((profileItemModel) => (
              <div className="form-group">
                <label className="col-xs-3 control-label profile-item-name">{profileItemModel.name}</label>
                <div className="col-xs-9 profile-item-input form-control-static">
                  {
                    this.getDataInput(profileItemModel)
                  }
                </div>
              </div>
            ))
          }
        </div>
      </PanelCore>
    );
  }
}

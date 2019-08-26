import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './CharacterFilter.css';

export default class CharacterFilter extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('CharacterFilter mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('CharacterFilter did update');
  }

  componentWillUnmount = () => {
    console.log('CharacterFilter will unmount');
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

  makeFilterItemString = ((filterItem, i, items) => {
    const { t, filterConfiguration } = this.props;
    // name2DisplayName, name2Source,
    // const name2DisplayName = filterConfiguration.getName2DisplayNameMapping();
    // const name2Source = filterConfiguration.getName2SourceMapping();

    // const displayName = filterConfiguration.getName2DisplayNameMapping()[filterItem.name];
    const displayName = filterConfiguration.getItemDisplayName(filterItem);
    const source = filterConfiguration.getName2SourceMapping()[filterItem.name];
    let condition, arr, value, list;
    condition = `${displayName} `;
    switch (filterItem.type) {
    case 'enum':
      arr = Object.keys(filterItem.selectedOptions);
      condition += arr.length === 1 ? t('groups.is') : t('groups.one-from');
      value = arr.map(opt => `"${opt}"`).join(', ');
      break;
    case 'checkbox':
      // arr = [];
      // if (filterItem.selectedOptions.true) { arr.push(t('constant.yes')); }
      // if (filterItem.selectedOptions.false) { arr.push(t('constant.no')); }
      // condition = arr.length === 1 ? t('groups.is') : t('groups.one-from');
      // value = arr.map(opt => `"${opt}"`).join(', ');
      condition = '';
      if (filterItem.selectedOptions.true) {
        condition += ` ${t('groups.is')} "${displayName}"`;
      }
      if (filterItem.selectedOptions.true && filterItem.selectedOptions.no) {
        condition += ' or ';
      }
      if (filterItem.selectedOptions.no) {
        condition += ` ${t('groups.is-not')} "${displayName}"`;
      }
      value = '';
      break;
    case 'number':
      condition += t(`constant.${filterItem.condition}`);
      value = filterItem.num;
      break;
    case 'multiEnum':
      condition += t(`constant.${filterItem.condition}`);
      value = Object.keys(filterItem.selectedOptions).map(opt => `"${opt}"`).join(', ');
      break;
    case 'text':
    case 'string':
      condition += t('groups.text-contains');
      value = filterItem.regexString;
      break;
    default:
      throw new Error(`Unexpected type ${filterItem.type}`);
    }
    return (
      <div>
        {t(`groups.${filterConfiguration.getItemSetName(filterItem)}-set-name`)}
        {' '}
        {}
        {' '}
        {condition}
        {' '}
        {value}
        {' '}
        {(items.length - 1) === i ? '' : 'and'}
      </div>
    );
    // const title = `${L10n.getValue(`profile-filter-${source}`)}, ${L10n.getValue(`constant-${filterItem.type}`)}`;
    // return {
    //   // displayName, title,
    //   condition, value
    // };
  });

  render() {
    const { something } = this.state;
    const { t, model } = this.props;

    if (model.length === 0) {
      return <div> Show all characters </div>;
      // return null;
    }
    return (
      <div className="character-filter">
        <div>Show characters where</div>
        {
          model.map(this.makeFilterItemString)
        }
        {/* CharacterFilter body */}
      </div>
    );
  }
}

CharacterFilter.propTypes = {
  // bla: PropTypes.string,
};

CharacterFilter.defaultProps = {
  // bla: 'test',
};

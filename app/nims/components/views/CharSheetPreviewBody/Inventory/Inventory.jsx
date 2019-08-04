import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Inventory.css';

import Panel from '../../../util/Panel';

export default class Inventory extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('Inventory mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Inventory did update');
  }

  componentWillUnmount = () => {
    console.log('Inventory will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getAllInventoryLists({ characterName: id })
    ]).then((results) => {
      const [allInventoryLists] = results;
      allInventoryLists.sort(CU.charOrdAFactory(R.compose(R.toLower, R.prop('storyName'))));
      this.setState({
        allInventoryLists
      });
    });
  }

  render() {
    const { allInventoryLists, id } = this.state;
    const { t } = this.props;

    if (!allInventoryLists) {
      return <div> Inventory stub </div>;
      // return null;
    }
    return (
      <Panel title={`${t('briefings.inventory')} (${allInventoryLists.length})`} className="Inventory">
        <div className="form-horizontal insertion-point">
          {
            allInventoryLists.map(elem => (
              <div className="form-group">
                <label className="col-xs-3 control-label profile-item-name">{elem.storyName}</label>
                <div className="col-xs-9 profile-item-input form-control-static">
                  <input className="inventoryInput form-control" value={elem.inventory} />
                </div>
              </div>
            ))
          }
        </div>
      </Panel>
    );
  }
}

Inventory.propTypes = {
  // bla: PropTypes.string,
};

Inventory.defaultProps = {
  // bla: 'test',
};

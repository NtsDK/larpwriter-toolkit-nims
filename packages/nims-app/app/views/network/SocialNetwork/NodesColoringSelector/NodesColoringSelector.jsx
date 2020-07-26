import React, { Component } from 'react';
import './NodesColoringSelector.css';

export class NodesColoringSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('NodesColoringSelector mounted');
  }

  componentDidUpdate() {
    console.log('NodesColoringSelector did update');
  }

  componentWillUnmount() {
    console.log('NodesColoringSelector will unmount');
  }

  render() {
    const { something } = this.state;
    const { t } = this.props;

    // if (!something) {
    //   return <div> NodesColoringSelector stub </div>;
    //   // return null;
    // }
    const networkNodeGroups = [];
    return (
      <div className="NodesColoringSelector network-coloring-area">
        <div className="margin-bottom-16">
          <select id="networkNodeGroupSelector" className="form-control">
            {
              networkNodeGroups.map((group) => <option value={group.value}>{group.name}</option>)
            }
          </select>
        </div>
        <span className="margin-bottom-8 inline-block">{t('social-network.legend')}</span>
        <div id="colorLegend" />
      </div>
    );
  }
}

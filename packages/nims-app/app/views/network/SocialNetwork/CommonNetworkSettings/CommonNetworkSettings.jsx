import React, { Component } from 'react';
import './CommonNetworkSettings.css';

export class CommonNetworkSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.onChangeNode = this.onChangeNode.bind(this);
    this.onShowPlayerNames = this.onShowPlayerNames.bind(this);
  }

  componentDidMount() {
    console.log('CommonNetworkSettings mounted');
  }

  componentDidUpdate() {
    console.log('CommonNetworkSettings did update');
  }

  componentWillUnmount() {
    console.log('CommonNetworkSettings will unmount');
  }

  onChangeNode(e) {
    const { onSelectFocusNode } = this.props;
    onSelectFocusNode(e.target.value);
  }

  onShowPlayerNames(e) {
    const { onShowPlayerNames } = this.props;
    onShowPlayerNames(e.target.checked);
  }

  render() {
    const { something } = this.state;
    const {
      t, nodes = [], focusNode, showPlayerNames
    } = this.props;

    //     nodes={nodes}
    // focusNode={focusNode}
    // onSelectFocusNode={this.onSelectFocusNode}

    // if (!something) {
    //   return <div> CommonNetworkSettings stub </div>;
    //   // return null;
    // }
    return (
      <div className="CommonNetworkSettings">
        <span className="display-block">{t('social-network.show-node')}</span>
        <div className="margin-bottom-8">
          <select id="nodeFocusSelector" className="common-select " value={focusNode} onChange={this.onChangeNode}>
            {
              nodes.map((node) => <option key={node.id} value={node.id}>{node.originName}</option>)
            }
          </select>
        </div>
        <div>
          <input
            id="showPlayerNamesCheckbox"
            type="checkbox"
            className="hidden"
            checked={showPlayerNames}
            onChange={this.onShowPlayerNames}
          />
          <label htmlFor="showPlayerNamesCheckbox" className="checkbox-label-icon common-checkbox">
            <span>{t('social-network.show-player-names')}</span>
          </label>
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import './CommonNetworkSettings.css';

export class CommonNetworkSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
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

  render() {
    const { something } = this.state;
    const { t } = this.props;

    // if (!something) {
    //   return <div> CommonNetworkSettings stub </div>;
    //   // return null;
    // }
    return (
      <div className="CommonNetworkSettings">
        <span className="display-block">{t('social-network.show-node')}</span>
        <div className="margin-bottom-8">
          <select id="nodeFocusSelector" className="common-select " />
        </div>
        <div>
          <input id="showPlayerNamesCheckbox" type="checkbox" className="hidden" />
          <label htmlFor="showPlayerNamesCheckbox" className="checkbox-label-icon common-checkbox">
            <span>{t('social-network.show-player-names')}</span>
          </label>
        </div>
      </div>
    );
  }
}

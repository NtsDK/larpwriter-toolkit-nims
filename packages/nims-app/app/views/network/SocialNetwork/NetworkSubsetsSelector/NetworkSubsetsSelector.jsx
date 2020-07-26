import React, { Component } from 'react';
import './NetworkSubsetsSelector.css';

export class NetworkSubsetsSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('NetworkSubsetsSelector mounted');
  }

  componentDidUpdate() {
    console.log('NetworkSubsetsSelector did update');
  }

  componentWillUnmount() {
    console.log('NetworkSubsetsSelector will unmount');
  }

  render() {
    const { something } = this.state;
    const { t } = this.props;

    // if (!something) {
    //   return <div> NetworkSubsetsSelector stub </div>;
    //   // return null;
    // }
    return (
      <div className="NetworkSubsetsSelector network-filter-area">
        <select size={3} id="networkSubsetsSelector" className="form-control" />
        <div id="networkCharacterDiv" className="hidden">
          <h4>{t('social-network.characters')}</h4>
          <input selector-filter="#networkCharacterSelector" />
          <select id="networkCharacterSelector" multiple className="form-control" />
        </div>
        <div id="networkStoryDiv" className="hidden">
          <h4>{t('social-network.stories')}</h4>
          <input selector-filter="#networkStorySelector" />
          <select id="networkStorySelector" multiple className="form-control" />
        </div>
      </div>
    );
  }
}

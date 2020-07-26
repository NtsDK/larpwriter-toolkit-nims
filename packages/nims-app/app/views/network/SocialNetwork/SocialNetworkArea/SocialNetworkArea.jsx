import React, { Component } from 'react';
import './SocialNetworkArea.css';

export class SocialNetworkArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('SocialNetworkArea mounted');
  }

  componentDidUpdate() {
    console.log('SocialNetworkArea did update');
  }

  componentWillUnmount() {
    console.log('SocialNetworkArea will unmount');
  }

  render() {
    const { something } = this.state;
    // const { t } = this.props;

    // if (!something) {
    //   return <div> SocialNetworkArea stub </div>;
    //   // return null;
    // }
    return (
      <div className="SocialNetworkArea visualObjectContainer full-screen-elem" id="socialNetworkContainer" />
    );
  }
}

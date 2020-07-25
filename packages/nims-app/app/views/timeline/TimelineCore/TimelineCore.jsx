import React, { Component } from 'react';
import './TimelineCore.css';

export class TimelineCore extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('TimelineCore mounted');
  }

  componentDidUpdate() {
    console.log('TimelineCore did update');
  }

  componentWillUnmount() {
    console.log('TimelineCore will unmount');
  }

  render() {
    const { something } = this.state;
    // const { t } = this.props;

    if (!something) {
      return <div> TimelineCore stub </div>;
      // return null;
    }
    return (
      <div className="TimelineCore">
        TimelineCore body
      </div>
    );
  }
}

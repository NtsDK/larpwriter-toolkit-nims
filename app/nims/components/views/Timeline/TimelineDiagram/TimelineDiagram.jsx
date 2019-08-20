import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TimelineDiagram.css';

export default class TimelineDiagram extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('TimelineDiagram mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('TimelineDiagram did update');
  }

  componentWillUnmount = () => {
    console.log('TimelineDiagram will unmount');
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

  render() {
    const { something } = this.state;
    //const { t } = this.props;

    if (!something) {
      return <div> TimelineDiagram stub </div> ;
      // return null;
    }
    return (
      <div className="TimelineDiagram">
        TimelineDiagram body
      </div>
    );
  }
}

TimelineDiagram.propTypes = {
  // bla: PropTypes.string,
};

TimelineDiagram.defaultProps = {
  // bla: 'test',
};

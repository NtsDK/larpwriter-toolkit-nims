import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Stub.css';

export default class Stub extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('Stub mounted');
	// this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Stub did update');
  }

  componentWillUnmount = () => {
    console.log('Stub will unmount');
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
      return <div> Stub stub </div> ;
	  // return null;
    }
    return (
      <div className="Stub">
        Stub body
      </div>
    );
  }
}

Stub.propTypes = {
  // bla: PropTypes.string,
};

Stub.defaultProps = {
  // bla: 'test',
};

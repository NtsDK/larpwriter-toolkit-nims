import React, { Component } from "react";

export class BodyStub extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount(props) {
    const {name, callback} = this.props;
    this.setState({
      name
    });
    callback(true);
    console.log(name, 'componentDidMount');
  }
  componentDidUpdate() {
    const {name} = this.state;
    console.log(name, 'componentDidUpdate');
  }
  componentWillUnmount() {
    const {name} = this.state;
    console.log(name, 'componentWillUnmount');
  }

  render() {
    const {name} = this.state;
    console.log(name, 'render');
    // return <>{name}</>;
    return null;
  }
  
}
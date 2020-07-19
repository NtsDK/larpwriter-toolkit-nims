import React, { Component } from "react";
import { UI, U, L10n } from 'nims-app-core';

export class ViewWrapper extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   view: null
    // };
  }
  componentDidMount() {
    const {view, name} = this.props;
    // let viewContent = view.content || view.getContent();
    // if(viewContent === undefined) {
    //   view.init();
    //   // viewContent = view.content || view.getContent();
    // }
    // this.setState({
    //   view
    // });
  }
  
  render() {
    const {name, view} = this.props;
    const content = U.queryEl('#contentArea');
    U.passEls(content, U.queryEl('#warehouse'));
    let viewContent = view.content || view.getContent();
    content.appendChild(viewContent);
    U.removeClass(content, 'hidden');
    // this.currentView = view;
    view.refresh();
    // return name;
    return null;
  }
}
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Panel.css';

export default class Panel extends Component {
  state = {
  };

  render() {
    // const { something } = this.state;
    const { children, title } = this.props;

    // if (!something) {
    //   return <div> Panel stub </div> ;
    //   // return null;
    // }
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          {/* <a href="#/" panel-toggler="" class="collapsed"> */}
          <h3 className="panel-title">{title}</h3>
          {/* </a> */}
        </div>
        <div className="panel-body">
          {children}
        </div>
      </div>
    );
  }
}

Panel.propTypes = {
  // bla: PropTypes.string,
};

Panel.defaultProps = {
  // bla: 'test',
};

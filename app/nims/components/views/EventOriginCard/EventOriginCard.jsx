import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './EventOriginCard.css';

export default class EventOriginCard extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('EventOriginCard mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('EventOriginCard did update');
  }

  componentWillUnmount = () => {
    console.log('EventOriginCard will unmount');
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
    const { t, event } = this.props;

    // if (!something) {
    //   return <div> EventOriginCard stub </div> ;
    //   // return null;
    // }
    return (
      <div className="panel panel-primary EventOriginCard">
        <div className="panel-heading flex-row">
          <h1 className="panel-title card-title flex-1-1-auto">{event.name}</h1>
          <input className="isStoryEditable time-input form-control flex-0-0-auto" value={event.time} />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon locked btn-primary flex-0-0-auto margin-left-8 isStoryEditable"
            title={t('briefings.unlock-event-source')}
          />
        </div>
        <div className="panel-body">
          <textarea className="isStoryEditable eventPersonalStory form-control text-input" value={event.text} />
        </div>
      </div>
    );
  }
}

EventOriginCard.propTypes = {
  // bla: PropTypes.string,
};

EventOriginCard.defaultProps = {
  // bla: 'test',
};

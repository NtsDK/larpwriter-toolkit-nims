import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './EventRow.css';

// import EventCard from '../EventCard';
import EventOriginCard from '../../EventOriginCard';
import EventAdaptationCard from '../../EventAdaptationCard';

export default class EventRow extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('EventRow mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('EventRow did update');
  }

  componentWillUnmount = () => {
    console.log('EventRow will unmount');
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
    const { t, event, id } = this.props;

    const data = event.characters[id];

    // if (!something) {
    //   return <div> EventRow stub </div> ;
    //   // return null;
    // }
    return (
      <div className="container-fluid eventRow-dependent EventRow">
        <div className="row eventMainPanelRow-left events-eventsContainer ">
          <div className="col-xs-6">
            <EventOriginCard event={event} />
          </div>
          <div className="col-xs-6">
            <EventAdaptationCard name={id} data={data} />
          </div>
        </div>
      </div>
    );
  }
}

EventRow.propTypes = {
  // bla: PropTypes.string,
};

EventRow.defaultProps = {
  // bla: 'test',
};

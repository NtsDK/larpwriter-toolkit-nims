import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PreviewEvents.css';

import Panel from '../../../util/Panel';
import EventRow from '../EventRow';

export default class PreviewEvents extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('PreviewEvents mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('PreviewEvents did update');
  }

  componentWillUnmount = () => {
    console.log('PreviewEvents will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getCharacterEventsByTime({ characterName: id })
    ]).then((results) => {
      const [allEvents] = results;
      this.setState({
        allEvents
      });
    });
  }

  render() {
    const { allEvents } = this.state;
    const { t, id } = this.props;

    if (!allEvents) {
      // return <div> PreviewEvents stub </div> ;
      return null;
    }
    const subPart2name = subPart => subPart.map(event => (
      <>
      {event.name}
      <br />
      </>
    ));
    return (
      <>
      {
        R.splitEvery(Constants.eventsSplitConstant, allEvents).map(subPart => (
          <Panel title={subPart2name(subPart)}>
            {
              subPart.map(event => <EventRow event={event} id={id} />)
            }
          </Panel>
        ))
      }
      </>
    );
  }
}

PreviewEvents.propTypes = {
  // bla: PropTypes.string,
};

PreviewEvents.defaultProps = {
  // bla: 'test',
};

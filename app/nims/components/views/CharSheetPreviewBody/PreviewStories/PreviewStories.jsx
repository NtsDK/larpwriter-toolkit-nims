import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PreviewStories.css';

import Panel from '../../../util/Panel';
import EventRow from '../EventRow';

export default class PreviewStories extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('PreviewStories mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('PreviewStories did update');
  }

  componentWillUnmount = () => {
    console.log('PreviewStories will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getCharacterEventGroupsByStory({ characterName: id }),
      dbms.getMetaInfo()
    ]).then((results) => {
      const [eventGroups, metaInfo] = results;
      this.setState({
        eventGroups, metaInfo
      });
    });
  }

  render() {
    const { eventGroups, metaInfo } = this.state;
    const { t, id } = this.props;

    if (!eventGroups) {
      // return <div> PreviewStories stub </div>;
      return null;
    }
    return (
      <>
      {
        eventGroups.map(elem => (
          <Panel title={`${elem.storyName} (${elem.events.length})`}>
            {
              elem.events.map(event => <EventRow event={event} id={id} />)
            }
          </Panel>
        ))
      }
      </>
    );
  }
}

PreviewStories.propTypes = {
  // bla: PropTypes.string,
};

PreviewStories.defaultProps = {
  // bla: 'test',
};

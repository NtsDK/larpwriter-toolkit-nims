import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './WriterStory.css';

export default class WriterStory extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('WriterStory mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('WriterStory did update');
  }

  componentWillUnmount = () => {
    console.log('WriterStory will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getWriterStory({ storyName: id }),
    ]).then((results) => {
      const [story] = results;
      this.setState({
        story
      });
    });
  }

  render() {
    const { story } = this.state;

    if (!story) {
      return null;
    }
    return (
      <div className="writer-story">
        <div className="panel panel-default">
          <div className="panel-body">
            <textarea className="isStoryEditable form-control writer-story-area" value={story} />
          </div>
        </div>
      </div>
    );
  }
}

WriterStory.propTypes = {
  // bla: PropTypes.string,
};

WriterStory.defaultProps = {
  // bla: 'test',
};

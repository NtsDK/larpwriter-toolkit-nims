import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TimelineDiagram.css';

import * as vis from 'vis';
import 'vis/dist/vis.min.css';

const options = {
  orientation: 'top',
  showCurrentTime: false,
};

export default class TimelineDiagram extends Component {
  timelineDataset = new vis.DataSet();

  tagDataset = new vis.DataSet();

  state = {
  };

  componentDidMount = () => {
    console.log('TimelineDiagram mounted');
    this.timeline = new vis.Timeline(this.viz, null, options);
    this.timeline.setGroups(this.tagDataset);
    this.timeline.setItems(this.timelineDataset);
    this.updateTimeline();
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('TimelineDiagram did update');
    this.updateTimeline();
  }

  componentWillUnmount = () => {
    console.log('TimelineDiagram will unmount');
  }

  prepareLabel = label => `<span class="timeline-label">${label}</span>`;

  updateTimeline() {
    const {
      usedData, metaInfo, selectedValues, t
    } = this.props;

    this.tagDataset.clear();
    this.timelineDataset.clear();

    this.tagDataset.add(selectedValues.map(entityName => R.always({ id: entityName, content: entityName })()));

    const endDate = new Date(metaInfo.date);
    const startDate = new Date(metaInfo.preGameDate);
    endDate.setMonth(endDate.getMonth() + 2);
    startDate.setMonth(startDate.getMonth() - 2);
    // endDate.setFullYear(endDate.getFullYear() + 1);
    // startDate.setFullYear(startDate.getFullYear() - 1);

    this.timeline.setOptions({
      end: endDate,
      start: startDate,
    });


    // state.postDate = metaInfo.date;
    // state.preDate = metaInfo.preGameDate;

    if (selectedValues[0]) {
      this.timelineDataset.add({
        content: this.prepareLabel(t('overview.pre-game-end-date')),
        start: new Date(metaInfo.date),
        group: selectedValues[0],
        className: 'importantItem',
        editable: false
      });
      this.timelineDataset.add({
        content: this.prepareLabel(t('overview.pre-game-start-date')),
        start: new Date(metaInfo.preGameDate),
        group: selectedValues[0],
        className: 'importantItem',
        editable: false
      });
    }

    this.timelineDataset.add(R.flatten(R.toPairs(usedData).map((pair) => {
      const entityName = pair[0];

      // <span class="timeline-label">${label}</span>
      return pair[1].map(event => ({
        content: this.prepareLabel(event.name),
        start: event.time !== '' ? event.time : metaInfo.date,
        group: entityName
      }));
    })));
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

    // if (!something) {
    //   return <div> TimelineDiagram stub </div>;
    //   // return null;
    // }
    return (
      <div className="timeline-diagram panel panel-default">

        <div className="panel-body">
          <div
            className=" visualObjectContainer full-screen-elem "
            id="timelineContainer"
            ref={viz => (this.viz = viz)}
          />
        </div>
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

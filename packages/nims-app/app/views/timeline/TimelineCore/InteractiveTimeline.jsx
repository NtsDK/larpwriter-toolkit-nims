import React, { Component } from 'react';
import vis from 'vis';
import dateFormat from 'dateformat';
import 'vis/dist/vis.min.css';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import { CU } from 'nims-dbms-core';
import * as R from 'ramda';

const prepareLabel = (label) => `<span class="timeline-label">${label}</span>`;

// specify options
const options = {
  orientation: 'top',
  showCurrentTime: false,
  //        editable : {
  //            updateTime : true
  //        },
  //        onMove : function (item, callback) {
  //            if (item.storyName) {
  //                DBMS.setEventTime(item.storyName, item.eventIndex, item.start, function(err){
  //                    if(err) {UI.handleError(err); return;}
  //                    callback(item);
  //                });
  //            }
  //        },
  //        multiselect : true
};

export class InteractiveTimeline extends Component {
  timelineDataset = new vis.DataSet();

  tagDataset = new vis.DataSet();

  constructor(props) {
    super(props);
    this.state = {
    };
    this.timelineContainer = React.createRef();
  }

  componentDidMount() {
    this.initTimeline();
    this.setState({});
    // this.refresh();
    console.log('InteractiveTimeline mounted');
  }

  componentDidUpdate() {
    // if (this.timeline === undefined) {
    //   this.initTimeline();
    // }
    console.log('InteractiveTimeline did update');
  }

  // compo

  componentWillUnmount() {
    // this.timeline.destroy();
    // delete this.timeline;
    console.log('InteractiveTimeline will unmount');
  }

  initTimeline() {
    if (this.timeline === undefined) {
      const timeline = new vis.Timeline(this.timelineContainer.current, null, options);
      timeline.setGroups(this.tagDataset);
      timeline.setItems(this.timelineDataset);
      this.timeline = timeline;
    }
  }

  fillTimelines() {
    const { postDate, usedData } = this.props;
    this.timelineDataset.add(R.flatten(R.toPairs(usedData).map((pair) => {
      const entityName = pair[0];
      return pair[1].map((event) => ({
        content: prepareLabel(event.name),
        start: event.time !== '' ? event.time : postDate,
        group: entityName
      }));
    })));
  }

  render() {
    if (this.timeline !== undefined) {
      const {
        usedData, postDate, preDate, selectedValues, t
      } = this.props;

      this.tagDataset.clear();
      this.timelineDataset.clear();

      this.tagDataset.add(selectedValues.map((entityName) => R.always({ id: entityName, content: entityName })()));

      this.fillTimelines();

      if (postDate) {
        const endDate = new Date(postDate);
        const startDate = new Date(preDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        startDate.setFullYear(startDate.getFullYear() - 1);

        this.timeline.setOptions({
          end: endDate,
          start: startDate,
        });
      }

      if (selectedValues[0]) {
        this.timelineDataset.add({
          content: prepareLabel(t('overview.pre-game-end-date')),
          start: new Date(postDate),
          group: selectedValues[0],
          className: 'importantItem',
          editable: false
        });
        this.timelineDataset.add({
          content: prepareLabel(t('overview.pre-game-start-date')),
          start: new Date(preDate),
          group: selectedValues[0],
          className: 'importantItem',
          editable: false
        });
      }
    }

    return (
      <div className="tab-pane" id="timeline-interactive">
        <div ref={this.timelineContainer} className="visualObjectContainer full-screen-elem timelineContainer" />
      </div>
    );
  }
}

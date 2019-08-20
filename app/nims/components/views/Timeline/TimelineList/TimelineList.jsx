import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TimelineList.css';

export default class TimelineList extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('TimelineList mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('TimelineList did update');
  }

  componentWillUnmount = () => {
    console.log('TimelineList will unmount');
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
    const { t } = this.props;

    // if (!something) {
    //   return <div> TimelineList stub </div> ;
    //   // return null;
    // }
    return (
      <div className="TimelineList">
        TimelineList body
        <div className="panel panel-default">

          <div className="panel-body">
            <div className="tab-pane active" id="timeline-list">
              <div className="container-fluid">
                <div className="row margin-bottom-8">
                  <div className="col-xs-2 white-space-normal">{t('timeline.time')}</div>
                  <div className="col-xs-2 white-space-normal">{t('timeline.story-name')}</div>
                  <div className="col-xs-3 white-space-normal">{t('timeline.event-name')}</div>
                  <div className="col-xs-5 white-space-normal">{t('timeline.characters')}</div>
                </div>
              </div>
              <div className="container-fluid timeline-list" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}


// <div class="row">
//   <div class="col-xs-2 white-space-normal time"></div>
//   <div class="col-xs-2 white-space-normal story-name"></div>
//   <div class="col-xs-3 white-space-normal event-name"></div>
//   <div class="col-xs-5 white-space-normal characters"></div>
// </div>

TimelineList.propTypes = {
  // bla: PropTypes.string,
};

TimelineList.defaultProps = {
  // bla: 'test',
};

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './EventAdaptationCard.css';

export default class EventAdaptationCard extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('EventAdaptationCard mounted');
    // this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('EventAdaptationCard did update');
  }

  componentWillUnmount = () => {
    console.log('EventAdaptationCard will unmount');
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
    const { t, charName, data } = this.props;

    // if (!something) {
    //   return <div> EventAdaptationCard stub </div> ;
    //   // return null;
    // }
    return (

      <div className="panel panel-default EventAdaptationCard">
        <div className="panel-heading flex-row">
          <h1 className="panel-title card-title flex-1-1-auto">{charName}</h1>
          <input
            className=" time-input form-control flex-0-0-auto"
            value={data.time}
            placeholder={t('adaptations.subjective-time')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon finished flex-0-0-auto margin-left-8"
            title={t('constant.adaptation-finished')}
          />
        </div>
        <div className="panel-body">
          <textarea
            className="eventPersonalStory form-control text-input"
            value={data.text}
            placeholder={t('adaptations.adaptation-text')}
          />
        </div>
      </div>
    );
  }
}

EventAdaptationCard.propTypes = {
  // bla: PropTypes.string,
};

EventAdaptationCard.defaultProps = {
  // bla: 'test',
};

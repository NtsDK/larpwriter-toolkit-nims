import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Events.css';

export default class Events extends Component {
  state = {
  };

  componentDidMount = () => {
    //console.log('Events mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Events did update');
  }

  componentWillUnmount = () => {
    console.log('Events will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getMetaInfo(),
      dbms.getStoryEvents({ storyName: id })
    ]).then((results) => {
      const [metaInfo, events] = results;
      this.setState({
        metaInfo, events
      });
    });
  }

  render() {
    const { events } = this.state;
    const { t } = this.props;

    if (!events) {
      return null;
    }
    return (
      <div className="events panel panel-default">
        <div className="alert alert-info">{t('advices.no-events-in-story')}</div>
        <table className="table table-bordered">
          <tbody>
            {
              events.map((event, i) => (
                <tr>
                  <td><span className="event-number">{i}</span></td>
                  <td>
                    <div className="story-events-div-main">
                      <div className="story-events-div-left">
                        <input className="isStoryEditable  form-control event-name-input " value={event.name} />
                      </div>
                      <div className="story-events-div-right">
                        <input className="isStoryEditable  form-control event-time " value={event.time} />
                      </div>
                    </div>
                    <textarea className="isStoryEditable  form-control event-text " value={event.text} />

                  </td>
                  <td>
                    <div className="flex-column">
                      <button
                        type="button"
                        className="btn btn-default btn-reduced fa-icon move event flex-0-0-auto isStoryEditable"
                        title={t('stories.move-event')}
                      />
                      <button
                        type="button"
                        className="btn btn-default btn-reduced fa-icon clone event flex-0-0-auto isStoryEditable"
                        title={t('stories.clone-event')}
                      />
                      <button
                        type="button"
                        className="btn btn-default btn-reduced fa-icon merge event flex-0-0-auto isStoryEditable"
                        title={t('stories.merge-events')}
                      />
                      <button
                        type="button"
                        className="btn btn-default btn-reduced fa-icon remove event flex-0-0-auto isStoryEditable"
                        title={t('stories.remove-event')}
                      />
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  }
}

Events.propTypes = {
  // bla: PropTypes.string,
};

Events.defaultProps = {
  // bla: 'test',
};

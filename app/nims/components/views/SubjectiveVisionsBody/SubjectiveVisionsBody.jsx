/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './SubjectiveVisionsBody.css';

export default class SubjectiveVisionsBody extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('SubjectiveVisionsBody mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('SubjectiveVisionsBody did update');
  }

  componentWillUnmount = () => {
    console.log('SubjectiveVisionsBody will unmount');
  }

  getStateInfo = () => {
    const { id, dbms } = this.props;
    Promise.all([
      dbms.getMetaInfo(),
      dbms.getStory({ storyName: id }),
      // PermissionInformer.isEntityEditable({ type: 'story', name: storyName }),
      dbms.getEntityNamesArray({ type: 'character' })
      // dbms.getSomething(),
    ]).then((results) => {
      const [metaInfo, story, allCharacters] = results;
      this.setState({
        metaInfo, story, allCharacters
      });
    });
  }

  render() {
    const { story } = this.state;
    const { t } = this.props;

    if (!story) {
      return null;
    }
    const characters = R.sort(CU.charOrdA, R.keys(story.characters));
    return (
      <div className="subjective-visions-body flex-1-1-auto">
        <div className="adaptations-content">
          <div className="panel panel-default">
            <div className="panel-body">
              <input type="checkbox" id="finishedStoryCheckbox" className="" />
              <label htmlFor="finishedStoryCheckbox" className="checkbox-label-icon common-checkbox">
                {t('adaptations.show-only-unfinished-stories')}
              </label>
            </div>
          </div>
          <div className="main-container flex-row">
            <div>
              <div id="personalStoriesCharacterContainer" className="">
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title">{t('adaptations.filter')}</h3>
                  </div>
                  <div className="panel-body">

                    <div>
                      <input type="radio" name="adaptationFilter" value="ByCharacter" id="adaptationFilterByCharacter" className="" />
                      <label htmlFor="adaptationFilterByCharacter" className="radio-label-icon common-radio">
                        <span>{t('adaptations.by-characters')}</span>
                      </label>
                    </div>
                    <div>
                      <input type="radio" name="adaptationFilter" value="ByEvent" id="adaptationFilterByEvent" className="" />
                      <label htmlFor="adaptationFilterByEvent" className="radio-label-icon common-radio">
                        <span>{t('adaptations.by-events')}</span>
                      </label>
                    </div>

                    <div id="events-characterSelectorDiv">
                      <h4>{t('adaptations.characters')}</h4>
                      <select id="events-characterSelector" className="form-control" multiple size={Math.min(15, characters.length)}>
                        {
                          characters.map(option => <option value={option} selected>{option}</option>)
                        }
                      </select>
                    </div>
                    <div id="events-eventSelectorDiv" className="">
                      <h4>{t('adaptations.events')}</h4>
                      <select id="events-eventSelector" className="form-control" multiple size={Math.min(15, story.events.length)}>
                        {
                          story.events.map(event => <option value={event.name} selected>{event.name}</option>)
                        }
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="personalStories" className="flex-1-1-auto">

              {
                story.events.map(event => (
                  <div className="container-fluid eventRow-dependent">
                    <div className="row eventMainPanelRow-left events-eventsContainer">

                      <div className="col-xs-6">
                        <div className="panel panel-primary">
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
                      </div>
                      {
                        R.toPairs(event.characters).map(([name, props]) => (
                          <div className="col-xs-6">
                            <div className="panel panel-default">
                              <div className="panel-heading flex-row">
                                <h1 className="panel-title card-title flex-1-1-auto">{name}</h1>
                                <input
                                  className=" time-input form-control flex-0-0-auto"
                                  value={props.time}
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
                                  value={props.text}
                                  placeholder={t('adaptations.adaptation-text')}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      }


                    </div>
                  </div>
                ))
              }

            </div>
          </div>
        </div>
      </div>
    );
  }
}

SubjectiveVisionsBody.propTypes = {
  // bla: PropTypes.string,
};

SubjectiveVisionsBody.defaultProps = {
  // bla: 'test',
};

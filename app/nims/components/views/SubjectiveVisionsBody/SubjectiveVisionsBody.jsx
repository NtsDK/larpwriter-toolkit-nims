/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './SubjectiveVisionsBody.css';

import EventOriginCard from '../EventOriginCard';
import EventAdaptationCard from '../EventAdaptationCard';

export default class SubjectiveVisionsBody extends Component {
  state = {
    story: null
  };

  componentDidMount = () => {
    console.log('SubjectiveVisionsBody mounted');
    this.getStateInfo();
  }

  componentDidUpdate = (prevProps) => {
    console.log('SubjectiveVisionsBody did update');
    // console.log('this.props.id', this.props.id);
    if (prevProps.id === this.props.id) {
      return;
    }
    this.getStateInfo();
  }

  componentWillUnmount = () => {
    console.log('SubjectiveVisionsBody will unmount');
  }

  getStateInfo = () => {
    const { id, dbms } = this.props;
    if (!id) {
      return;
    }
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
    // const { id } = this.state;
    const { story } = this.state;
    const { t, id } = this.props;

    // if (!id) {
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
                        <EventOriginCard event={event} />
                      </div>
                      {
                        R.toPairs(event.characters).map(([name, props]) => (
                          <div className="col-xs-6">
                            <EventAdaptationCard charName={name} data={props} />
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './StoriesBody.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';

import WriterStory from './WriterStory';
import Events from './Events';
import Characters from './Characters';
import Presence from './Presence';

export default class StoriesBody extends Component {
  state = {
    redirect: false
  };

  componentDidMount = () => {
    console.log('StoriesBody mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('StoriesBody did update');
  }

  componentWillUnmount = () => {
    console.log('StoriesBody will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'story' }),
    ]).then((results) => {
      const [storyNames] = results;
      storyNames.sort(CU.charOrdA);
      this.setState({
        storyNames
      });
    });
  }

  onStoryChange = (event) => {
    const {
      tab1, tab2
    } = this.props;
    const { value } = event.target;
    this.setState({
      redirect: true,
      to: `/stories/${tab1}/${tab2}/${value}`
    });
    console.log(event.target.value);
  }

  getTab = (tab1, tab2) => {
    if (tab2 && tab1 === tab2) {
      return null;
    }
    const { id, dbms } = this.props;
    switch (tab1) {
    case 'writerStory':
      return <WriterStory id={id} dbms={dbms} />;
    case 'events':
      return <Events id={id} dbms={dbms} />;
    case 'characters':
      return <Characters id={id} dbms={dbms} />;
    case 'presence':
      return <Presence id={id} dbms={dbms} />;
    default:
      return null;
    }
  }

  render() {
    const { storyNames, redirect } = this.state;
    const {
      t, tab1, tab2, id
    } = this.props;

    if (!storyNames) {
      return null;
    }
    if (redirect) {
      this.setState({
        redirect: false
      });
      return <Redirect to={this.state.to} />;
    }

    const left = this.getTab(tab1);
    const right = this.getTab(tab2, tab1);

    return (
      <div className="stories-body">
        <div className="panel panel-default">
          <div className="panel-body first-panel">
            <div className="flex-row entity-toolbar">
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon create story flex-0-0-auto icon-padding"
                title={t('stories.create-entity')}
              >
                <span>{t('stories.story')}</span>
              </button>
              <select id="storySelector" className="common-select form-control" onChange={this.onStoryChange}>
                {
                  storyNames.map(name => (<option value={name} selected={name === id}>{name}</option>))
                }
              </select>
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon rename story flex-0-0-auto isStoryEditable"
                title={t('stories.rename-entity')}
              />
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon remove story flex-0-0-auto isStoryEditable"
                title={t('stories.remove-entity')}
              />
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon create event flex-0-0-auto icon-padding isStoryEditable"
                title={t('stories.create-event')}
              >
                <span>{t('stories.event')}</span>
              </button>
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon add character flex-0-0-auto icon-padding isStoryEditable"
                title={t('stories.add-character')}
              >
                <span>{t('stories.character')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="alert alert-info">{t('advices.no-story')}</div>

        <nav className="view-switch stories-nav">
          <ul>
            <li>
              <NavLink to={`/stories/writerStory/${tab2}/${id}`}>{t('header.writer-story')}</NavLink>
            </li>
            <li>
              <NavLink to={`/stories/events/${tab2}/${id}`}>{t('header.story-events')}</NavLink>
            </li>
            <li>
              <NavLink to={`/stories/characters/${tab2}/${id}`}>{t('header.story-characters')}</NavLink>
            </li>
            <li>
              <NavLink to={`/stories/presence/${tab2}/${id}`}>{t('header.event-presence')}</NavLink>
            </li>
          </ul>
          <ul>
            <li>
              <NavLink to={`/stories/${tab1}/writerStory/${id}`}>{t('header.writer-story')}</NavLink>
            </li>
            <li>
              <NavLink to={`/stories/${tab1}/events/${id}`}>{t('header.story-events')}</NavLink>
            </li>
            <li>
              <NavLink to={`/stories/${tab1}/characters/${id}`}>{t('header.story-characters')}</NavLink>
            </li>
            <li>
              <NavLink to={`/stories/${tab1}/presence/${id}`}>{t('header.event-presence')}</NavLink>
            </li>
          </ul>
        </nav>

        <div className="stories-content-container">
          <div className="left-side">{left}</div>
          <div className="right-side">{right}</div>
        </div>
      </div>
    );
  }
}

StoriesBody.propTypes = {
  // bla: PropTypes.string,
};

StoriesBody.defaultProps = {
  // bla: 'test',
};

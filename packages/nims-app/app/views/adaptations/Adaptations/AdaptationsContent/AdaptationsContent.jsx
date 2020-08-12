import React, { Component } from 'react';
import * as R from 'ramda';
import { UI, U, L10n } from 'nims-app-core';
import PermissionInformer from 'permissionInformer';
import './AdaptationsContent.css';
import { AdaptationsFilter } from '../AdaptationsFilter';
import { InlineNotification } from '../../../commons/uiCommon3.jsx';
import {
  getStoryCharacterCompleteness, getStoryEventCompleteness, getCharacterNames, getEventIndexes
} from '../../adaptationUtils';

export class AdaptationsContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      characterNames: null,
      events: null,
      areAdaptationsEditable: null,
      metaInfo: null,
      isStoryEditable: true,
      allCharacters: null,
      characterArray: null,
      eventArray: null,
      selectedCharacterNames: null,
      selectedEventIndexes: null,
      filterBy: 'ByCharacter'
    };
    this.setFilterBy = this.setFilterBy.bind(this);
    this.setSelectedCharacterNames = this.setSelectedCharacterNames.bind(this);
    this.setSelectedEventIndexes = this.setSelectedEventIndexes.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('AdaptationsContent mounted');
  }

  componentDidUpdate() {
    console.log('AdaptationsContent did update');
  }

  componentWillUnmount() {
    console.log('AdaptationsContent will unmount');
  }

  refresh() {
    const { storyName } = this.props;
    Promise.all([
      DBMS.getMetaInfo(),
      DBMS.getStory({ storyName }),
      PermissionInformer.isEntityEditable({ type: 'story', name: storyName }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false })
    ]).then((results) => {
      const [metaInfo, story, isStoryEditable, allCharacters] = results;
      const characterNames = R.keys(story.characters);
      const adaptations = characterNames.map((characterName) => ({
        characterName,
        storyName
      }));
      const characterArray = getStoryCharacterCompleteness(story);
      const eventArray = getStoryEventCompleteness(story);

      // const selectedCharacterNames = getCharacterNames(characterArray);
      const selectedCharacterNames = R.pluck('characterName', characterArray);
      const selectedEventIndexes = R.pluck('index', eventArray).map((index) => String(index));
      // const eventIndexes = getEventIndexes(eventArray);

      const map = R.indexBy(R.prop('value'), allCharacters);

      characterArray.forEach((elem) => {
        elem.displayName = map[elem.characterName].displayName;
        elem.value = map[elem.characterName].value;
      });

      characterArray.sort(CU.charOrdAObject);

      PermissionInformer.areAdaptationsEditable({ adaptations }).then((areAdaptationsEditable) => {
        story.events.forEach((item, i) => (item.index = i));
        this.setState({
          characterNames,
          events: story.events,
          areAdaptationsEditable,
          metaInfo,
          isStoryEditable,
          allCharacters,
          characterArray,
          eventArray,
          selectedCharacterNames,
          selectedEventIndexes,
        });
        // buildAdaptationInterface(
        //   storyName, characterNames, story.events, areAdaptationsEditable,
        //   metaInfo
        // );
        // updateAdaptationSelector(story, allCharacters);
        // UI.enable(content, 'isStoryEditable', isStoryEditable);
        // UI.enable(content, 'notEditable', false);
      }).catch(UI.handleError);
    }).catch(UI.handleError);
  }

  setFilterBy(filterBy) {
    this.setState({
      filterBy
    });
  }

  setSelectedCharacterNames(selectedCharacterNames) {
    this.setState({
      selectedCharacterNames
    });
  }

  setSelectedEventIndexes(selectedEventIndexes) {
    this.setState({
      selectedEventIndexes
    });
  }

  render() {
    const {
      metaInfo, events, characterNames, story, allCharacters, characterArray, eventArray,
      selectedCharacterNames, selectedEventIndexes, filterBy
    } = this.state;
    const { t } = this.props;

    if (!events) {
      return null;
    }

    const adaptationsNum = R.flatten(events.map((event) => R.keys(event.characters))).length;
    return (
      <div className="AdaptationsContent tw-flex">
        {/* AdaptationsContent body */}
        <div>
          <AdaptationsFilter
            characterArray={characterArray}
            eventArray={eventArray}
            selectedCharacterNames={selectedCharacterNames}
            selectedEventIndexes={selectedEventIndexes}
            filterBy={filterBy}
            setFilterBy={this.setFilterBy}
            setSelectedCharacterNames={this.setSelectedCharacterNames}
            setSelectedEventIndexes={this.setSelectedEventIndexes}
          />
        </div>
        {/* </div> */}
        <div>Adaptation cards</div>
        <InlineNotification type="info" showIf={events.length === 0}>
          {t('advices.no-events-in-story')}
        </InlineNotification>
        <InlineNotification type="info" showIf={characterNames.length === 0}>
          {t('advices.no-characters-in-story')}
        </InlineNotification>
        <InlineNotification type="info" showIf={adaptationsNum === 0}>
          {t('advices.no-adaptations-in-story')}
        </InlineNotification>
        {/* <div id="personalStories" style={{ flexGrow: 1 }} /> */}
      </div>
    );
  }
}

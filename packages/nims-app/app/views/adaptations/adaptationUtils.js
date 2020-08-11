import * as R from 'ramda';

export function getStoryCharacterCompleteness(story) {
  return R.keys(story.characters).map((elem) => ({
    characterName: elem,
    isFinished: _isStoryFinishedForCharacter(story, elem),
    isEmpty: _isStoryEmptyForCharacter(story, elem)
  }));
}

function _isStoryEmptyForCharacter(story, characterName) {
  return story.events.every((event) => event.characters[characterName] === undefined);
}

function _isStoryFinishedForCharacter(story, characterName) {
  return story.events.filter((event) => event.characters[characterName] !== undefined)
    .every((event) => event.characters[characterName].ready === true);
}

export function getStoryEventCompleteness(story) {
  return story.events.map((event, i) => ({
    name: event.name,
    index: i,
    isFinished: _isEventReady(event),
    isEmpty: Object.keys(event.characters).length === 0
  }));
}

function _isEventReady(event) {
  return R.values(event.characters).every((character) => character.ready);
}

function getNames(nameObjectArray, nameObjectProperty, settingsProperty) {
  const namesOnly = nameObjectArray.map(R.prop(nameObjectProperty));
  //   const names = SM.getSettings().Adaptations[settingsProperty];
  const existingNames = namesOnly;
  //   if (names === null) {
  //     existingNames = namesOnly;
  //   } else {
  //     existingNames = names.filter((name) => namesOnly.indexOf(name) !== -1);
  //   }

  //   updateSettings(settingsProperty, existingNames);
  return existingNames;
}

export function getCharacterNames(characterArray) {
  return getNames(characterArray, 'characterName', 'characterNames');
}

export function getEventIndexes(eventArray) {
  return getNames(eventArray, 'index', 'eventIndexes');
}

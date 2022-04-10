import * as R from 'ramda';
import { CU } from "nims-dbms-core";

const path = ['ProfileBindings'];

export function _getProfileBinding(type, name, db) {
  let arr;
  if (type === 'character') {
    const bindings = R.path(path, db);
    // @ts-ignore
    arr = [name, bindings[name] || ''];
  } else {
    // @ts-ignore
    const bindings = R.invertObj(R.path(path, db));
    arr = [bindings[name] || '', name];
  }
  return arr;
};

const rel2RelKey = R.pipe(R.props(['starter', 'ender']), R.sort(CU.charOrdA), JSON.stringify);
export const _rel2RelKey = rel2RelKey;
const arr2RelKey = R.pipe(R.sort(CU.charOrdA), JSON.stringify);
export const _arr2RelKey = arr2RelKey;

export function _getKnownCharacters(database, characterName) {
  const stories = database.Stories;
  const knownCharacters = {};
  R.values(stories).forEach((story) => {
      // @ts-ignore
      const filter = R.compose(R.not, R.isNil, R.prop(characterName), R.prop('characters'));
      story.events.filter(filter).forEach((event) => {
          R.keys(event.characters).forEach((charName) => {
              knownCharacters[charName] = knownCharacters[charName] || {};
              knownCharacters[charName][story.name] = true;
          });
      });
  });
  delete knownCharacters[characterName];
  return knownCharacters;
};

export const _isStoryEmpty = (database, storyName) => 
  database.Stories[storyName].events.length === 0;

export const _isStoryFinished = (database, storyName) => 
  database.Stories[storyName].events.every(event => 
    !R.isEmpty(event.characters) 
    && R.values(event.characters).every(adaptation => adaptation.ready)
  );

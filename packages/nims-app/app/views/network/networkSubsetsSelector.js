import { UI, U } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';

const state = {};

// export default {
//   init, refresh, getStoryNames, getCharacterNames
// };

export function init() {
  U.listen(U.queryEl('#networkSubsetsSelector'), 'change', onNetworkSubsetsChange);
}

export function refresh(parent) {
  state.parent = parent;

  let selector = U.fillSelector(U.clearEl(U.queryEl('#networkSubsetsSelector')), UI.constArr2Select(Constants.objectSubsets));
  [selector.value] = Constants.objectSubsets;
  onNetworkSubsetsChange({ target: selector });

  selector = U.fillSelector(
    U.clearEl(U.queryEl('#networkCharacterSelector')),
    state.parent.characterNames.sort(CU.charOrdAObject).map(UI.remapProps4Select)
  );
  U.setAttr(selector, 'size', selector.options.length > 15 ? 15 : selector.options.length);
  selector = U.fillSelector(
    U.clearEl(U.queryEl('#networkStorySelector')),
    state.parent.storyNames.sort(CU.charOrdAObject).map(UI.remapProps4Select)
  );
  U.setAttr(selector, 'size', selector.options.length > 15 ? 15 : selector.options.length);
}

export function getStoryNames() {
  const { value } = U.queryEl('#networkSubsetsSelector');

  if (Constants.objectSubsets[0] === value) { // all objects
    return state.parent.storyNames.map(R.prop('value'));
  } if (Constants.objectSubsets[1] === value) { // "selected characters"
    const primaryCharacters = U.nl2array(U.queryEl('#networkCharacterSelector').selectedOptions).map(R.prop('value'));
    const isPrimaryCharacter = R.contains(R.__, primaryCharacters);
    return R.values(state.parent.Stories)
      .filter((story) => R.keys(story.characters).some(isPrimaryCharacter)).map(R.prop('name'));
  } if (Constants.objectSubsets[2] === value) { //"selected stories"
    return U.nl2array(U.queryEl('#networkStorySelector').selectedOptions).map(R.prop('value'));
  }
  throw new Error(`Unexpected subsets selector: ${value}`);
}

export function getCharacterNames() {
  const { value } = U.queryEl('#networkSubsetsSelector');

  if (Constants.objectSubsets[0] === value) { // all objects
    return state.parent.characterNames.map(R.prop('value'));
  } if (Constants.objectSubsets[1] === value) { // "selected characters"
    // returns character and his neighbours
    const primaryCharacters = U.nl2array(U.queryEl('#networkCharacterSelector').selectedOptions).map(R.prop('value'));
    const isPrimaryCharacter = R.contains(R.__, primaryCharacters);
    const secondaryCharacters = R.values(state.parent.Stories)
      .filter((story) => R.keys(story.characters).some(isPrimaryCharacter))
      .map((story) => story.events.filter((event) => R.keys(event.characters).some(isPrimaryCharacter))
        .map((event) => R.keys(event.characters).filter((name) => !isPrimaryCharacter(name))));
    return primaryCharacters.concat(R.uniq(R.flatten(secondaryCharacters)));
  } if (Constants.objectSubsets[2] === value) { //"selected stories"
    const stories = U.nl2array(U.queryEl('#networkStorySelector').selectedOptions).map(R.prop('value'));
    return R.uniq(R.flatten(stories.map((storyName) => R.keys(state.parent.Stories[storyName].characters))));
  }
  throw new Error(`Unexpected subsets selector: ${value}`);
}

function onNetworkSubsetsChange(event) {
  const selectedSubset = event.target.value;
  U.hideEl(U.queryEl('#networkCharacterDiv'), selectedSubset !== Constants.objectSubsets[1]);
  U.hideEl(U.queryEl('#networkStoryDiv'), selectedSubset !== Constants.objectSubsets[2]);
}

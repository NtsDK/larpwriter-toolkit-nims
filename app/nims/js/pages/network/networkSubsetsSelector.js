/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/*global
 Utils, StoryCharacters
 */

'use strict';

((exports) => {
    const state = {};

    exports.init = () => {
        listen(getEl('networkSubsetsSelector'), 'change', onNetworkSubsetsChange);
    };

    exports.refresh = (parent) => {
        state.parent = parent;

        let selector = fillSelector(clearEl(getEl('networkSubsetsSelector')), constArr2Select(Constants.objectSubsets));
        [selector.value] = Constants.objectSubsets;
        onNetworkSubsetsChange({ target: selector });

        selector = fillSelector(
            clearEl(getEl('networkCharacterSelector')),
            state.parent.characterNames.sort(Utils.charOrdAObject).map(remapProps4Select)
        );
        setAttr(selector, 'size', selector.options.length > 15 ? 15 : selector.options.length);
        selector = fillSelector(
            clearEl(getEl('networkStorySelector')),
            state.parent.storyNames.sort(Utils.charOrdAObject).map(remapProps4Select)
        );
        setAttr(selector, 'size', selector.options.length > 15 ? 15 : selector.options.length);
    };

    exports.getStoryNames = () => {
        const { value } = getEl('networkSubsetsSelector');

        if (Constants.objectSubsets[0] === value) { // all objects
            return state.parent.storyNames.map(R.prop('value'));
        } else if (Constants.objectSubsets[1] === value) { // "selected characters"
            const primaryCharacters = nl2array(getEl('networkCharacterSelector').selectedOptions).map(R.prop('value'));
            const isPrimaryCharacter = R.contains(R.__, primaryCharacters);
            return R.values(state.parent.Stories)
                .filter(story => R.keys(story.characters).some(isPrimaryCharacter)).map(R.prop('name'));
        } else if (Constants.objectSubsets[2] === value) { //"selected stories"
            return nl2array(getEl('networkStorySelector').selectedOptions).map(R.prop('value'));
        }
        throw new Error(`Unexpected subsets selector: ${value}`);
    };

    exports.getCharacterNames = () => {
        const { value } = getEl('networkSubsetsSelector');

        if (Constants.objectSubsets[0] === value) { // all objects
            return state.parent.characterNames.map(R.prop('value'));
        } else if (Constants.objectSubsets[1] === value) { // "selected characters"
            // returns character and his neighbours
            const primaryCharacters = nl2array(getEl('networkCharacterSelector').selectedOptions).map(R.prop('value'));
            const isPrimaryCharacter = R.contains(R.__, primaryCharacters);
            const secondaryCharacters = R.values(state.parent.Stories)
                .filter(story => R.keys(story.characters).some(isPrimaryCharacter))
                .map(story => story.events.filter(event => R.keys(event.characters).some(isPrimaryCharacter))
                    .map(event => R.keys(event.characters).filter(name => !isPrimaryCharacter(name))));
            return primaryCharacters.concat(R.uniq(R.flatten(secondaryCharacters)));
        } else if (Constants.objectSubsets[2] === value) { //"selected stories"
            const stories = nl2array(getEl('networkStorySelector').selectedOptions).map(R.prop('value'));
            return R.uniq(R.flatten(stories.map(storyName => R.keys(state.parent.Stories[storyName].characters))));
        }
        throw new Error(`Unexpected subsets selector: ${value}`);
    };

    function onNetworkSubsetsChange(event) {
        const selectedSubset = event.target.value;
        hideEl(getEl('networkCharacterDiv'),  selectedSubset !== Constants.objectSubsets[1]);
        hideEl(getEl('networkStoryDiv'), selectedSubset !== Constants.objectSubsets[2]);
    }
})(this.NetworkSubsetsSelector = {});

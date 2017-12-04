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

"use strict";

(function(exports){

    var state = {};

    exports.init = function () {
        listen(getEl("networkSubsetsSelector"), "change", onNetworkSubsetsChange);
    };

    exports.refresh = function (parent) {
        state.parent = parent;

        var selector = fillSelector(clearEl(getEl("networkSubsetsSelector")), constArr2Select(Constants.objectSubsets));
        selector.value = Constants.objectSubsets[0];
        onNetworkSubsetsChange({target: selector});

        selector = fillSelector(clearEl(getEl("networkCharacterSelector")), state.parent.characterNames.sort(Utils.charOrdAObject).map(remapProps4Select));
        setAttr(selector, 'size', selector.options.length > 15 ? 15 : selector.options.length);
        selector = fillSelector(clearEl(getEl("networkStorySelector")), state.parent.storyNames.sort(Utils.charOrdAObject).map(remapProps4Select));
        setAttr(selector, 'size', selector.options.length > 15 ? 15 : selector.options.length);
    };

    exports.getStoryNames = function () {
        var value = getEl("networkSubsetsSelector").value;

        if(Constants.objectSubsets[0] === value){ // all objects
            return state.parent.storyNames.map(obj => obj.value);
        } else if (Constants.objectSubsets[1] === value) { // "selected characters"
            var primaryCharacters = nl2array(getEl("networkCharacterSelector").selectedOptions).map(option => option.value);
            var isPrimaryCharacter = R.contains(R.__, primaryCharacters);
            return R.values(state.parent.Stories).filter(story => R.keys(story.characters).some(isPrimaryCharacter)).map(story => story.name);
        } else if (Constants.objectSubsets[2] === value) { //"selected stories"
            return nl2array(getEl("networkStorySelector").selectedOptions).map(option => option.value);
        } else {
            throw new Error('Unexpected subsets selector: ' + value);
        }
    };

    exports.getCharacterNames = function () {
        var value = getEl("networkSubsetsSelector").value;

        if(Constants.objectSubsets[0] === value){ // all objects
            return state.parent.characterNames.map(obj => obj.value);
        } else if (Constants.objectSubsets[1] === value) { // "selected characters"
            // returns character and his neighbours
            var primaryCharacters = nl2array(getEl("networkCharacterSelector").selectedOptions).map(option => option.value);
            var isPrimaryCharacter = R.contains(R.__, primaryCharacters);
            var secondaryCharacters = R.values(state.parent.Stories).filter(story => R.keys(story.characters).some(isPrimaryCharacter)).map(function(story){
                return story.events.filter(event => R.keys(event.characters).some(isPrimaryCharacter)).map(function(event){
                    return R.keys(event.characters).filter(name => !isPrimaryCharacter(name));
                });
            });
            return primaryCharacters.concat(R.uniq(R.flatten(secondaryCharacters)));
        } else if (Constants.objectSubsets[2] === value) { //"selected stories"
            var stories = nl2array(getEl("networkStorySelector").selectedOptions).map(option => option.value);
            return R.uniq(R.flatten(stories.map(storyName => R.keys(state.parent.Stories[storyName].characters))));
        } else {
            throw new Error('Unexpected subsets selector: ' + value);
        }
    };

    var onNetworkSubsetsChange = function (event) {
        var selectedSubset = event.target.value;
        setClassByCondition(getEl("networkCharacterDiv"), "hidden", selectedSubset !== Constants.objectSubsets[1]);
        setClassByCondition(getEl("networkStoryDiv"), "hidden", selectedSubset !== Constants.objectSubsets[2]);
    };

})(this['NetworkSubsetsSelector']={});
